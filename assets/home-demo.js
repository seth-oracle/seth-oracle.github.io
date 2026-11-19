(()=>{
"use strict";
const root=document.getElementById("oracleDemo");if(!root)return;
const $=id=>document.getElementById(id);
const overlay=$("demoOverlay"),start=$("demoStart"),spin=$("demoSpin"),reset=$("demoReset"),reels=$("demoReels"),drawer=$("demoDrawer"),drawerTitle=$("demoDrawerTitle"),drawerText=$("demoDrawerText"),drawerStats=$("demoDrawerStats"),assistant=$("demoAssistant"),roomIndicator=$("demoRoomIndicator"),status=$("demoPlayStatus"),workflow=$("demoWorkflow"),gameSelect=$("demoGameSelect"),roomFlow=$("demoRoomFlow"),roomResults=$("demoRoomResults"),scan=$("demoScan"),scanStatus=$("demoScanStatus"),stepTitle=$("demoStepTitle"),liveGame=$("demoLiveGame"),gameBrand=$("demoGameBrand");
const symbols=["𓂀","☥","💎","🔱","🪙","𓃭","🪲","✦"];
const buttons=[...root.querySelectorAll("[data-demo-tool]")];
let room="A-018",game="",round=0,spinning=false,position=false,scanned=false;
function randomSymbols(){for(const cell of reels.children)cell.textContent=symbols[Math.floor(Math.random()*symbols.length)];}
function closeDrawer(){drawer.hidden=true;buttons.forEach(b=>b.setAttribute("aria-pressed","false"));}
function display(title,desc,values=[],rooms=false){
drawer.hidden=false;drawerTitle.textContent=title;drawerText.textContent=desc;drawerStats.replaceChildren();
if(rooms){const list=document.createElement("div");list.className="demo-room-list";["A-018","A-032","A-107","B-015","B-026","C-009"].forEach(name=>{const b=document.createElement("button");b.className="demo-room"+(name===room?" is-selected":"");b.type="button";b.textContent="房間 "+name;b.addEventListener("click",()=>{room=name;roomIndicator.textContent="房號 "+name;display("🏠 全房掃描","目前查看示範房號："+name+"。這是房間列表展示，不是真實排行。",[],true);});list.appendChild(b);});drawerStats.appendChild(list);return;}
const row=document.createElement("div");row.className="demo-kpis";for(const value of values){const chip=document.createElement("span");chip.className="demo-kpi";chip.textContent=value;row.appendChild(chip);}drawerStats.appendChild(row);
}
const actions={
data:()=>display("📋 資料","目前房間和資料面板的示範畫面。",["目前遊戲："+game,"房號："+room,"觀察資料：示例"]),
speed:()=>display("🚀 極速加速器","展示極速加速器入口。此模式不對實際遊戲進行加速。",["示範狀態：已開啟","實際遊戲：未連線"]),
board:()=>display("🎯 盤面","展示盤面訊號與近期觀測資料版型，無法由此推斷真實開獎。",["觀測區間：示例","盤面訊號：展示","預測：不提供"]),
rooms:()=>display("🏠 全房掃描","可點選示範房號，查看房間切換介面。",[],true),
result:()=>display("💎 下輪開獎結果","顯示賽特神諭的結果資訊區版型。此處沒有實際開獎資料，也不會預知下一輪。",["結果資料：未連線","介面模式：示範"]),
switch:()=>{position=!position;assistant.classList.toggle("to-bottom",position);display("↔️ 換邊","已變更六格工具列位置。再點一次可切回。",["位置："+(position?"下方":"上方")]);}
};
buttons.forEach(b=>b.addEventListener("click",()=>{buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));actions[b.dataset.demoTool]?.();}));
function chooseGame(name){game=name;gameSelect.hidden=true;roomFlow.hidden=false;roomResults.hidden=true;scanned=false;stepTitle.textContent=name+"｜房間掃描";scanStatus.textContent="已選擇 "+name+"。按下方按鈕，觀看全房掃描操作展示。";scan.disabled=false;scan.textContent="🔎 開始全房掃描";}
root.querySelectorAll("[data-game]").forEach(b=>b.addEventListener("click",()=>chooseGame(b.dataset.game)));
function enterRoom(name){room=name;roomIndicator.textContent="房號 "+name;gameBrand.textContent=game+" · "+name+"（示範）";workflow.hidden=true;liveGame.hidden=false;assistant.hidden=false;spin.disabled=false;status.textContent="已進入示範房間 · 可操作六格助手";randomSymbols();display("📋 資料","已進入 "+game+" 的示範房間 "+name+"。點上方六格功能查看各介面。",["房號 "+name,"狀態：離線示範"]);}
scan.addEventListener("click",()=>{if(scanned)return;scan.disabled=true;scan.textContent="正在掃描…";scanStatus.textContent="正在展示掃房流程（示範資料）";setTimeout(()=>{scanned=true;scanStatus.textContent="掃描完成！請選擇一間房間進入。";scan.textContent="✓ 掃描完成";roomResults.replaceChildren();["A-018","A-032","A-107","B-015","B-026","C-009"].forEach(name=>{const b=document.createElement("button");b.className="demo-room";b.type="button";b.textContent="🏠 "+name+"｜進入此房";b.addEventListener("click",()=>enterRoom(name));roomResults.appendChild(b);});roomResults.hidden=false;},850);});
start.addEventListener("click",()=>{overlay.hidden=true;workflow.hidden=false;liveGame.hidden=true;gameSelect.hidden=false;roomFlow.hidden=true;stepTitle.textContent="選擇 ATG 遊戲";});
spin.addEventListener("click",()=>{if(spinning)return;spinning=true;spin.disabled=true;closeDrawer();reels.classList.add("is-spinning");status.textContent="展示盤面切換動畫 · 無投注或派彩";let ticks=0;const timer=setInterval(()=>{randomSymbols();if(++ticks>=8){clearInterval(timer);reels.classList.remove("is-spinning");spinning=false;spin.disabled=false;round++;status.textContent="盤面示範 "+round+" 次 · 非實際開獎";}},95);});
$("demoClose").addEventListener("click",closeDrawer);
reset.addEventListener("click",()=>{overlay.hidden=false;workflow.hidden=false;gameSelect.hidden=false;roomFlow.hidden=true;roomResults.hidden=true;liveGame.hidden=true;assistant.hidden=true;spin.disabled=true;game="";room="A-018";roomIndicator.textContent="房號 "+room;round=0;scanned=false;position=false;assistant.classList.remove("to-bottom");closeDrawer();status.textContent="等待開始體驗";stepTitle.textContent="選擇 ATG 遊戲";});
randomSymbols();
})();