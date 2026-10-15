/* Lemon Learning · dated curriculum guidance.
   Calendar shows known schedules. The course chapter is never inferred from the date.
   Repository source: ./learning-progress.json; browser edits are private local drafts. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const STORAGE="lemon-curriculum-local-v1";
const NAMES={chinese:"语文 · 人教四上",math:"数学 · 北师大四上",pep:"英语 · PEP四上",pu3:"有道 · Power Up 3",pu2:"新东方 · PU2"};
const weekLabels=["周一","周二","周三","周四","周五","周六","周日"];
// 家庭串联知识顺序来自 active/curriculum/math.md，不能替代学校课次。
const mathUnits=["认识更大的数","整数乘法（二）","运算律","运用数量关系解决问题","线与角","我们生活的空间（二）","图形的奥秘","数据的表示和分析（一）"];
function mathNextFamily(){
 const explicit=nameOf("math","next");if(explicit)return explicit;
 const current=nameOf("math","current");
 const idx=mathUnits.findIndex(unit=>current.includes(unit));
 return idx>=0&&idx+1<mathUnits.length?mathUnits[idx+1]:"";
}
const fallback={updatedAt:"1970-01-01T00:00:00Z",subjects:{
 chinese:{current:"",next:"",status:"unknown"},math:{current:"",next:"",status:"unknown"},
 pep:{current:"",next:"",status:"unknown"},pu3:{current:"",next:"",status:"unknown"},pu2:{current:"",next:"",status:"unknown"}
},reviewSignals:[]};
let baseline=fallback, state=JSON.parse(JSON.stringify(fallback.subjects));
let date=document.documentElement.dataset.lemonDate||iso(new Date());
let loaded=false;
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function asDate(str){let nums=String(str).split("-").map(Number);return new Date(nums[0]||2026,(nums[1]||1)-1,nums[2]||1,12)}
function addDay(str,n){let d=asDate(str);d.setDate(d.getDate()+n);return iso(d)}
function dayIndex(str){return (asDate(str).getDay()+6)%7}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function getJSON(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch(e){return null}}
function sessionSchedule(){
 const s=window.LemonSchedule||{};
 return {school:s.schoolTimetable||[["语文","数学","英语"],["数学","语文"],["数学","语文"],["语文","数学","英语"],["语文","英语"]],
 extras:s.extraClassSchedule||{2:[{period:"晚上",subject:"有道英语 Power Up 3"}],5:[{period:"上午",subject:"数学培优"},{period:"晚上",subject:"有道英语 Power Up 3"}],6:[{period:"下午",subject:"新东方英语 PU2"}]}};
}
function progress(k){return state[k]||fallback.subjects[k]}
function nameOf(k,kind){
 const x=progress(k);return String(x[kind]||"").trim();
}
function hasContent(k){return !!nameOf(k,"current")||!!nameOf(k,"next")}
function target(k,kind){
 const x=nameOf(k,kind);
 return x||((kind==="next"?"下一课":"当前章节")+"（进度待同步）");
}
function extraClasses(day){return sessionSchedule().extras[day]||[]}
function showStatus(message){$("guideStatus").textContent=message}
function note(t,body,tag){
 return '<div class="guide-point"><div class="guide-point-top"><b>'+safe(t)+'</b>'+(tag?'<small>'+safe(tag)+'</small>':'')+'</div><p>'+safe(body)+'</p></div>';
}
function mathSignal(){return (baseline.reviewSignals||[]).find(s=>s.subject==="math"&&s.status==="needs-check")}
function subjectAdvice(key,type){
 if(key==="math"){
  const signal=mathSignal(),curr=nameOf("math","current"),next=nameOf("math","next");
  if(curr){
   const family=mathNextFamily();
   if(type==="preview")return next?
     ("先看 "+next+" 的前置知识；观察例题情境，留下一个问题。"):
     ("学校下一课页码未同步，围绕 "+curr+" 回想一种方法并猜测下节课会用到哪里；不提前刷完整单元。");
   if(progress("math").status==="mastered"&&family)
     return "已标记掌握 "+curr+"；家庭知识线可继续预热 "+family+"，但学校进度与当天实际作业仍优先。";
   return "围绕 "+curr+" 复述一个算理，再做一道能独立解释的新题；不用增加机械题量。";
  }
  if(signal && type!=="preview")return "10月12日发现十位乘法数位问题：把236×42拆为236×2+236×40，说清第二行为何左移，再独立试一题。";
  return type==="preview"?"先核对数学课下一节内容；找一道生活中的例子，回想相关旧知识，观察后带着疑问上课。":"先查看今天学校实际讲到哪页；完成必要作业后，挑一道代表题说清思路，当前单元仍待同步。";
 }
 if(key==="chinese"){
  return type==="preview"?
   ("预读 "+target("chinese","next")+"：轻读一遍、圈两个不熟的字、提出一个问题。不预先写完整练习。"):
   ("围绕 "+target("chinese","current")+"：回顾课文大意、两个重点词和规范笔顺；尝试用自己的话说出一段意思。");
 }
 if(key==="pep"){
  return type==="preview"?
   ("预听读 "+target("pep","next")+" 的词句，找出一条自己能说出来的核心句型。"):
   ("围绕 "+target("pep","current")+"：听一句、说一句、换一个词自己表达，不只背中文释义。");
 }
 if(key==="pu3"){
  return type==="preview"?
   ("预听 "+target("pu3","next")+" 的词句，标记不知道的，不提前把课程作业全部做完。"):
   ("有道PU3：围绕 "+target("pu3","current")+" 课前听读关键词句，课后尝试复述两句，实际作业另由任务池安排。");
 }
 if(key==="pu2"){
  return type==="preview"?
   ("预听读 "+target("pu2","next")+" 的短文或词句，带一个不理解的地方去上课。"):
   ("新东方PU2：围绕 "+target("pu2","current")+" 课前短时听读，课程作业按周三～四的计划单独处理。");
 }
 return "";
}
function todayGuidance(str){
 const wd=dayIndex(str),school=sessionSchedule().school[wd]||[],extras=extraClasses(wd);
 const list=[];
 const schoolKeys=[];
 if(school.includes("数学"))schoolKeys.push("math");
 if(school.includes("语文"))schoolKeys.push("chinese");
 if(school.includes("英语"))schoolKeys.push("pep");
 // Strongly loaded days reserve room for extra classes rather than stacking 3 academic recommendations.
 const classKeys=[];
 if(wd===2||wd===5)classKeys.push("pu3");
 if(wd===6)classKeys.push("pu2");
 const firstSchool=schoolKeys.includes("math")?"math":schoolKeys[0];
 if(firstSchool)list.push({id:firstSchool,tag:"课内回顾",text:subjectAdvice(firstSchool,"today")});
 if(!classKeys.length){
   let second=schoolKeys.find(k=>k!==firstSchool);
   if(second)list.push({id:second,tag:"轻量巩固",text:subjectAdvice(second,"today")});
 }
 classKeys.forEach(k=>list.push({id:k,tag:"今日上课",text:subjectAdvice(k,"today")}));
 if(wd===5)list.unshift({id:"math",tag:"周六数学培优",text:"上午培优前简单回想最近不稳的一处知识，结束后只保留一个值得巩固的问题；不要把整节培优再做一遍。"});
 if(wd===3&&schoolKeys.includes("pep")&&!classKeys.length)list.splice(1,1,{id:"pep",tag:"英语课堂",text:subjectAdvice("pep","today")});
 if(!list.length)list.push({id:"rest",tag:"休整与梳理",text:"没有校内课，不额外推算新教材章节；处理已有作业和已约定的短时复习。"});
 return list;
}
function nextSchoolDay(str){
 let next=str;for(let i=0;i<7;i++){next=addDay(next,1);if(dayIndex(next)<5)return next}return next;
}
function previewGuidance(str){
 const next=nextSchoolDay(str),wd=dayIndex(next),subjects=sessionSchedule().school[wd]||[];
 const keys=[];
 if(subjects.includes("语文"))keys.push("chinese");
 if(subjects.includes("数学"))keys.push("math");
 if(subjects.includes("英语"))keys.push("pep");
 // Preview is a 5–10min preheating suggestion, not mandatory tasks for all subjects.
 const prioritized=keys.slice(0,2);
 return {date:next,day:wd,items:prioritized.map(k=>({id:k,tag:"课前预热",text:subjectAdvice(k,"preview")}))};
}
function renderToday(){
 const wd=dayIndex(date),dayLabel=weekLabels[wd],next=previewGuidance(date);
 $("guideTodayDate").textContent=date+" · "+dayLabel;
 $("guideToday").innerHTML=todayGuidance(date).map(v=>note(NAMES[v.id]||"数学培优",v.text,v.tag)).join("");
 $("guidePreviewDate").textContent=next.date+" · "+weekLabels[next.day];
 $("guidePreview").innerHTML=next.items.map(v=>note(NAMES[v.id],v.text,v.tag)).join("");
 $("guideScope").textContent="上面是依据课程时间与当前进度生成的学习建议，不是额外作业。教材进度仍未同步的科目仅提供预习方法，不能判断学校已经学到哪一课。";
}
function weeklyHeadline(str){
 const wd=dayIndex(str),extras=extraClasses(wd);
 const school=sessionSchedule().school[wd]||[];
 let main="核对实际作业";
 if(wd===2||wd===5)main="有道PU3课堂：课前短听读、课后保留一个问题";
 else if(wd===6)main="新东方PU2课堂：课前预热、课后确认作业";
 else if(school.includes("数学"))main="数学："+(nameOf("math","current")||"结合当天课堂梳理算理");
 else if(school.includes("语文"))main="语文："+(nameOf("chinese","current")||"读懂当天课文与字词");
 const hints=[];
 if(wd===2||wd===3)hints.push("PU2上周日作业安排窗口");
 if(wd===5)hints.push("上午数学培优");
 if(extras.length)hints.push(extras.map(x=>x.period+x.subject.replace(" Power Up 3","PU3").replace("英语 ","")).join(" / "));
 return {main,hints};
}
function renderWeek(){
 const rows=[];
 for(let i=0;i<7;i++){
  const d=addDay(date,i),wd=dayIndex(d),summary=weeklyHeadline(d);
  rows.push('<div class="guide-week-row"><b>'+safe(weekLabels[wd])+' '+safe(d.slice(5))+'</b><span>'+safe(summary.main)+'</span>'+ (summary.hints.length?'<small>'+safe(summary.hints.join(" · "))+'</small>':'')+'</div>');
 }
 $("guideWeek").innerHTML=rows.join("");
}
function renderProgressForm(){
 const form=$("guideProgressForm");form.replaceChildren();
 for(const [key,label] of Object.entries(NAMES)){
  const x=progress(key),block=document.createElement("div");block.className="guide-progress-row";
  const title=document.createElement("strong");title.textContent=label;block.appendChild(title);
  const grid=document.createElement("div");grid.className="guide-inputs";
  for(const [field,placeholder] of [["current","当前学到：单元 / 课文 / 页码"],["next","接下来：下一课 / 下一个学习点"]]){
   const input=document.createElement("input");
   input.type="text";input.value=x[field]||"";input.placeholder=placeholder;input.setAttribute("aria-label",label+" "+placeholder);
   if(key==="math"){input.setAttribute("list","guideMathUnits")}
   input.dataset.subject=key;input.dataset.field=field;
   input.addEventListener("change",handleFieldChange);
   grid.appendChild(input);
  }
  const select=document.createElement("select");select.setAttribute("aria-label",label+"掌握状态");select.dataset.subject=key;select.dataset.field="status";
  const options=[["unknown","进度待同步"],["learning","正在学习"],["needs-review","需要巩固"],["mastered","已掌握"]];
  options.forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;select.appendChild(o)});
  select.value=x.status||"unknown";select.addEventListener("change",handleFieldChange);
  grid.appendChild(select);block.appendChild(grid);
  if(key==="math"&&nameOf("math","current")){
   const hint=document.createElement("div");hint.className="school-note";
   hint.textContent="家庭知识串联下一步："+(mathNextFamily()||"按当前单元完成情况判断")+"；它不是学校下一课的自动推断。";
   block.appendChild(hint);
  }
  form.appendChild(block);
 }
}
function announceProgress(){
 window.dispatchEvent(new CustomEvent('lemon:progresschange',{detail:{subjects:JSON.parse(JSON.stringify(state))}}));
}
function handleFieldChange(event){
 const e=event.target,key=e.dataset.subject,field=e.dataset.field;
 if(!state[key])state[key]={current:"",next:"",status:"unknown"};
 state[key][field]=e.value;
 persistLocal();renderToday();renderWeek();announceProgress();
 if(key==="math"&&(field==="current"||field==="next"))renderProgressForm();
 showStatus("学习进度已保存在本浏览器。可以点击“复制进度摘要”发给我，更新网站的教材进度源。");
}
function persistLocal(){
 try{localStorage.setItem(STORAGE,JSON.stringify({savedAt:new Date().toISOString(),subjects:state}))}catch(e){showStatus("浏览器无法保存，请复制进度摘要")}
}
function copyText(text){
 const fallbackCopy=()=>{
  const e=document.createElement("textarea");e.value=text;document.body.appendChild(e);e.select();
  let success=false;try{success=document.execCommand("copy")}catch(err){}
  e.remove();showStatus(success?"进度摘要已复制，可直接发给我":"复制失败，请手动复制进度内容");
 };
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>showStatus("进度摘要已复制，可直接发给我"),fallbackCopy);
 else fallbackCopy();
}
function exportProgress(){
 const lines=["Lemon 教材进度同步 | "+date,
 "请根据以下实际进度更新学习安排；没确认的项目保留待确认。"];
 for(const [key,label] of Object.entries(NAMES)){
  const x=progress(key);
  lines.push(label+"：当前 "+(x.current||"未确认")+"；下一步 "+(x.next||"未确认")+"；状态 "+({"unknown":"待确认","learning":"正在学习","needs-review":"需要巩固","mastered":"已掌握"}[x.status]||"待确认"));
 }
 lines.push("如有当天作业、老师反馈或教材页码，我会一并发来供判断。");
 copyText(lines.join("\n"));
}
function syncFromRepo(){
 state=JSON.parse(JSON.stringify(baseline.subjects||fallback.subjects));
 try{localStorage.removeItem(STORAGE)}catch(e){}
 renderProgressForm();renderToday();renderWeek();announceProgress();showStatus("已恢复为仓库进度（本地未同步草稿已清除）");
}
function reconcile(source){
 baseline=source&&source.subjects?source:fallback;
 const local=getJSON(STORAGE);
 const sourceTime=Date.parse(baseline.updatedAt)||0,localTime=Date.parse(local?.savedAt)||0;
 state=JSON.parse(JSON.stringify(local&&local.subjects&&localTime>sourceTime?local.subjects:baseline.subjects));
 renderProgressForm();renderToday();renderWeek();
 loaded=true;
 $("guideOrigin").textContent=baseline===fallback?"暂未读取到仓库进度，可先录入并复制同步":"仓库进度更新："+(baseline.updatedAt||"未标注");
 announceProgress();
}
function init(){
 $("guideCopyProgress").addEventListener("click",exportProgress);
 $("guideResetProgress").addEventListener("click",syncFromRepo);
 window.addEventListener("lemon:datechange",e=>{
  date=e.detail?.date||date;
  renderToday();renderWeek();
 });
 // The initial date event is emitted before this script loads, so read the data attribute.
 date=document.documentElement.dataset.lemonDate||date;
 renderToday();renderWeek();
 fetch("./learning-progress.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(reconcile).catch(()=>{
  reconcile(fallback);
  showStatus("教材进度文件暂不可用，已显示通用方法；稍后可刷新重试。");
 });
}
window.LemonLearningProgress=Object.freeze({snapshot:()=>JSON.parse(JSON.stringify(state))});
init();
})();
