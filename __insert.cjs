const fs = require('fs');
const p = 'C:\\pro\\mytecno\\app\\admin\\(protected)\\articles\\[id]\\edit\\edit-form.tsx';
let t = fs.readFileSync(p, 'utf8');
const lines = t.split(/\r?\n/);
let born = -1;
for (let i = 0; i < lines.length; i++) {
  if (/recipeCookMin\s*:\s*number\s*;/.test(lines[i])) { born = i; break; }
}
if (born >= 0) {
  const indent = lines[born].match(/^\s*/)[0];
  lines.splice(born, 0, indent + 'recipePrepMin: number | null;');
  fs.writeFileSync(p, lines.join('\r\n'), 'utf8');
  console.log('INSERTED before line ' + (born + 1) + ': ' + lines[born + 1].trim());
} else {
  const typeIdx = lines.findIndex(l => /type ArticleDraft = \{/.test(l));
  console.log('NODECL of recipeCookMin; typeIdx=' + typeIdx);
  for (let i = Math.max(0, typeIdx); i < typeIdx + 16 && i < lines.length; i++) console.log((i + 1) + ': ' + lines[i].trim());
}
