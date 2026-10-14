/* Local, inspectable planning rules. No network/model calls; no measurements are written here.
 * Templates/references belong to task-ruler.js. Scope, units and facts are never inferred from a date.
 * Draft -> review -> apply is a separate step. Required remainders always remain visible.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LemonPlanEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '20261014.1';
  const num = v => v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v);
  const positive = v => num(v) !== null && num(v) > 0;
  const str = v => typeof v === 'string' ? v.trim() : '';
  const clone = v => JSON.parse(JSON.stringify(v));
  const dateOK = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(s + 'T12:00:00Z'));
  const age = (a, b) => (Date.parse(a + 'T12:00:00Z') - Date.parse(b + 'T12:00:00Z')) / 86400000;
  const same = (a, b) => a.template === b.template && num(a.quantity) === num(b.quantity) &&
    a.familiarity === b.familiarity && str(a.group) === str(b.group) && str(a.qualityRule) === str(b.qualityRule);
  const median = vals => { const s = vals.slice().sort((a,b) => a-b); const i = Math.floor(s.length/2); return s.length % 2 ? s[i] : (s[i-1]+s[i])/2; };
  const subject = t => /^(math-)/.test(t.template) || /数学/.test(t.name) ? '数学' :
    /^(en-|xdf-)/.test(t.template) || /英语|PU[23]/i.test(t.name) ? '英语' : /^(zh-)/.test(t.template) ? '语文' : '';
  function priorRows(task, input) {
    return (input.history || []).filter(h => h.id !== task.id && h.date <= input.date &&
      age(input.date, h.date) <= 60 && age(input.date,h.date) >= 0 && same(task,h))
      .sort((a,b) => b.date.localeCompare(a.date) || str(b.savedAt).localeCompare(str(a.savedAt)));
  }
  function reference(t, input) {
    const tpl = input.templates.find(x => x.id === t.template);
    if (t.familiarity !== 'familiar') return null;
    return tpl?.refs?.find(r => t.quantity >= r.from && t.quantity <= r.to) || null;
  }
  function estimate(t, input) {
    const rows = priorRows(t,input);
    const good = rows.filter(h => h.quality === 'met' && num(h.done) === num(h.quantity) && positive(h.actual)).slice(0,3);
    const ref = reference(t,input);
    const last=rows[0];
    const lastUnstable=last&&(last.quality==='notmet'||num(last.done)<num(last.quantity));
    if(lastUnstable&&!good.length&&!positive(t.timeOverride))return {pending:'最近同量结果尚未稳定：先缩小到可比较的小段，或明确教学和本次预算；不套更快参考',rows};
    let minutes, basis;
    if (positive(t.timeOverride)) {
      minutes = Math.ceil(Number(t.timeOverride));
      basis = {kind:'adult',text:'成人本次估计／调整；不是实测',samples:[]};
    } else if (good.length) {
      minutes = Math.ceil(median(good.map(h=>Number(h.actual))));
      basis = {kind:'history',text:`最近60天内${good.length}次同量、同条件且质量保持的实测中位数，向上取整；未按参考速度压缩`,samples:good.map(h=>({id:h.id,date:h.date,minutes:Number(h.actual)}))};
    } else if (ref) {
      minutes = ref.max;
      basis = {kind:'reference',text:`同量试用参考 ${ref.min}–${ref.max}分，先取上限；首次试约，不是保证能完成`,samples:[]};
    } else {
      return {pending:'缺少同条件实测或适用参考；需核对材料后补一个首次时间预算',rows};
    }
    let teaching = num(t.teachingOverride);
    let teachingBasis = '已学常规任务先不另加长讲解；短提示计入任务用时';
    if (teaching !== null) {
      if (teaching < 0) return {pending:'教学分钟不能为负数',rows};
      teaching = Math.ceil(teaching); teachingBasis = '成人明确的本次教学预算';
    } else if (good.length && good.every(h => num(h.teachActual) !== null)) {
      teaching = Math.ceil(median(good.map(h=>Number(h.teachActual))));
      teachingBasis = '相同实测记录中的长讲解中位用时';
    } else if (t.familiarity === 'learning' || t.familiarity === 'hard') {
      return {pending:'本项需要教学或难度较高：请补充另留的教学分钟，不按熟练任务判差',rows};
    } else teaching = 0;
    if (t.familiarity === 'learning' && teaching === 0) return {pending:'标为尚不会的任务需要先明确教学安排',rows};
    if(lastUnstable&&basis.kind!=='adult'){
      minutes=Math.max(minutes,Math.ceil(Number(last.planned)||0),Math.ceil(Number(last.actual)||0));
      basis.text+='；最近一次未稳定，不压缩其已用／约定时间';
    }
    const latest = rows[0];
    const problem = latest && (latest.quality === 'notmet' || num(latest.done) < num(latest.quantity));
    return {minutes,teaching,basis,teachingBasis,ref,rows,
      caution:problem ? '最近同类任务有未完成或质量问题；先改变帮助方式，不同时提速加量' : good.length ? '' : '尚无合格同量实测，先观察；不把未达到参考判作失败'};
  }
  function priority(t, input) {
    if (t.necessity === 'required' || (dateOK(t.deadline) && age(t.deadline,input.date) <= 1)) return 0;
    if (t.necessity === 'routine') return 1;
    if (t.necessity === 'important') return 2;
    return 3;
  }
  function why(t,input) {
    if (dateOK(t.deadline)) return `实际截止 ${t.deadline}，先保护已确认交付`;
    return ({required:'成人确认的必做任务；完成范围不能静默删减',routine:t.windowNote || '已有例行承诺，先核对当天实际内容',important:'已录入的针对性学习目标',optional:'可顺延任务，只在确有价值和余量时安排'})[t.necessity] || '必要性未确认';
  }
  function ready(t) {
    const missing=[];
    if (!str(t.name)) missing.push('具体任务');
    if (!positive(t.quantity)) missing.push('实际范围／任务量');
    if (!['familiar','learning','hard'].includes(t.familiarity)) missing.push('是否已学');
    if (!['required','routine','important','optional'].includes(t.necessity)) missing.push('必要性');
    if (!str(t.group) || !str(t.qualityRule)) missing.push('质量与可比条件');
    return missing;
  }
  function support(t, e) {
    if (t.familiarity === 'learning') return '成人先教一个关键步骤，再让 Lemon 尝试相近的一步；不以未学会前的速度考核。';
    if (e.rows[0]?.help === 'repeated' || Number(e.rows[0]?.prompts) >= 3) return '保持任务量和时间；先自己完成一小组，不逐题确认，随后集中检查。';
    if (subject(t)==='英语') return '先确认听懂／读懂，再让他独立提取或表达；遇到词句卡点及时给提示。';
    if (t.template==='zh-copy') return '先示范本次要注意的一处笔顺；短段自己写，再一起检查，不逐字打断。';
    return '先听他讲思路，必要时示范一步；短时独立尝试后集中反馈，不整段监考。';
  }
  function splitVariant(t, room, input) {
    if (!t.splittable || !['zh-copy','en-copy','math-xueba','zh-basic','en-basic'].includes(t.template)) return null;
    // Only concrete smaller quantities with their own history/reference. Never divide a full-task time.
    const tpl=input.templates.find(x=>x.id===t.template);
    const quantities=[...(tpl?.refs||[]).map(r=>r.from), ...(input.history||[])
      .filter(h=>h.template===t.template&&h.quality==='met'&&h.done==h.quantity).map(h=>num(h.quantity))]
      .filter(q=>positive(q)&&q<t.quantity).sort((a,b)=>b-a);
    for (const q of [...new Set(quantities)]) {
      const smaller={...t,quantity:q,timeOverride:null};
      const e=estimate(smaller,input);
      if (!e.pending && e.minutes+e.teaching<=room) return {task:smaller,e,remainder:t.quantity-q};
    }
    return null;
  }
  function makeFocus(selected) {
    const poor=selected.find(t=>t.caution.startsWith('最近同类'));
    const repeated=selected.find(t=>t.support.includes('不逐题确认'));
    if (poor) return {focus:'先自查，再请成人确认',label:'先保持约定质量，找到一处卡点，不加快或加量',
      reason:`${poor.name} 最近同条件结果未稳定`,commitment:'遇到不会时说清楚卡点，在帮助后自己继续一步',axis:'帮助方式 / 提醒程度'};
    if (repeated) return {focus:'独立完成一小段，再集中检查',label:'保持任务量和时间，只减少逐题确认',
      reason:`${repeated.name} 最近有反复提醒／确认的记录`,commitment:'先自己做完一小组，再集中请成人检查',axis:'帮助方式 / 提醒程度'};
    return {focus:'独立完成一小段，再集中检查',label:'先兑现一个小段，建立真实基线，不自动提速加量',
      reason:'先形成一次可核对的成功；无实测时不推断已经具备的速度',commitment:'先自己完成约定的小段，卡住时说清楚需要哪一步帮助',axis:'保持约定，再确认一次'};
  }
  function timeline(tasks, overhead) {
    const intro=Math.min(5,Math.floor(overhead/3)),ending=intro,rest=overhead-intro-ending;
    const work=tasks.reduce((n,t)=>n+t.planned+t.teaching,0), rows=[];let time=0,progress=0,rested=false;
    const add=(name,minutes)=>{if(minutes>0){rows.push({name,from:time,to:time+minutes});time+=minutes}};
    add('一起确认任务与结束点',intro);
    for (const task of tasks) {
      for (const [label,minutes] of [[task.name+' · 成人引导',task.teaching],[task.name+' · 尝试与反馈',task.planned]]) {
        if (!rested && rest>0 && progress < work/2 && progress+minutes >= work/2) {
          const before=Math.max(0,Math.min(minutes,Math.ceil(work/2-progress)));
          add(label,before);add('按约定休息',rest);add(label+'（继续）',minutes-before);rested=true;
        } else add(label,minutes);
        progress+=minutes;
      }
    }
    if(!rested)add('预留休息',rest);
    add('一起检查、记录与兑现奖励',ending);return rows;
  }
  function generate(source) {
    const input=clone(source); input.templates=input.templates||[]; input.history=input.history||[];
    const s=input.session||{},total=num(s.sessionTotal),overhead=num(s.overhead);
    if(!dateOK(input.date)||!positive(total)||overhead===null||overhead<0||overhead>total)throw Error('先确认有效日期、总时长和休息／收尾预算');
    const existing=Array.isArray(s.tasks)?s.tasks:[];
    if(existing.some(t=>!positive(t.planned)||num(t.teaching)===null||t.teaching<0))throw Error('已有约定存在无效用时，请先修正');
    const reserved=existing.reduce((n,t)=>n+Number(t.planned)+Number(t.teaching),0);
    const result={version:VERSION,date:input.date,selected:[],pending:[],deferred:[],excluded:[],context:[],
      budget:{total,overhead,existing:reserved,available:Math.max(0,total-overhead-reserved)},existing:existing.map(t=>({name:t.name,planned:Number(t.planned),teaching:Number(t.teaching)}))};
    const classes=input.classes||[];
    result.context=classes.map(c=>`${c.period} ${c.subject}（上课不计入这次家庭共学；具体时长未录入，不扣一个虚构分钟数）`);
    if(!classes.length)result.context.push('当天未登记固定课外课；仍以实际家庭共学总时长为上限');
    const seen=new Set(existing.map(t=>t.sourceId||t.id));
    const candidates=(input.candidates||[]).slice().sort((a,b)=>priority(a,input)-priority(b,input)||str(a.deadline||'9999').localeCompare(str(b.deadline||'9999')));
    let room=result.budget.available,extraCount=0;
    for (const original of candidates) {
      const t=clone(original);if(!t.id||seen.has(t.id))continue;seen.add(t.id);
      if(t.completed){result.excluded.push({...t,reason:'已有完成标记；不重复安排，不把勾选当成用时实测'});continue}
      const gaps=ready(t);
      if(gaps.length){result.pending.push({...t,reason:'需确认：'+gaps.join('、')});continue}
      let e=estimate(t,input);
      if(e.pending){result.pending.push({...t,reason:e.pending});continue}
      const important=priority(t,input)<=1;
      const sameClass=classes.some(c=>subject(t)&&c.subject.includes(subject(t)));
      if (!important && (extraCount>=1 || sameClass) && !t.allowExtraOnClassDay) {
        result.deferred.push({...t,reason:sameClass?'当天已有同科课外课，不自动再叠加专项；可由成人明确允许':'只保留一个额外学习重点，不因有余量就填满'});continue;
      }
      let remainder=0,task=t;
      // Known parent observation informs safe scope, not a fabricated measured speed.
      const uncertain500=t.template==='zh-copy'&&t.quantity>=500&&e.basis.kind==='reference';
      if(e.minutes+e.teaching>room||uncertain500){
        const split=splitVariant(t,room,input);
        if(split){task=split.task;e=split.e;remainder=split.remainder}
        else {const reason=uncertain500?'有500字约两小时的历史观察，不能直接套40–55分；请补实测／人工预算，或允许先做小段并另排剩余':`预计任务与教学共${e.minutes+e.teaching}分，但本次只余${room}分；需另安排／缩小范围，不强压速度`;
          (priority(t,input)===0||uncertain500?result.pending:result.deferred).push({...t,reason});continue}
      }
      const item={...task,sourceId:t.id,planned:e.minutes,teaching:e.teaching,basis:e.basis,teachingBasis:e.teachingBasis,
        caution:e.caution,reason:why(t,input),support:support(task,e),remainder};
      result.selected.push(item);room-=item.planned+item.teaching;if(!important)extraCount++;
      if(remainder){result.pending.push({...t,quantity:remainder,reason:`仅安排${task.quantity}${task.unit}，剩余${remainder}${task.unit}需另排；原任务未被当作全部完成`,remainder:true});}
    }
    result.focus=makeFocus(result.selected);
    result.budget.proposed=result.selected.reduce((n,t)=>n+t.planned+t.teaching,0);
    result.budget.used=overhead+reserved+result.budget.proposed;
    result.budget.remaining=total-result.budget.used;
    result.timeline=timeline([...result.existing,...result.selected],overhead);
    result.requiredUnresolved=result.pending.filter(t=>priority(t,input)===0);
    return result;
  }
  return Object.freeze({VERSION,generate,estimate,same,reference,timeline});
});
