/* UI for a rules-generated proposal. Ruler owns the data; generation never writes measurements. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), E=window.LemonPlanEngine, B=window.LemonTaskPlanner;
  if(!E||!B||!$('generatePlan'))return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let draft=null,signature='',message='';
  const snapshot=()=>B.snapshot();
  const fresh=()=>signature===JSON.stringify(snapshot());
  const chosen=()=>draft?draft.selected.filter(t=>t.use!==false):[];
  function stats(){const selected=chosen(),s=snapshot().session;return {selected,total:Number(s.sessionTotal),used:Number(s.overhead)+draft.budget.existing+selected.reduce((n,t)=>n+t.planned+t.teaching,0)}}
  function candidates(){
    const s=snapshot();
    $('generatorCandidates').innerHTML='<p class="quiet">候选 '+s.candidates.length+' 项 · 原约定 '+s.session.tasks.length+' 项（原约定与实测不会被替换）</p>'+
      s.candidates.filter(t=>t.quantity>0&&!t.completed).map(t=>`<div class="gp-candidate"><span>${esc(t.name)} · ${t.quantity}${esc(t.unit)}</span><button type="button" class="btn small secondary" data-edit="${esc(t.id)}">修改范围</button></div>`).join('');
    const last=B.lastProposal();
    $('adoptedGaps').innerHTML=last?.unresolved?.length?'<details><summary>上次草案仍需另排／核对的部分</summary>'+last.unresolved.map(t=>`<p>${esc(t.name)}：${esc(t.reason)}</p>`).join('')+'</details>':'';
  }
  function list(title,items,editable=false){return !items.length?'':`<details class="gp-detail" ${title.includes('待确认')?'open':''}><summary>${title}（${items.length}）</summary>`+items.map(t=>`<div class="gp-gap"><div><b>${esc(t.name)}</b><p>${esc(t.reason)}</p></div>${editable?`<button type="button" class="btn small secondary" data-edit="${esc(t.id)}">补充／调整</button>`:''}</div>`).join('')+'</details>'}
  function renderStart(){
    const panel=$('startRitualTask'),budget=$('startRitualBudget');
    if(!panel||!budget)return;
    const s=snapshot().session||{},first=(s.tasks||[])[0],overhead=Math.max(0,Number(s.overhead)||0),intro=Math.min(5,Math.floor(overhead/3));
    panel.textContent=first?
      '本次第一项：'+first.name+' · '+first.quantity+first.unit+' · 约定'+first.planned+'分钟。完成标准：'+first.qualityRule+'。请由 Lemon 说出真正的第一步，不让成人替他决定。':
      '本次尚未约定任务。请先核对实际作业并确认本次安排；不要根据课表自动加任务。';
    budget.textContent=intro===5?'原有开始前确认环节已预留5分钟，包含在本次休息与收尾预算内。':
      '当前预算中开始前仅分配'+intro+'分钟；按现有时间简化准备，不要为了凑足5分钟追加学习时间。';
  }
  function render(){
    renderStart();candidates();
    if(!draft){$('generatedPlan').innerHTML=message?`<p class="notice" role="status">${esc(message)}</p>`:'';return}
    const b=stats(),stale=!fresh();
    const rows=draft.selected.map((t,i)=>`<article class="gp-task"><div class="gp-task-head"><label class="check"><input type="checkbox" data-use="${i}" ${t.use===false?'':'checked'}><b>${esc(t.name)} · ${t.quantity}${esc(t.unit)}</b></label><button type="button" class="btn small secondary" data-edit="${esc(t.sourceId)}">调整范围</button></div><p class="note">选入理由：${esc(t.reason)}</p><div class="grid"><div class="field"><label for="gp-time-${i}">建议任务用时（分钟）</label><input id="gp-time-${i}" type="number" data-time="${i}" min="1" max="180" step="1" value="${t.planned}"></div><div class="field"><label for="gp-teach-${i}">另留教学（分钟）</label><input id="gp-teach-${i}" type="number" data-teach="${i}" min="0" max="120" step="1" value="${t.teaching}"></div></div><p class="gp-basis"><strong>${({history:'依据：同量实测',reference:'依据：首次试用参考',adult:'依据：成人预算'})[t.basis.kind]}</strong> · ${esc(t.basis.text)}</p>${t.basis.samples?.length?`<p class="quiet">实测来源：${t.basis.samples.map(h=>esc(h.date)+' / '+h.minutes+'分').join('，')}</p>`:''}<p class="quiet">教学依据：${esc(t.teachingBasis)}</p><p class="note"><b>成人怎么帮：</b>${esc(t.support)}</p><p class="note"><b>结束条件：</b>完成${t.quantity}${esc(t.unit)}；${esc(t.qualityRule)}${t.remainder?'。剩余'+t.remainder+esc(t.unit)+'仍需另排':''}</p>${t.caution?`<p class="quiet">${esc(t.caution)}</p>`:''}</article>`).join('');
    const flow=E.timeline([...draft.existing,...b.selected],Number(snapshot().session.overhead));
    $('generatedPlan').innerHTML=`<div class="gp-summary"><strong>本次草案 · ${esc(draft.date)}</strong><p>已约定任务${draft.budget.existing}分 + 建议任务与教学${b.used-draft.budget.existing-Number(snapshot().session.overhead)}分 + 休息收尾${snapshot().session.overhead}分 = <b>${b.used} / ${b.total}分钟</b></p><p>${b.used>b.total?'仍超时，先删减或调整，不能直接采用。':'留白'+(b.total-b.used)+'分钟，不用填满。'}</p><p><b>只抓一个改善点：</b>${esc(draft.focus.label)}</p><p class="quiet">${esc(draft.focus.reason)}</p></div>`+
      `<p class="quiet">${draft.context.map(esc).join('；')}</p>`+rows+
      (!rows?'<p class="notice">还没有可直接带入的任务。下列是已经知道的任务来源；补全实际范围后再生成，系统不会编造今天的作业量。</p>':'')+
      list('待确认／待另排',draft.pending,true)+list('本次顺延',draft.deferred,true)+list('不重复安排',draft.excluded)+
      (rows?`<details><summary>建议执行顺序与时段</summary><p class="quiet">按本次开始后相对分钟排布，不虚构上课钟点。长段内仍是引导—短时尝试—反馈。</p><div class="gp-timeline">${flow.map(r=>`<div><span>${r.from}–${r.to}分</span><b>${esc(r.name)}</b></div>`).join('')}</div></details>`:'')+
      `<p class="notice ${stale?'warning':''}" role="status">${stale?'任务、日期或实测已更新，请重新生成。':message||'这是草案。修改建议分钟后，依据会标为成人调整；采用只添加已选部分，保留原约定与所有结果。'}</p><div class="actions"><button type="button" class="btn" id="adoptPlan" ${stale||!b.selected.length||b.used>b.total?'disabled':''}>${draft.pending.length?'将已选部分带入约定（待确认项仍保留）':'确认草案，带入本次约定'}</button><button type="button" class="btn secondary" id="regeneratePlan">重新生成</button></div>`;
    $('adoptPlan').onclick=()=>{
      if(!fresh()){render();return}
      try{
        const p=JSON.parse(JSON.stringify(draft));p.selected=chosen();
        p.deferred=[...p.deferred,...draft.selected.filter(t=>t.use===false).map(t=>({...t,reason:'成人在本次草案中未选入；并非已经完成'}))];
        B.adopt(p,signature);draft=null;message='已带入本次约定。请与 Lemon 确认；可以直接到“实测与反馈”记录。';render();
      }catch(e){message=e.message;render()}
    };
    $('regeneratePlan').onclick=generate;
  }
  function generate(){
    try{const s=snapshot();signature=JSON.stringify(s);draft=E.generate(s);message='';render()}
    catch(e){draft=null;message=e.message;render()}
  }
  $('generatePlan').onclick=generate;
  $('stageCandidate').onclick=()=>{if(B.stageForm()){$('planGenerator').scrollIntoView({behavior:'smooth',block:'start'});message='候选已更新，请点击“生成本次建议”。';render()}};
  $('planGenerator').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]');if(edit)B.edit(edit.dataset.edit)});
  $('generatedPlan').addEventListener('change',e=>{
    const el=e.target;if(!draft)return;
    if(el.hasAttribute('data-use'))draft.selected[Number(el.dataset.use)].use=el.checked;
    if(el.hasAttribute('data-time')||el.hasAttribute('data-teach')){
      const teaching=el.hasAttribute('data-teach'),i=Number(teaching?el.dataset.teach:el.dataset.time),v=Number(el.value);
      if(!el.reportValidity()||!Number.isInteger(v)){render();return}
      const t=draft.selected[i];if(teaching){t.teaching=v;t.teachingBasis='成人对本次草案的教学预算调整'}else{t.planned=v;t.basis={...t.basis,kind:'adult',text:'成人调整为'+v+'分钟；原始依据：'+t.basis.text}}
    }
    render();
  });
  window.addEventListener('lemon:taskschange',()=>{if(draft)render();else {candidates();renderStart()}});
  window.addEventListener('lemon:datechange',()=>{draft=null;message='';render()});
  render();
})();
