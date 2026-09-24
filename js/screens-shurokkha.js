/* Shurokkha · screens-shurokkha.js — Shurokkha screens (My Device + Second Device) and popups */

/* ---------------- Shurokkha (My Device + Second Device) ---------------- */
function renderShu(d){
  const D = S.dev[d], x = D.data;
  if (D.revoked) return sbar(d) + `<div class="appbar dead">${SHIELD(20)}<b>Shurokkha</b></div>
    <div class="scr-body"><div class="pad center" style="padding-top:50px">
      <div class="big-ic">⊘</div><h3 class="t">এই ফোনের চাবি বাতিল হয়েছে</h3>
      <p class="s">নতুন ডিভাইস থেকে সব সেশন বন্ধ করা হয়েছে। Shurokkha-র চাবি আর SafePay-এর চাবি — দুটোই সার্ভার থেকে মুছে ফেলা হয়েছে। এই ফোন হাতে পেলেও কেউ কিছু অনুমোদন করতে পারবে না।</p>
    </div></div>`;

  let sc = D.screen;
  if (['home','chpin','sessions','scan'].includes(sc) && !D.signedIn) sc = 'landing';
  let b = '';

  if (sc === 'landing'){
    b = `<div class="land">
      <div class="land-hero"><div class="mark shu">${SHIELD(40)}</div><h2>Shurokkha</h2><p>সুরক্ষা · আপনার সব অ্যাপের চাবি এক জায়গায়</p></div>
      <div class="pad">
        ${d==='sec' && !S.acct.registered ? `<div class="note warn flush">আগে My Device-এ Shurokkha রেজিস্টার করুন।</div>` : ''}
        <button class="btn" data-shu="signin" data-d="${d}" ${d==='sec' && !S.acct.registered ? 'disabled' : ''}>সাইন ইন</button>
        <button class="btn ghost" data-shu="lost" data-d="${d}" ${d==='sec' && !S.acct.registered ? 'disabled' : ''}>ফোন হারিয়ে গেছে</button>
      </div></div>`;
  }
  else if (sc === 'signin'){
    b = shuBar(d, 'সাইন ইন', false, 'to-landing') + `<div class="scr-body"><div class="pad">
      <div class="fld"><label>মোবাইল নম্বর</label><input id="${d}Phone" value="${S.acct.phone}" inputmode="numeric"></div>
      ${err(x)}
      <button class="btn" data-shu="signin-go" data-d="${d}">চালিয়ে যান</button>
      <p class="s" style="margin-top:12px">${!S.acct.registered ? 'এই নম্বরে Shurokkha নেই — পরের ধাপে রেজিস্ট্রেশন হবে।'
        : D.active ? 'এই ফোনে চাবি আছে। পিন দিয়ে ঢুকুন।' : 'নতুন ডিভাইস। আপনার অন্য ফোনে অনুমোদন চাওয়া হবে।'}</p>
    </div></div>`;
  }
  else if (sc === 'reg'){
    b = shuBar(d, 'রেজিস্ট্রেশন', false, 'to-landing') + `<div class="scr-body"><div class="pad">
      <h3 class="t">Shurokkha পিন ঠিক করুন</h3>
      <p class="s">৪ সংখ্যার পিন। Shurokkha খোলার সময় লাগবে। কোনো অ্যাপের সাথে শেয়ার হবে না।</p>
      <div class="two">
        <div class="fld"><label>পিন</label><input id="${d}RegPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>আবার</label><input id="${d}RegPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn" data-shu="reg-go" data-d="${d}">চাবি তৈরি করুন</button>
    </div></div>`;
  }
  else if (sc === 'reg-keys'){
    b = shuBar(d, 'চাবি তৈরি হয়েছে') + `<div class="scr-body">
      <div class="pad" style="padding-bottom:8px"><p class="s" style="margin:0">দুটি চাবি একসাথে তৈরি হলো। একটি ফোনে থাকল, একটি সার্ভারে গেল।</p></div>
      <div class="keyviz">
        <div class="kv priv"><b>🔒 private</b><div class="hx">ফোনের চিপে আটকে আছে। বের করা যায় না — JavaScript পড়তেও পারে না।</div></div>
        <div class="kv"><b>🔓 public</b><div class="hx m">${esc(D.key.fp)}<br>${esc((D.key.jwk.x).slice(0,22))}…</div></div>
      </div>
      <div class="note ok">সার্ভারে এখন লেখা আছে: <b>${bn(S.acct.phone)} → এই public key</b>। এটাই বিশ্বাসের ভিত্তি।</div>
      <div class="pad" style="padding-top:0"><button class="btn" data-shu="to-recovery" data-d="${d}">পরের ধাপ</button></div>
    </div>`;
  }
  else if (sc === 'reg-recovery'){
    b = shuBar(d, 'ফোন হারালে') + `<div class="scr-body"><div class="pad">
      <p class="s">এখনই ঠিক করে রাখুন। পরে দরকার হবে।</p>
      <div class="note warn flush">কাগজে লিখে রাখুন — প্রতিটি কোড একবার ব্যবহার করা যাবে।</div>
      <div class="codes">${S.acct.paper.map(c => `<div>${c}</div>`).join('')}</div>
      <div class="note ok flush">বিশ্বস্ত দুইজন: <b>স্বামী</b> ও <b>বোন</b>। ফোন হারালে দুজনকেই অনুমোদন দিতে হবে।</div>
      <button class="btn" data-shu="reg-finish" data-d="${d}">শুরু করুন</button>
    </div></div>`;
  }
  else if (sc === 'pin'){
    b = shuBar(d, 'পিন দিন', false, 'to-landing') + `<div class="scr-body"><div class="pad">
      <p class="s">${bn(S.acct.phone)}</p>
      <div class="fld"><label>Shurokkha পিন</label><input id="${d}Pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      ${err(x)}
      <button class="btn" data-shu="pin-go" data-d="${d}">ঢুকুন</button>
    </div></div>`;
  }
  else if (sc === 'home'){
    const L = S.links.safepay, mine = L && L.keys[d];
    b = shuBar(d, 'Shurokkha', true) + `<div class="scr-body">
      <div class="hello"><div class="av">শি</div><div><b>${bn(S.acct.phone)}</b><span>${label(d)} · ডিভাইস কী ${esc(D.key ? D.key.fp : '—')}</span></div></div>
      ${x.recovered ? (x.revoked
        ? `<div class="note ok" style="margin-top:12px">রিকভারি সম্পন্ন। হারানো ফোনের সব চাবি বাতিল, SafePay-এর চাবিও নতুন করে তৈরি হয়েছে।</div>`
        : `<div class="note bad" style="margin-top:12px">হারানো ফোনটি এখনো অনুমোদন দিতে পারে। মেনু → ডিভাইস ও সেশন থেকে সরিয়ে দিন।</div>`) : ''}
      <h6 class="sub">সংযুক্ত অ্যাপ</h6>
      ${mine ? `<div class="app-row"><div class="app-ic">S</div>
          <div><b>SafePay</b>
            <span>কী ${esc(mine.fp)}</span>
            <span class="bn">${L.lastUse ? 'শেষ অনুমোদন: ' + ({login:'লগইন', transfer:'টাকা পাঠানো', topup:'অ্যাড মানি', chpin:'পিন বদল'}[L.lastUse.kind]) + ' · ' + ago(L.lastUse.at) : 'যুক্ত হয়েছে ' + ago(L.linkedAt)}</span>
          </div><span class="live" title="সক্রিয়"></span></div>`
        : `<div class="empty"><div class="big-ic">⧉</div><p class="s" style="margin:0">এখনো কোনো অ্যাপ যুক্ত নেই।<br>SafePay-তে রেজিস্টার করলে এখানে দেখাবে।</p></div>`}
    </div>`;
  }
  else if (sc === 'chpin'){
    b = shuBar(d, 'পিন বদল', false, 'home') + `<div class="scr-body"><div class="pad">
      <p class="s">রেজিস্ট্রেশনের সময় দেওয়া Shurokkha পিন বদলান। পিন বদল সবসময় আঙুলের ছাপ চায়।</p>
      <div class="fld"><label>বর্তমান পিন</label><input id="${d}OldPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      <div class="two">
        <div class="fld"><label>নতুন পিন</label><input id="${d}NewPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
        <div class="fld"><label>আবার</label><input id="${d}NewPin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>
      </div>
      ${err(x)}
      <button class="btn" data-shu="chpin-go" data-d="${d}">পিন বদলান</button>
    </div></div>`;
  }
  else if (sc === 'sessions'){
    const devs = activeDevs();
    b = shuBar(d, 'ডিভাইস ও সেশন', false, 'home') + `<div class="scr-body">
      <p class="s pad" style="padding-bottom:0">যেসব ডিভাইসে Shurokkha সাইন ইন করা আছে। প্রতিটির নিজস্ব চাবি।</p>
      <div class="rowlist">${devs.map(t => `<div class="rowi"><div class="ico">📱</div>
        <div><b>${label(t)}</b><span>ঢাকা · কী ${esc(S.dev[t].key ? S.dev[t].key.fp : '—')}</span></div>
        <div class="tag ${t===d ? 'me' : ''}">${t===d ? 'এই ফোন' : ''}</div></div>`).join('')}</div>
      <div class="pad">
        ${x.done ? `<div class="note ok flush">অন্য সব ডিভাইস সরানো হয়েছে। তাদের SafePay চাবিও বাতিল।</div>` : ''}
        <button class="btn warn" data-shu="revoke-others" data-d="${d}" ${devs.length < 2 ? 'disabled' : ''}>অন্য সব ডিভাইস সরান</button>
        <p class="s" style="margin:10px 0 0;font-size:11.5px">ফোন হারালে এটাই প্রথম কাজ। সরানো ডিভাইসের সব চাবি সার্ভার থেকে মুছে যায়।</p>
      </div></div>`;
  }
  else if (sc === 'scan'){
    const P = S.pending, mine = P && P.status==='pending' && P.targets.includes(d);
    let inner;
    if (!mine) inner = `<div class="pad"><div class="note warn flush">এখন কোনো অনুরোধ অপেক্ষায় নেই।</div>
      <p class="s">SafePay বা অন্য ডিভাইসে নেটওয়ার্ক-ছাড়া অনুরোধ তৈরি হলে সেখানে একটি কিউআর দেখাবে। সেটা এখানে স্ক্যান করুন।</p></div>`;
    else if (!P.scanned[d]) inner = `<div class="pad center">
      <p class="s">অন্য স্ক্রিনের কিউআর ক্যামেরায় ধরুন।</p>
      <div class="camera"><div>⛶</div><small>ক্যামেরা · নেটওয়ার্ক লাগে না</small></div>
      <button class="btn" data-shu="do-scan" data-d="${d}">স্ক্যান করুন</button></div>`;
    else if (!P.resp[d]) inner = `<div class="pad">${requestSummary(P)}${cue()}
      <button class="btn" data-shu="sign-offline" data-d="${d}" style="margin-top:10px">আঙুলের ছাপ দিয়ে অনুমোদন</button>
      <button class="btn warn" data-shu="no" data-d="${d}">না, আমি না</button></div>`;
    else inner = `<div class="otpbox"><div class="lbl">এই ৮ সংখ্যা ${P.origin==='sp' ? 'SafePay-তে' : 'অন্য ডিভাইসে'} টাইপ করুন</div><div class="big">${P.resp[d]}</div></div>
      <div class="note ok">হিসাবটা ফোনের ভেতরেই হয়েছে। এই সংখ্যা শুধু <b>এই একটি</b> অনুরোধের জন্য — অঙ্ক বা ডিভাইস বদলালে কাজ করবে না।</div>`;
    b = shuBar(d, 'কিউআর স্ক্যান', false, 'home') + `<div class="scr-body">${inner}</div>`;
  }
  else if (sc === 'lost'){
    b = shuBar(d, 'ফোন হারিয়ে গেছে', false, 'to-landing') + `<div class="scr-body"><div class="pad">
      ${D.active ? `<div class="note warn flush">এই ফোনেই আপনার Shurokkha চালু আছে। ফোন হারালে নতুন ফোন থেকে এই অপশন ব্যবহার করুন।</div>`
      : `<p class="s">তিনটি পথ আছে। যেটা সম্ভব সেটা বেছে নিন।</p>
        <button class="btn" data-shu="lost-qr" data-d="${d}">পুরোনো ফোনটি হাতে আছে</button>
        <button class="btn ghost" data-shu="lost-paper" data-d="${d}">কাগজের কোড আছে</button>
        <button class="btn ghost" data-shu="lost-people" data-d="${d}">বিশ্বস্ত দুইজনের অনুমোদন</button>
        <p class="s" style="margin-top:14px;font-size:11.5px">কোনোটাই না থাকলে এনআইডি নিয়ে এজেন্টের কাছে যেতে হবে।</p>`}
    </div></div>`;
  }
  else if (sc === 'wait'){
    const P = S.pending;
    if (!P || P.status !== 'pending') b = shuBar(d, 'অপেক্ষা', false, 'to-landing') + `<div class="scr-body"><div class="pad"><p class="s">অনুরোধটি আর চালু নেই।</p></div></div>`;
    else b = shuBar(d, 'অপেক্ষা', false, 'cancel-req') + `<div class="scr-body">
      <div class="pad center" style="padding-bottom:4px">
        ${P.offline ? '' : '<div class="spin shu"></div>'}
        <h3 class="t">পুরোনো ফোনে অনুমোদন দিন</h3>
        <p class="s">${P.offline ? 'পুরোনো ফোনে Shurokkha → ☰ মেনু → কিউআর স্ক্যান। তারপর ৮ সংখ্যা এখানে লিখুন।'
          : 'অনুরোধটি My Device-এর Shurokkha-তে গেছে। সেখানে “হ্যাঁ” চাপলেই এখানে চালু হবে।'}</p>
      </div>
      ${P.offline ? `<div class="qrwrap">${qrHTML(P.challenge)}</div><div class="pad" style="padding-top:0">
          <div class="fld"><label>পুরোনো ফোনের ৮ সংখ্যা</label><input id="${d}Resp" inputmode="numeric" maxlength="8" placeholder="________"></div>
          ${err(x)}<button class="btn" data-shu="resp-go" data-d="${d}">যাচাই করুন</button></div>`
        : `<div class="pad" style="padding-top:0"><div class="note ok flush">কোনো SMS পাঠানো হয়নি। বলে দেওয়ার মতো কোনো কোড নেই।</div>
          <button class="btn ghost" data-shu="force-offline" data-d="${d}">পুরোনো ফোনে নেটওয়ার্ক নেই?</button></div>`}
    </div>`;
  }
  else if (sc === 'paper'){
    b = shuBar(d, 'কাগজের কোড', false, 'lost') + `<div class="scr-body"><div class="pad">
      <p class="s">রেজিস্ট্রেশনের সময় দেওয়া কোডগুলোর যেকোনো একটি লিখুন। প্রতিটি একবার ব্যবহার করা যায়।</p>
      <div class="fld"><label>রিকভারি কোড</label><input id="${d}Paper" placeholder="XXXX-XXXX" autocomplete="off"></div>
      ${err(x)}
      <button class="btn" data-shu="paper-go" data-d="${d}">যাচাই করুন</button>
      <div class="note warn flush" style="margin-top:14px">এই কোডগুলো bearer token — যার হাতে যাবে সে ব্যবহার করতে পারবে। তাই শুধু রিকভারিতে, লেনদেনে নয়।</div>
    </div></div>`;
  }
  else if (sc === 'people'){
    b = shuBar(d, 'বিশ্বস্ত দুইজন', false, 'lost') + `<div class="scr-body">
      <p class="s pad" style="padding-bottom:6px">দুজনের ফোনেই অনুরোধ গেছে। <b>দুজনেরই</b> অনুমোদন লাগবে।</p>
      <div class="rowlist">
        <div class="rowi"><div class="ico">👤</div><div><b>স্বামী</b><span>01722xxxxxx</span></div>
          <div class="tag">${x.p1 ? '<span class="tag me">✓ দিয়েছেন</span>' : `<button class="btn sm" data-shu="p1" data-d="${d}">অনুমোদন</button>`}</div></div>
        <div class="rowi"><div class="ico">👤</div><div><b>বোন</b><span>01933xxxxxx</span></div>
          <div class="tag">${x.p2 ? '<span class="tag me">✓ দিয়েছেন</span>' : `<button class="btn sm" data-shu="p2" data-d="${d}">অনুমোদন</button>`}</div></div>
      </div>
      <div class="pad">
        <button class="btn" data-shu="people-go" data-d="${d}" ${x.p1 && x.p2 ? '' : 'disabled'}>চালিয়ে যান</button>
        <p class="s" style="margin-top:11px;font-size:11.5px">প্রতারক একসাথে দুজন আলাদা মানুষকে বোকা বানাতে পারবে না। বাস্তবে এখানে ২৪ ঘণ্টার অপেক্ষাও যোগ হবে।</p>
      </div></div>`;
  }
  else if (sc === 'revoke-confirm'){
    const others = activeDevs().filter(t => t !== d);
    b = shuBar(d, 'শেষ ধাপ') + `<div class="scr-body">
      <div class="pad" style="padding-bottom:6px">
        <h3 class="t">অন্য সব সেশন বন্ধ করবেন?</h3>
        <p class="s">এই ফোনে নতুন চাবি তৈরি হয়েছে — Shurokkha-র জন্য, আর প্রতিটি সংযুক্ত অ্যাপের জন্য। হারানো ফোনের চাবিগুলো এখনো চালু আছে।</p>
      </div>
      <div class="rowlist">
        ${others.map(t => `<div class="rowi"><div class="ico">📱</div><div><b>${label(t)}</b><span>Shurokkha সেশন</span></div><div class="tag x">বন্ধ হবে</div></div>`).join('')}
        ${S.links.safepay ? `<div class="rowi"><div class="app-ic" style="width:24px;height:24px;font-size:12px;border-radius:7px">S</div><div><b>SafePay</b><span>হারানো ফোনের public key</span></div><div class="tag x">মুছে যাবে</div></div>` : ''}
      </div>
      <div class="pad">
        <button class="btn warn" data-shu="revoke-go" data-d="${d}">সব বন্ধ করুন</button>
        <button class="btn ghost" data-shu="revoke-skip" data-d="${d}">আপাতত থাক</button>
      </div></div>`;
  }
  else if (sc === 'denied'){
    b = shuBar(d, 'বাতিল') + `<div class="scr-body"><div class="pad center" style="padding-top:44px">
      <div class="big-ic" style="color:#B4432F">✕</div><h3 class="t">অনুরোধ প্রত্যাখ্যাত</h3>
      <p class="s">অন্য ফোন থেকে “না” বলা হয়েছে।</p>
      <button class="btn ghost" data-shu="to-landing" data-d="${d}">ফিরে যান</button></div></div>`;
  }

  return sbar(d) + b + shuOverlays(d);
}

function requestSummary(P){
  const meta = (k,v) => `<div class="mrow"><i>${k}</i><b>${v}</b></div>`;
  if (P.kind === 'login') return `<h4 style="font-family:var(--bn);font-size:16px;margin:0 0 8px">আপনি কি SafePay-তে লগইন করার চেষ্টা করছেন?</h4>${meta('ডিভাইস', esc(P.device))}${meta('অবস্থান', esc(P.place))}`;
  if (P.kind === 'transfer') return `<div class="mamt">${taka(P.amount)}</div><div class="mto">→ ${bn(P.payee)} ${P.payeeKnown ? '' : '<em>নতুন নম্বর</em>'}</div>`;
  if (P.kind === 'topup') return `<div class="mamt">${taka(P.amount)}</div><div class="mto">SafePay-তে যোগ · ${esc(P.source)}</div>`;
  if (P.kind === 'chpin') return `<h4 style="font-family:var(--bn);font-size:16px;margin:0 0 8px">SafePay-এর পিন বদলাচ্ছেন?</h4>`;
  return `<h4 style="font-family:var(--bn);font-size:16px;margin:0 0 8px">নতুন ডিভাইসে Shurokkha চালু করবেন?</h4>${meta('ডিভাইস', esc(P.device))}${meta('অবস্থান', esc(P.place))}`;
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
      <button class="di" data-shu="chpin" data-d="${d}"><i>🔑</i>পিন বদল</button>
      <button class="di" data-shu="sessions" data-d="${d}"><i>📱</i>ডিভাইস ও সেশন</button>
      <button class="di" data-shu="scan" data-d="${d}"><i>⛶</i>কিউআর স্ক্যান</button>
      <button class="di out" data-shu="signout" data-d="${d}"><i>⏻</i>সাইন আউট</button>
    </div></div>`;
  }
  if (S.lockAlert[d]){
    return o + `<div class="modal"><div class="box bad"><div class="mh">${SHIELD(16)}<span>সতর্কতা</span></div>
      <div class="mb"><h4>একাধিক সন্দেহজনক অনুরোধ</h4>
      <p class="s" style="margin:0 0 6px">চট্টগ্রাম থেকে এক মিনিটে তিনটি লগইন অনুরোধ এসেছে। Shurokkha ১০ মিনিটের জন্য অচেনা ডিভাইসের অনুরোধ বন্ধ করেছে।</p>
      <div class="note warn flush">কেউ হয়তো আপনার SafePay পিন জানে। পিন বদলে ফেলুন।</div></div>
      <div class="mf"><button class="btn" data-shu="lock-ok" data-d="${d}">বুঝেছি</button></div></div></div>`;
  }
  if (linkFor(d)){
    return o + `<div class="modal"><div class="box"><div class="mh">${SHIELD(16)}<span>Shurokkha · নতুন অ্যাপ</span></div>
      <div class="mb">
        <div style="display:flex;gap:11px;align-items:center;margin-bottom:12px"><div class="app-ic">S</div>
          <div><b style="font-size:15px">SafePay</b><span style="display:block;font-family:var(--bn);font-size:11px;color:var(--mid)">ট্যাবলেট · ঢাকা · ${clock()}</span></div></div>
        <h4>SafePay আপনার Shurokkha-র সাথে যুক্ত হতে চায়</h4>
        <p class="s" style="margin:0 0 4px">হ্যাঁ দিলে SafePay-এর জন্য নতুন চাবি জোড়া তৈরি হবে। private key এই ফোনেই থাকবে, public key SafePay-এর সার্ভারে যাবে।</p>
        ${cue()}
      </div>
      <div class="mf"><button class="btn" data-shu="link-yes" data-d="${d}">হ্যাঁ, যুক্ত করুন</button><button class="btn warn" data-shu="link-no" data-d="${d}">না</button></div>
    </div></div>`;
  }
  const P = popupFor(d);
  if (P){
    const bad = P.suspicious;
    const head = P.kind==='login' ? 'SafePay · লগইন' : P.kind==='transfer' ? (P.tier==='T3' ? 'SafePay · এই লেনদেনে স্বাক্ষর' : 'SafePay · টাকা পাঠানো')
      : P.kind==='topup' ? 'SafePay · অ্যাড মানি' : P.kind==='chpin' ? 'SafePay · পিন বদল' : 'Shurokkha · নতুন ডিভাইস';
    const title = P.kind==='transfer' ? '<h4>SafePay থেকে টাকা পাঠাচ্ছেন?</h4>' : P.kind==='topup' ? '<h4>SafePay-তে টাকা যোগ করছেন?</h4>' : '';
    o += `<div class="modal"><div class="box ${bad ? 'bad' : ''}">
      <div class="mh ${P.app==='SafePay' && !bad ? 'sp' : ''}">${SHIELD(16)}<span>${bad ? 'সতর্কতা · অচেনা অবস্থান' : head}</span></div>
      <div class="mb">${title}${requestSummary(P)}
        <div class="mrow"><i>সময়</i><b>${clock()}</b></div>
        ${bad ? `<div class="note bad flush" style="margin-top:10px">এই অনুরোধ ${esc(P.place)} থেকে এসেছে। আপনি ঢাকায় আছেন। আপনি না করে থাকলে “না” চাপুন।</div>` : ''}
        ${cue()}
      </div>
      ${P.resp[d] ? `<div class="otpbox" style="margin:0 15px 8px"><div class="lbl">নেটওয়ার্ক নেই — এই ৮ সংখ্যা ${P.origin==='sp' ? 'SafePay-তে' : 'অন্য ডিভাইসে'} টাইপ করুন</div><div class="big">${P.resp[d]}</div></div>
          <div class="mf"><button class="btn ghost" data-shu="popup-close" data-d="${d}">ঠিক আছে</button></div>`
        : `<div class="mf"><button class="btn" data-shu="yes" data-d="${d}">হ্যাঁ, আমি</button><button class="btn warn" data-shu="no" data-d="${d}">না, আমি না</button></div>`}
    </div></div>`;
  }
  return o;
}

