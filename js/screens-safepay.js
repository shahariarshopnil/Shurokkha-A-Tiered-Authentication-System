/* Shurokkha · screens-safepay.js — SafePay screens and the permission popup */

/* ---------------- SafePay ---------------- */
const spBar = (title, right) => `<div class="appbar sp"><span class="sp-ic">S</span><b class="${/[\u0980-\u09FF]/.test(title)?'bnf':''}">${title}</b>${right||''}</div>`;
const spBack = (to, txt) => `<button class="rt" data-sp="nav" data-to="${to}">${txt||'ফিরুন'}</button>`;

function renderSP(){
  const P = S.sp, x = P.data, sc = P.screen, leg = S.mode==='legacy';
  let b = '';

  if (sc === 'landing'){
    b = `<div class="land">
      <div class="land-hero"><div class="mark sp">S</div><h2>SafePay</h2><p>নিরাপদ লেনদেন</p></div>
      <div class="pad"><button class="btn spb" data-sp="nav" data-to="login">লগইন</button><button class="btn ghost" data-sp="nav" data-to="reg">রেজিস্টার</button></div></div>`;
  }
  else if (sc === 'reg'){
    b = spBar('রেজিস্টার', spBack('landing')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>নাম</label><input id="spRegName" value="শিরিন আক্তার" style="font-family:var(--bn)"></div>
      <div class="fld"><label>মোবাইল নম্বর</label><input id="spRegPhone" value="${S.acct.phone}" inputmode="numeric"></div>
      <div class="two">
        <div class="fld"><label>SafePay পিন</label><input id="spRegPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>আবার</label><input id="spRegPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn spb" data-sp="reg-go">রেজিস্টার</button>
      <p class="s" style="margin-top:12px;font-size:11.5px">${leg ? 'Legacy: নম্বর যাচাই হবে SMS কোডে।' : 'যাচাই হবে আপনার My Device-এর Shurokkha দিয়ে।'}</p>
    </div></div>`;
  }
  else if (sc === 'linking'){
    const L = S.linkReq, off = L && L.targets.every(t => netOf(t)==='none');
    b = spBar('Shurokkha সংযোগ') + `<div class="scr-body"><div class="pad center" style="padding-top:34px">
      ${off ? '<div class="big-ic">⚠</div>' : '<div class="spin"></div>'}
      <h3 class="t">My Device-এ নিশ্চিত করুন</h3>
      <p class="s">Shurokkha-তে “SafePay যুক্ত করবেন?” অনুরোধ গেছে। হ্যাঁ দিলে SafePay-এর জন্য চাবি তৈরি হবে।</p>
      ${off ? `<div class="note warn flush">My Device-এ নেটওয়ার্ক নেই। প্রথমবার সংযোগের সময় public key পাঠাতে একবার নেটওয়ার্ক লাগবে।</div>` : ''}
      <button class="btn ghost" data-sp="cancel-link">বাতিল</button>
    </div></div>`;
  }
  else if (sc === 'reg-done'){
    b = spBar('সম্পন্ন') + `<div class="scr-body"><div class="pad center" style="padding-top:34px">
      <div class="big-ic" style="color:var(--shu)">✓</div>
      <h3 class="t">${x.fromLogin ? 'Shurokkha যুক্ত হয়েছে' : 'রেজিস্ট্রেশন সম্পন্ন'}</h3>
      <p class="s">SafePay এখন Shurokkha-র সাথে যুক্ত। এই অ্যাপের জন্য চাবি তৈরি হয়েছে।</p>
      <div class="sumcard" style="margin:0 0 14px;text-align:left"><div class="k">SafePay-এর সার্ভারে সংরক্ষিত public key</div><div class="v" style="font-family:var(--mono);font-size:17px">${esc(x.fp)}</div></div>
      <button class="btn spb" data-sp="nav" data-to="login">লগইন করুন</button>
    </div></div>`;
  }
  else if (sc === 'login'){
    b = spBar('লগইন', spBack('landing')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>মোবাইল নম্বর</label><input id="spLoginPhone" value="${S.acct.phone}" inputmode="numeric"></div>
      <div class="fld"><label>SafePay পিন</label><input id="spLoginPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      ${err(x)}
      <button class="btn spb" data-sp="login-go">লগইন</button>
      <p class="s" style="margin-top:12px;font-size:11.5px">${leg ? 'Legacy: একটি SMS কোড পাঠানো হবে।' : 'পিনের পর আপনার My Device-এর Shurokkha-তে অনুমোদন চাওয়া হবে। কোনো SMS নেই।'}</p>
    </div></div>`;
  }
  else if (sc === 'await'){
    const R = S.pending;
    if (!R || R.origin !== 'sp') b = spBar('অপেক্ষা') + `<div class="scr-body"><div class="pad"><p class="s">অনুরোধটি আর চালু নেই।</p><button class="btn ghost" data-sp="nav" data-to="${P.loggedIn ? 'home' : 'login'}">ফিরে যান</button></div></div>`;
    else {
      const summary = R.kind==='login' ? `<div class="k">লগইন অনুমোদন</div><div class="w">${bn(S.acct.phone)}</div>`
        : R.kind==='transfer' ? `<div class="k">টাকা পাঠানো <span class="tb ${R.tier}">${R.tier}</span></div><div class="v">${taka(R.amount)}</div><div class="w">→ ${bn(R.payee)}</div>`
        : R.kind==='topup' ? `<div class="k">অ্যাড মানি <span class="tb ${R.tier}">${R.tier}</span></div><div class="v">${taka(R.amount)}</div><div class="w">${esc(R.source)}</div>`
        : `<div class="k">পিন বদল <span class="tb ${R.tier}">${R.tier}</span></div><div class="w">SafePay পিন</div>`;
      b = spBar('Shurokkha অনুমোদন', `<button class="rt" data-sp="cancel-req">বাতিল</button>`) + `<div class="scr-body">
        <div class="pad center" style="padding-bottom:6px">
          ${R.offline ? '' : '<div class="spin"></div>'}
          <h3 class="t">${R.offline ? 'কিউআর স্ক্যান করুন' : 'My Device-এ অনুমোদন দিন'}</h3>
          <p class="s" style="margin-bottom:8px">${R.offline ? 'My Device-এ নেটওয়ার্ক নেই। Shurokkha → ☰ মেনু → কিউআর স্ক্যান। তারপর ৮ সংখ্যা এখানে লিখুন।'
            : 'Shurokkha-তে অনুরোধ গেছে। “হ্যাঁ” চেপে আঙুলের ছাপ দিন।'}</p>
        </div>
        <div class="sumcard">${summary}</div>
        ${R.offline ? `<div class="qrwrap">${qrHTML(R.challenge)}</div><div class="pad" style="padding-top:0">
            <div class="fld"><label>My Device-এর ৮ সংখ্যা</label><input id="spResp" inputmode="numeric" maxlength="8" placeholder="________"></div>
            ${err(x)}<button class="btn spb" data-sp="resp-go">যাচাই করুন</button></div>`
          : `<div class="pad" style="padding-top:0"><div class="note ok flush">কোনো SMS পাঠানো হয়নি। বলে দেওয়ার মতো কোনো কোড নেই।</div>
            <button class="btn ghost" data-sp="force-offline">My Device-এ নেটওয়ার্ক নেই?</button></div>`}
      </div>`;
    }
  }
  else if (sc === 'otp'){
    const rec = S.otp;
    b = spBar('Verify', `<button class="rt" data-sp="nav" data-to="${x.back || 'landing'}">Cancel</button>`) + `<div class="scr-body"><div class="pad">
      <p class="s" style="font-family:var(--ui)">Enter the 6-digit code sent to ${S.acct.phone}. The code expires 60 seconds after it is sent.</p>
      <div class="fld en"><label>Verification code</label><input id="spOtp" inputmode="numeric" maxlength="6" placeholder="______"></div>
      ${x.err ? `<div class="note bad en flush">${esc(x.err)}</div>` : ''}
      <button class="btn spb en" data-sp="otp-go">Verify</button>
      <button class="btn ghost en" data-sp="otp-resend">Resend code</button>
      <p class="s" style="font-family:var(--ui);font-size:11.5px;margin-top:12px">${rec ? `Time left: <b data-exp="${rec.expires}">—</b> · ` : ''}${S.net==='none' ? 'No signal on your phone — the SMS cannot be delivered.' : S.net==='poor' ? 'Weak signal — delivery may be delayed.' : 'Check your phone’s messages.'}</p>
    </div></div>`;
  }
  else if (sc === 'denied'){
    const txt = x.kind==='link' ? 'Shurokkha সংযোগ বাতিল করা হয়েছে।' : x.kind==='login' ? 'Shurokkha থেকে লগইন অনুরোধ বাতিল করা হয়েছে।' : 'Shurokkha থেকে অনুরোধটি বাতিল করা হয়েছে।';
    b = spBar('বাতিল') + `<div class="scr-body"><div class="pad center" style="padding-top:44px">
      <div class="big-ic" style="color:#B4432F">✕</div><h3 class="t">অনুরোধ প্রত্যাখ্যাত</h3><p class="s">${txt}</p>
      <button class="btn ghost" data-sp="nav" data-to="${P.loggedIn ? 'home' : 'landing'}">ফিরে যান</button></div></div>`;
  }
  else if (sc === 'home'){
    b = spBar('SafePay', `<button class="rt" data-sp="logout">লগআউট</button>`) + `<div class="scr-body">
      <div class="sp-hello"><small>স্বাগতম</small><b>${esc(P.name || 'শিরিন আক্তার')}</b><span>${S.acct.phone}</span></div>
      <div class="tiles">
        <button class="tile" data-sp="balance"><i>৳</i><b>ব্যালেন্স দেখুন</b></button>
        <button class="tile" data-sp="nav" data-to="send"><i>↗</i><b>টাকা পাঠান</b></button>
        <button class="tile" data-sp="nav" data-to="add"><i>＋</i><b>অ্যাড মানি</b></button>
        <button class="tile" data-sp="nav" data-to="sessions"><i>📱</i><b>ডিভাইস ও সেশন</b></button>
        <button class="tile wide" data-sp="nav" data-to="chpin"><i>🔑</i><b>পাসওয়ার্ড / পিন বদল</b></button>
      </div>
      <div class="note ${leg ? 'warn' : 'ok'}">${leg ? 'Legacy: লেনদেনে SafePay পিন, আর লগইন ও পিন বদলে SMS কোড।' : 'সব যাচাই হয় Shurokkha দিয়ে। কোনো SMS কোড নেই।'}</div>
    </div>`;
  }
  else if (sc === 'balance'){
    b = spBar('ব্যালেন্স', spBack('home')) + `<div class="scr-body">
      <div class="balcard"><small>বর্তমান ব্যালেন্স</small><b>৳ ${bn(grp(P.balance))}</b></div>
      ${leg ? '' : `<div class="note ok">কোনো প্রশ্ন করা হয়নি — লগইন করা সেশন, শুধু দেখা <span class="tb T0">T0</span></div>`}
    </div>`;
  }
  else if (sc === 'send'){
    b = spBar('টাকা পাঠান', spBack('home')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>প্রাপকের নম্বর</label><input id="spTo" value="${x.to || ''}" inputmode="numeric" placeholder="01XXXXXXXXX"></div>
      <div class="chips">${P.saved.map(n => `<button data-sp="pick" data-v="${n}">${PAYEE_NAMES[n] || bn(n)}</button>`).join('')}</div>
      <div class="fld"><label>টাকার পরিমাণ</label><input id="spAmt" value="${x.amt || ''}" inputmode="numeric" placeholder="0"></div>
      ${err(x)}
      <button class="btn spb" data-sp="send-go">এগিয়ে যান</button>
    </div></div>`;
  }
  else if (sc === 'add'){
    const src = x.src || 'ব্যাংক অ্যাকাউন্ট';
    b = spBar('অ্যাড মানি', spBack('home')) + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>কোথা থেকে</label></div>
      <div class="srcs">${['ব্যাংক অ্যাকাউন্ট','ডেবিট কার্ড'].map(s => `<button data-sp="src" data-v="${s}" aria-pressed="${s===src}">${s}</button>`).join('')}</div>
      <div class="fld"><label>টাকার পরিমাণ</label><input id="spAddAmt" value="${x.amt || ''}" inputmode="numeric" placeholder="0"></div>
      ${err(x)}
      <button class="btn spb" data-sp="add-go">টাকা যোগ করুন</button>
    </div></div>`;
  }
  else if (sc === 'sessions'){
    b = spBar('ডিভাইস ও সেশন', spBack('home')) + `<div class="scr-body">
      <p class="s pad" style="padding-bottom:0">SafePay যেসব ডিভাইসে লগইন করা আছে।</p>
      <div class="rowlist">${P.sessions.map(s => `<div class="rowi ${s.atk ? 'atk' : ''}"><div class="ico">${s.atk ? '💻' : '📱'}</div>
        <div><b>${esc(s.name)}</b><span>${esc(s.place)}</span></div>
        <div class="tag ${s.me ? 'me' : s.atk ? 'x' : ''}">${s.me ? 'এই ডিভাইস' : s.atk ? 'অচেনা' : ''}</div></div>`).join('')}</div>
      <div class="pad">
        ${x.done ? `<div class="note ok flush">অন্য সব সেশন বন্ধ করা হয়েছে।</div>` : ''}
        <button class="btn warn" data-sp="kill-sessions" ${P.sessions.length < 2 ? 'disabled' : ''}>অন্য সব সেশন বন্ধ করুন</button>
      </div></div>`;
  }
  else if (sc === 'chpin'){
    b = spBar('পাসওয়ার্ড / পিন বদল', spBack('home')) + `<div class="scr-body"><div class="pad">
      <p class="s">${leg ? 'Legacy: বদলানোর আগে SMS কোড চাওয়া হবে।' : 'পিন বদল সবসময় Shurokkha-তে স্বাক্ষর চায় (T3)।'}</p>
      <div class="two">
        <div class="fld"><label>নতুন পিন</label><input id="spNewPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>আবার</label><input id="spNewPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn spb" data-sp="chpin-go">পিন বদলান</button>
    </div></div>`;
  }
  else if (sc === 'pinpad'){
    const pin = x.pin || '';
    const what = x.purpose==='balance' ? 'Check balance' : x.purpose==='transfer' ? `Send ৳${grp(x.amount)} to ${x.to}` : `Add ৳${grp(x.amount)}`;
    b = spBar('Enter PIN', spBack('home', 'Cancel')) + `<div class="scr-body">
      <p class="s" style="font-family:var(--ui);padding:14px 17px 0;margin:0">${esc(what)}</p>
      <div class="pindots">${[0,1,2,3].map(i => `<i class="${pin.length > i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="pinpad">${[1,2,3,4,5,6,7,8,9].map(n => `<button data-sp="pk" data-v="${n}">${n}</button>`).join('')}
        <button data-sp="pk-del">⌫</button><button data-sp="pk" data-v="0">0</button><span></span></div>
      ${x.err ? `<div class="note bad en">${esc(x.err)}</div>` : ''}
    </div>`;
  }
  else if (sc === 'done'){
    b = spBar('সম্পন্ন') + `<div class="scr-body"><div class="pad center" style="padding-top:40px">
      <div class="big-ic" style="color:var(--shu)">✓</div><h3 class="t">${esc(x.t)}</h3><p class="s">${esc(x.s || '')}</p>
      <button class="btn ghost" data-sp="nav" data-to="home">হোম</button></div></div>`;
  }

  // in-app permission popup
  let m = '';
  if (P.modal === 'perm'){
    m = `<div class="modal"><div class="box"><div class="mh sp"><span class="sp-ic" style="width:18px;height:18px;font-size:11px">S</span><span>SafePay</span></div>
      <div class="mb">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><div class="mark shu" style="width:42px;height:42px;border-radius:12px;margin:0">${SHIELD(24)}</div>
          <div><b style="font-size:15px">Shurokkha</b><span style="display:block;font-family:var(--bn);font-size:11px;color:var(--mid)">My Device-এ ইনস্টল করা আছে</span></div></div>
        <h4>Shurokkha-কে আপনার অ্যাপ অ্যাক্সেসের অনুমতি দিন</h4>
        <ul class="perm"><li>SafePay-এর লগইন ও লেনদেন অনুমোদন করবে</li><li>SafePay-এর জন্য আলাদা চাবি জোড়া তৈরি ও সংরক্ষণ করবে</li><li>SMS কোডের আর দরকার হবে না</li></ul>
      </div>
      <div class="mf"><button class="btn spb" data-sp="perm-yes">অনুমতি দিন</button><button class="btn ghost" data-sp="perm-no">বাতিল</button></div></div></div>`;
  } else if (P.modal === 'no-shu'){
    m = `<div class="modal"><div class="box"><div class="mh sp"><span>SafePay</span></div>
      <div class="mb"><h4>Shurokkha চালু পাওয়া যায়নি</h4><p class="s" style="margin:0">আগে My Device-এ Shurokkha রেজিস্টার করে সাইন ইন করুন, তারপর আবার চেষ্টা করুন।</p></div>
      <div class="mf"><button class="btn ghost" data-sp="modal-x">ঠিক আছে</button></div></div></div>`;
  }
  return sbar('sp') + b + m;
}

