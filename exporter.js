import { escapeHtml, getAllItems, getItemImageAsset, normalizeAssetName } from "./parser.js";

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function exportAssetsForLesson(lesson, assets) {
  const used = {};
  for (const item of getAllItems(lesson)) {
    const asset = getItemImageAsset(item, assets);
    if (asset) used[normalizeAssetName(item.image)] = asset;
  }
  return used;
}

export function createStandaloneHtml(lesson, assets) {
  const payload = safeJson({ lesson, assets: exportAssetsForLesson(lesson, assets) });
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(lesson.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{color-scheme:dark;--bg:#080705;--bg2:#11100d;--panel:rgba(30,27,22,.72);--panel2:rgba(255,246,219,.08);--line:rgba(255,236,184,.16);--ink:#fff6e2;--muted:#bdb3a0;--gold:#e8c877;--jade:#78c6b2;--rose:#d89477;--shadow:0 28px 80px rgba(0,0,0,.42);font-family:Inter,"IBM Plex Sans Arabic","Noto Sans Arabic",system-ui,sans-serif;letter-spacing:0}*{box-sizing:border-box}body{margin:0;min-height:100vh;color:var(--ink);background:linear-gradient(135deg,#070605,#14110d 42%,#0b1b1b 100%);overflow-x:hidden}body:before{content:"";position:fixed;inset:0;background:radial-gradient(circle at 50% 0%,rgba(244,207,126,.16),transparent 34%),linear-gradient(120deg,rgba(119,198,178,.08),transparent 48%,rgba(216,148,119,.08));pointer-events:none}.app{position:relative;min-height:100vh}.top{position:sticky;top:0;z-index:10;display:flex;gap:16px;align-items:center;justify-content:space-between;padding:18px 24px;background:rgba(8,7,5,.66);backdrop-filter:blur(24px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:12px;font-weight:800}.mark{display:grid;place-items:center;width:44px;height:44px;border-radius:16px;background:linear-gradient(145deg,#f2d987,#785225);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 18px 46px rgba(232,200,119,.18);color:#171009}.controls{display:flex;gap:10px}.btn{border:1px solid var(--line);background:rgba(255,255,255,.07);color:var(--ink);border-radius:999px;padding:11px 14px;font:inherit;font-weight:700;cursor:pointer;transition:transform .2s ease,background .2s ease,border .2s ease}.btn:hover{transform:translateY(-1px);background:rgba(255,255,255,.11);border-color:rgba(232,200,119,.38)}.btn:focus-visible{outline:3px solid rgba(232,200,119,.35);outline-offset:3px}.layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px;padding:22px;max-width:1480px;margin:0 auto}.side{position:sticky;top:92px;align-self:start;border:1px solid var(--line);background:linear-gradient(160deg,rgba(255,255,255,.09),rgba(255,255,255,.035));backdrop-filter:blur(24px);border-radius:28px;padding:18px;box-shadow:var(--shadow)}.progress{height:10px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}.progress span{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--jade));border-radius:inherit}.sectionBtn{width:100%;margin-top:10px;text-align:start;border:1px solid transparent;background:transparent;color:var(--muted);padding:12px;border-radius:16px;cursor:pointer;font:inherit}.sectionBtn.active,.sectionBtn:hover{background:rgba(255,255,255,.08);border-color:var(--line);color:var(--ink)}main{min-width:0}.hero{padding:28px 4px 24px}.hero h1{font-size:2.6rem;line-height:1.05;margin:0 0 10px}.hero p{color:var(--muted);max-width:760px}.section{margin:0 0 34px}.section h2{font-size:1.35rem}.intro{color:var(--muted);line-height:1.8}.grid{display:grid;gap:16px}.card{border:1px solid var(--line);background:linear-gradient(145deg,rgba(255,255,255,.1),rgba(255,255,255,.035));border-radius:28px;padding:22px;box-shadow:0 18px 60px rgba(0,0,0,.24);transition:transform .24s ease,border-color .24s ease,background .24s ease}.card.active{border-color:rgba(232,200,119,.5);background:linear-gradient(145deg,rgba(255,255,255,.135),rgba(255,255,255,.05))}.meta{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}.badge{border:1px solid var(--line);border-radius:999px;padding:6px 10px;color:var(--gold);font-size:.78rem;font-weight:800;text-transform:uppercase}.chip{border:1px solid rgba(120,198,178,.24);border-radius:999px;padding:5px 9px;color:#bfe7db;font-size:.78rem}.arabic{direction:rtl;font-family:"Noto Sans Arabic","IBM Plex Sans Arabic",sans-serif;font-size:2.15rem;line-height:1.65;margin:0 0 16px;text-align:right}.actions{display:flex;gap:10px;flex-wrap:wrap}.reveal{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s ease}.reveal.open{grid-template-rows:1fr}.reveal>div{overflow:hidden}.translation{margin-top:14px;color:#f7e7bd;font-size:1.05rem;line-height:1.8}.imageWrap{margin-top:16px;border-radius:24px;overflow:hidden;border:1px solid rgba(232,200,119,.28);box-shadow:0 26px 70px rgba(0,0,0,.38),0 0 70px rgba(232,200,119,.11);background:#0d0b08}.imageWrap img{display:block;width:100%;max-height:520px;object-fit:cover}.caption{padding:12px 14px;color:var(--muted);font-size:.92rem}.focus{position:fixed;inset:0;z-index:30;background:linear-gradient(135deg,rgba(6,5,4,.96),rgba(18,15,11,.96) 55%,rgba(8,28,27,.94));display:grid;grid-template-rows:auto 1fr auto;padding:20px}.focus .card{max-width:900px;margin:auto;width:min(900px,100%)}.focusBar{display:flex;align-items:center;justify-content:space-between}.focusNav{display:flex;gap:12px;justify-content:center;padding:18px}.srOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:820px){.top{padding:14px}.layout{grid-template-columns:1fr;padding:14px}.side{position:relative;top:auto}.hero h1{font-size:2rem}.arabic{font-size:1.7rem}.controls{gap:6px}.btn{padding:10px 12px}.top{align-items:flex-start}.brand span:last-child{display:none}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
</style>
</head>
<body>
<div class="app" id="app"></div>
<script id="lesson-data" type="application/json">${payload}</script>
<script>
(() => {
  const { lesson, assets } = JSON.parse(document.getElementById("lesson-data").textContent);
  const app = document.getElementById("app");
  const state = { sectionId: lesson.sections[0]?.id || "", itemId: lesson.sections[0]?.items[0]?.id || "", shownTranslations: {}, shownImages: {}, studied: {}, focus: false };
  const norm = (name = "") => String(name).trim().replace(/^\\.?[\\\\/]+/, "").toLowerCase();
  const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
  const allItems = () => lesson.sections.flatMap(section => section.items);
  const activeItem = () => allItems().find(item => item.id === state.itemId) || allItems()[0];
  const assetFor = item => item?.image ? assets[norm(item.image)] : null;
  const pct = () => allItems().length ? Math.round(Object.keys(state.studied).length / allItems().length * 100) : 0;
  function chips(item){ return ["cefr","dialect","topic","function","root","frequency"].filter(k=>item[k]).map(k=>'<span class="chip">'+esc(item[k])+'</span>').join(""); }
  function card(item){
    const asset = assetFor(item);
    return '<article class="card '+(item.id===state.itemId?'active':'')+'" data-card="'+item.id+'"><div class="meta"><span class="badge">'+esc(item.type)+'</span>'+chips(item)+'</div><p class="arabic" lang="ar" dir="rtl">'+esc(item.arabic)+'</p><div class="actions"><button class="btn" data-action="translation" data-id="'+item.id+'" aria-expanded="'+!!state.shownTranslations[item.id]+'">'+(state.shownTranslations[item.id]?'Hide Translation':'Show Translation')+'</button>'+(asset?'<button class="btn" data-action="image" data-id="'+item.id+'" aria-expanded="'+!!state.shownImages[item.id]+'">'+(state.shownImages[item.id]?'Hide Image':'Show Image')+'</button>':'')+'<button class="btn" data-action="studied" data-id="'+item.id+'">'+(state.studied[item.id]?'Studied':'Mark Studied')+'</button></div><div class="reveal '+(state.shownTranslations[item.id]?'open':'')+'"><div><p class="translation">'+esc(item.translation)+'</p></div></div>'+(asset?'<div class="reveal '+(state.shownImages[item.id]?'open':'')+'"><div><figure class="imageWrap"><img src="'+asset.dataUrl+'" alt="'+esc(item.image || item.arabic)+'"><figcaption class="caption">'+esc(item.image || item.arabic)+'</figcaption></figure></div></div>':'')+'</article>';
  }
  function render(){
    const active = activeItem();
    state.sectionId = active?.sectionId || state.sectionId;
    app.innerHTML = '<header class="top"><div class="brand"><span class="mark">ع</span><span>'+esc(lesson.title)+'</span></div><div class="controls"><button class="btn" data-action="prev">Previous</button><button class="btn" data-action="focus">'+(state.focus?'Exit Focus':'Focus')+'</button><button class="btn" data-action="next">Next</button></div></header><div class="layout"><aside class="side"><strong>'+pct()+'% complete</strong><div class="progress"><span style="width:'+pct()+'%"></span></div>'+lesson.sections.map(section=>'<button class="sectionBtn '+(section.id===state.sectionId?'active':'')+'" data-action="section" data-id="'+section.id+'">'+esc(section.title)+'</button>').join("")+'</aside><main><section class="hero"><h1>'+esc(lesson.title)+'</h1><p>'+lesson.sections.length+' sections · '+allItems().length+' learning items · Jordanian Arabic lesson package</p></section>'+lesson.sections.map(section=>'<section class="section" id="'+section.id+'"><h2>'+esc(section.title)+'</h2>'+(section.intro?'<p class="intro">'+esc(section.intro)+'</p>':'')+'<div class="grid">'+section.items.map(card).join("")+'</div></section>').join("")+'</main></div>'+(state.focus&&active?'<div class="focus" role="dialog" aria-modal="true"><div class="focusBar"><strong>'+esc(lesson.title)+'</strong><button class="btn" data-action="focus">Close</button></div>'+card(active)+'<div class="focusNav"><button class="btn" data-action="prev">Previous</button><button class="btn" data-action="next">Next</button></div></div>':'');
  }
  function move(delta){ const items=allItems(); const i=Math.max(0,items.findIndex(item=>item.id===state.itemId)); const next=items[Math.min(items.length-1,Math.max(0,i+delta))]; if(next){state.itemId=next.id; state.sectionId=next.sectionId; state.studied[next.id]=true; render(); setTimeout(()=>document.querySelector('[data-card="'+next.id+'"]')?.scrollIntoView({behavior:"smooth",block:"center"}),0);} }
  app.addEventListener("click", e => { const btn=e.target.closest("[data-action]"); if(!btn)return; const id=btn.dataset.id; const action=btn.dataset.action; if(action==="translation")state.shownTranslations[id]=!state.shownTranslations[id]; if(action==="image")state.shownImages[id]=!state.shownImages[id]; if(action==="studied")state.studied[id]=!state.studied[id]; if(action==="section"){const s=lesson.sections.find(x=>x.id===id); if(s?.items[0]){state.sectionId=id;state.itemId=s.items[0].id;}} if(action==="focus")state.focus=!state.focus; if(action==="next")move(1); if(action==="prev")move(-1); render(); });
  document.addEventListener("keydown", e => { if(e.key==="Escape"&&state.focus){state.focus=false;render();} if(["ArrowRight","ArrowDown"," "].includes(e.key)){e.preventDefault();move(1);} if(["ArrowLeft","ArrowUp"].includes(e.key)){e.preventDefault();move(-1);} });
  let touchX=0; document.addEventListener("touchstart", e=>{touchX=e.changedTouches[0].clientX},{passive:true}); document.addEventListener("touchend", e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>60)move(dx<0?1:-1)},{passive:true});
  render();
})();
</script>
</body>
</html>`;
}
