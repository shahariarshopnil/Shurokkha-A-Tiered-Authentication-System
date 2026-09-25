/* Shurokkha · state.js — Application state and the event log (RO6 task data) */

/* ---------------- state ---------------- */
function fresh(){
  return {
    mode:'shurokkha', net:'good', lang:'bn', webauthn:false,
    acct:{registered:false, phone:'01711223344', pinHash:null, paper:[], usedPaper:[]},
    dev:{
      my: {screen:'landing', data:{}, menu:false, key:null, credId:null, active:false, revoked:false, signedIn:false},
      sec:{screen:'landing', data:{}, menu:false, key:null, credId:null, active:false, revoked:false, signedIn:false}
    },
    shuPub:{}, shuSeeds:{},           // Shurokkha server: device public keys + seeds
    links:{},                          // on-device: {safepay:{app, linkedAt, lastUse, keys:{my:{kp,jwk,seed,fp}}}}
    sp:{registered:false, name:'', pinHash:null, pendingPin:null, pub:{}, seeds:{},   // SafePay server
        balance:125000, saved:['01712345678','01819002211'], sessions:[], loggedIn:false,
        screen:'landing', data:{}, modal:null, afterLink:null},
    pending:null, linkReq:null,
    lockUntil:0, burst:[], lockAlert:{},
    otp:null, otpHist:[], smsDismissed:0,
    tier:null, signals:null, rule:null,
    atk:{},
    fresh:{},
    log:[], t0:now()
  };
}
const S = fresh();

/* ---------------- log ---------------- */
function log(msg, kind){
  S.log.push({t:((now()-S.t0)/1000).toFixed(1), mode:S.mode, net:S.net, msg, kind:kind||''});
  try{ localStorage.setItem('shurokkha.log', JSON.stringify(S.log.slice(-500))); }catch(_){}
  drawLog();
}
function drawLog(){
  const box = $('#log');
  box.innerHTML = S.log.slice(-100).map(e => `<div class="l ${e.kind}"><u>${e.t}s</u><span>${esc(e.msg)}</span></div>`).join('');
  box.scrollTop = box.scrollHeight;
  $('#logCount').textContent = S.log.length;
}
