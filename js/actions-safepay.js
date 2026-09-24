/* Shurokkha · actions-safepay.js — Button handlers for SafePay */

/* ==================================================================
   SAFEPAY ACTIONS
   ================================================================== */
const SPA = {
  nav(el){ go('sp', el.dataset.to); render(); },
  'modal-x'(){ S.sp.modal = null; render(); },
  logout(){ S.sp.loggedIn = false; S.sp.sessions = S.sp.sessions.filter(s => !s.me); go('sp', 'landing'); log('SafePay: logged out'); render(); },

  async 'reg-go'(){
    const name = val('spRegName'), a = val('spRegPin'), b = val('spRegPin2'), x = S.sp.data;
    if (!/^\d{4}$/.test(a)){ x.err = '৪ সংখ্যার পিন দিন।'; render(); return; }
    if (a !== b){ x.err = 'দুটি পিন মেলেনি।'; render(); return; }
    S.sp.name = name; S.sp.pendingPin = await sha(a);
    if (S.mode === 'legacy'){ sendSMS('reg'); go('sp', 'otp', {purpose:'reg', back:'reg'}); render(); return; }
    S.sp.modal = 'perm'; log('SafePay: asking permission to use Shurokkha'); render();
  },
  'perm-yes'(){
    S.sp.modal = null;
    if (!S.acct.registered || !activeDevs().length){ S.sp.modal = 'no-shu'; render(); return; }
    startLink(); render();
  },
  'perm-no'(){ S.sp.modal = null; S.sp.data.err = 'Shurokkha-র অনুমতি ছাড়া এই প্রোটোটাইপে যাচাই সম্ভব নয়।'; render(); },
  'cancel-link'(){ if (S.linkReq) S.linkReq.status = 'cancelled'; go('sp', 'landing'); render(); },

  async 'login-go'(){
    const x = S.sp.data;
    if (!S.sp.registered){ x.err = 'এই নম্বরে SafePay অ্যাকাউন্ট নেই। আগে রেজিস্টার করুন।'; render(); return; }
    if (await sha(val('spLoginPin')) !== S.sp.pinHash){ x.err = 'পিন ভুল।'; log('SafePay: wrong PIN', 'r'); render(); return; }
    assess('login', {session:false});
    if (S.mode === 'legacy'){ sendSMS('login'); go('sp', 'otp', {purpose:'login', back:'login'}); render(); return; }
    if (!S.links.safepay || !holders().length){ S.sp.afterLink = 'login'; S.sp.modal = 'perm'; render(); return; }
    request({app:'SafePay', kind:'login', origin:'sp', device:'SafePay · ট্যাবলেট', place:'ঢাকা · মিরপুর'});
    go('sp', 'await'); render();
  },
  'force-offline'(){ SHU['force-offline'](); },
  'cancel-req'(){ S.pending = null; go('sp', S.sp.loggedIn ? 'home' : 'login'); log('SafePay request cancelled'); render(); },
  async 'resp-go'(){
    const P = S.pending, x = S.sp.data; if (!P) return;
    const via = await checkResp(P, val('spResp'));
    if (!via){ x.err = 'সংখ্যাগুলো মিলল না।'; log('offline response mismatch', 'r'); render(); return; }
    log(`offline response matched ${label(via)}'s SafePay seed — bound to this ${P.kind}, single use`, 'g');
    await resolve(P, 'approved', via);
  },

  balance(){
    assess('balance');
    if (S.mode === 'legacy'){ go('sp', 'pinpad', {purpose:'balance'}); render(); return; }
    log('balance viewed · T0 · no prompt', 'g'); go('sp', 'balance'); render();
  },
  pick(el){ const d = S.sp.data; go('sp', 'send', {to:el.dataset.v, amt:val('spAmt') || d.amt || ''}); render(); },
  'send-go'(){
    const to = val('spTo'), amt = parseInt(val('spAmt'), 10) || 0, x = S.sp.data;
    if (!/^01\d{9}$/.test(to)){ x.err = '১১ সংখ্যার সঠিক নম্বর দিন।'; render(); return; }
    if (amt < 1){ x.err = 'টাকার পরিমাণ দিন।'; render(); return; }
    if (amt > S.sp.balance){ x.err = 'পর্যাপ্ত ব্যালেন্স নেই।'; render(); return; }
    const known = S.sp.saved.includes(to);
    assess('transfer', {amount:amt, payeeKnown:known});
    if (S.mode === 'legacy'){ go('sp', 'pinpad', {purpose:'transfer', amount:amt, to}); render(); return; }
    request({app:'SafePay', kind:'transfer', origin:'sp', amount:amt, payee:to, payeeKnown:known});
    go('sp', 'await'); render();
  },
  src(el){ S.sp.data.src = el.dataset.v; S.sp.data.amt = val('spAddAmt'); S.fresh.sp = true; render(); },
  'add-go'(){
    const amt = parseInt(val('spAddAmt'), 10) || 0, x = S.sp.data, src = x.src || 'ব্যাংক অ্যাকাউন্ট';
    if (amt < 1){ x.err = 'টাকার পরিমাণ দিন।'; render(); return; }
    assess('topup', {amount:amt});
    if (S.mode === 'legacy'){ go('sp', 'pinpad', {purpose:'topup', amount:amt, src}); render(); return; }
    request({app:'SafePay', kind:'topup', origin:'sp', amount:amt, source:src});
    go('sp', 'await'); render();
  },
  'kill-sessions'(){
    const hadAtk = S.sp.sessions.some(s => s.atk);
    S.sp.sessions = S.sp.sessions.filter(s => s.me);
    if (hadAtk){ S.atk.in = false; S.atk.evicted = true; }
    go('sp', 'sessions', {done:true}); log('SafePay: all other sessions ended' + (hadAtk ? ' · attacker evicted' : ''), 'g'); render();
  },
  async 'chpin-go'(){
    const a = val('spNewPin'), b = val('spNewPin2'), x = S.sp.data;
    if (!/^\d{4}$/.test(a)){ x.err = '৪ সংখ্যার পিন দিন।'; render(); return; }
    if (a !== b){ x.err = 'দুটি পিন মেলেনি।'; render(); return; }
    const h = await sha(a);
    assess('chpin');
    if (S.mode === 'legacy'){ S.sp.pendingPin = h; sendSMS('chpin'); go('sp', 'otp', {purpose:'chpin', back:'home'}); render(); return; }
    request({app:'SafePay', kind:'chpin', origin:'sp', newPinHash:h});
    go('sp', 'await'); render();
  },

  /* legacy PIN pad */
  async pk(el){
    const x = S.sp.data; x.pin = (x.pin || '') + el.dataset.v; x.err = '';
    if (x.pin.length < 4){ render(); return; }
    if (await sha(x.pin) !== S.sp.pinHash){ x.pin = ''; x.err = 'Incorrect PIN.'; log('legacy: wrong SafePay PIN', 'r'); render(); return; }
    if (x.purpose === 'balance'){ go('sp', 'balance'); log('legacy: balance viewed after PIN'); }
    else if (x.purpose === 'transfer'){ S.sp.balance -= x.amount; if (!S.sp.saved.includes(x.to)) S.sp.saved.push(x.to);
      go('sp', 'done', {t:'টাকা পাঠানো হয়েছে', s:`${taka(x.amount)} → ${bn(x.to)}`}); log(`legacy: ৳${grp(x.amount)} sent with PIN only`, 'r'); }
    else { S.sp.balance += x.amount; go('sp', 'done', {t:'অ্যাড মানি সম্পন্ন', s:`${taka(x.amount)} · ${x.src}`}); log(`legacy: ৳${grp(x.amount)} added with PIN only`); }
    render();
  },
  'pk-del'(){ const x = S.sp.data; x.pin = (x.pin || '').slice(0, -1); render(); },

  /* legacy OTP */
  'otp-resend'(){ log('user pressed Resend — earlier codes silently invalidated', 'r'); sendSMS(S.sp.data.purpose); S.sp.data.err = ''; render(); },
  async 'otp-go'(){
    const v = val('spOtp'), rec = S.otp, x = S.sp.data;
    if (!rec || !rec.arrived){ x.err = 'The code has not arrived yet.'; log('verify attempted before any code arrived', 'r'); render(); return; }
    if (now() > rec.expires){ x.err = 'This code has expired. Request a new one.'; log('verify failed — code expired before entry', 'r'); render(); return; }
    if (v !== rec.code){
      const stale = S.otpHist.some(o => o.code === v);
      x.err = stale ? 'That code is no longer valid. Use the most recent one.' : 'Incorrect code.';
      log(stale ? 'verify failed — superseded code entered' : 'verify failed — wrong code', 'r'); render(); return;
    }
    if (x.purpose === 'reg'){ S.sp.registered = true; S.sp.pinHash = S.sp.pendingPin; go('sp', 'login'); log('legacy: SafePay registered via SMS', 'r'); }
    else if (x.purpose === 'login'){ S.sp.loggedIn = true; if (!S.sp.sessions.some(s => s.me)) S.sp.sessions.unshift({name:'এই ডিভাইস · ট্যাবলেট', place:'ঢাকা · মিরপুর', me:true}); go('sp', 'home'); log('legacy: logged in with SMS code', 'r'); }
    else if (x.purpose === 'chpin'){ S.sp.pinHash = S.sp.pendingPin; go('sp', 'done', {t:'পিন বদলে গেছে', s:'SMS কোড দিয়ে যাচাই করা হয়েছে।'}); log('legacy: PIN changed via SMS', 'r'); }
    S.otp = null; render();
  }
};

