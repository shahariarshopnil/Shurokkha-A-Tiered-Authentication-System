/* Shurokkha · actions-shurokkha.js — Button handlers for Shurokkha */

/* ==================================================================
   SHUROKKHA ACTIONS
   ================================================================== */
const val = id => ((document.getElementById(id) || {}).value || '').trim();
const SHU = {
  noop(){},
  'to-landing'(d){ go(d, 'landing'); render(); },
  home(d){ go(d, 'home'); render(); },
  signin(d){ go(d, 'signin'); render(); },
  lost(d){ go(d, 'lost'); render(); },
  menu(d){ S.dev[d].menu = true; render(); },
  'menu-close'(d){ S.dev[d].menu = false; render(); },
  chpin(d){ go(d, 'chpin'); render(); },
  sessions(d){ go(d, 'sessions'); render(); },
  scan(d){ go(d, 'scan'); render(); },
  signout(d){ S.dev[d].signedIn = false; go(d, 'landing'); log(label(d)+': signed out of Shurokkha (keys stay in the chip)'); render(); },
  'sms-x'(){ S.smsDismissed = now(); render(); },
  'lock-ok'(d){ S.lockAlert[d] = false; render(); },
  'popup-close'(d){ if (S.pending) S.pending.hidden[d] = true; render(); },

  'signin-go'(d){
    const D = S.dev[d];
    if (!S.acct.registered){
      if (d !== 'my'){ D.data.err = 'আগে My Device-এ রেজিস্টার করুন।'; render(); return; }
      go(d, 'reg'); render(); return;
    }
    if (D.active){ go(d, 'pin'); render(); return; }
    assess('device', {app:'Shurokkha'});
    const P = request({app:'Shurokkha', kind:'device', origin:'sec', originDev:d, device:'নতুন ফোন · Galaxy A14', place:'ঢাকা · মিরপুর'});
    if (!P){ D.data.err = 'অনুমোদন দেওয়ার মতো কোনো সক্রিয় ডিভাইস নেই। “ফোন হারিয়ে গেছে” ব্যবহার করুন।'; render(); return; }
    go(d, 'wait'); render();
  },
  async 'reg-go'(d){
    const a = val(d+'RegPin'), b = val(d+'RegPin2');
    if (!/^\d{4}$/.test(a)){ S.dev[d].data.err = '৪ সংখ্যার পিন দিন।'; render(); return; }
    if (a !== b){ S.dev[d].data.err = 'দুটি পিন মেলেনি।'; render(); return; }
    S.acct.pinHash = await sha(a);
    await tryCreateCred(d);
    const D = S.dev[d];
    D.key = await makeKeys(); S.shuPub[d] = D.key.jwk; S.shuSeeds[d] = D.key.seed;
    S.acct.paper = Array.from({length:6}, () => { const r = () => hex(rand(2)).toUpperCase(); return r()+'-'+r(); });
    log(`Shurokkha registered · device keypair created (private extractable=false) · public ${D.key.fp} sent to server`, 'k');
    go(d, 'reg-keys'); render();
  },
  'to-recovery'(d){ go(d, 'reg-recovery'); render(); },
  'reg-finish'(d){
    const D = S.dev[d];
    S.acct.registered = true; D.active = true; D.signedIn = true;
    go(d, 'home'); log('Shurokkha ready on '+label(d)+' · recovery codes and trusted contacts set', 'g'); render();
  },
  async 'pin-go'(d){
    if (await sha(val(d+'Pin')) !== S.acct.pinHash){ S.dev[d].data.err = 'পিন মেলেনি।'; log('Shurokkha: wrong PIN on '+label(d), 'r'); render(); return; }
    S.dev[d].signedIn = true; go(d, 'home'); log('Shurokkha: signed in on '+label(d)); render();
  },
  async 'chpin-go'(d){
    const o = val(d+'OldPin'), n = val(d+'NewPin'), n2 = val(d+'NewPin2'), x = S.dev[d].data;
    if (await sha(o) !== S.acct.pinHash){ x.err = 'বর্তমান পিন ভুল।'; render(); return; }
    if (!/^\d{4}$/.test(n)){ x.err = 'নতুন পিন ৪ সংখ্যার হতে হবে।'; render(); return; }
    if (n !== n2){ x.err = 'নতুন দুটি পিন মেলেনি।'; render(); return; }
    const ok = await userVerify(d, 'আঙুলের ছাপ দিন', 'Shurokkha পিন পরিবর্তন'); if (!ok) return;
    const K = S.dev[d].key, msg = 'shurokkha-pin-change|' + hex(rand(6));
    const good = await verify(S.shuPub[d], msg, await sign(K.kp.privateKey, msg));
    S.acct.pinHash = await sha(n);
    log(`Shurokkha PIN changed · signed with device key · verify → ${good ? 'VALID' : 'INVALID'}`, 'g');
    toast(d, 'পিন বদলে গেছে'); go(d, 'home'); render();
  },
  'revoke-others'(d){
    activeDevs().filter(t => t !== d).forEach(revokeDevice);
    go(d, 'sessions', {done:true}); render();
  },
  yes(d){ approveYes(d); },
  no(d){ approveNo(d); },
  'link-yes'(d){ linkYes(d); },
  'link-no'(d){ linkNo(d); },
  'do-scan'(d){ const P = S.pending; if (!P) return; P.scanned[d] = true; log(`${label(d)} scanned the QR — challenge read by camera, no network used`, 'k'); render(); },
  async 'sign-offline'(d){
    const P = S.pending; if (!P) return;
    const ok = await userVerify(d, 'আঙুলের ছাপ দিন', subFor(P)); if (!ok) return;
    P.resp[d] = await ocra(keysFor(P, d).seed, P.challenge);
    log(`${label(d)} offline response · HMAC-SHA1("${P.challenge}") → ${P.resp[d]}`, 'k'); render();
  },
  'lost-qr'(d){
    assess('recovery', {app:'Shurokkha'});
    const P = request({app:'Shurokkha', kind:'recovery', origin:'sec', originDev:d, device:'নতুন ফোন · Galaxy A14', place:'ঢাকা · মিরপুর', offline:true});
    if (!P){ S.dev[d].data.err = 'পুরোনো ফোনে আর চাবি নেই।'; render(); return; }
    go(d, 'wait'); render();
  },
  'lost-paper'(d){ go(d, 'paper'); render(); },
  'lost-people'(d){ go(d, 'people'); log('recovery via two trusted contacts requested'); render(); },
  p1(d){ S.dev[d].data.p1 = true; log('trusted contact 1 approved', 'g'); render(); },
  p2(d){ S.dev[d].data.p2 = true; log('trusted contact 2 approved', 'g'); render(); },
  async 'people-go'(d){ log('both trusted contacts approved — production would add a 24h hold', 'g'); await activateDevice(d); go(d, 'revoke-confirm'); render(); },
  async 'paper-go'(d){
    const v = val(d+'Paper').toUpperCase(), x = S.dev[d].data;
    if (!S.acct.paper.includes(v) || S.acct.usedPaper.includes(v)){
      x.err = S.acct.usedPaper.includes(v) ? 'এই কোডটি আগেই ব্যবহার হয়েছে।' : 'কোডটি মেলেনি।'; log('paper recovery code rejected', 'r'); render(); return; }
    S.acct.usedPaper.push(v); log('paper recovery code accepted and burned', 'g');
    await activateDevice(d); go(d, 'revoke-confirm'); render();
  },
  async 'resp-go'(d){
    const P = S.pending, v = val(d+'Resp'), x = S.dev[d].data;
    if (!P){ return; }
    const via = await checkResp(P, v);
    if (!via){ x.err = 'সংখ্যাগুলো মিলল না।'; log('offline response mismatch', 'r'); render(); return; }
    log(`offline response matched ${label(via)}'s seed — transaction-bound, single use`, 'g');
    await resolve(P, 'approved', via);
  },
  'force-offline'(){ const P = S.pending; if (!P) return; P.offline = true; P.targets.forEach(t => P.deliverAt[t] = Infinity); log('switched to the offline QR path'); render(); },
  'cancel-req'(d){ S.pending = null; go(d, 'landing'); log('request cancelled'); render(); },
  'revoke-go'(d){
    activeDevs().filter(t => t !== d).forEach(revokeDevice);
    S.pending = null;
    go(d, 'home', {recovered:true, revoked:true});
    log('recovery complete · new keys bound · lost device revoked · SafePay now trusts only the new public key', 'g'); render();
  },
  'revoke-skip'(d){ go(d, 'home', {recovered:true, revoked:false}); log('user skipped revocation — the lost device can still approve SafePay requests', 'r'); render(); }
};

