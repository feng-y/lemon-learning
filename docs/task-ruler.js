/* Task calibration, not an age norm. All reference times below are provisional project budgets.
   Existing planner keys stay untouched. Drafts and explicitly saved measurements are distinct. */
(() => {
'use strict';
const $=id=>document.getElementById(id), KEY='lemon-task-ruler-v1';
const PRIOR_KEYS=['lemon-weekly-pool-v1','lemon-integrated-plan-v1','lemon-curriculum-local-v1'];
const SCHOOL=[['语文','数学','英语','少先队活动','体育','美术'],['数学','语文','音乐','体育素质','美术','科学'],['数学','语文','道德与法治','体育','劳动','书法'],['语文','数学','音乐','道德与法治','体育','英语'],['语文','综合实践','信息','英语','趣味体育','科学']];
const CLASSES={2:[{period:'晚上',subject:'有道英语 Power Up 3'}],5:[{period:'上午',subject:'数学培优'},{period:'晚上',subject:'有道英语 Power Up 3'}],6:[{period:'下午',subject:'新东方英语 PU2'}]};
window.LemonSchedule={schoolTimetable:SCHOOL,extraClassSchedule:CLASSES};
const TEMPLATES=[
 {id:'math-xueba',name:'数学《学霸》',unit:'面',quantity:2,scope:'已学常规题为主，含少量应用题；不含集中攻难题。',quality:'理解题意，完成约定范围；先自查，不逐题等确认。',group:'学霸常规页·少量应用题',refs:[{from:2,to:2,min:20,max:30}],refText:'2面 · 20–30分钟'},
 {id:'zh-copy',name:'中文抄写',unit:'字',quantity:100,scope:'熟悉文字、普通作业字迹；先写小段，500字是完整任务方向，不是今天必做量。',quality:'字迹可辨、不漏抄；本次只抓一处笔顺。',group:'熟文抄写·普通字迹',refs:[{from:100,to:100,min:8,max:12},{from:500,to:500,min:40,max:55}],refText:'100字 · 8–12分钟；500字 · 40–55分钟'},
 {id:'zh-basic',name:'语文基础练习',unit:'面',quantity:2,scope:'字词、句子和课内积累等已学内容，不含整篇习作。',quality:'按题意完整回答，关键字词可辨。',group:'语文常规基础页',refs:[{from:2,to:2,min:15,max:25}],refText:'2面 · 15–25分钟'},
 {id:'zh-reading',name:'语文阅读',unit:'篇',quantity:1,scope:'约400–600字，配4–5个常规问题；含读原文和组织回答。',quality:'能回原文找依据，答完整，不只写满空格。',group:'400–600字·4–5题',refs:[{from:1,to:1,min:20,max:30}],refText:'1篇 · 20–30分钟'},
 {id:'en-basic',name:'英语书面练习',unit:'面',quantity:2,scope:'已学词句的匹配、填空、短句；不含长篇阅读或新语法教学。',quality:'理解词句；大小写、拼写和语序基本正确。',group:'英语已学词句常规页',refs:[{from:2,to:2,min:15,max:25}],refText:'2面 · 15–25分钟'},
 {id:'en-copy',name:'英文抄写',unit:'词',quantity:50,scope:'已理解的50–80个英文单词，按英文词数计，不套中文500字。',quality:'大小写、词间距、拼写和标点基本正确。',group:'已懂英文短段抄写',refs:[{from:50,to:80,min:10,max:15}],refText:'50–80词 · 10–15分钟'},
 {id:'en-vocab',name:'英语词汇复习',unit:'词',quantity:8,scope:'已学8–10词：认读、遮挡提取、少量拼写或运用；新词学习另估。',quality:'不只看着读，遮住后尝试提取或使用。',group:'已学词认读·提取·使用',refs:[{from:8,to:10,min:8,max:12}],refText:'8–10词 · 8–12分钟'},
 {id:'xdf-reader',name:'小书童训练',unit:'份',quantity:1,scope:'先看当天材料、录音长度、跟读遍数与提交要求，不固定拍成8分钟。',quality:'按本次具体听读、回答或提交要求完成。',group:'小书童·需写明任务包',refs:[],refText:'按实际任务包估时'},
 {id:'zh-unit-review',name:'语文单元复习',unit:'次',quantity:1,scope:'成人确认已经学完的一个语文单元；分段提取、运用和自查，不代替学校必做任务。',quality:'积累能独立提取；阅读能回原文找依据；完成一个表达练习；说出一处待复查内容。',group:'语文单元复习·具体单元',refs:[],refText:'整次试行35分钟；非年龄常模'},
 {id:'math-unit-review',name:'数学单元复习',unit:'次',quantity:1,scope:'成人确认已经学完的一个数学单元；关系、典型方法、变式与讲解，非整卷重复刷题。',quality:'能解释一个核心方法；独立尝试典型题与小变式；能指出卡点或检查方式。',group:'数学单元复习·具体单元',refs:[],refText:'整次试行29分钟；非年龄常模'},
 {id:'custom',name:'其他实际任务',unit:'份',quantity:1,scope:'先写明范围、熟悉度与质量，建立这类任务的实测，不凭名称编一个标准。',quality:'明确本次完成范围与可检查的结果。',group:'待写明同类任务组',refs:[],refText:'待具体材料与实测'}
];
const FIXED=[
 {id:'xdf-reader',name:'新东方 · 每日小书童',daily:true,days:[0,1,2,3,4,5,6],template:'xdf-reader'},
 {id:'xdf-vocab',name:'新东方 · 每日单词',daily:true,days:[0,1,2,3,4,5,6],template:'en-vocab'},
 {id:'course-pu3-wed',name:'有道 PU3 · 周三课程作业',days:[2],template:'custom'},
 {id:'course-pu3-sat',name:'有道 PU3 · 周六课程作业',days:[5],template:'custom'},
 {id:'course-pu2',name:'新东方 PU2 · 周日课程作业（周三～四处理）',days:[2,3],template:'custom'}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>v===''||v===null||v===undefined?null:(Number.isFinite(Number(v))?Number(v):null);
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00'))&&iso(new Date(s+'T12:00:00'))===s;
const atDate=s=>new Date(s+'T12:00:00');
const day=s=>(atDate(s).getDay()+6)%7;
const weekKey=s=>{let d=atDate(s);d.setDate(d.getDate()-day(s));return iso(d)};
const tid=()=>globalThis.crypto?.randomUUID?.()||'r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const template=id=>TEMPLATES.find(t=>t.id===id)||TEMPLATES[TEMPLATES.length-1];
const text=s=>typeof s==='string'?s:'';
const metric=(v,suffix='分')=>n(v)===null?'未测':Number(v)+suffix;
const defaults=()=>({sessionTotal:90,overhead:18,owner:'家教',focus:$('focus').options[0].value,commitment:'先自己做完一小组，再请成人一起检查',reward:'听故事20分钟',confirmed:false,fulfilled:'',rewardState:'待确认',confidence:'',nextAxis:'保持约定，再确认一次',nextStep:'',tasks:[],updatedAt:new Date().toISOString()});
let db={version:1,drafts:{},history:[]}, storageAvailable=true, pendingLink=null, toastTimer;
const saved=read(KEY);
if(saved?.version===1&&saved.drafts&&Array.isArray(saved.history)){db=saved}
let date=iso(new Date());
$('sessionDate').value=date;
function session(){if(!db.drafts[date])db.drafts[date]=defaults();return db.drafts[date]}
function persist(){session().updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(db));storageAvailable=true;window.dispatchEvent(new Event('lemon:taskschange'));return true}catch{storageAvailable=false;notify('浏览器未保存成功，请先复制记录或导出备份。');return false}}
function notify(s){$('status').textContent=s;$('status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('status').hidden=true,6500)}
function reference(tid,qty,familiarity){if(familiarity!=='familiar')return null;return template(tid).refs.find(r=>qty>=r.from&&qty<=r.to)||null}
function refLabel(t){const r=reference(t.template,n(t.quantity),t.familiarity);return r?r.min+'–'+r.max+'分钟':'无可直接套用区间'}
function groupKey(t){return [t.template,n(t.quantity),t.familiarity,text(t.group).trim(),text(t.qualityRule).trim()].join('|')}
function comparable(t){return db.history.filter(h=>h.date<=date&&h.id!==t.id&&h.quality==='met'&&n(h.done)===n(h.quantity)&&n(h.actual)>0&&groupKey(h)===groupKey(t)).sort((a,b)=>b.date.localeCompare(a.date)||b.savedAt.localeCompare(a.savedAt)).slice(0,3)}
function baseline(t){const rows=comparable(t);if(!rows.length)return null;const times=rows.map(h=>Number(h.actual)).sort((a,b)=>a-b);const m=times.length%2?times[(times.length-1)/2]:(times[times.length/2-1]+times[times.length/2])/2;return {rows,time:m}}
function candidate(){return {template:$('template').value,quantity:n($('quantity').value),familiarity:$('familiarity').value,group:$('comparisonGroup').value,qualityRule:$('qualityRule').value}}
function renderRuler(){const t=candidate(),r=reference(t.template,t.quantity,t.familiarity),b=baseline(t),info=template(t.template);$('templateScope').textContent=info.scope;$('unitLabel').textContent='（'+info.unit+'）';$('referenceTime').textContent=r?r.min+'–'+r.max+'分钟':t.familiarity==='learning'?'先教，再建立基线':'暂无同量参考';$('referenceScope').textContent=r?`${t.quantity}${info.unit}，已学常规任务；仅是试用预算。`:'其他字数或难度不按比例折算。';$('baselineTime').textContent=b?b.time+'分钟':'尚无同量实测';$('baselineNote').textContent=b?`最近${b.rows.length}次合格、同量同条件记录的中位用时。提醒和质量仍需一起看。`:(t.template==='zh-copy'?'已有500字约两小时的家长观察；不套用到小段，也不伪装成精确测量。':'尚未保存同类型、同量、同熟悉度且质量保持的记录。');$('plannedTime').textContent=n($('taskMinutes').value)>0?$('taskMinutes').value+'分钟':'本次预算待确认'}
function fillTemplate(id){const t=template(id);$('template').value=t.id;$('taskName').value=t.name;$('quantity').value=t.quantity;$('familiarity').value='familiar';$('taskMinutes').value='';$('teachingMinutes').value=0;$('qualityRule').value=t.quality;$('comparisonGroup').value=t.group;$('deadline').value='';pendingLink=null;plannerEditId=null;$('necessity').value='';renderRuler()}
function catalogue(){$('template').innerHTML=TEMPLATES.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');$('rulerRows').innerHTML=TEMPLATES.map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.scope)}</td><td>${esc(t.refText)}</td><td>${esc(t.quality)}</td></tr>`).join('')}
function budget(){const s=session(),used=s.tasks.reduce((a,t)=>a+Number(t.planned)+Number(t.teaching),0),reserve=n(s.overhead)||0,total=n(s.sessionTotal)||90,remaining=total-reserve-used;const optional=s.tasks.filter(t=>t.necessity==='optional');$('budget').textContent=`任务与教学 ${used}分钟 + 计划／休息／收尾 ${reserve}分钟 = ${used+reserve} / ${total}分钟。`+(remaining<0?` 超出${-remaining}分钟：${optional.length?'先顺延可调任务；':'需由成人缩小范围或另安排，不能无限延时。'}`:` 尚余${remaining}分钟，不需要填满。`);$('budget').classList.toggle('warning',remaining<0)}
const priorityLabel={required:'实际必交',important:'针对性学习',routine:'每日／课程例行',optional:'可顺延'};
function renderPlan(){const rows=session().tasks;$('planList').innerHTML=rows.length?rows.map((t,i)=>`<div class="task-line"><div><b>${i+1}. ${esc(t.name)} <span class="pill">${esc(priorityLabel[t.necessity])}</span></b><p>${t.quantity}${esc(t.unit)} · 约定${t.planned}分 + 教学${t.teaching}分 · ${esc(t.familiarity==='learning'?'需要先教':t.familiarity==='hard'?'已学较难':'已学常规')}${t.deadline?' · 截止'+esc(t.deadline):''}</p><p>${esc(t.qualityRule)}</p></div><div class="row"><button class="btn small secondary" data-up="${esc(t.id)}" ${i===0?'disabled':''}>上移</button><button class="btn small secondary" data-remove="${esc(t.id)}">移出约定</button></div></div>`).join(''):'<div class="empty">先加入一项已有任务。不要为测量再多安排一份作业。</div>';$('planList').querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=rows.findIndex(t=>t.id===b.dataset.up);if(i>0){[rows[i-1],rows[i]]=[rows[i],rows[i-1]];persist();renderPlan();renderResults()}});$('planList').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const t=rows.find(x=>x.id===b.dataset.remove);if((t.actual!==''||t.done!=='')&&!confirm('本项已有结果草稿，确认移出本次约定？已保存的历史不会删除。'))return;session().tasks=rows.filter(t=>t.id!==b.dataset.remove);persist();renderPlan();renderResults()});budget()}
function selection(options,val){return options.map(([v,label])=>`<option value="${esc(v)}" ${v===val?'selected':''}>${esc(label)}</option>`).join('')}
function resultInput(t,key,label,kind='number',options){const attr=`data-record="${esc(t.id)}" data-field="${key}" id="${key}-${esc(t.id)}"`;return `<div class="field"><label for="${key}-${esc(t.id)}">${label}</label>`+(kind==='select'?`<select ${attr}>${selection(options,t[key]||'')}</select>`:`<input ${attr} type="${kind}" ${kind==='number'?'min="0" max="10000" step="0.1"':'maxlength="220"'} value="${esc(t[key]??'')}">`)+`</div>`}
function verdict(t){const actual=n(t.actual),done=n(t.done);if(actual===null||done===null||!t.quality)return '还没有完整结果。未测不是零，也不是失败。';if(t.quality==='notmet')return '质量未保持：先找到一处具体错误或方法缺口，不用更快的时间判定进步。';if(done<t.quantity)return '范围尚未完成：核对任务量、知识与中断原因。先调整一种支持，不直接评价态度。';if(done>t.quantity)return '实际完成量超过约定：这条记录保留，但不进入原任务量的速度对比；不因多做就继续加量。';if(t.quality==='unknown')return '完成量与时间已记录，质量尚未核对，暂不判断约定达成。';if(actual>t.planned)return `比本次约定多用${+(actual-t.planned).toFixed(1)}分钟。核对离题、确认依赖或估量偏差，不直接扣掉全部进步。`;return '约定范围、时间和质量已达到。再核对这次的自主责任；不是要求达到参考速度。'}
function renderResults(){const tasks=session().tasks;$('results').innerHTML=tasks.length?tasks.map(t=>{const b=baseline(t);return `<article class="result"><header><strong>${esc(t.name)} · ${t.quantity}${esc(t.unit)}</strong><span class="quiet">本次教学另留 ${t.teaching}分钟</span></header><div class="metrics"><div class="metric"><label>试用参考</label><strong>${esc(refLabel(t))}</strong><small>${esc(t.familiarity==='familiar'?'不可替代本次约定':'本次条件不套熟练任务参考')}</small></div><div class="metric"><label>同量实测</label><strong>${b?b.time+'分钟':'暂无'}</strong><small>${b?'最近'+b.rows.length+'次合格同条件记录':'未把旧预算当成实际表现'}</small></div><div class="metric"><label>本次约定</label><strong>${t.planned}分钟</strong><small>${esc(t.qualityRule)}</small></div></div><div class="grid3">${resultInput(t,'done','实际完成量（'+esc(t.unit)+'）')}${resultInput(t,'actual','任务实际用时（分钟）')}${resultInput(t,'teachActual','另行长讲解（分钟）')}</div><div class="grid3" style="margin-top:12px">${resultInput(t,'quality','约定质量','select',[['','尚未检查'],['met','保持了质量'],['notmet','有明确质量问题'],['unknown','暂不能判断']])}${resultInput(t,'prompts','催促／确认次数（可留空）')}${resultInput(t,'help','主要帮助程度','select',[['','未记录'],['independent','独立完成'],['hint','少量提示后继续'],['repeated','反复提醒／确认'],['taught','需要共同教学']])}</div><details><summary>卡点与证据（有影响再写）</summary>${resultInput(t,'evidence','哪里变顺、哪里卡住','text')}</details><div class="verdict" id="verdict-${esc(t.id)}">${esc(verdict(t))}</div></article>`}).join(''):'<div class="empty">先在“本次约定”加入任务，这里会逐项记录实测。</div>';$('results').querySelectorAll('[data-field]').forEach(e=>e.addEventListener(e.tagName==='SELECT'?'change':'input',()=>{const t=session().tasks.find(x=>x.id===e.dataset.record);if(t){t[e.dataset.field]=e.value;persist();$('verdict-'+t.id).textContent=verdict(t)}}));renderHistory()}
function historyLabel(t){return `${t.date} · ${t.quantity}${t.unit} · 实测${t.actual}分 / 约定${t.planned}分 · 质量${t.quality==='met'?'保持':t.quality==='notmet'?'有问题':'待判断'} · 提醒${n(t.prompts)===null?'未记':t.prompts+'次'}`}
function renderHistory(){const sorted=db.history.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.savedAt.localeCompare(a.savedAt));$('history').innerHTML=sorted.length?sorted.slice(0,30).map(t=>`<div class="growth"><strong>${esc(t.name)}</strong><p>${esc(historyLabel(t))}</p><p>${esc(t.confidence||'未填写孩子自己的完成体验。')}</p><p>下一次：${esc(t.nextStep||t.nextAxis||'先维持约定再观察')}</p></div>`).join(''):'<p class="note">尚无已保存实测。500字约两小时的历史观察不伪装成这里的精确记录。</p>';renderRuler()}
function saveMeasurements(){let count=0,skipped=0;const s=session();for(const t of s.tasks){if(t.done===''&&t.actual==='')continue;const done=n(t.done),actual=n(t.actual),teaching=n(t.teachActual),prompts=n(t.prompts);if(done===null||actual===null||teaching===null||!t.quality||done<0||actual<0||teaching<0||(done>0&&actual===0)||(t.prompts!==''&&(prompts===null||prompts<0||!Number.isInteger(prompts)))){skipped++;continue}const row={...t,date,owner:s.owner,focus:s.focus,confirmed:s.confirmed,commitment:s.commitment,fulfilled:s.fulfilled,reward:s.reward,rewardState:s.rewardState,confidence:s.confidence,nextAxis:s.nextAxis,nextStep:s.nextStep,savedAt:new Date().toISOString()};const ix=db.history.findIndex(h=>h.id===row.id);if(ix>=0)db.history[ix]=row;else db.history.push(row);count++}persist();renderResults();notify(`已保存${count}项实测${skipped?'；'+skipped+'项请补全完成量、实际用时、长讲解（无则0）和质量。':'。再次保存同一项会更新，不会重复计数。'}`)}
function oldPoolCandidates(){const pool=read(PRIOR_KEYS[0])||{},selected=Array.isArray(pool.selected?.[date])?pool.selected[date]:[],d=day(date);const custom=Object.values(pool.tasks||{}).filter(t=>t&&t.date===date&&typeof t.id==='string').map(t=>({...t,template:typeof t.name==='string'&&t.name.includes('学霸')?'math-xueba':'custom'}));return [...FIXED.filter(t=>t.days.includes(d)||selected.includes(t.id)),...custom].map(t=>({...t,selected:selected.includes(t.id),priorEstimate:pool.allocations?.[date]?.[t.id]??t.minutes??null,done:!!pool.done?.[(t.daily?date:weekKey(date))+'|'+t.id]}))}
function renderCandidates(){const list=oldPoolCandidates();$('poolCandidates').innerHTML=list.map(t=>`<div class="task-line"><div><b>${esc(t.name)}${t.selected?'<span class="pill">原已选</span>':''}${t.done?'<span class="pill">原标记完成</span>':''}</b><p>${t.done?'已有完成标记，但尚无实测。可补记录，不能当作新做一次。':'只带入材料与范围，再确认今天的约定。'}${n(t.priorEstimate)>0?' 旧预算'+Number(t.priorEstimate)+'分钟（非实测）。':''}</p></div><button class="btn small secondary" data-candidate="${esc(t.id)}">带入并确认</button></div>`).join('')||'<p>当天未记录其他实际作业。</p>';$('poolCandidates').querySelectorAll('[data-candidate]').forEach(b=>b.onclick=()=>{const t=list.find(x=>x.id===b.dataset.candidate);fillTemplate(t.template);$('taskName').value=t.name;$('necessity').value=t.daily?'routine':t.type==='school'?'required':'important';if(t.template==='custom'){$('quantity').value=1;$('comparisonGroup').value=t.name}pendingLink={id:t.id,daily:!!t.daily,week:weekKey(date)};renderRuler();$('taskName').focus();notify('已带入任务；请确认任务量、时间和质量后加入约定。')})}
function renderCalendar(){const d=day(date);$('calendar').innerHTML=`<strong>${date} · ${['周一','周二','周三','周四','周五','周六','周日'][d]}</strong><p>校内：${SCHOOL[d]?SCHOOL[d].map((x,i)=>(i+1)+'. '+esc(x)).join(' / '):'无校内课表'}</p><p>课外：${(CLASSES[d]||[]).map(x=>esc(x.period+' '+x.subject)).join(' / ')||'无已登记固定课外课'}</p>`;document.documentElement.dataset.lemonDate=date;window.dispatchEvent(new CustomEvent('lemon:datechange',{detail:{date,day:d}}))}
const SESSION_FIELDS=['sessionTotal','overhead','owner','focus','commitment','reward','confirmed','fulfilled','rewardState','confidence','nextAxis','nextStep'];
function renderSession(){const s=session();for(const key of SESSION_FIELDS){const e=$(key);if(e.type==='checkbox')e.checked=!!s[key];else e.value=s[key]??''}renderPlan();renderResults();renderCandidates();renderCalendar();persist()}
function copyReport(){const s=session();const lines=[`Lemon｜${date}｜${s.owner}辅导`,`本轮目标：合理估量与独立完成任务，建立信心；本次只抓：${s.focus}`,`总预算${s.sessionTotal}分；计划／收尾／约定休息${s.overhead}分。`,`自主责任：${s.commitment||'未约定'}；双方确认：${s.confirmed?'是':'待确认'}。`];s.tasks.forEach((t,i)=>{const b=baseline(t);lines.push('',`${i+1}. ${t.name}｜${t.quantity}${t.unit}｜${priorityLabel[t.necessity]}`,`参考：${refLabel(t)}（试用，非达标线）；同量实测：${b?b.time+'分钟，n='+b.rows.length:'尚无'}。`,`本次约定：任务${t.planned}分 + 教学${t.teaching}分；质量：${t.qualityRule}`,`估时依据：${t.planBasis?.text||'人工填写的约定'}；帮助：${t.planSupport||'按双方约定'}；${t.remainder?'原任务剩余'+t.remainder+t.unit+'仍需安排':''}`,`实际：${metric(t.done,t.unit)}，任务${metric(t.actual)}，长讲解${metric(t.teachActual)}，质量${t.quality==='met'?'保持':t.quality==='notmet'?'有问题':'待核对'}，提醒${metric(t.prompts,'次')}。`,`帮助：${({'independent':'独立','hint':'少量提示','repeated':'反复提醒或确认','taught':'共同教学'})[t.help]||'未记'}；证据：${t.evidence||'未记'}。`,verdict(t))});lines.push('',`自主责任验收：${({'yes':'已兑现','partial':'部分兑现','no':'未兑现，需核对原因'})[s.fulfilled]||'未验收'}；奖励：${s.reward} / ${s.rewardState}`,`自己做到的一步／原话：${s.confidence||'未观察，不推断'}`,`下次只改：${s.nextAxis}；${s.nextStep||'暂未定，先看实测'}`);const str=lines.join('\n');const fallback=()=>{const e=document.createElement('textarea');e.value=str;document.body.appendChild(e);e.select();let ok=false;try{ok=document.execCommand('copy')}catch{}e.remove();notify(ok?'记录已复制。':'复制不可用，请导出备份。')};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(str).then(()=>notify('记录已复制，可发给家教、家长或继续同步。'),fallback);else fallback()}
function downloadJSON(obj,name){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function safeRecord(t){return t&&typeof t.id==='string'&&typeof t.name==='string'&&typeof t.template==='string'&&TEMPLATES.some(x=>x.id===t.template)&&n(t.quantity)>0&&n(t.planned)>0&&n(t.teaching)>=0&&typeof t.qualityRule==='string'&&typeof t.group==='string'}
function validateImport(v){if(!v||v.format!=='lemon-task-ruler-backup'||v.version!==1||v.data?.version!==1||!v.data.drafts||!Array.isArray(v.data.history)||v.data.history.length>10000)throw Error('不是支持的任务标尺备份');for(const [k,d] of Object.entries(v.data.drafts)){if(!validDate(k)||!d||!Array.isArray(d.tasks)||d.tasks.length>100||!d.tasks.every(safeRecord)||![60,75,90].includes(Number(d.sessionTotal))||n(d.overhead)===null||n(d.overhead)<0)throw Error('日期或任务结构不正确')}for(const t of v.data.history){if(!safeRecord(t)||!validDate(t.date)||!Number.isFinite(Date.parse(t.savedAt))||n(t.actual)===null||n(t.actual)<0||n(t.done)===null||n(t.done)<0||n(t.teachActual)===null||n(t.teachActual)<0||!['met','notmet','unknown'].includes(t.quality))throw Error('实测记录不完整')}return v}
$('taskForm').addEventListener('submit',e=>{e.preventDefault();if(!$('taskForm').reportValidity())return;const q=n($('quantity').value),planned=n($('taskMinutes').value),teaching=n($('teachingMinutes').value);if(!(q>0&&planned>0&&teaching>=0))return;const info=template($('template').value);const t={id:tid(),sourceId:plannerEditId||undefined,template:info.id,name:$('taskName').value.trim(),unit:info.unit,quantity:q,familiarity:$('familiarity').value,planned,teaching,qualityRule:$('qualityRule').value.trim(),group:$('comparisonGroup').value.trim()||info.group,necessity:$('necessity').value,deadline:$('deadline').value,link:pendingLink,done:'',actual:'',teachActual:'',quality:'',prompts:'',help:'',evidence:''};if(!t.name||!t.qualityRule){notify('请写明材料与完成标准。');return}if(t.familiarity==='learning'&&teaching===0){notify('这项尚不会：先明确如何教学或重新估量。当前仍可记录，但不要套熟练参考。')}session().tasks.push(t);pendingLink=null;plannerEditId=null;persist();renderPlan();renderResults();$('taskMinutes').value='';renderRuler();notify('已加入本次约定。任务约定与教学时间分别计入总预算。')});
$('template').onchange=()=>fillTemplate($('template').value);['quantity','familiarity','taskMinutes','comparisonGroup','qualityRule'].forEach(id=>$(id).addEventListener(id==='familiarity'?'change':'input',renderRuler));
SESSION_FIELDS.forEach(key=>$(key).addEventListener($(key).tagName==='SELECT'||$(key).type==='checkbox'?'change':'input',()=>{session()[key]=$(key).type==='checkbox'?$(key).checked:$(key).value;persist();if(key==='sessionTotal'||key==='overhead')budget()}));
$('sessionDate').onchange=()=>{if(!validDate($('sessionDate').value)){$('sessionDate').value=date;return}persist();date=$('sessionDate').value;renderSession();renderRuler()};
$('saveMeasurements').onclick=saveMeasurements;$('copyRecord').onclick=copyReport;$('print').onclick=()=>window.print();
$('exportData').onclick=()=>downloadJSON({format:'lemon-task-ruler-backup',version:1,exportedAt:new Date().toISOString(),data:db,legacy:Object.fromEntries(PRIOR_KEYS.map(k=>[k,read(k)]))},'lemon-task-records-'+date+'.json');
$('importData').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error('备份超过5MB');const v=validateImport(JSON.parse(await file.text()));if(!confirm('合并备份中的记录？同一日期草稿和同一条实测保留较新版本，不清空其他记录。'))return;for(const [k,d] of Object.entries(v.data.drafts)){if(!db.drafts[k]||(!db.drafts[k].tasks.length&&d.tasks.length)||String(d.updatedAt||'')>String(db.drafts[k].updatedAt||''))db.drafts[k]=d}for(const row of v.data.history){const i=db.history.findIndex(t=>t.id===row.id);if(i<0)db.history.push(row);else if(row.savedAt>db.history[i].savedAt)db.history[i]=row}for(const k of PRIOR_KEYS){if(!read(k)&&v.legacy?.[k]){try{localStorage.setItem(k,JSON.stringify(v.legacy[k]))}catch{}}}persist();renderSession();notify('备份已合并。旧任务池只在本机尚无该数据时恢复。')}catch(err){notify('未导入：'+err.message)}finally{e.target.value=''}};
function navigation(){document.querySelectorAll('.nav a').forEach(a=>{if(a.hash===location.hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}window.addEventListener('hashchange',navigation);

// Planning owns a proposal only. This bridge owns task storage and adopts confirmed proposals.
let plannerEditId=null;
const planningKey=t=>t.sourceId||(t.link?.id?`pool:${t.link.daily?date:(t.link.week||weekKey(date))}:${t.link.id}`:t.id);
function planningSnapshot(){
 const s=session(),pool=read(PRIOR_KEYS[0])||{};
 const linkedDone=t=>t.link?.id&&!!pool.done?.[(t.link.daily?date:(t.link.week||weekKey(date)))+'|'+t.link.id];
 const sources=oldPoolCandidates().map(t=>({
  id:`pool:${t.daily?date:weekKey(date)}:${t.id}`,name:t.name,template:t.template,unit:template(t.template).unit,
  quantity:n(t.quantity),familiarity:t.familiarity||'',qualityRule:t.qualityRule||'',group:t.group||'',
  necessity:t.necessity||(t.daily?'routine':t.type==='school'?'required':t.type==='extra'?'optional':'routine'),
  deadline:t.dueDate||t.deadline||'',windowNote:t.id==='course-pu2'?'周三～四是家庭处理窗口，不是教师硬截止':'',
  completed:t.done,priorEstimate:t.priorEstimate,link:{id:t.id,daily:!!t.daily,week:weekKey(date)}
 }));
 const staged=(Array.isArray(s.candidates)?s.candidates:[]).filter(t=>t&&typeof t.id==='string').map(t=>({...t,completed:linkedDone(t)}));
 const existing=s.tasks.map(t=>({...t,sourceId:planningKey(t)}));
 // Explicit staged details take precedence over placeholders from the fixed/legacy pool.
 const used=new Set(existing.map(t=>t.sourceId)),ids=new Set();
 const candidates=[...staged,...sources].filter(t=>{if(used.has(t.id)||ids.has(t.id))return false;ids.add(t.id);return true});
 return JSON.parse(JSON.stringify({date,session:{sessionTotal:s.sessionTotal,overhead:s.overhead,focus:s.focus,commitment:s.commitment,tasks:existing},
  candidates,history:db.history,templates:TEMPLATES,classes:CLASSES[day(date)]||[]}));
}
function stagePlanningForm(){
 const fields=['taskName','quantity','qualityRule','necessity'];
 for(const id of fields){if(!$(id).reportValidity())return false}
 if(!['required','important','routine','optional'].includes($('necessity').value))return false;
 if($('taskMinutes').value&&!$('taskMinutes').reportValidity())return false;
 if(!$('teachingMinutes').reportValidity())return false;
 const tpl=template($('template').value),s=session();
 const id=plannerEditId||(pendingLink?`pool:${pendingLink.daily?date:(pendingLink.week||weekKey(date))}:${pendingLink.id}`:tid());
 const c={id,template:tpl.id,name:$('taskName').value.trim(),unit:tpl.unit,quantity:n($('quantity').value),
  familiarity:$('familiarity').value,qualityRule:$('qualityRule').value.trim(),group:$('comparisonGroup').value.trim()||tpl.group,
  necessity:$('necessity').value,deadline:$('deadline').value,timeOverride:n($('taskMinutes').value),
  teachingOverride:n($('teachingMinutes').value),splittable:$('plannerSplit').checked,link:pendingLink};
 if(!Array.isArray(s.candidates))s.candidates=[];
 const idx=s.candidates.findIndex(t=>t.id===id);if(idx<0)s.candidates.push(c);else s.candidates[idx]=c;
 plannerEditId=id;persist();notify('已加入生成候选；用时留空将优先取同条件实测，其次才是试用参考。');return true;
}
function editPlanningCandidate(id){
 const t=planningSnapshot().candidates.find(t=>t.id===id);if(!t)return;
 fillTemplate(t.template);plannerEditId=t.id;pendingLink=t.link||null;
 $('taskName').value=t.name;$('quantity').value=t.quantity??'';
 $('necessity').value=t.necessity||'';$('familiarity').value=t.familiarity||'familiar';
 $('qualityRule').value=t.qualityRule||template(t.template).quality;
 $('comparisonGroup').value=t.group||t.name||template(t.template).group;
 $('taskMinutes').value=t.timeOverride??'';$('teachingMinutes').value=t.teachingOverride??0;
 $('deadline').value=t.deadline||'';$('plannerSplit').checked=!!t.splittable;
 renderRuler();$('taskName').focus();$('taskForm').scrollIntoView({block:'start',behavior:'smooth'});
}
function adoptPlanningProposal(proposal,signature){
 if(JSON.stringify(planningSnapshot())!==signature)throw Error('任务、日期或实测已改变，请重新生成；原约定未改动。');
 const s=session(),selected=proposal.selected||[];
 if(!selected.length)throw Error('没有可带入任务，请先补全待确认项。');
 const seen=new Set(s.tasks.map(planningKey));
 const sourceIds=new Set(planningSnapshot().candidates.filter(t=>!t.completed).map(t=>t.id));
 if(selected.some(t=>!sourceIds.has(t.sourceId)||seen.has(t.sourceId)||!safeRecord(t)||n(t.teaching)<0))throw Error('草案任务无效或已带入，请重新生成。');
 if(new Set(selected.map(t=>t.sourceId)).size!==selected.length)throw Error('草案有重复任务。');
 const used=s.tasks.reduce((a,t)=>a+Number(t.planned)+Number(t.teaching),0)+selected.reduce((a,t)=>a+Number(t.planned)+Number(t.teaching),0)+Number(s.overhead);
 if(used>Number(s.sessionTotal))throw Error('草案仍超过总时长，请调整任务或另安排；未改动原约定。');
 const old=JSON.stringify(s);
 const originals=new Map(planningSnapshot().candidates.map(t=>[t.id,t]));
 for(const item of selected){const {basis,support,teachingBasis,...t}=item;s.tasks.push({...t,id:tid(),sourceId:item.sourceId,
   planBasis:basis,planSupport:support,teachingBasis,remainder:item.remainder||0,
   done:'',actual:'',teachActual:'',quality:'',prompts:'',help:'',evidence:''});
   s.candidates=(s.candidates||[]).filter(c=>c.id!==item.sourceId);
   if(item.remainder>0){const source=originals.get(item.sourceId);s.candidates.push({...source,id:tid(),name:source.name+'（剩余）',
     quantity:item.remainder,link:null,timeOverride:null,completed:false,parentSource:item.sourceId});}
 }
 // Remainders are not silently marked completed. Confirmation is still a conversation with Lemon.
 s.lastProposal={date,version:proposal.version,unresolved:[...(proposal.pending||[]),...(proposal.deferred||[])].map(t=>({name:t.name,quantity:t.quantity,unit:t.unit,reason:t.reason})),focus:proposal.focus};
 if(!s.confirmed&&s.tasks.length===selected.length){s.focus=proposal.focus.focus;s.commitment=proposal.focus.commitment}
 s.confirmed=false;
 if(!persist()){db.drafts[date]=JSON.parse(old);throw Error('本地保存失败，未采用草案，请先导出记录。')}
 renderSession();notify('已带入本次约定，原任务和实测保留。请与 Lemon 一起确认范围与责任。');
}
// Stage a voluntary unit review, never infer curriculum completion or create measurements.
function stageUnitReview(subject,unitName){
 const cfg={chinese:{template:'zh-unit-review',name:'语文',minutes:35},math:{template:'math-unit-review',name:'数学',minutes:29}}[subject];
 const unit=text(unitName).trim();
 if(!cfg||!unit||unit.length>60)return {ok:false,message:'请填入已学完的具体单元（最多60字）。'};
 const id='unit-review:'+date+':'+subject+':'+unit,s=session();
 if(s.tasks.some(t=>planningKey(t)===id))return {ok:false,message:'本次约定已包含这个单元复习，无需重复加入。'};
 if((s.candidates||[]).some(t=>t.id===id))return {ok:false,message:'该单元已在候选中，可直接生成草案或调整范围。'};
 const tpl=template(cfg.template),c={id,template:cfg.template,name:cfg.name+' · '+unit+' · 单元复习',
  unit:'次',quantity:1,familiarity:'familiar',qualityRule:tpl.quality,group:cfg.name+'单元复习·'+unit,
  necessity:'optional',deadline:'',timeOverride:cfg.minutes,teachingOverride:0,splittable:false,link:null};
 if(!Array.isArray(s.candidates))s.candidates=[];
 s.candidates.push(c);
 if(!persist()){s.candidates=s.candidates.filter(t=>t.id!==id);return {ok:false,message:'浏览器未能保存候选，请手动录入。'};}
 notify('单元复习已加入候选。'+cfg.minutes+'分钟为试用预算，请核对当天任务与余量。');
 return {ok:true,message:'已加入候选。请审查生成的本次草案。'};
}
window.LemonTaskPlanner=Object.freeze({stageUnitReview,snapshot:planningSnapshot,stageForm:stagePlanningForm,edit:editPlanningCandidate,adopt:adoptPlanningProposal,
 removeCandidate(id){const s=session();s.candidates=(s.candidates||[]).filter(t=>t.id!==id);persist()},
 lastProposal:()=>session().lastProposal||null});

catalogue();fillTemplate('math-xueba');renderSession();navigation();
})();
