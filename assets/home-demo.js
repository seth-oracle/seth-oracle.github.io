(()=>{
"use strict";
const root=document.getElementById("oracleDemo");if(!root)return;
const $=id=>document.getElementById(id);
const overlay=$("demoOverlay"),start=$("demoStart"),spin=$("demoSpin"),reset=$("demoReset"),reels=$("demoReels"),drawer=$("demoDrawer"),drawerTitle=$("demoDrawerTitle"),drawerText=$("demoDrawerText"),drawerStats=$("demoDrawerStats"),assistant=$("demoAssistant"),roomIndicator=$("demoRoomIndicator"),status=$("demoPlayStatus");
const symbols=["𓂀","☥","💎","🔱","🪙","𓃭","🪲","✦"];
const buttons=[...root.querySelectorAll("[data-demo-tool]")];
let room="A-018",round=0,spinning=false,position=false;
function randomSymbols(){const items=reels.children;for(const cell of items)cell.textContent=symbols[Math.floor(Math.random()*symbols.length)];}
function closeDrawer(){drawer.hidden=true;buttons.forEach(b=>b.setAttribute("aria-pressed","false"));}
function display(title,desc,values=[],rooms=false){
drawer.hidden=false;drawerTitle.textContent=title;drawerText.textContent=desc;drawerStats.replaceChildren();
if(rooms){
const list=document.createElement("div");list.className="demo-room-list";
["A-018","A-032","A-107","B-015","B-026","C-009"].forEach(name=>{
const b=document.createElement("button");b.className="demo-room"+(name===room?" is-selected":"");b.type="button";b.textContent="🏠 "+name;
b.addEventListener("click",()=>{room=name;roomIndicator.textContent="房號 "+name;display("🏠 全房掃描","已切換至模擬房間 "+name+"。此清單為示範排列，不是真實房間排名。",[],true);});list.appendChild(b);
});drawerStats.appendChild(list);return;
}
const row=document.createElement("div");row.className="demo-kpis";for(const t of values){const el=document.createElement("span");el.className="demo-kpi";el.textContent=t;row.appendChild(el)}drawerStats.appendChild(row);
}
const actions={
data:()=>display("📋 資料摘要","目前僅展示賽特神諭資料面板的呈現方式。",["房號 "+room,"觀測 50 筆（示例）","即時連線：否"]),
speed:()=>display("🚀 極速加速器","已切換至加速器示範畫面，未對任何遊戲發送操作。",["示範：開啟","實際加速：無"]),
board:()=>display("🎯 盤面分析","可查看近期訊號展示。示意資料無法推測真實中獎機率。",["近 50 筆（示例）","訊號：僅展示","機率預測：不提供"]),
rooms:()=>display("🏠 全房掃描","點選一間模擬房間，查看切換效果。",[],true),
result:()=>display("💎 下輪開獎結果","這是結果資訊面板示範，不包含任何真實或可預先取得的開獎結果。",["結果：示例畫面","真實開獎：未連線"]),
switch:()=>{position=!position;assistant.classList.toggle("to-bottom",position);display("↔️ 換邊","已切換工具面板位置。可再次按下切回。",["位置："+(position?"下方":"上方")]);}
};
buttons.forEach(b=>b.addEventListener("click",()=>{buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));actions[b.dataset.demoTool]?.();}));
start.addEventListener("click",()=>{overlay.hidden=true;assistant.hidden=false;spin.disabled=false;status.textContent="可點擊旋轉及六格助手，體驗示範互動";randomSymbols();display("🏠 全房掃描","歡迎體驗賽特神諭！先選一間模擬房間，再試試六格功能。",[],true);});
spin.addEventListener("click",()=>{if(spinning)return;spinning=true;spin.disabled=true;closeDrawer();reels.classList.add("is-spinning");status.textContent="模擬盤面旋轉中（沒有下注或派彩）";let ticks=0;const ticker=setInterval(()=>{randomSymbols();ticks++;if(ticks>=8){clearInterval(ticker);reels.classList.remove("is-spinning");spinning=false;spin.disabled=false;round++;status.textContent="示範旋轉 "+round+" 次 · 無投注、無獎金";}},95);});
$("demoClose").addEventListener("click",closeDrawer);
reset.addEventListener("click",()=>{overlay.hidden=false;assistant.hidden=true;spin.disabled=true;room="A-018";roomIndicator.textContent="房號 "+room;round=0;position=false;assistant.classList.remove("to-bottom");closeDrawer();status.textContent="等待開始體驗";});
randomSymbols();
})();