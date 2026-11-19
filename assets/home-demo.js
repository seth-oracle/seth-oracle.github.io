(()=>{
"use strict";
const root=document.getElementById("oracleDemo");if(!root)return;
const $=id=>document.getElementById(id);
const overlay=$("demoOverlay"),start=$("demoStart"),spin=$("demoSpin"),reset=$("demoReset"),reels=$("demoReels"),drawer=$("demoDrawer"),drawerTitle=$("demoDrawerTitle"),drawerText=$("demoDrawerText"),drawerStats=$("demoDrawerStats"),assistant=$("demoAssistant"),roomIndicator=$("demoRoomIndicator"),status=$("demoPlayStatus"),workflow=$("demoWorkflow"),gameSelect=$("demoGameSelect"),roomFlow=$("demoRoomFlow"),roomResults=$("demoRoomResults"),scan=$("demoScan"),scanStatus=$("demoScanStatus"),stepTitle=$("demoStepTitle"),liveGame=$("demoLiveGame"),gameBrand=$("demoGameBrand");
const symbols=["𓂀","☥","💎","🔱","🪙","𓃭","🪲","✦"];
const buttons=[...root.querySelectorAll("[data-demo-tool]")];
let demoZoom=100;
function setDemoZoom(value){demoZoom=Math.max(75,Math.min(115,value));assistant.style.setProperty("--demo-zoom",String(demoZoom/100));$("demoZoomValue").textContent=demoZoom+"%";}
$("demoZoomOut").addEventListener("click",()=>setDemoZoom(demoZoom-10));
$("demoZoomIn").addEventListener("click",()=>setDemoZoom(demoZoom+10));

let room="A-018",game="",round=0,spinning=false,position=false,scanned=false,demoSpeed=1;
function randomSymbols(){for(const cell of reels.children)cell.textContent=symbols[Math.floor(Math.random()*symbols.length)];}
function closeDrawer(){drawer.hidden=true;buttons.forEach(b=>b.setAttribute("aria-pressed","false"));}
function display(title,desc,values=[],rooms=false){
drawer.classList.remove("oracle-data-mode");drawer.hidden=false;drawerTitle.textContent=title;drawerText.textContent=desc;drawerStats.replaceChildren();
if(rooms){const list=document.createElement("div");list.className="demo-room-list";["A-018","A-032","A-107","B-015","B-026","C-009"].forEach(name=>{const b=document.createElement("button");b.className="demo-room"+(name===room?" is-selected":"");b.type="button";b.textContent="房間 "+name;b.addEventListener("click",()=>{room=name;roomIndicator.textContent="房號 "+name;display("🏠 全房掃描","目前查看示範房號："+name+"。這是房間列表展示，不是真實排行。",[],true);});list.appendChild(b);});drawerStats.appendChild(list);return;}
const row=document.createElement("div");row.className="demo-kpis";for(const value of values){const chip=document.createElement("span");chip.className="demo-kpi";chip.textContent=value;row.appendChild(chip);}drawerStats.appendChild(row);
}
const actions={
data:()=>{
display("賽特神諭","● 模擬體驗中");
drawer.classList.add("oracle-data-mode");
const info=document.createElement("div");info.className="oracle-mini-grid";
const items=[["進房金額","0.71"],["目前點數","0.71"],["本房盈虧","0.00"],["下輪開獎結果","—"],["本房免遊次數","0 次"],["本次完成轉數",String(round)]];
for(const [label,value] of items){const tile=document.createElement("div");tile.className="oracle-mini-tile";const k=document.createElement("span");k.textContent=label;const v=document.createElement("strong");v.textContent=value;tile.append(k,v);info.appendChild(tile);}
const stop=document.createElement("button");stop.type="button";stop.className="oracle-stop-button";stop.textContent="🛡️ 止盈／止損";
const options=document.createElement("div");options.className="oracle-stop-settings";options.hidden=true;
const explanation=document.createElement("p");explanation.textContent="止盈／止損門檻設定示範，不會控制真實遊戲或金額。";
options.appendChild(explanation);
for(const [label,value] of [["止盈點數","300"],["止損點數","200"]]){const row=document.createElement("label");row.textContent=label;const field=document.createElement("input");field.type="number";field.min="0";field.max="1000000";field.value=value;field.inputMode="numeric";field.setAttribute("aria-label",label);row.appendChild(field);options.appendChild(row);}
stop.addEventListener("click",()=>{options.hidden=!options.hidden;stop.setAttribute("aria-expanded",String(!options.hidden));});
stop.setAttribute("aria-expanded","false");
const note=document.createElement("div");note.className="oracle-data-footnote";note.textContent="以上數值僅為介面示範，非即時會員資料。";
drawerStats.append(info,stop,options,note);
},
speed:()=>{
display("🚀 極速加速器","單一加速入口，可切換展示速度。這只控制模擬畫面的動畫，不影響實際 ATG 遊戲。");
const row=document.createElement("div");row.className="oracle-speed-choices";[1,2,3,5].forEach(n=>{const b=document.createElement("button");b.type="button";b.className="demo-room";b.textContent=n+" ×";b.addEventListener("click",()=>{demoSpeed=n;row.querySelectorAll("button").forEach(x=>x.classList.toggle("is-selected",x===b));speedInfo.textContent="目前模擬速度："+n+" 倍 · 可按下方旋轉觀看動畫";});row.appendChild(b)});
const speedInfo=document.createElement("p");speedInfo.textContent="目前模擬速度："+demoSpeed+" 倍";drawerStats.append(row,speedInfo);
},
board:()=>{
display("🎯 盤面監測","近期 50 局訊號觀察展示。介面可切換觀察指標；示範走勢不代表真實機率或可預測結果。");
const plot=document.createElement("div");plot.className="oracle-signal-bars";
[42,61,54,73,48,65,58,70,51,64,57,68].forEach((value,i)=>{const cell=document.createElement("span");cell.style.height=value+"%";cell.title="第 "+(i+1)+" 段觀察示意";plot.appendChild(cell)});
const legend=document.createElement("div");legend.className="demo-kpis";["觀察筆數 50","近期訊號：示範走勢","自動停轉門檻：80%（設定展示）"].forEach(t=>{const cell=document.createElement("span");cell.className="demo-kpi";cell.textContent=t;legend.appendChild(cell)});drawerStats.append(plot,legend);
},
rooms:()=>display("🏠 全房掃描","以下為模擬掃描後的房號清單。點擊房間即可更新目前房號，示範的排行不是實際遊戲分析。",[],true),
result:()=>{
display("💎 下輪開獎結果","展示正式產品的結果顯示區域樣式。這裡沒有連接遊戲伺服器，不提供真實下一輪結果。");
const grid=document.createElement("div");grid.className="oracle-result-grid";["?","?","?","?","?","?"].forEach(v=>{const cell=document.createElement("div");cell.textContent=v;grid.appendChild(cell)});
const note=document.createElement("p");note.textContent="結果狀態：尚未連線 · 避免使用假的開獎答案誤導玩家";drawerStats.append(grid,note);
},
switch:()=>{position=!position;assistant.classList.toggle("to-bottom",position);display("↔️ 工具列換邊","已將六格工具列切換到"+(position?"下方":"上方")+"。再次點擊即可返回。",["目前位置："+(position?"下方":"上方")]);}
};
buttons.forEach(b=>b.addEventListener("click",()=>{buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));actions[b.dataset.demoTool]?.();}));
function chooseGame(name){game=name;gameSelect.hidden=true;roomFlow.hidden=false;roomResults.hidden=true;scanned=false;stepTitle.textContent=name+"｜房間掃描";scanStatus.textContent="已選擇 "+name+"。按下方按鈕，觀看全房掃描操作展示。";scan.disabled=false;scan.textContent="🔎 開始全房掃描";}
root.querySelectorAll("[data-game]").forEach(b=>b.addEventListener("click",()=>chooseGame(b.dataset.game)));
function enterRoom(name){room=name;roomIndicator.textContent="房號 "+name;gameBrand.textContent=game+" · "+name+"（示範）";workflow.hidden=true;liveGame.hidden=false;assistant.hidden=false;spin.disabled=false;status.textContent="已進入示範房間 · 可操作六格助手";randomSymbols();actions.data();}
scan.addEventListener("click",()=>{if(scanned)return;scan.disabled=true;scan.textContent="正在掃描…";scanStatus.textContent="正在展示掃房流程（示範資料）";setTimeout(()=>{scanned=true;scanStatus.textContent="掃描完成！請選擇一間房間進入。";scan.textContent="✓ 掃描完成";roomResults.replaceChildren();["A-018","A-032","A-107","B-015","B-026","C-009"].forEach(name=>{const b=document.createElement("button");b.className="demo-room";b.type="button";b.textContent="🏠 "+name+"｜進入此房";b.addEventListener("click",()=>enterRoom(name));roomResults.appendChild(b);});roomResults.hidden=false;},850);});
start.addEventListener("click",()=>{overlay.hidden=true;workflow.hidden=false;liveGame.hidden=true;gameSelect.hidden=false;roomFlow.hidden=true;stepTitle.textContent="選擇 ATG 遊戲";});
spin.addEventListener("click",()=>{if(spinning)return;spinning=true;spin.disabled=true;closeDrawer();reels.classList.add("is-spinning");status.textContent="展示盤面切換動畫 · 無投注或派彩";let ticks=0;const timer=setInterval(()=>{randomSymbols();if(++ticks>=8){clearInterval(timer);reels.classList.remove("is-spinning");spinning=false;spin.disabled=false;round++;status.textContent="盤面示範 "+round+" 次 · 非實際開獎";}},Math.max(35,130/demoSpeed));});
$("demoClose").addEventListener("click",closeDrawer);
reset.addEventListener("click",()=>{overlay.hidden=false;workflow.hidden=false;gameSelect.hidden=false;roomFlow.hidden=true;roomResults.hidden=true;liveGame.hidden=true;assistant.hidden=true;spin.disabled=true;game="";room="A-018";roomIndicator.textContent="房號 "+room;round=0;scanned=false;position=false;assistant.classList.remove("to-bottom");closeDrawer();status.textContent="等待開始體驗";stepTitle.textContent="選擇 ATG 遊戲";});
randomSymbols();
})();