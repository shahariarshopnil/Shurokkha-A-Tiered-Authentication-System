/* ==================================================================
   SHUROKKHA — research prototype
   Plain <script> files, loaded in the order listed in index.html.
   My Device      : Shurokkha authenticator (holds keys for every linked app)
   SafePay        : financial app that delegates verification to Shurokkha
   Second Device  : Shurokkha on a new phone — sign-in and lost-phone recovery
   ================================================================== */

const $ = s => document.querySelector(s);
const enc = new TextEncoder();
const rand = n => crypto.getRandomValues(new Uint8Array(n));
const hex = u => [...u].map(b => b.toString(16).padStart(2,'0')).join('');
const unhex = h => new Uint8Array(h.match(/../g).map(b => parseInt(b,16)));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const now = () => Date.now();
const t = (bnText, enText) => (typeof S !== 'undefined' && S.lang === 'en' ? enText : bnText);
const BD = '০১২৩৪৫৬৭৮৯';
const bn = n => (typeof S !== 'undefined' && S.lang === 'en') ? String(n) : String(n).replace(/\d/g, d => BD[+d]);
function grp(n){ const s = String(n); if (s.length <= 3) return s;
  const last = s.slice(-3); let rest = s.slice(0,-3), out = '';
  while (rest.length > 2){ out = ',' + rest.slice(-2) + out; rest = rest.slice(0,-2); }
  return rest + out + ',' + last; }
const taka = n => (typeof S !== 'undefined' && S.lang === 'en') ? '৳' + grp(n) : bn(grp(n)) + ' টাকা';
const clock = () => { const d = new Date(); return bn(d.getHours()%12||12) + ':' + bn(String(d.getMinutes()).padStart(2,'0')); };
const ago = t => {
  const s = Math.round((now()-t)/1000);
  if (typeof S !== 'undefined' && S.lang === 'en') {
    return s < 60 ? s + ' sec ago' : Math.round(s/60) + ' min ago';
  }
  return s < 60 ? bn(s)+' সেকেন্ড আগে' : bn(Math.round(s/60))+' মিনিট আগে';
};
const LABEL = {my:'My Device', sec:'Second Device', sp:'SafePay'};
const label = d => LABEL[d] || d;
const SHIELD = (w=20) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="currentColor"/><path d="m8.5 12 2.4 2.4 4.6-4.8" fill="none" stroke="#0B7A57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PAYEE_NAMES = {'01712345678':'রফিক — সাপ্লায়ার', '01819002211':'মা'};
