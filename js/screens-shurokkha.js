/* Shurokkha · screens-shurokkha.js — Shurokkha screens (My Device + Second Device) and popups */

/* ---------------- Shurokkha (My Device + Second Device) ---------------- */
function renderShu(d){
  const D = S.dev[d], x = D.data;
  if (D.revoked) return sbar(d) + `<div class="appbar dead">${SHIELD(20)}<b>Shurokkha</b></div>
    <div class="scr-body"><div class="pad center" style="padding-top:50px">
      <div class="big-ic">⊘</div><h3 class="t">${t('এই ফোনের চাবি বাতিল হয়েছে', 'This phone\'s key is revoked')}</h3>
      <p class="s">${t('নতুন ডিভাইস থেকে সব সেশন বন্ধ করা হয়েছে। Shurokkha-র চাবি আর SafePay-এর চাবি — দুটোই সার্ভার থেকে মুছে ফেলা হয়েছে। এই ফোন হাতে পেলেও কেউ কিছু অনুমোদন করতে পারবে না।', 'All sessions closed from new device. Both Shurokkha key and SafePay key removed from server. Even with physical access, no one can approve anything.')}</p>
    </div></div>`;

  let sc = D.screen;
  if (['home','chpin','sessions','scan'].includes(sc) && !D.signedIn) sc = 'landing';
  let b = '';

  if (sc === 'landing'){
    b = `<div class="land">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px 0;">
        <span style="font-family:var(--mono);font-size:11px;color:var(--mid)">${t('ভাষা', 'Language')}</span>
        <div class="seg lang" style="scale:0.88;transform-origin:right center;">
          <button data-lang="bn" aria-pressed="${S.lang==='bn'}">বাংলা</button>
          <button data-lang="en" aria-pressed="${S.lang==='en'}">English</button>
        </div>
      </div>
      <div class="land-hero" style="padding-top:24px">
        <div class="mark shu">${SHIELD(40)}</div>
        <h2>Shurokkha</h2>
        <p>${t('সুরক্ষা · আপনার সব অ্যাপের চাবি এক জায়গায়', 'Security · All your app keys in one place')}</p>
      </div>
      <div class="pad">
        ${d==='sec' && !S.acct.registered ? `<div class="note warn flush">${t('আগে My Device-এ Shurokkha রেজিস্টার করুন।', 'Please register Shurokkha on My Device first.')}</div>` : ''}
        <button class="btn ${S.lang==='en'?'en':''}" data-shu="signin" data-d="${d}" ${d==='sec' && !S.acct.registered ? 'disabled' : ''}>${t('রেজিস্টার', 'Register')}</button>
        <button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="lost" data-d="${d}" ${d==='sec' && !S.acct.registered ? 'disabled' : ''}>${t('ফোন হারিয়ে গেছে', 'Lost phone')}</button>
      </div></div>`;
  }
  else if (sc === 'signin'){
    b = shuBar(d, t('রেজিস্ট্রেশন / সাইন ইন', 'Register / Sign In'), false, 'to-landing') + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>${t('মোবাইল নম্বর', 'Mobile Number')}</label><input id="${d}Phone" value="${S.acct.phone}" inputmode="numeric"></div>
      ${err(x)}
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="signin-go" data-d="${d}">${t('চালিয়ে যান', 'Continue')}</button>
      <p class="s" style="margin-top:12px">${!S.acct.registered ? t('এই নম্বরে Shurokkha নেই — পরের ধাপে রেজিস্ট্রেশন হবে।', 'No Shurokkha on this number — registration will occur next step.')
        : D.active ? t('এই ফোনে চাবি আছে। পিন দিয়ে ঢুকুন।', 'Key exists on this phone. Enter PIN to sign in.') : t('নতুন ডিভাইস। আপনার অন্য ফোনে অনুমোদন চাওয়া হবে।', 'New device. Approval will be requested on your other phone.')}</p>
    </div></div>`;
  }
  else if (sc === 'reg'){
    b = shuBar(d, t('রেজিস্ট্রেশন', 'Registration'), false, 'to-landing') + `<div class="scr-body"><div class="pad">
      <h3 class="t">${t('Shurokkha পিন ঠিক করুন', 'Set Shurokkha PIN')}</h3>
      <p class="s">${t('৪ সংখ্যার পিন। Shurokkha খোলার সময় লাগবে। কোনো অ্যাপের সাথে শেয়ার হবে না।', '4-digit PIN. Needed to open Shurokkha. Never shared with any app.')}</p>
      <div class="two">
        <div class="fld"><label>${t('পিন', 'PIN')}</label><input id="${d}RegPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>${t('আবার', 'Confirm')}</label><input id="${d}RegPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="reg-go" data-d="${d}">${t('চাবি তৈরি করুন', 'Create Keys')}</button>
    </div></div>`;
  }
  else if (sc === 'reg-keys'){
    b = shuBar(d, t('চাবি তৈরি হয়েছে', 'Keys Created')) + `<div class="scr-body">
      <div class="pad" style="padding-bottom:8px"><p class="s" style="margin:0">${t('দুটি চাবি একসাথে তৈরি হলো। একটি ফোনে থাকল, একটি সার্ভারে গেল।', 'Two keys created together. One stays on phone, one goes to server.')}</p></div>
      <div class="keyviz">
        <div class="kv priv"><b>🔒 private</b><div class="hx">${t('ফোনের চিপে আটকে আছে। বের করা যায় না — JavaScript পড়তেও পারে না।', 'Locked inside phone chip. Non-extractable — JS cannot read it.')}</div></div>
        <div class="kv"><b>🔓 public</b><div class="hx m">${esc(D.key.fp)}<br>${esc((D.key.jwk.x).slice(0,22))}…</div></div>
      </div>
      <div class="note ok">${t('সার্ভারে এখন লেখা আছে:', 'Server now holds:')} <b>${bn(S.acct.phone)} → ${t('এই public key', 'this public key')}</b>। ${t('এটাই বিশ্বাসের ভিত্তি।', 'This is the foundation of trust.')}</div>
      <div class="pad" style="padding-top:0"><button class="btn ${S.lang==='en'?'en':''}" data-shu="to-recovery" data-d="${d}">${t('পরের ধাপ', 'Next Step')}</button></div>
    </div>`;
  }
  else if (sc === 'reg-recovery'){
    b = shuBar(d, t('ফোন হারালে', 'If Phone Lost')) + `<div class="scr-body"><div class="pad">
      <p class="s">${t('এখনই ঠিক করে রাখুন। পরে দরকার হবে।', 'Set up now for future recovery needs.')}</p>
      <div class="note warn flush">${t('কাগজে লিখে রাখুন — প্রতিটি কোড একবার ব্যবহার করা যাবে।', 'Write down on paper — each code single-use only.')}</div>
      <div class="codes">${S.acct.paper.map(c => `<div>${c}</div>`).join('')}</div>
      <div class="note ok flush">${t('বিশ্বস্ত দুইজন: স্বামী ও বোন। ফোন হারালে দুজনকেই অনুমোদন দিতে হবে।', 'Two trusted contacts: Husband & Sister. Both must approve if lost.')}</div>
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="reg-finish" data-d="${d}">${t('শুরু করুন', 'Get Started')}</button>
    </div></div>`;
  }
  else if (sc === 'pin'){
    b = shuBar(d, t('পিন দিন', 'Enter PIN'), false, 'to-landing') + `<div class="scr-body"><div class="pad">
      <p class="s">${bn(S.acct.phone)}</p>
      <div class="fld"><label>${t('Shurokkha পিন', 'Shurokkha PIN')}</label><input id="${d}Pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      ${err(x)}
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="pin-go" data-d="${d}">${t('ঢুকুন', 'Enter')}</button>
    </div></div>`;
  }
  else if (sc === 'home'){
    const L = S.links.safepay, mine = L && L.keys[d];
    b = shuBar(d, 'Shurokkha', true) + `<div class="scr-body">
      <div class="hello"><div class="av">${t('শি', 'Sh')}</div><div><b>${bn(S.acct.phone)}</b><span>${label(d)} · ${t('ডিভাইস কী', 'Device key')} ${esc(D.key ? D.key.fp : '—')}</span></div></div>
      ${x.recovered ? (x.revoked
        ? `<div class="note ok" style="margin-top:12px">${t('রিকভারি সম্পন্ন। হারানো ফোনের সব চাবি বাতিল, SafePay-এর চাবিও নতুন করে তৈরি হয়েছে।', 'Recovery complete. Lost phone keys revoked, new SafePay keys generated.')}</div>`
        : `<div class="note bad" style="margin-top:12px">${t('হারানো ফোনটি এখনো অনুমোদন দিতে পারে। মেনু → ডিভাইস ও সেশন থেকে সরিয়ে দিন।', 'Lost phone can still approve requests. Revoke it from Menu → Devices & Sessions.')}</div>`) : ''}
      <h6 class="sub">${t('সংযুক্ত অ্যাপ', 'Linked Apps')}</h6>
      ${mine ? `<div class="app-row"><div class="app-ic">S</div>
          <div><b>SafePay</b>
            <span>${t('কী', 'Key')} ${esc(mine.fp)}</span>
            <span class="bn">${L.lastUse ? t('শেষ অনুমোদন: ', 'Last approval: ') + ({login:t('লগইন','Login'), transfer:t('টাকা পাঠানো','Send Money'), topup:t('অ্যাড মানি','Add Money'), chpin:t('পিন বদল','Change PIN')}[L.lastUse.kind]) + ' · ' + ago(L.lastUse.at) : t('যুক্ত হয়েছে ', 'Linked ') + ago(L.linkedAt)}</span>
          </div><span class="live" title="${t('সক্রিয়','Active')}"></span></div>`
        : `<div class="empty"><div class="big-ic">⧉</div><p class="s" style="margin:0">${t('এখনো কোনো অ্যাপ যুক্ত নেই।<br>SafePay-তে রেজিস্টার করলে এখানে দেখাবে।', 'No apps linked yet.<br>Register on SafePay to display here.')}</p></div>`}
    </div>`;
  }
  else if (sc === 'chpin'){
    b = shuBar(d, t('পিন বদল', 'Change PIN'), false, 'home') + `<div class="scr-body"><div class="pad">
      <p class="s">${t('রেজিস্ট্রেশনের সময় দেওয়া Shurokkha পিন বদলান। পিন বদল সবসময় আঙুলের ছাপ চায়।', 'Change your Shurokkha PIN. Changing PIN requires fingerprint verification.')}</p>
      <div class="fld"><label>${t('বর্তমান পিন', 'Current PIN')}</label><input id="${d}OldPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      <div class="two">
        <div class="fld"><label>${t('নতুন পিন', 'New PIN')}</label><input id="${d}NewPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>${t('আবার', 'Confirm')}</label><input id="${d}NewPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="chpin-go" data-d="${d}">${t('পিন বদলান', 'Change PIN')}</button>
    </div></div>`;
  }
  else if (sc === 'sessions'){
    const devs = activeDevs();
    b = shuBar(d, t('ডিভাইস ও সেশন', 'Devices & Sessions'), false, 'home') + `<div class="scr-body">
      <p class="s pad" style="padding-bottom:0">${t('যেসব ডিভাইসে Shurokkha সাইন ইন করা আছে। প্রতিটির নিজস্ব চাবি।', 'Devices signed into Shurokkha. Each holds its own keypair.')}</p>
      <div class="rowlist">${devs.map(t_dev => `<div class="rowi"><div class="ico">📱</div>
        <div><b>${label(t_dev)}</b><span>${t('ঢাকা', 'Dhaka')} · ${t('কী', 'Key')} ${esc(S.dev[t_dev].key ? S.dev[t_dev].key.fp : '—')}</span></div>
        <div class="tag ${t_dev===d ? 'me' : ''}">${t_dev===d ? t('এই ফোন', 'This phone') : ''}</div></div>`).join('')}</div>
      <div class="pad">
        ${x.done ? `<div class="note ok flush">${t('অন্য সব ডিভাইস সরানো হয়েছে। তাদের SafePay চাবিও বাতিল।', 'All other devices removed. SafePay keys revoked.')}</div>` : ''}
        <button class="btn warn ${S.lang==='en'?'en':''}" data-shu="revoke-others" data-d="${d}" ${devs.length < 2 ? 'disabled' : ''}>${t('অন্য সব ডিভাইস সরান', 'Revoke All Other Devices')}</button>
        <p class="s" style="margin:10px 0 0;font-size:11.5px">${t('ফোন হারালে এটাই প্রথম কাজ। সরানো ডিভাইসের সব চাবি সার্ভার থেকে মুছে যায়।', 'First action if phone is lost. Deletes all revoked keys from server.')}</p>
      </div></div>`;
  }
  else if (sc === 'scan'){
    const P = S.pending, mine = P && P.status==='pending' && P.targets.includes(d);
    let inner;
    if (!mine) inner = `<div class="pad"><div class="note warn flush">${t('এখন কোনো অনুরোধ অপেক্ষায় নেই।', 'No pending request right now.')}</div>
      <p class="s">${t('SafePay বা অন্য ডিভাইসে নেটওয়ার্ক-ছাড়া অনুরোধ তৈরি হলে সেখানে একটি কিউআর দেখাবে। সেটা এখানে স্ক্যান করুন।', 'If an offline request is initiated on SafePay or another device, scan its QR code here.')}</p></div>`;
    else if (!P.scanned[d]) inner = `<div class="pad center">
      <p class="s">${t('অন্য স্ক্রিনের কিউআর ক্যামেরায় ধরুন।', 'Point camera at the QR code on other screen.')}</p>
      <div class="camera"><div>⛶</div><small>${t('ক্যামেরা · নেটওয়ার্ক লাগে না', 'Camera · No network required')}</small></div>
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="do-scan" data-d="${d}">${t('স্ক্যান করুন', 'Scan')}</button></div>`;
    else if (!P.resp[d]) inner = `<div class="pad">${requestSummary(P)}${cue()}
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="sign-offline" data-d="${d}" style="margin-top:10px">${t('আঙুলের ছাপ দিয়ে অনুমোদন', 'Approve with Fingerprint')}</button>
      <button class="btn warn ${S.lang==='en'?'en':''}" data-shu="no" data-d="${d}">${t('না, আমি না', 'No, not me')}</button></div>`;
    else inner = `<div class="otpbox"><div class="lbl">${t('এই ৮ সংখ্যা ' + (P.origin==='sp' ? 'SafePay-তে' : 'অন্য ডিভাইসে') + ' টাইপ করুন', 'Type these 8 digits in ' + (P.origin==='sp' ? 'SafePay' : 'the other device'))}</div><div class="big">${P.resp[d]}</div></div>
      <div class="note ok">${t('হিসাবটা ফোনের ভেতরেই হয়েছে। এই সংখ্যা শুধু <b>এই একটি</b> অনুরোধের জন্য — অঙ্ক বা ডিভাইস বদলালে কাজ করবে না।', 'Calculated locally on device. Valid for <b>this single request</b> only.')}</div>`;
    b = shuBar(d, t('কিউআর স্ক্যান', 'QR Scan'), false, 'home') + `<div class="scr-body">${inner}</div>`;
  }
  else if (sc === 'lost'){
    b = shuBar(d, t('ফোন হারিয়ে গেছে', 'Lost Phone'), false, 'to-landing') + `<div class="scr-body"><div class="pad">
      ${D.active ? `<div class="note warn flush">${t('এই ফোনেই আপনার Shurokkha চালু আছে। ফোন হারালে নতুন ফোন থেকে এই অপশন ব্যবহার করুন।', 'Shurokkha is active on this phone. If lost, use this option from a new phone.')}</div>`
      : `<p class="s">${t('তিনটি পথ আছে। যেটা সম্ভব সেটা বেছে নিন।', 'Choose one of 3 recovery options.')}</p>
        <button class="btn ${S.lang==='en'?'en':''}" data-shu="lost-qr" data-d="${d}">${t('পুরোনো ফোনটি হাতে আছে', 'Have old phone in hand')}</button>
        <button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="lost-paper" data-d="${d}">${t('কাগজের কোড আছে', 'Have paper recovery code')}</button>
        <button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="lost-people" data-d="${d}">${t('বিশ্বস্ত দুইজনের অনুমোদন', 'Approval from 2 trusted contacts')}</button>
        <p class="s" style="margin-top:14px;font-size:11.5px">${t('কোনোটাই না থাকলে এনআইডি নিয়ে এজেন্টের কাছে যেতে হবে।', 'If none are available, visit an agent with your NID.')}</p>`}
    </div></div>`;
  }
  else if (sc === 'wait'){
    const P = S.pending;
    if (!P || P.status !== 'pending') b = shuBar(d, t('অপেক্ষা', 'Waiting'), false, 'to-landing') + `<div class="scr-body"><div class="pad"><p class="s">${t('অনুরোধটি আর চালু নেই।', 'Request no longer active.')}</p></div></div>`;
    else b = shuBar(d, t('অপেক্ষা', 'Waiting'), false, 'cancel-req') + `<div class="scr-body">
      <div class="pad center" style="padding-bottom:4px">
        ${P.offline ? '' : '<div class="spin shu"></div>'}
        <h3 class="t">${t('পুরোনো ফোনে অনুমোদন দিন', 'Approve on old phone')}</h3>
        <p class="s">${P.offline ? t('পুরোনো ফোনে Shurokkha → ☰ মেনু → কিউআর স্ক্যান। তারপর ৮ সংখ্যা এখানে লিখুন।', 'On old phone: Shurokkha → ☰ Menu → QR Scan. Enter the 8 digits here.')
          : t('অনুরোধটি My Device-এর Shurokkha-তে গেছে। সেখানে “হ্যাঁ” চাপলেই এখানে চালু হবে।', 'Request sent to My Device Shurokkha. Tap "Yes" there to continue.')}</p>
      </div>
      ${P.offline ? `<div class="qrwrap">${qrHTML(P.challenge)}</div><div class="pad" style="padding-top:0">
          <div class="fld"><label>${t('পুরোনো ফোনের ৮ সংখ্যা', '8-digit code from old phone')}</label><input id="${d}Resp" inputmode="numeric" maxlength="8" placeholder="________"></div>
          ${err(x)}<button class="btn ${S.lang==='en'?'en':''}" data-shu="resp-go" data-d="${d}">${t('যাচাই করুন', 'Verify')}</button></div>`
        : `<div class="pad" style="padding-top:0"><div class="note ok flush">${t('কোনো SMS পাঠানো হয়নি। বলে দেওয়ার মতো কোনো কোড নেই।', 'No SMS sent. No codes to read aloud.')}</div>
          <button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="force-offline" data-d="${d}">${t('পুরোনো ফোনে নেটওয়ার্ক নেই?', 'No network on old phone?')}</button></div>`}
    </div>`;
  }
  else if (sc === 'paper'){
    b = shuBar(d, t('কাগজের কোড', 'Paper Code'), false, 'lost') + `<div class="scr-body"><div class="pad">
      <p class="s">${t('রেজিস্ট্রেশনের সময় দেওয়া কোডগুলোর যেকোনো একটি লিখুন। প্রতিটি একবার ব্যবহার করা যায়।', 'Enter one of the recovery codes generated at setup. Single-use only.')}</p>
      <div class="fld"><label>${t('রিকভারি কোড', 'Recovery Code')}</label><input id="${d}Paper" placeholder="XXXX-XXXX" autocomplete="off"></div>
      ${err(x)}
      <button class="btn ${S.lang==='en'?'en':''}" data-shu="paper-go" data-d="${d}">${t('যাচাই করুন', 'Verify')}</button>
      <div class="note warn flush" style="margin-top:14px">${t('এই কোডগুলো bearer token — যার হাতে যাবে সে ব্যবহার করতে পারবে। তাই শুধু রিকভারিতে, লেনদেনে নয়।', 'Recovery codes act as bearer tokens. Use for recovery only.')}</div>
    </div></div>`;
  }
  else if (sc === 'people'){
    b = shuBar(d, t('বিশ্বস্ত দুইজন', 'Trusted Contacts'), false, 'lost') + `<div class="scr-body">
      <p class="s pad" style="padding-bottom:6px">${t('দুজনের ফোনেই অনুরোধ গেছে। <b>দুজনেরই</b> অনুমোদন লাগবে।', 'Request sent to both contacts. <b>Both</b> must approve.')}</p>
      <div class="rowlist">
        <div class="rowi"><div class="ico">👤</div><div><b>${t('স্বামী', 'Husband')}</b><span>01722xxxxxx</span></div>
          <div class="tag">${x.p1 ? `<span class="tag me">${t('✓ দিয়েছেন', '✓ Approved')}</span>` : `<button class="btn sm" data-shu="p1" data-d="${d}">${t('অনুমোদন', 'Approve')}</button>`}</div></div>
        <div class="rowi"><div class="ico">👤</div><div><b>${t('বোন', 'Sister')}</b><span>01933xxxxxx</span></div>
          <div class="tag">${x.p2 ? `<span class="tag me">${t('✓ দিয়েছেন', '✓ Approved')}</span>` : `<button class="btn sm" data-shu="p2" data-d="${d}">${t('অনুমোদন', 'Approve')}</button>`}</div></div>
      </div>
      <div class="pad">
        <button class="btn ${S.lang==='en'?'en':''}" data-shu="people-go" data-d="${d}" ${x.p1 && x.p2 ? '' : 'disabled'}>${t('চালিয়ে যান', 'Continue')}</button>
        <p class="s" style="margin-top:11px;font-size:11.5px">${t('প্রতারক একসাথে দুজন আলাদা মানুষকে বোকা বানাতে পারবে না।', 'An attacker cannot easily trick two separate contacts simultaneously.')}</p>
      </div></div>`;
  }
  else if (sc === 'revoke-confirm'){
    const others = activeDevs().filter(t_dev => t_dev !== d);
    b = shuBar(d, t('শেষ ধাপ', 'Final Step')) + `<div class="scr-body">
      <div class="pad" style="padding-bottom:6px">
        <h3 class="t">${t('অন্য সব সেশন বন্ধ করবেন?', 'Revoke all other sessions?')}</h3>
        <p class="s">${t('এই ফোনে নতুন চাবি তৈরি হয়েছে — Shurokkha-র জন্য, আর প্রতিটি সংযুক্ত অ্যাপের জন্য। হারানো ফোনের চাবিগুলো এখনো চালু আছে।', 'New keys created on this phone. Lost phone keys remain active until revoked.')}</p>
      </div>
      <div class="rowlist">
        ${others.map(t_dev => `<div class="rowi"><div class="ico">📱</div><div><b>${label(t_dev)}</b><span>Shurokkha ${t('সেশন', 'Session')}</span></div><div class="tag x">${t('বন্ধ হবে', 'Will Revoke')}</div></div>`).join('')}
        ${S.links.safepay ? `<div class="rowi"><div class="app-ic" style="width:24px;height:24px;font-size:12px;border-radius:7px">S</div><div><b>SafePay</b><span>${t('হারানো ফোনের public key', 'Lost phone public key')}</span></div><div class="tag x">${t('মুছে যাবে', 'Will Delete')}</div></div>` : ''}
      </div>
      <div class="pad">
        <button class="btn warn ${S.lang==='en'?'en':''}" data-shu="revoke-go" data-d="${d}">${t('সব বন্ধ করুন', 'Revoke All')}</button>
        <button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="revoke-skip" data-d="${d}">${t('আপাতত থাক', 'Keep for Now')}</button>
      </div></div>`;
  }
  else if (sc === 'denied'){
    b = shuBar(d, t('বাতিল', 'Denied')) + `<div class="scr-body"><div class="pad center" style="padding-top:44px">
      <div class="big-ic" style="color:#B4432F">✕</div><h3 class="t">${t('অনুরোধ প্রত্যাখ্যাত', 'Request Rejected')}</h3>
      <p class="s">${t('অন্য ফোন থেকে “না” বলা হয়েছে।', 'Rejected from other phone.')}</p>
      <button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="to-landing" data-d="${d}">${t('ফিরে যান', 'Go Back')}</button></div></div>`;
  }

  return sbar(d) + b + shuOverlays(d);
}

function requestSummary(P){
  const meta = (k,v) => `<div class="mrow"><i>${k}</i><b>${v}</b></div>`;
  if (P.kind === 'login') return `<h4 style="font-family:var(--bn);font-size:16px;margin:0 0 8px">${t('আপনি কি SafePay-তে লগইন করার চেষ্টা করছেন?', 'Are you attempting to log in to SafePay?')}</h4>${meta(t('ডিভাইস','Device'), esc(P.device))}${meta(t('অবস্থান','Location'), esc(P.place))}`;
  if (P.kind === 'transfer') return `<div class="mamt">${taka(P.amount)}</div><div class="mto">→ ${bn(P.payee)} ${P.payeeKnown ? '' : `<em>${t('নতুন নম্বর','New Number')}</em>`}</div>`;
  if (P.kind === 'topup') return `<div class="mamt">${taka(P.amount)}</div><div class="mto">${t('SafePay-তে যোগ', 'Add to SafePay')} · ${esc(P.source)}</div>`;
  if (P.kind === 'chpin') return `<h4 style="font-family:var(--bn);font-size:16px;margin:0 0 8px">${t('SafePay-এর পিন বদলাচ্ছেন?', 'Changing SafePay PIN?')}</h4>`;
  return `<h4 style="font-family:var(--bn);font-size:16px;margin:0 0 8px">${t('নতুন ডিভাইসে Shurokkha চালু করবেন?', 'Enable Shurokkha on new device?')}</h4>${meta(t('ডিভাইস','Device'), esc(P.device))}${meta(t('অবস্থান','Location'), esc(P.place))}`;
}

function shuOverlays(d){
  const D = S.dev[d]; let o = '';
  // legacy SMS notifications land on My Device, outside any app
  if (d === 'my'){
    const list = S.otpHist.filter(r => r.arrived && r.arrivedAt > S.smsDismissed).slice(-3).reverse();
    if (list.length) o += `<div class="notifs">${list.map(r => `<div class="notif ${r.stale ? 'stale' : ''}">
      <div class="nh"><span>Messages · +8801XXXXXXXXX</span><span>${Math.round((now()-r.arrivedAt)/1000)}s <button data-shu="sms-x" data-d="my" aria-label="dismiss">✕</button></span></div>
      <div class="nb">Your SafePay verification code is ${r.code}. Do not share this code with anyone.</div></div>`).join('')}</div>`;
  }
  if (D.menu && D.signedIn){
    o += `<div class="drawer" data-shu="menu-close" data-d="${d}"><div class="dp" data-shu="noop">
      <div class="dh"><b>${bn(S.acct.phone)}</b><span>${label(d)}</span></div>
      <button class="di" data-shu="chpin" data-d="${d}"><i>🔑</i>${t('পিন বদল', 'Change PIN')}</button>
      <button class="di" data-shu="sessions" data-d="${d}"><i>📱</i>${t('ডিভাইস ও সেশন', 'Devices & Sessions')}</button>
      <button class="di" data-shu="scan" data-d="${d}"><i>⛶</i>${t('কিউআর স্ক্যান', 'QR Scan')}</button>
      <div class="di" style="justify-content:space-between">
        <span style="display:flex;gap:12px;align-items:center"><i>🌐</i>${t('ভাষা', 'Language')}</span>
        <div class="seg lang" style="scale:0.85;transform-origin:right center">
          <button data-lang="bn" aria-pressed="${S.lang==='bn'}">বাংলা</button>
          <button data-lang="en" aria-pressed="${S.lang==='en'}">EN</button>
        </div>
      </div>
      <button class="di out" data-shu="signout" data-d="${d}"><i>⏻</i>${t('সাইন আউট', 'Sign Out')}</button>
    </div></div>`;
  }
  if (S.lockAlert[d]){
    return o + `<div class="modal"><div class="box bad"><div class="mh">${SHIELD(16)}<span>${t('সতর্কতা', 'Alert')}</span></div>
      <div class="mb"><h4>${t('একাধিক সন্দেহজনক অনুরোধ', 'Multiple Suspicious Requests')}</h4>
      <p class="s" style="margin:0 0 6px">${t('চট্টগ্রাম থেকে এক মিনিটে তিনটি লগইন অনুরোধ এসেছে। Shurokkha ১০ মিনিটের জন্য অচেনা ডিভাইসের অনুরোধ বন্ধ করেছে।', 'Three login requests in one minute from Chattogram. Shurokkha rate-limited unknown devices for 10 min.')}</p>
      <div class="note warn flush">${t('কেউ হয়তো আপনার SafePay পিন জানে। পিন বদলে ফেলুন।', 'Someone may know your SafePay PIN. Change your PIN immediately.')}</div></div>
      <div class="mf"><button class="btn ${S.lang==='en'?'en':''}" data-shu="lock-ok" data-d="${d}">${t('বুঝেছি', 'Got it')}</button></div></div></div>`;
  }
  if (linkFor(d)){
    return o + `<div class="modal"><div class="box"><div class="mh">${SHIELD(16)}<span>Shurokkha · ${t('নতুন অ্যাপ', 'New App')}</span></div>
      <div class="mb">
        <div style="display:flex;gap:11px;align-items:center;margin-bottom:12px"><div class="app-ic">S</div>
          <div><b style="font-size:15px">SafePay</b><span style="display:block;font-family:var(--bn);font-size:11px;color:var(--mid)">${t('ট্যাবলেট · ঢাকা · ', 'Tablet · Dhaka · ')}${clock()}</span></div></div>
        <h4>${t('SafePay আপনার Shurokkha-র সাথে যুক্ত হতে চায়', 'SafePay wants to link with Shurokkha')}</h4>
        <p class="s" style="margin:0 0 4px">${t('হ্যাঁ দিলে SafePay-এর জন্য নতুন চাবি জোড়া তৈরি হবে। private key এই ফোনেই থাকবে, public key SafePay-এর সার্ভারে যাবে।', 'Approving will generate a keypair for SafePay. Private key stays on phone, public key sent to SafePay server.')}</p>
        ${cue()}
      </div>
      <div class="mf"><button class="btn ${S.lang==='en'?'en':''}" data-shu="link-yes" data-d="${d}">${t('হ্যাঁ, যুক্ত করুন', 'Yes, Link')}</button><button class="btn warn ${S.lang==='en'?'en':''}" data-shu="link-no" data-d="${d}">${t('না', 'No')}</button></div>
    </div></div>`;
  }
  const P = popupFor(d);
  if (P){
    const bad = P.suspicious;
    const head = P.kind==='login' ? t('SafePay · লগইন', 'SafePay · Login') : P.kind==='transfer' ? (P.tier==='T3' ? t('SafePay · এই লেনদেনে স্বাক্ষর', 'SafePay · Sign Transaction') : t('SafePay · টাকা পাঠানো', 'SafePay · Send Money'))
      : P.kind==='topup' ? t('SafePay · অ্যাড মানি', 'SafePay · Add Money') : P.kind==='chpin' ? t('SafePay · পিন বদল', 'SafePay · Change PIN') : t('Shurokkha · নতুন ডিভাইস', 'Shurokkha · New Device');
    const title = P.kind==='transfer' ? `<h4>${t('SafePay থেকে টাকা পাঠাচ্ছেন?', 'Sending money from SafePay?')}</h4>` : P.kind==='topup' ? `<h4>${t('SafePay-তে টাকা যোগ করছেন?', 'Adding money to SafePay?')}</h4>` : '';
    o += `<div class="modal"><div class="box ${bad ? 'bad' : ''}">
      <div class="mh ${P.app==='SafePay' && !bad ? 'sp' : ''}">${SHIELD(16)}<span>${bad ? t('সতর্কতা · অচেনা অবস্থান', 'Alert · Unknown Location') : head}</span></div>
      <div class="mb">${title}${requestSummary(P)}
        <div class="mrow"><i>${t('সময়', 'Time')}</i><b>${clock()}</b></div>
        ${bad ? `<div class="note bad flush" style="margin-top:10px">${t('এই অনুরোধ ' + esc(P.place) + ' থেকে এসেছে। আপনি ঢাকায় আছেন। আপনি না করে থাকলে “না” চাপুন।', 'This request originated from ' + esc(P.place) + '. If you did not request this, tap "No".')}</div>` : ''}
        ${cue()}
      </div>
      ${P.resp[d] ? `<div class="otpbox" style="margin:0 15px 8px"><div class="lbl">${t('নেটওয়ার্ক নেই — এই ৮ সংখ্যা ' + (P.origin==='sp' ? 'SafePay-তে' : 'অন্য ডিভাইসে') + ' টাইপ করুন', 'Offline — type these 8 digits in ' + (P.origin==='sp' ? 'SafePay' : 'other device'))}</div><div class="big">${P.resp[d]}</div></div>
          <div class="mf"><button class="btn ghost ${S.lang==='en'?'en':''}" data-shu="popup-close" data-d="${d}">${t('ঠিক আছে', 'OK')}</button></div>`
        : `<div class="mf"><button class="btn ${S.lang==='en'?'en':''}" data-shu="yes" data-d="${d}">${t('হ্যাঁ, আমি', 'Yes, it\'s me')}</button><button class="btn warn ${S.lang==='en'?'en':''}" data-shu="no" data-d="${d}">${t('না, আমি না', 'No, not me')}</button></div>`}
    </div></div>`;
  }
  return o;
}
