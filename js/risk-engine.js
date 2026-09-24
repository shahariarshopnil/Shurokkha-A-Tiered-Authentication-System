/* Shurokkha · risk-engine.js — Risk engine: declarative tier rules R0-R9 and the inspector panel */

/* ==================================================================
   RISK ENGINE — declarative, first match wins. This list is the framework.
   ================================================================== */
const RULES = [
  {id:'R1', tier:'T0', why:'logged-in session · read only',                   test:s => s.action==='balance' && s.session},
  {id:'R2', tier:'T1', why:'money coming in · low risk',                      test:s => s.action==='topup'},
  {id:'R3', tier:'T1', why:'saved payee · under ৳2,000',                      test:s => s.action==='transfer' && s.payeeKnown && s.amount < 2000},
  {id:'R4', tier:'T2', why:'saved payee · under ৳25,000',                     test:s => s.action==='transfer' && s.payeeKnown && s.amount < 25000},
  {id:'R5', tier:'T3', why:'new payee or high value — sign amount and payee', test:s => s.action==='transfer'},
  {id:'R6', tier:'T3', why:'credential change always signs',                  test:s => s.action==='chpin'},
  {id:'R7', tier:'T3', why:'unfamiliar location — flag the request',          test:s => s.action==='login' && s.suspicious},
  {id:'R8', tier:'T2', why:'every login is approved on the authenticator',    test:s => s.action==='login'},
  {id:'R9', tier:'T3', why:'adding a device to Shurokkha itself',             test:s => s.action==='device' || s.action==='recovery'},
  {id:'R0', tier:'T1', why:'default floor',                                   test:() => true}
];
function assess(action, extra){
  const s = Object.assign({action, app:'SafePay', session:S.sp.loggedIn, location:'ঢাকা · মিরপুর',
    suspicious:false, amount:0, payeeKnown:true}, extra||{});
  const r = RULES.find(r => r.test(s));
  S.signals = s; S.rule = r; S.tier = S.mode==='legacy' ? 'LEG' : r.tier;
  drawInspector(); return S.tier;
}
function drawInspector(){
  const s = S.signals, el = $('#inspector');
  if (!s){ el.innerHTML = '<p class="hint">Run a scenario to see the signals.</p>'; $('#ctxName').textContent = 'idle'; return; }
  $('#ctxName').textContent = s.action;
  const row = (k,v,c) => `<div class="sig"><i>${k}</i><b class="${c||''}">${esc(v)}</b></div>`;
  const auth = activeDevs();
  let h = row('app', s.app);
  h += row('session', s.session ? 'logged in' : 'none', s.session ? 'y' : 'n');
  h += row('authenticator', auth.length ? auth.map(label).join(' + ') : 'none', auth.length ? 'y' : 'x');
  h += row('auth network', S.net, S.net==='good' ? 'y' : S.net==='poor' ? 'n' : 'x');
  h += row('location', s.location, s.suspicious ? 'x' : 'y');
  h += row('action', s.action);
  if (s.action==='transfer' || s.action==='topup') h += row('amount', '৳'+grp(s.amount), s.amount>=25000 ? 'n' : 'y');
  if (s.action==='transfer') h += row('payee', s.payeeKnown ? 'saved' : 'new', s.payeeKnown ? 'y' : 'n');
  const t = S.tier, legSms = ['login','chpin'].includes(s.action);
  const lbl = {T0:'no prompt', T1:'Shurokkha tap + fingerprint', T2:'Shurokkha approval with details',
    T3:'signed approval, details bound into the signature', LEG: legSms ? 'PIN + SMS one-time code' : 'SafePay PIN only'}[t];
  const via = t==='T0' ? 'nothing sent'
    : S.mode==='legacy' ? (legSms ? 'SMS to '+S.acct.phone : 'PIN typed on SafePay')
    : S.net==='none' ? 'QR → 8 digits (offline)' : 'push to Shurokkha';
  h += `<div class="verdict"><div class="vh"><span class="tierbadge ${t}">${t}</span><span>${lbl}</span></div>
    <div class="vr">matched <em>${S.mode==='legacy' ? 'legacy' : S.rule.id}</em> — ${esc(S.mode==='legacy' ? 'no risk evaluation; one rule for everything' : S.rule.why)}<br>delivery <em>${via}</em></div></div>`;
  el.innerHTML = h;
}

