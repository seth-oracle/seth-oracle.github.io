(function(){
"use strict";
const root=document.getElementById("oracleDemo");
if(!root)return;
const start=document.getElementById("demoStart"),reset=document.getElementById("demoReset");
const heading=document.getElementById("demoHeading"),details=document.getElementById("demoDetails"),stats=document.getElementById("demoStats");
const buttons=[...root.querySelectorAll("[data-demo-tool]")];
let started=false;
const stages={
  data:{title:"📋 資料",desc:"查看模擬房間編號、觀察狀態與資料摘要。這些是介面示範資訊，不代表實際遊戲紀錄。",metrics:["目前房號｜A-018","觀察紀錄｜50 筆","資料狀態｜示範模式"]},
  speed:{title:"🚀 極速",desc:"展示極速操作的功能入口。正式操作需在支援的遊戲環境中使用；體驗區不會控制遊戲。",metrics:["功能入口｜已選擇","模式｜預覽","遊戲控制｜未連線"]},
  board:{title:"🎯 盤面",desc:"觀察近期畫面與盤面訊號的呈現方式。模擬數字僅用於介面演示，不能預測真實結果。",metrics:["觀察窗｜最近 50 筆","訊號｜資料不足","真實預測｜不提供"]},
  rooms:{title:"🏠 全房",desc:"試試全房掃描結果的排列方式，點擊模擬房間可切換正在查看的房號。",rooms:["A-018","A-032","A-107"]},
  result:{title:"💎 結果",desc:"展示「下輪開獎結果」資訊區的外觀。此處沒有連接實際遊戲資料，不會產生或揭露真實下一輪結果。",metrics:["結果區｜展示","即時資料｜未連線","狀態｜僅供教學"]},
  switch:{title:"↔️ 換邊",desc:"展示助手工具列位置切換的操作體驗，不會修改任何正式介面設定。",metrics:["工具列｜位置已切換","目前模式｜示範","正式遊戲｜未連線"]}
};
function render(tool){
const state=stages[tool];heading.textContent=state.title;details.textContent=state.desc;
stats.replaceChildren();
if(state.rooms){const grid=document.createElement("div");grid.className="demo-rooms";state.rooms.forEach((room,i)=>{
 const b=document.createElement("button");b.type="button";b.className="demo-room";b.textContent="房間 "+room;b.addEventListener("click",()=>{heading.textContent="🏠 房間 "+room;details.textContent="已選擇模擬房間 "+room+"，此操作僅展示選房介面，不連接遊戲。";});grid.appendChild(b);
});stats.appendChild(grid);}
else{const row=document.createElement("div");row.className="demo-kpis";for(const item of state.metrics){const chip=document.createElement("span");chip.className="demo-kpi";chip.textContent=item;row.appendChild(chip)}stats.appendChild(row)}
buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.demoTool===tool)));
}
function begin(){started=true;buttons.forEach(b=>b.disabled=false);start.textContent="體驗進行中";start.disabled=true;render("rooms");}
start.addEventListener("click",begin);
reset.addEventListener("click",()=>{started=false;start.disabled=false;start.textContent="▶ 開始免費體驗";buttons.forEach(b=>{b.disabled=true;b.setAttribute("aria-pressed","false")});heading.textContent="準備開始體驗";details.textContent="按左側「開始免費體驗」，再點六個功能按鈕試操作。";stats.replaceChildren();});
buttons.forEach(b=>b.addEventListener("click",()=>{if(started)render(b.dataset.demoTool)}));
})();