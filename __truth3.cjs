const fs = require('fs');
const all = [];
for (const name of fs.readdirSync('C:\\pro')) {
  const sub = 'C:\\pro\\' + name;
  const tryPath = sub + '\\app\\admin\\(protected)\\articles\\[id]\\edit\\edit-form.tsx';
  if (!fs.existsSync(tryPath)) { all.push('SKIP ' + name + ' (no edit-form)'); continue; }
  const chars = [...name].map(c => c.charCodeAt(0)).join(',');
  const t = fs.readFileSync(tryPath, 'utf8').split(/\r?\n/);
  all.push('== FOLDER ' + name + ' [' + chars + '] lines=' + t.length);
  t.forEach((l, i) => {
    if (/recipe[A-Z]\w*|Prep[A-Z]|CookMin/.test(l)) all.push((i + 1) + ': ' + l.trim());
  });
}
console.log(all.join('\n'));
