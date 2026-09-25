/* Shurokkha · harness.js — Researcher harness: attacker console, scenarios, wiring, boot */

/* ==================================================================
   ATTACKER CONSOLE
   ================================================================== */
function drawAtk(){
  const el = $('#atk');
  if (!S.sp.registered){ el.innerHTML = `<p class="nil">Register SafePay first. The attacker targets her SafePay account.</p>`; return; }
  const quote = `<p class="q">“ম্যাডাম, SafePay থেকে বলছি। আপনার অ্যাকাউন্ট সাসপেন্ড হয়েছে। ফোনে যে কোডটা গেছে একটু বলুন।”</p>`;
  if (S.mode === 'legacy'){
    const live = S.otp && S.otp.purpose==='atk' && S.otp.arrived && now() < S.otp.expires ? S.otp : null;
    el.innerHTML = quote + `<p class="nil">Assume her SafePay PIN was already phished. The attacker logs in from Chattogram, which sends a real SMS to her phone.</p>
      <div style="margin-top:9px"><button class="chip hot" data-k="leg-login">Log in as her → SMS to her phone</button></div>
      ${live ? `<div class="steal">${live.code}</div><p class="nil" style="color:#EFA79C">Visible on her phone right now. It works for whoever holds it.</p>`
        : S.otp && S.otp.purpose==='atk' && !S.otp.arrived ? `<p class="nil" style="margin-top:8px;color:#C79A92">Waiting for the SMS to reach her…</p>` : ''}
      <div class="atkrow"><input id="atkCode" placeholder="code she read out" inputmode="numeric"><button class="chip hot" data-k="leg-use">Use it</button></div>
      ${S.atk.in ? `<div class="res r">Attacker is inside SafePay. Balance visible: ৳${grp(S.sp.balance)}.</div>` : ''}
      ${S.atk.evicted ? `<div class="res g">Attacker session ended from SafePay → ডিভাইস ও সেশন.</div>` : ''}`;
  } else {
    const locked = now() < S.lockUntil;
    el.innerHTML = quote + `<p class="nil">No transmitted code exists anywhere in this flow. There is nothing on her screen to read out.</p>
      <div style="margin-top:9px;display:flex;flex-wrap:wrap;gap:6px">
        <button class="chip hot" data-k="shu-login">Log in to SafePay as her</button>
        <button class="chip hot" data-k="shu-bomb">Push-bomb · 5 requests</button>
      </div>
      <p class="nil" style="margin-top:9px;color:#C79A92">Her phone shows the attacker's device and Chattogram as the location.</p>
      ${S.atk.blocked ? `<div class="res g">Blocked. She read the location and tapped না.</div>` : ''}
      ${S.atk.in ? `<div class="res r">She tapped হ্যাঁ — attacker is in. A yes/no prompt still depends on the person reading it.</div>` : ''}
      ${S.atk.evicted ? `<div class="res g">Attacker session ended from SafePay → ডিভাইস ও সেশন.</div>` : ''}
      ${locked ? `<div class="res g">Rate limit active: requests from unrecognised devices blocked for ${Math.ceil((S.lockUntil-now())/60000)} min.</div>` : ''}`;
  }
}
function suspiciousRequest(){
  if (now() < S.lockUntil){ log('ATTACKER request dropped — Shurokkha rate limit active', 'g'); drawAtk(); return false; }
  if (!holders().length){ log('ATTACKER: SafePay is not linked to Shurokkha yet', ''); return false; }
  S.burst = S.burst.filter(t => now() - t < 60000); S.burst.push(now());
  if (S.burst.length >= 3){
    S.lockUntil = now() + 600000;
    if (S.pending && S.pending.origin === 'atk') S.pending = null;
    activeDevs().forEach(d => S.lockAlert[d] = true);
    log('Shurokkha: 3 suspicious requests in 60s — unrecognised devices blocked for 10 min, user alerted', 'g');
    render(); return false;
  }
  S.atk = {};
  assess('login', {session:false, suspicious:true, location:'চট্টগ্রাম'});
  request({app:'SafePay', kind:'login', origin:'atk', device:'Windows PC · Chrome', place:'চট্টগ্রাম', suspicious:true});
  log('ATTACKER: login attempt from Chattogram with her phished PIN', 'r');
  render(); return true;
}
const K = {
  'leg-login'(){ S.atk = {}; assess('login', {session:false, location:'চট্টগ্রাম'}); sendSMS('atk'); log('ATTACKER logged in with her phished PIN — SMS sent to her phone', 'r'); render(); },
  'leg-use'(){
    const v = val('atkCode'), rec = S.otp;
    if (!rec || rec.purpose !== 'atk' || v !== rec.code || !rec.arrived || now() > rec.expires){ log('ATTACKER code rejected'); drawAtk(); return; }
    S.atk.in = true; S.otp = null;
    S.sp.sessions.push({name:'Windows PC · Chrome', place:'চট্টগ্রাম', atk:true});
    log('ATTACKER SUCCEEDED — a code read out over the phone was reused on another device', 'r'); render();
  },
  'shu-login'(){ suspiciousRequest(); },
  'shu-bomb'(){ let i = 0; const fire = () => { if (i++ >= 5) return; if (suspiciousRequest()) setTimeout(fire, 900); }; fire(); }
};

/* ==================================================================
   HARNESS: scenarios, captions, global
   ================================================================== */
function drawActs(){
  const c = [];
  if (!S.acct.registered) c.push(['hint', t('Start on My Device: রেজিস্টার → register Shurokkha.', 'Start on My Device: Register → register Shurokkha.')]);
  else if (!S.sp.registered) c.push(['sp-reg', t('Register on SafePay', 'Register on SafePay')]);
  else {
    if (!S.sp.loggedIn) c.push(['sp-login', t('Log in to SafePay', 'Log in to SafePay')]);
    else c.push(['bal',t('Check balance','Check balance')], ['s1',t('Send ৳1,200 · saved','Send ৳1,200 · saved')], ['s2',t('Send ৳12,000 · saved','Send ৳12,000 · saved')], ['s3',t('Send ৳45,000 · new','Send ৳45,000 · new')],
                ['add',t('Add ৳5,000','Add ৳5,000')], ['chpin',t('Change SafePay PIN','Change SafePay PIN')], ['sess',t('SafePay sessions','SafePay sessions')]);
    c.push(['sec-in',t('Second device sign-in','Second device sign-in')], ['lost',t('Lost phone → recovery','Lost phone → recovery')]);
  }
  $('#acts').innerHTML = c.map(([k,l]) => k==='hint' ? `<p class="hint">${l}</p>` : `<button class="chip" data-s="${k}">${l}</button>`).join('');
}
const SC = {
  'sp-reg'(){ go('sp', 'reg'); render(); },
  'sp-login'(){ go('sp', 'login'); render(); },
  bal(){ SPA.balance(); },
  s1(){ go('sp', 'send', {to:'01712345678', amt:1200}); render(); },
  s2(){ go('sp', 'send', {to:'01712345678', amt:12000}); render(); },
  s3(){ go('sp', 'send', {to:'01955667788', amt:45000}); render(); },
  add(){ go('sp', 'add', {amt:5000}); render(); },
  chpin(){ go('sp', 'chpin'); render(); },
  sess(){ go('sp', 'sessions'); render(); },
  'sec-in'(){ go('sec', 'signin'); render(); },
  lost(){ go('sec', 'lost'); render(); }
};
function captions(){
  $('#capMy').textContent = S.dev.my.revoked ? 'key revoked' : S.acct.registered ? 'Shurokkha · keys in chip' : 'Shurokkha installed';
  $('#capSp').textContent = S.sp.loggedIn ? 'logged in' : S.links.safepay ? 'linked to Shurokkha' : 'tablet / computer';
  $('#capSec').textContent = S.dev.sec.revoked ? 'key revoked' : S.dev.sec.active ? 'Shurokkha · own keys' : 'new phone';
  $('#dotMy').className = 'net-dot ' + (S.net==='good' ? '' : S.net);
}
function drawCryptoBadge(){
  $('#cryptoBadge').innerHTML = S.webauthn
    ? `<span class="cryptobadge real">● WebAuthn platform authenticator available</span>`
    : `<span class="cryptobadge">● WebAuthn blocked in this frame — WebCrypto ECDSA + press-and-hold</span>`;
}
const G = {
  export(){ const b = $('#exportBox'); b.style.display = 'block';
    b.value = JSON.stringify({generated:new Date().toISOString(), mode:S.mode, events:S.log}, null, 1); },
  async copy(){ G.export(); try{ await navigator.clipboard.writeText($('#exportBox').value); const c = $('#logCount'), o = c.textContent; c.textContent = 'copied'; setTimeout(() => c.textContent = o, 1200); }catch(_){ $('#exportBox').select(); } },
  reset(){
    try{ localStorage.removeItem('shurokkha.log'); }catch(_){}
    const wa = S.webauthn, curLang = S.lang || 'bn'; Object.assign(S, fresh()); S.webauthn = wa; S.lang = curLang;
    [...$('#langSeg').children].forEach(x => x.setAttribute('aria-pressed', x.dataset.lang===S.lang));
    [...$('#modeSeg').children].forEach(x => x.setAttribute('aria-pressed', x.dataset.mode==='shurokkha'));
    [...$('#netSeg').children].forEach(x => x.setAttribute('aria-pressed', x.dataset.net==='good'));
    ['layer-my','layer-sp','layer-sec'].forEach(id => document.getElementById(id).innerHTML = '');
    S.fresh = {my:true, sp:true, sec:true};
    drawLog(); drawInspector(); log('demo reset', 'k'); render();
  }
};

/* ---------------- wiring ---------------- */
document.addEventListener('click', e => {
  const lg = e.target.closest('[data-lang]');
  if (lg){
    S.lang = lg.dataset.lang;
    document.querySelectorAll('[data-lang]').forEach(x => x.setAttribute('aria-pressed', x.dataset.lang === S.lang));
    log(`language → ${S.lang === 'en' ? 'English' : 'Bangla'}`);
    render(); return;
  }
  const t = e.target.closest('[data-shu],[data-sp],[data-k],[data-g],[data-s]');
  if (t && !t.disabled){
    if (t.dataset.shu !== undefined){
      if (t.dataset.shu === 'menu-close' && e.target.closest('.dp')) return;
      const f = SHU[t.dataset.shu]; if (f) f(t.dataset.d, t); return;
    }
    if (t.dataset.sp !== undefined){ const f = SPA[t.dataset.sp]; if (f) f(t); return; }
    if (t.dataset.k !== undefined){ const f = K[t.dataset.k]; if (f) f(t); return; }
    if (t.dataset.g !== undefined){ const f = G[t.dataset.g]; if (f) f(t); return; }
    if (t.dataset.s !== undefined){ const f = SC[t.dataset.s]; if (f) f(t); return; }
  }
  const m = e.target.closest('#modeSeg button');
  if (m){
    S.mode = m.dataset.mode;
    [...$('#modeSeg').children].forEach(x => x.setAttribute('aria-pressed', x === m));
    S.pending = null; S.linkReq = null; S.otp = null; S.otpHist = []; S.sp.modal = null; S.atk = {};
    go('sp', S.sp.loggedIn ? 'home' : 'landing');
    log(`mode → ${S.mode}`, S.mode==='legacy' ? 'r' : 'g');
    if (S.signals) assess(S.signals.action, S.signals); render(); return;
  }
  const n = e.target.closest('#netSeg button');
  if (n){
    S.net = n.dataset.net;
    [...$('#netSeg').children].forEach(x => x.setAttribute('aria-pressed', x === n));
    log(`My Device network → ${S.net}`);
    // pending pushes re-route when the network changes
    [S.pending, S.linkReq].forEach(R => {
      if (!R || R.status !== 'pending' || R.offline) return;
      R.targets.forEach(t => {
        const nn = netOf(t);
        if (nn === 'none'){ if (R.deliverAt[t] > now()) R.deliverAt[t] = Infinity; }   // already-delivered pushes stay on screen
        else if (!isFinite(R.deliverAt[t]) || R.deliverAt[t] > now()){ R.deliverAt[t] = now() + (nn==='poor' ? 1600 : 350); setTimeout(render, R.deliverAt[t] - now() + 40); }
      });
    });
    if (S.signals) assess(S.signals.action, S.signals); render();
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || !e.target.closest('.screen')) return;
  const b = e.target.closest('.scr-body')?.querySelector('.btn:not(.ghost):not(.warn):not([disabled])');
  if (b){ e.preventDefault(); b.click(); }
});
setInterval(() => {
  document.querySelectorAll('[data-exp]').forEach(el => {
    const left = Math.max(0, Math.ceil((+el.dataset.exp - now())/1000));
    el.textContent = left ? left + 's' : 'expired'; el.style.color = left < 15 ? '#B4432F' : '';
  });
}, 500);

/* ---------------- boot ---------------- */
(async function boot(){
  // vendor/qrcode.js is bundled; fall back to the CDN only if it failed to load
  if (!window.qrcode){
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    s.onload = () => render(); s.onerror = () => {};
    document.head.appendChild(s);
  }
  S.webauthn = await probeWebAuthn(); drawCryptoBadge();
  try{ const raw = localStorage.getItem('shurokkha.log'); if (raw) S.log = JSON.parse(raw); }catch(_){}
  log('session started', 'k');
  drawInspector(); render();
})();
