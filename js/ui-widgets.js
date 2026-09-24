/* Shurokkha · ui-widgets.js — QR rendering, fingerprint sheet, toasts */

/* ---------------- QR ---------------- */
function qrHTML(data){
  if (window.qrcode){
    try{ const q = qrcode(0, 'M'); q.addData(data); q.make(); return q.createImgTag(3, 6).replace('<img', '<img class="qr"'); }catch(_){}
  }
  const n = 25, c = 5; let seed = 0;
  for (const ch of data) seed = (seed*31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => (seed = (seed*1664525 + 1013904223) >>> 0) / 4294967296;
  const inF = (x,y,ox,oy) => x>=ox && x<ox+7 && y>=oy && y<oy+7;
  const fOn = (x,y,ox,oy) => { const a = x-ox, b = y-oy; return a===0||a===6||b===0||b===6||(a>1&&a<5&&b>1&&b<5); };
  let r = '';
  for (let y=0;y<n;y++) for (let x=0;x<n;x++){
    let on;
    if (inF(x,y,0,0)) on = fOn(x,y,0,0); else if (inF(x,y,n-7,0)) on = fOn(x,y,n-7,0);
    else if (inF(x,y,0,n-7)) on = fOn(x,y,0,n-7); else on = rnd() > .5;
    if (on) r += `<rect x="${x*c}" y="${y*c}" width="${c}" height="${c}"/>`;
  }
  return `<svg class="qr" width="${n*c}" height="${n*c}" viewBox="0 0 ${n*c} ${n*c}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/><g fill="#0D1418">${r}</g></svg>`;
}

/* ---------------- biometric + toast ---------------- */
function biometric(d, title, sub){
  return new Promise(resolve => {
    const layer = document.getElementById('layer-'+d);
    const el = document.createElement('div'); el.className = 'sheet';
    el.innerHTML = `<div class="card"><div class="fp hold" tabindex="0" role="button" aria-label="আঙুলের ছাপ">☝</div>
      <h4>${esc(title)}</h4><p>${esc(sub || 'আঙুলের ছাপ চেপে ধরুন')}</p>
      <p style="font-size:11px;margin-top:-4px">চিহ্নটি চেপে ধরে রাখুন</p>
      <button class="btn ghost" data-x="cancel">বাতিল</button></div>`;
    layer.appendChild(el);
    const fp = el.querySelector('.fp'); let t = null, done = false;
    const finish = ok => { if (done) return; done = true; clearTimeout(t); el.remove(); resolve(ok); };
    fp.addEventListener('pointerdown', e => { e.preventDefault(); fp.classList.add('press'); t = setTimeout(() => finish(true), 650); });
    ['pointerup','pointerleave','pointercancel'].forEach(ev => fp.addEventListener(ev, () => { fp.classList.remove('press'); clearTimeout(t); }));
    fp.addEventListener('keydown', e => { if (e.key===' ' || e.key==='Enter'){ e.preventDefault(); finish(true); } });
    el.querySelector('[data-x=cancel]').onclick = () => finish(false);
    setTimeout(() => fp.focus({preventScroll:true}), 30);
  });
}
async function userVerify(d, title, sub){
  const D = S.dev[d];
  if (S.webauthn && D && D.credId){
    try{
      await navigator.credentials.get({publicKey:{challenge:rand(32), allowCredentials:[{type:'public-key', id:D.credId}], userVerification:'required', timeout:60000}});
      log('WebAuthn platform verification succeeded on '+label(d), 'g'); return true;
    }catch(e){ log('WebAuthn failed ('+(e.name||'error')+') — falling back to press-and-hold'); }
  }
  return biometric(d, title, sub);
}
function toast(k, msg){
  const layer = document.getElementById('layer-'+k); if (!layer) return;
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  layer.appendChild(t); setTimeout(() => t.remove(), 2400);
}

