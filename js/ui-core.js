/* Shurokkha · ui-core.js — Render loop, navigation, shared UI fragments */

/* ==================================================================
   RENDER
   ================================================================== */
const HOSTS = {my:'host-my', sp:'host-sp', sec:'host-sec'};
function go(k, screen, data){
  const o = k==='sp' ? S.sp : S.dev[k];
  o.screen = screen; o.data = data || {};
  if (k !== 'sp') o.menu = false;
  S.fresh[k] = true;
}
function render(){
  const keep = {}, scrolls = {};
  for (const k in HOSTS){
    if (S.fresh[k]) continue;
    document.querySelectorAll('#'+HOSTS[k]+' input[id]').forEach(i => keep[i.id] = i.value);
    const sb = document.querySelector('#'+HOSTS[k]+' .scr-body'); if (sb) scrolls[k] = sb.scrollTop;
  }
  const ae = document.activeElement; let fid = null, sel = null;
  if (ae && ae.tagName === 'INPUT' && ae.id){ fid = ae.id; try{ sel = [ae.selectionStart, ae.selectionEnd]; }catch(_){} }
  document.getElementById('host-my').innerHTML = renderShu('my');
  document.getElementById('host-sp').innerHTML = renderSP();
  document.getElementById('host-sec').innerHTML = renderShu('sec');
  for (const id in keep){ const i = document.getElementById(id); if (i) i.value = keep[id]; }
  for (const k in scrolls){ const sb = document.querySelector('#'+HOSTS[k]+' .scr-body'); if (sb) sb.scrollTop = scrolls[k]; }
  if (fid){ const f = document.getElementById(fid); if (f && keep[fid] !== undefined){ f.focus({preventScroll:true}); if (sel) try{ f.setSelectionRange(sel[0], sel[1]); }catch(_){} } }
  S.fresh = {};
  captions(); drawActs(); drawAtk();
}
function sbar(k){
  const n = netOf(k);
  const sig = n==='good' ? '▮▮▮▮' : n==='poor' ? '▮▮▯▯' : '✕ নেটওয়ার্ক নেই';
  return `<div class="statusbar"><span>${clock()}</span><span>${sig}</span></div>`;
}
const shuBar = (d, title, withMenu, back) => `<div class="appbar shu">${SHIELD(20)}<b class="${/[\u0980-\u09FF]/.test(title)?'bnf':''}">${title}</b>${
  withMenu ? `<button class="menu-btn" data-shu="menu" data-d="${d}" aria-label="মেনু">☰</button>`
  : back ? `<button class="rt" data-shu="${back}" data-d="${d}">ফিরুন</button>` : ''}</div>`;
const cue = () => `<div class="cue"><div class="gl">🌿</div><small>আপনার নিরাপত্তা চিহ্ন। এই চিহ্ন না থাকলে অনুরোধটি Shurokkha-র নয়।</small></div>`;
const err = x => x.err ? `<div class="note bad flush">${esc(x.err)}</div>` : '';

