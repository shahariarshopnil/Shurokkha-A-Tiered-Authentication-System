/* Shurokkha · auth-flows.js — Approval requests, key routing, app linking, legacy SMS simulation */

/* ==================================================================
   DEVICE / KEY HELPERS
   ================================================================== */
const netOf = d => d==='my' ? S.net : 'good';
const activeDevs = () => ['my','sec'].filter(d => S.dev[d].active && !S.dev[d].revoked);
const holders = () => S.links.safepay ? Object.keys(S.links.safepay.keys).filter(d => S.dev[d].active && !S.dev[d].revoked) : [];
function keysFor(P, d){
  if (P.app === 'SafePay'){
    const k = S.links.safepay.keys[d];
    return {priv:k.kp.privateKey, pub:S.sp.pub[d], seed:k.seed, srvSeed:S.sp.seeds[d]};
  }
  const k = S.dev[d].key;
  return {priv:k.kp.privateKey, pub:S.shuPub[d], seed:k.seed, srvSeed:S.shuSeeds[d]};
}
async function activateDevice(d){
  const D = S.dev[d];
  D.key = await makeKeys(); S.shuPub[d] = D.key.jwk; S.shuSeeds[d] = D.key.seed;
  log(`${label(d)}: Shurokkha device keypair created · public key registered`, 'k');
  if (S.links.safepay){
    const k = await makeKeys(); S.links.safepay.keys[d] = k; S.sp.pub[d] = k.jwk; S.sp.seeds[d] = k.seed;
    log(`${label(d)}: new SafePay keypair · private stays on device · public key registered with SafePay`, 'k');
  }
  D.active = true; D.signedIn = true; D.revoked = false;
}
function revokeDevice(d){
  const D = S.dev[d];
  D.active = false; D.revoked = true; D.signedIn = false; D.menu = false;
  delete S.shuPub[d]; delete S.shuSeeds[d];
  if (S.links.safepay) delete S.links.safepay.keys[d];
  delete S.sp.pub[d]; delete S.sp.seeds[d];
  if (S.pending && S.pending.targets) S.pending.targets = S.pending.targets.filter(t => t !== d);
  log(`${label(d)} revoked · its Shurokkha key and SafePay public key deleted server-side`, 'g');
}

/* ==================================================================
   APPROVAL REQUESTS — the core mechanism
   ================================================================== */
function request(o){
  const isSP = o.app === 'SafePay';
  const targets = isSP ? holders() : activeDevs().filter(t => t !== o.originDev);
  if (!targets.length) return null;
  const P = Object.assign({id:hex(rand(3)), status:'pending', createdAt:now(), deliverAt:{}, resp:{},
    popupResp:{}, scanned:{}, hidden:{}, tier:S.tier}, o);
  P.targets = targets;
  P.challenge = [hex(rand(4)), o.app, o.kind, o.amount||0, o.payee||o.device||'-'].join('|');
  if (!P.offline) P.offline = targets.every(t => netOf(t) === 'none');
  scheduleDelivery(P);
  S.pending = P;
  log(`${o.app} ${o.kind} → ${targets.map(label).join(', ')} · ${P.offline ? 'no network: QR + 8 digits' : 'push'} · challenge ${P.challenge}`, 'k');
  return P;
}
function scheduleDelivery(R){
  R.targets.forEach(t => {
    const n = netOf(t);
    R.deliverAt[t] = (R.offline || n==='none') ? Infinity : now() + (n==='poor' ? 1600 + Math.random()*1800 : 350);
    if (isFinite(R.deliverAt[t])) setTimeout(render, R.deliverAt[t] - now() + 40);
  });
}
function popupFor(d){
  const P = S.pending;
  if (!P || P.status !== 'pending' || !P.targets.includes(d) || P.hidden[d]) return null;
  if (P.resp[d]) return P.popupResp[d] ? P : null;
  return now() >= P.deliverAt[d] ? P : null;
}
async function approveYes(d){
  const P = S.pending; if (!P || P.status !== 'pending') return;
  const ok = await userVerify(d, 'আঙুলের ছাপ দিন', subFor(P));
  if (!ok){ log('fingerprint cancelled on '+label(d)); return; }
  if (S.pending !== P || P.status !== 'pending') return;
  const K = keysFor(P, d);
  if (netOf(d) === 'none'){
    // same tier, different mechanism: no network, so compute the bound response on-device
    P.resp[d] = await ocra(K.seed, P.challenge); P.popupResp[d] = true; P.offline = true;
    log(`${label(d)} has no network — offline response HMAC-SHA1("${P.challenge}") → ${P.resp[d]}`, 'k');
    render(); return;
  }
  const msg = 'approve|' + P.challenge;
  const sig = await sign(K.priv, msg);
  const good = await verify(K.pub, msg, sig);
  log(`${label(d)} signed with its ${P.app} private key · ${P.app} server verified with stored public key → ${good?'VALID':'INVALID'}`, good?'g':'r');
  toast(d, good ? 'চাবি মিলেছে ✓' : 'চাবি মেলেনি');
  await resolve(P, good ? 'approved' : 'denied', d);
}
function approveNo(d){
  const P = S.pending; if (!P) return;
  log(`${label(d)} tapped না — ${P.app} ${P.kind} denied`, P.origin==='atk' ? 'g' : '');
  toast(d, 'অনুরোধ বাতিল করা হয়েছে');
  resolve(P, 'denied', d);
}
async function checkResp(P, v){
  for (const t of P.targets){ const K = keysFor(P, t); if (await ocra(K.srvSeed, P.challenge) === v) return t; }
  return null;
}
async function resolve(P, status, via){
  P.status = status; P.via = via;
  const ok = status === 'approved';
  if (P.origin === 'sp') spResolve(P, ok);
  else if (P.origin === 'atk') atkResolve(P, ok);
  else await secResolve(P, ok);
  render();
}
function spResolve(P, ok){
  if (!ok){ go('sp', 'denied', {kind:P.kind}); return; }
  S.links.safepay.lastUse = {kind:P.kind, at:now()};
  if (P.kind === 'login'){
    S.sp.loggedIn = true;
    if (!S.sp.sessions.some(s => s.me)) S.sp.sessions.unshift({name:'এই ডিভাইস · ট্যাবলেট', place:'ঢাকা · মিরপুর', me:true});
    go('sp', 'home', {}); log('SafePay: logged in — no code was transmitted', 'g');
  } else if (P.kind === 'transfer'){
    S.sp.balance -= P.amount;
    if (!S.sp.saved.includes(P.payee)) S.sp.saved.push(P.payee);
    go('sp', 'done', {t:'টাকা পাঠানো হয়েছে', s:`${taka(P.amount)} → ${bn(P.payee)}`});
    log(`transfer settled ৳${grp(P.amount)} → ${P.payee}`, 'g');
  } else if (P.kind === 'topup'){
    S.sp.balance += P.amount;
    go('sp', 'done', {t:'অ্যাড মানি সম্পন্ন', s:`${taka(P.amount)} · ${P.source}`});
    log(`add money settled ৳${grp(P.amount)}`, 'g');
  } else if (P.kind === 'chpin'){
    S.sp.pinHash = P.newPinHash;
    go('sp', 'done', {t:'পিন বদলে গেছে', s:'কোনো SMS কোড লাগেনি।'});
    log('SafePay PIN changed', 'g');
  }
}
async function secResolve(P, ok){
  const d = P.originDev;
  if (!ok){ go(d, 'denied', {}); return; }
  await activateDevice(d);
  if (P.kind === 'recovery') go(d, 'revoke-confirm', {});
  else { go(d, 'home', {}); log(`${label(d)} added to Shurokkha after approval`, 'g'); }
}
function atkResolve(P, ok){
  if (ok){
    S.atk.in = true; S.atk.blocked = false;
    S.sp.sessions.push({name:'Windows PC · Chrome', place:'চট্টগ্রাম', atk:true});
    log('ATTACKER is inside SafePay — the victim tapped হ্যাঁ on a request from Chattogram', 'r');
  } else { S.atk.blocked = true; S.atk.in = false; log('ATTACKER blocked — the victim read the location and tapped না', 'g'); }
}
function subFor(P){
  if (P.kind === 'login') return 'SafePay-এর চাবি মেলানো হচ্ছে';
  if (P.kind === 'transfer') return taka(P.amount) + ' → ' + bn(P.payee);
  if (P.kind === 'topup') return taka(P.amount) + ' যোগ';
  if (P.kind === 'chpin') return 'SafePay পিন পরিবর্তন';
  return 'নতুন ডিভাইস যুক্ত করা';
}

/* ---------------- linking SafePay to Shurokkha ---------------- */
function startLink(){
  const targets = activeDevs();
  S.linkReq = {status:'pending', targets, deliverAt:{}, hidden:{}, offline:false};
  scheduleDelivery(S.linkReq);
  go('sp', 'linking', {});
  log(`SafePay asked to link with Shurokkha → ${targets.map(label).join(', ')}`, 'k');
}
function linkFor(d){
  const L = S.linkReq;
  if (!L || L.status !== 'pending' || !L.targets.includes(d) || L.hidden[d]) return false;
  return now() >= L.deliverAt[d];
}
async function linkYes(d){
  const ok = await userVerify(d, 'আঙুলের ছাপ দিন', 'SafePay-এর জন্য নতুন চাবি তৈরি হবে');
  if (!ok) return;
  if (!S.linkReq || S.linkReq.status !== 'pending') return;
  const L = {app:'SafePay', linkedAt:now(), lastUse:null, keys:{}};
  for (const t of activeDevs()){
    const k = await makeKeys(); L.keys[t] = k; S.sp.pub[t] = k.jwk; S.sp.seeds[t] = k.seed;
    log(`Shurokkha on ${label(t)} generated a SafePay keypair · private key stays in the chip · public key sent to SafePay (${k.fp})`, 'k');
  }
  S.links.safepay = L; S.linkReq.status = 'approved';
  if (!S.sp.registered){ S.sp.registered = true; S.sp.pinHash = S.sp.pendingPin; }
  toast(d, 'SafePay যুক্ত হয়েছে');
  go('sp', 'reg-done', {fp:L.keys[d].fp, fromLogin:S.sp.afterLink==='login'});
  S.sp.afterLink = null;
  render();
}
function linkNo(d){
  if (S.linkReq) S.linkReq.status = 'denied';
  log('link to SafePay refused on '+label(d));
  go('sp', 'denied', {kind:'link'}); render();
}

/* ==================================================================
   LEGACY SMS SIMULATION
   ================================================================== */
function sendSMS(purpose){
  const code = String(100000 + Math.floor(Math.random()*900000));
  const delay = S.net==='good' ? 1200 : S.net==='poor' ? 9000 + Math.random()*14000 : Infinity;
  S.otpHist.forEach(o => o.stale = true);
  const rec = {code, purpose, sent:now(), arrived:false, stale:false, expires:now()+60000};
  S.otpHist.push(rec); S.otp = rec;
  log(`SMS dispatched (${purpose}) · 60s timer starts NOW · ETA ${isFinite(delay) ? (delay/1000).toFixed(1)+'s' : 'never'}`, 'r');
  if (isFinite(delay)) setTimeout(() => {
    rec.arrived = true; rec.arrivedAt = now();
    log(`SMS arrived after ${((now()-rec.sent)/1000).toFixed(1)}s · ${now() > rec.expires ? 'ALREADY EXPIRED' : Math.round((rec.expires-now())/1000)+'s left'}`, 'r');
    render();
  }, delay);
}

