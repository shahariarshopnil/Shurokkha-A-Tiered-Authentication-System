/* Shurokkha · crypto.js — Real WebCrypto: ECDSA P-256 keys, signatures, RFC 4226 offline codes, WebAuthn */

/* ==================================================================
   CRYPTO — real, not mocked
   ================================================================== */
async function makeKeys(){
  // extractable:false applies to the private key; the public key stays exportable
  const kp = await crypto.subtle.generateKey({name:'ECDSA', namedCurve:'P-256'}, false, ['sign','verify']);
  const jwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
  return {kp, jwk, seed:rand(20), fp: await keyFp(jwk)};
}
async function keyFp(jwk){
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(jwk.x + jwk.y)));
  const h = hex(d).slice(0,8).toUpperCase(); return h.slice(0,4) + ' ' + h.slice(4);
}
async function sign(priv, msg){
  return hex(new Uint8Array(await crypto.subtle.sign({name:'ECDSA', hash:'SHA-256'}, priv, enc.encode(msg))));
}
async function verify(jwk, msg, sigHex){
  const k = await crypto.subtle.importKey('jwk', jwk, {name:'ECDSA', namedCurve:'P-256'}, true, ['verify']);
  return crypto.subtle.verify({name:'ECDSA', hash:'SHA-256'}, k, unhex(sigHex), enc.encode(msg));
}
async function ocra(seed, msg){   // RFC 4226 dynamic truncation, widened to 8 digits
  const k = await crypto.subtle.importKey('raw', seed, {name:'HMAC', hash:'SHA-1'}, false, ['sign']);
  const m = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
  const o = m[19] & 0x0f;
  const bin = ((m[o]&0x7f)<<24)|((m[o+1]&0xff)<<16)|((m[o+2]&0xff)<<8)|(m[o+3]&0xff);
  return String(bin % 1e8).padStart(8,'0');
}
async function sha(s){ return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))); }

async function probeWebAuthn(){
  if (!window.PublicKeyCredential) return false;
  try{ return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }catch(_){ return false; }
}
async function tryCreateCred(d){
  if (!S.webauthn) return;
  try{
    const c = await navigator.credentials.create({publicKey:{
      rp:{name:'Shurokkha'}, user:{id:rand(16), name:S.acct.phone, displayName:'Shurokkha · '+label(d)},
      challenge:rand(32), pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
      authenticatorSelection:{authenticatorAttachment:'platform', userVerification:'required', residentKey:'discouraged'},
      attestation:'none', timeout:60000}});
    S.dev[d].credId = c.rawId; log('WebAuthn platform credential registered on '+label(d), 'g');
  }catch(e){
    S.webauthn = false; drawCryptoBadge();
    log('WebAuthn unavailable here ('+(e.name||'error')+') — using WebCrypto + press-and-hold');
  }
}

