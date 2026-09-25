/* Shurokkha · screens-safepay.js — SafePay screens and the permission popup */

/* ---------------- SafePay ---------------- */
const spBar = (title, right) => `<div class="appbar sp"><span class="sp-ic">S</span><b class="${/[\u0980-\u09FF]/.test(title)?'bnf':''}">${title}</b>${right||''}</div>`;
const spBack = (to, txt) => `<button class="rt" data-sp="nav" data-to="${to}">${txt||t('ফিরুন','Back')}</button>`;

function renderSP(){
  const P = S.sp, x = P.data, sc = P.screen, leg = S.mode==='legacy';
  let b = '';

  if (sc === 'landing'){
    b = `<div class="land">
      <div class="land-hero"><div class="mark sp">S</div><h2>SafePay</h2><p>${t('নিরাপদ লেনদেন', 'Secure Payments')}</p></div>
      <div class="pad"><button class="btn spb ${S.lang==='en'?'en':''}" data-sp="nav" data-to="login">${t('লগইন', 'Login')}</button><button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="nav" data-to="reg">${t('রেজিস্টার', 'Register')}</button></div></div>`;
  }
  else if (sc === 'reg'){
    b = spBar(t('রেজিস্টার', 'Register'), spBack('landing')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>${t('নাম', 'Name')}</label><input id="spRegName" value="${t('শিরিন আক্তার', 'Shirin Akter')}" style="font-family:${S.lang==='en'?'var(--ui)':'var(--bn)'}"></div>
      <div class="fld"><label>${t('মোবাইল নম্বর', 'Mobile Number')}</label><input id="spRegPhone" value="${S.acct.phone}" inputmode="numeric"></div>
      <div class="two">
        <div class="fld"><label>${t('SafePay পিন', 'SafePay PIN')}</label><input id="spRegPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>${t('আবার', 'Confirm')}</label><input id="spRegPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn spb ${S.lang==='en'?'en':''}" data-sp="reg-go">${t('রেজিস্টার', 'Register')}</button>
      <p class="s" style="margin-top:12px;font-size:11.5px">${leg ? t('Legacy: নম্বর যাচাই হবে SMS কোডে।', 'Legacy: Number verified via SMS code.') : t('যাচাই হবে আপনার My Device-এর Shurokkha দিয়ে।', 'Verified via Shurokkha on My Device.')}</p>
    </div></div>`;
  }
  else if (sc === 'linking'){
    const L = S.linkReq, off = L && L.targets.every(t_target => netOf(t_target)==='none');
    b = spBar(t('Shurokkha সংযোগ', 'Shurokkha Link')) + `<div class="scr-body"><div class="pad center" style="padding-top:34px">
      ${off ? '<div class="big-ic">⚠</div>' : '<div class="spin"></div>'}
      <h3 class="t">${t('My Device-এ নিশ্চিত করুন', 'Confirm on My Device')}</h3>
      <p class="s">${t('Shurokkha-তে “SafePay যুক্ত করবেন?” অনুরোধ গেছে। হ্যাঁ দিলে SafePay-এর জন্য চাবি তৈরি হবে।', 'Request sent to Shurokkha to link SafePay. Approving creates keys for SafePay.')}</p>
      ${off ? `<div class="note warn flush">${t('My Device-এ নেটওয়ার্ক নেই। প্রথমবার সংযোগের সময় public key পাঠাতে একবার নেটওয়ার্ক লাগবে।', 'No network on My Device. Network needed once to send public key.')}</div>` : ''}
      <button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="cancel-link">${t('বাতিল', 'Cancel')}</button>
    </div></div>`;
  }
  else if (sc === 'reg-done'){
    b = spBar(t('সম্পন্ন', 'Done')) + `<div class="scr-body"><div class="pad center" style="padding-top:34px">
      <div class="big-ic" style="color:var(--shu)">✓</div>
      <h3 class="t">${x.fromLogin ? t('Shurokkha যুক্ত হয়েছে', 'Shurokkha Linked') : t('রেজিস্ট্রেশন সম্পন্ন', 'Registration Complete')}</h3>
      <p class="s">${t('SafePay এখন Shurokkha-র সাথে যুক্ত। এই অ্যাপের জন্য চাবি তৈরি হয়েছে।', 'SafePay is now linked with Shurokkha. Keys generated.')}</p>
      <div class="sumcard" style="margin:0 0 14px;text-align:left"><div class="k">${t('SafePay-এর সার্ভারে সংরক্ষিত public key', 'Public key stored on SafePay server')}</div><div class="v" style="font-family:var(--mono);font-size:17px">${esc(x.fp)}</div></div>
      <button class="btn spb ${S.lang==='en'?'en':''}" data-sp="nav" data-to="login">${t('লগইন করুন', 'Login')}</button>
    </div></div>`;
  }
  else if (sc === 'login'){
    b = spBar(t('লগইন', 'Login'), spBack('landing')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>${t('মোবাইল নম্বর', 'Mobile Number')}</label><input id="spLoginPhone" value="${S.acct.phone}" inputmode="numeric"></div>
      <div class="fld"><label>${t('SafePay পিন', 'SafePay PIN')}</label><input id="spLoginPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      ${err(x)}
      <button class="btn spb ${S.lang==='en'?'en':''}" data-sp="login-go">${t('লগইন', 'Login')}</button>
      <p class="s" style="margin-top:12px;font-size:11.5px">${leg ? t('Legacy: একটি SMS কোড পাঠানো হবে।', 'Legacy: SMS verification code will be sent.') : t('পিনের পর আপনার My Device-এর Shurokkha-তে অনুমোদন চাওয়া হবে। কোনো SMS নেই।', 'Approval requested on My Device Shurokkha after PIN. No SMS.')}</p>
    </div></div>`;
  }
  else if (sc === 'await'){
    const R = S.pending;
    if (!R || R.origin !== 'sp') b = spBar(t('অপেক্ষা', 'Waiting')) + `<div class="scr-body"><div class="pad"><p class="s">${t('অনুরোধটি আর চালু নেই।', 'Request no longer active.')}</p><button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="nav" data-to="${P.loggedIn ? 'home' : 'login'}">${t('ফিরে যান', 'Go Back')}</button></div></div>`;
    else {
      const summary = R.kind==='login' ? `<div class="k">${t('লগইন অনুমোদন', 'Login Approval')}</div><div class="w">${bn(S.acct.phone)}</div>`
        : R.kind==='transfer' ? `<div class="k">${t('টাকা পাঠানো', 'Send Money')} <span class="tb ${R.tier}">${R.tier}</span></div><div class="v">${taka(R.amount)}</div><div class="w">→ ${bn(R.payee)}</div>`
        : R.kind==='topup' ? `<div class="k">${t('অ্যাড মানি', 'Add Money')} <span class="tb ${R.tier}">${R.tier}</span></div><div class="v">${taka(R.amount)}</div><div class="w">${esc(R.source)}</div>`
        : `<div class="k">${t('পিন বদল', 'Change PIN')} <span class="tb ${R.tier}">${R.tier}</span></div><div class="w">${t('SafePay পিন', 'SafePay PIN')}</div>`;
      b = spBar(t('Shurokkha অনুমোদন', 'Shurokkha Approval'), `<button class="rt" data-sp="cancel-req">${t('বাতিল', 'Cancel')}</button>`) + `<div class="scr-body">
        <div class="pad center" style="padding-bottom:6px">
          ${R.offline ? '' : '<div class="spin"></div>'}
          <h3 class="t">${R.offline ? t('কিউআর স্ক্যান করুন', 'Scan QR Code') : t('My Device-এ অনুমোদন দিন', 'Approve on My Device')}</h3>
          <p class="s" style="margin-bottom:8px">${R.offline ? t('My Device-এ নেটওয়ার্ক নেই। Shurokkha → ☰ মেনু → কিউআর স্ক্যান। তারপর ৮ সংখ্যা এখানে লিখুন।', 'No network on My Device. Shurokkha → ☰ Menu → QR Scan. Enter 8 digits here.')
            : t('Shurokkha-তে অনুরোধ গেছে। “হ্যাঁ” চেপে আঙুলের ছাপ দিন।', 'Request sent to Shurokkha. Tap "Yes" and verify fingerprint.')}</p>
        </div>
        <div class="sumcard">${summary}</div>
        ${R.offline ? `<div class="qrwrap">${qrHTML(R.challenge)}</div><div class="pad" style="padding-top:0">
            <div class="fld"><label>${t('My Device-এর ৮ সংখ্যা', '8-digit code from My Device')}</label><input id="spResp" inputmode="numeric" maxlength="8" placeholder="________"></div>
            ${err(x)}<button class="btn spb ${S.lang==='en'?'en':''}" data-sp="resp-go">${t('যাচাই করুন', 'Verify')}</button></div>`
          : `<div class="pad" style="padding-top:0"><div class="note ok flush">${t('কোনো SMS পাঠানো হয়নি। বলে দেওয়ার মতো কোনো কোড নেই।', 'No SMS sent. No codes to read aloud.')}</div>
            <button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="force-offline">${t('My Device-এ নেটওয়ার্ক নেই?', 'No network on My Device?')}</button></div>`}
      </div>`;
    }
  }
  else if (sc === 'otp'){
    const rec = S.otp;
    b = spBar('Verify', `<button class="rt" data-sp="nav" data-to="${x.back || 'landing'}">${t('বাতিল', 'Cancel')}</button>`) + `<div class="scr-body"><div class="pad">
      <p class="s" style="font-family:var(--ui)">Enter the 6-digit code sent to ${S.acct.phone}. The code expires 60 seconds after it is sent.</p>
      <div class="fld en"><label>Verification code</label><input id="spOtp" inputmode="numeric" maxlength="6" placeholder="______"></div>
      ${x.err ? `<div class="note bad en flush">${esc(x.err)}</div>` : ''}
      <button class="btn spb en" data-sp="otp-go">Verify</button>
      <button class="btn ghost en" data-sp="otp-resend">Resend code</button>
      <p class="s" style="font-family:var(--ui);font-size:11.5px;margin-top:12px">${rec ? `Time left: <b data-exp="${rec.expires}">—</b> · ` : ''}${S.net==='none' ? 'No signal on your phone — the SMS cannot be delivered.' : S.net==='poor' ? 'Weak signal — delivery may be delayed.' : 'Check your phone’s messages.'}</p>
    </div></div>`;
  }
  else if (sc === 'denied'){
    const txt = x.kind==='link' ? t('Shurokkha সংযোগ বাতিল করা হয়েছে।', 'Shurokkha link cancelled.') : x.kind==='login' ? t('Shurokkha থেকে লগইন অনুরোধ বাতিল করা হয়েছে।', 'Login request rejected by Shurokkha.') : t('Shurokkha থেকে অনুরোধটি বাতিল করা হয়েছে।', 'Request rejected by Shurokkha.');
    b = spBar(t('বাতিল', 'Denied')) + `<div class="scr-body"><div class="pad center" style="padding-top:44px">
      <div class="big-ic" style="color:#B4432F">✕</div><h3 class="t">${t('অনুরোধ প্রত্যাখ্যাত', 'Request Rejected')}</h3><p class="s">${txt}</p>
      <button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="nav" data-to="${P.loggedIn ? 'home' : 'landing'}">${t('ফিরে যান', 'Go Back')}</button></div></div>`;
  }
  else if (sc === 'home'){
    b = spBar('SafePay', `<button class="rt" data-sp="logout">${t('লগআউট', 'Logout')}</button>`) + `<div class="scr-body">
      <div class="sp-hello"><small>${t('স্বাগতম', 'Welcome')}</small><b>${esc(P.name || t('শিরিন আক্তার', 'Shirin Akter'))}</b><span>${S.acct.phone}</span></div>
      <div class="tiles">
        <button class="tile" data-sp="balance"><i>৳</i><b>${t('ব্যালেন্স দেখুন', 'Check Balance')}</b></button>
        <button class="tile" data-sp="nav" data-to="send"><i>↗</i><b>${t('টাকা পাঠান', 'Send Money')}</b></button>
        <button class="tile" data-sp="nav" data-to="add"><i>＋</i><b>${t('অ্যাড মানি', 'Add Money')}</b></button>
        <button class="tile" data-sp="nav" data-to="sessions"><i>📱</i><b>${t('ডিভাইস ও সেশন', 'Devices & Sessions')}</b></button>
        <button class="tile wide" data-sp="nav" data-to="chpin"><i>🔑</i><b>${t('পাসওয়ার্ড / পিন বদল', 'Change PIN')}</b></button>
      </div>
      <div class="note ${leg ? 'warn' : 'ok'}">${leg ? t('Legacy: লেনদেনে SafePay পিন, আর লগইন ও পিন বদলে SMS কোড।', 'Legacy: SafePay PIN for txns, SMS OTP for login and PIN change.') : t('সব যাচাই হয় Shurokkha দিয়ে। কোনো SMS কোড নেই।', 'All verified via Shurokkha. No SMS code required.')}</div>
    </div>`;
  }
  else if (sc === 'balance'){
    b = spBar(t('ব্যালেন্স', 'Balance'), spBack('home')) + `<div class="scr-body">
      <div class="balcard"><small>${t('বর্তমান ব্যালেন্স', 'Current Balance')}</small><b>৳ ${bn(grp(P.balance))}</b></div>
      ${leg ? '' : `<div class="note ok">${t('কোনো প্রশ্ন করা হয়নি — লগইন করা সেশন, শুধু দেখা', 'Read-only view — logged-in session')} <span class="tb T0">T0</span></div>`}
    </div>`;
  }
  else if (sc === 'send'){
    b = spBar(t('টাকা পাঠান', 'Send Money'), spBack('home')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>${t('প্রাপকের নম্বর', 'Recipient Number')}</label><input id="spTo" value="${x.to || ''}" inputmode="numeric" placeholder="01XXXXXXXXX"></div>
      <div class="chips">${P.saved.map(n => `<button data-sp="pick" data-v="${n}">${(PAYEE_NAMES[n] ? (S.lang==='en' ? (n==='01712345678'?'Rafiq — Supplier':'Mother') : PAYEE_NAMES[n]) : bn(n))}</button>`).join('')}</div>
      <div class="fld"><label>${t('টাকার পরিমাণ', 'Amount')}</label><input id="spAmt" value="${x.amt || ''}" inputmode="numeric" placeholder="0"></div>
      ${err(x)}
      <button class="btn spb ${S.lang==='en'?'en':''}" data-sp="send-go">${t('এগিয়ে যান', 'Continue')}</button>
    </div></div>`;
  }
  else if (sc === 'add'){
    const src = x.src || t('ব্যাংক অ্যাকাউন্ট', 'Bank Account');
    b = spBar(t('অ্যাড মানি', 'Add Money'), spBack('home')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>${t('কোথা থেকে', 'From')}</label></div>
      <div class="srcs">${[t('ব্যাংক অ্যাকাউন্ট', 'Bank Account'), t('ডেবিট কার্ড', 'Debit Card')].map(s => `<button data-sp="src" data-v="${s}" aria-pressed="${s===src}">${s}</button>`).join('')}</div>
      <div class="fld"><label>${t('টাকার পরিমাণ', 'Amount')}</label><input id="spAddAmt" value="${x.amt || ''}" inputmode="numeric" placeholder="0"></div>
      ${err(x)}
      <button class="btn spb ${S.lang==='en'?'en':''}" data-sp="add-go">${t('টাকা যোগ করুন', 'Add Money')}</button>
    </div></div>`;
  }
  else if (sc === 'sessions'){
    b = spBar(t('ডিভাইস ও সেশন', 'Devices & Sessions'), spBack('home')) + `<div class="scr-body">
      <p class="s pad" style="padding-bottom:0">${t('SafePay যেসব ডিভাইসে লগইন করা আছে।', 'Devices signed into SafePay.')}</p>
      <div class="rowlist">${P.sessions.map(s => `<div class="rowi ${s.atk ? 'atk' : ''}"><div class="ico">${s.atk ? '💻' : '📱'}</div>
        <div><b>${esc(s.name)}</b><span>${esc(s.place)}</span></div>
        <div class="tag ${s.me ? 'me' : s.atk ? 'x' : ''}">${s.me ? t('এই ডিভাইস', 'This device') : s.atk ? t('অচেনা', 'Unknown') : ''}</div></div>`).join('')}</div>
      <div class="pad">
        ${x.done ? `<div class="note ok flush">${t('অন্য সব সেশন বন্ধ করা হয়েছে।', 'All other sessions revoked.')}</div>` : ''}
        <button class="btn warn ${S.lang==='en'?'en':''}" data-sp="kill-sessions" ${P.sessions.length < 2 ? 'disabled' : ''}>${t('অন্য সব সেশন বন্ধ করুন', 'Revoke All Other Sessions')}</button>
      </div></div>`;
  }
  else if (sc === 'chpin'){
    b = spBar(t('পাসওয়ার্ড / পিন বদল', 'Change PIN'), spBack('home')) + `<div class="scr-body"><div class="pad">
      <p class="s">${leg ? t('Legacy: বদলানোর আগে SMS কোড চাওয়া হবে।', 'Legacy: SMS OTP required before PIN change.') : t('পিন বদল সবসময় Shurokkha-তে স্বাক্ষর চায় (T3)।', 'PIN change requires Shurokkha signature (T3).')}</p>
      <div class="two">
        <div class="fld"><label>${t('নতুন পিন', 'New PIN')}</label><input id="spNewPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>${t('আবার', 'Confirm')}</label><input id="spNewPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn spb ${S.lang==='en'?'en':''}" data-sp="chpin-go">${t('পিন বদলান', 'Change PIN')}</button>
    </div></div>`;
  }
  else if (sc === 'pinpad'){
    const pin = x.pin || '';
    const what = x.purpose==='balance' ? t('ব্যালেন্স দেখুন', 'Check balance') : x.purpose==='transfer' ? `${t('টাকা পাঠান ৳', 'Send ৳')}${grp(x.amount)} → ${x.to}` : `${t('অ্যাড মানি ৳', 'Add ৳')}${grp(x.amount)}`;
    b = spBar(t('SafePay পিন দিন', 'Enter PIN'), spBack('home', t('বাতিল', 'Cancel'))) + `<div class="scr-body">
      <p class="s" style="font-family:var(--ui);padding:14px 17px 0;margin:0">${esc(what)}</p>
      <div class="pindots">${[0,1,2,3].map(i => `<i class="${pin.length > i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="pinpad">${[1,2,3,4,5,6,7,8,9].map(n => `<button data-sp="pk" data-v="${n}">${n}</button>`).join('')}
        <button data-sp="pk-del">⌫</button><button data-sp="pk" data-v="0">0</button><span></span></div>
      ${x.err ? `<div class="note bad en">${esc(x.err)}</div>` : ''}
    </div>`;
  }
  else if (sc === 'done'){
    b = spBar(t('সম্পন্ন', 'Done')) + `<div class="scr-body"><div class="pad center" style="padding-top:40px">
      <div class="big-ic" style="color:var(--shu)">✓</div><h3 class="t">${esc(x.t)}</h3><p class="s">${esc(x.s || '')}</p>
      <button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="nav" data-to="home">${t('হোম', 'Home')}</button></div></div>`;
  }

  // in-app permission popup
  let m = '';
  if (P.modal === 'perm'){
    m = `<div class="modal"><div class="box"><div class="mh sp"><span class="sp-ic" style="width:18px;height:18px;font-size:11px">S</span><span>SafePay</span></div>
      <div class="mb">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><div class="mark shu" style="width:42px;height:42px;border-radius:12px;margin:0">${SHIELD(24)}</div>
          <div><b style="font-size:15px">Shurokkha</b><span style="display:block;font-family:var(--bn);font-size:11px;color:var(--mid)">${t('My Device-এ ইনস্টল করা আছে', 'Installed on My Device')}</span></div></div>
        <h4>${t('Shurokkha-কে আপনার অ্যাপ অ্যাক্সেসের অনুমতি দিন', 'Grant Shurokkha permission to access app')}</h4>
        <ul class="perm"><li>${t('SafePay-এর লগইন ও লেনদেন অনুমোদন করবে', 'Approves SafePay logins & transactions')}</li><li>${t('SafePay-এর জন্য আলাদা চাবি জোড়া তৈরি ও সংরক্ষণ করবে', 'Generates dedicated keypair for SafePay')}</li><li>${t('SMS কোডের আর দরকার হবে না', 'Eliminates SMS verification codes')}</li></ul>
      </div>
      <div class="mf"><button class="btn spb ${S.lang==='en'?'en':''}" data-sp="perm-yes">${t('অনুমতি দিন', 'Grant Permission')}</button><button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="perm-no">${t('বাতিল', 'Cancel')}</button></div></div></div>`;
  } else if (P.modal === 'no-shu'){
    m = `<div class="modal"><div class="box"><div class="mh sp"><span>SafePay</span></div>
      <div class="mb"><h4>${t('Shurokkha চালু পাওয়া যায়নি', 'Shurokkha Not Active')}</h4><p class="s" style="margin:0">${t('আগে My Device-এ Shurokkha রেজিস্টার করে সাইন ইন করুন, তারপর আবার চেষ্টা করুন।', 'Please register and sign in to Shurokkha on My Device first.')}</p></div>
      <div class="mf"><button class="btn ghost ${S.lang==='en'?'en':''}" data-sp="modal-x">${t('ঠিক আছে', 'OK')}</button></div></div></div>`;
  }
  return sbar('sp') + b + m;
}
