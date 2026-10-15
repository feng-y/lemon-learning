/* Fourth-grade unit review routines. Douyin videos are unverified reference leads. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),root=$('unitReviewCards'),status=$('unitReviewStatus');
 if(!root||!status)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const plans={
  chinese:{name:'语文',minutes:35,steps:[['背诵与日积月累',8,'遮挡提取，独立背或默'],['句子训练',7,'扩写或仿写，讲清方法'],['阅读理解',12,'回原文定位关键词与依据'],['易错字词',5,'只练实际反复出错处'],['自己总结',3,'说出已会与待复查内容']]},
  math:{name:'数学',minutes:29,steps:[['知识关系',5,'说出核心概念及其联系'],['典型题',8,'用1–2题解释本单元方法'],['小变式',8,'换条件后独立尝试'],['错误复盘',5,'区分概念、方法、计算、读题'],['自己讲解',3,'解释步骤并检查合理性']]}
 };
 let progress={},typed={chinese:'',math:''};
 function advice(key){
  const p=progress[key]||{},current=String(p.current||'').trim(),label=current?'当前记录为“'+current+'”':'教材当前单元未知';
  if(p.status==='mastered')return label+'，状态为已掌握；请另行确认整个单元确已结束。';
  if(p.status==='needs-review')return label+'，状态为需要巩固；优先修复已知薄弱点，不自动加量。';
  if(p.status==='learning')return label+'，状态为正在学习；先完成当前学习，整单元复习可顺延。';
  return label+'；先向学校核实学到哪里，不自动推断章节。';
 }
 function render(){
  for(const k of Object.keys(plans)){const field=$('unitReviewName-'+k);if(field)typed[k]=field.value;}
  root.innerHTML=Object.entries(plans).map(([key,p])=>
   '<article class="unit-review-card"><header><h3>'+p.name+' · 单元复习</h3><strong>'+p.minutes+'分钟</strong></header>'+
   '<p class="unit-review-progress">'+esc(advice(key))+'</p>'+
   '<ol>'+p.steps.map(([title,min,how])=>'<li><span><b>'+esc(title)+'</b><small>'+esc(how)+'</small></span><em>'+min+'分</em></li>').join('')+'</ol>'+
   '<div class="unit-review-entry"><label for="unitReviewName-'+key+'">已确认学完的单元</label>'+
   '<input id="unitReviewName-'+key+'" maxlength="60" placeholder="例如：第二单元 线与角" value="'+esc(typed[key])+'">'+
   '<button class="btn secondary" type="button" data-unit-review="'+key+'">加入候选并生成草案</button></div></article>'
  ).join('');
 }
 root.addEventListener('input',e=>{if(e.target.id==='unitReviewName-chinese')typed.chinese=e.target.value;if(e.target.id==='unitReviewName-math')typed.math=e.target.value;});
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-unit-review]');if(!b)return;
  const key=b.dataset.unitReview,field=$('unitReviewName-'+key),unit=(field?.value||'').trim();
  if(!unit){status.textContent='请先核对实际完成的单元，不从课表或日期推断。';field.focus();return;}
  const bridge=window.LemonTaskPlanner;
  if(!bridge?.stageUnitReview){status.textContent='任务模块尚未载入，请刷新后重试。';return;}
  const outcome=bridge.stageUnitReview(key,unit);status.textContent=outcome.message;
  if(outcome.ok){$('generatePlan').click();$('planGenerator').scrollIntoView({behavior:'smooth',block:'start'});}
 });
 window.addEventListener('lemon:progresschange',e=>{progress=e.detail?.subjects||{};render();});
 progress=window.LemonLearningProgress?.snapshot?.()||{};
 render();
})();
