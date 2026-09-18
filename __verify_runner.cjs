const fs = require('fs');
const cp = require('child_process');
const p = 'C:\\pro\\mytecno\\lib\\ai\\verification.ts';
const exists = fs.existsSync(p);
const size = exists ? fs.statSync(p).size : 0;
const s = exists ? fs.readFileSync(p, 'utf8') : '';
console.log('V_EXISTS=' + exists + ' V_BYTES=' + size);
console.log('V_HAS_FN=' + /export function extractClaims/.test(s));
console.log('V_HAS_REVIEW=' + /export function reviewGate/.test(s));
console.log('V_HAS_CLAIM_STUB=' + /ClaimStatus/.test(s) + ' URL_RE=' + /URL_RE/.test(s));

const t = cp.spawnSync('cmd', ['/c', 'npx tsc --noEmit > "%TEMP%\\gm_verify.txt" 2>&1'], { cwd: 'C:\\pro\\mytecno', encoding: 'utf8' });
const raw = fs.readFileSync(process.env.TEMP + '\\gm_verify.txt', 'utf8');
const errs = raw.split(/\r?\n/).filter((l) => /error TS/.test(l));
console.log('TSC_ERRORS=' + errs.length);
errs.slice(0, 4).forEach((l) => console.log(l.trim()));
