const fs = require('fs');
const p = 'C:\\pro\\mytecno\\app\\admin\\(protected)\\articles\\[id]\\edit\\page.tsx';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
console.log('TOTAL=' + lines.length);
for (let i = 40; i <= lines.length; i++) console.log(i + ': ' + lines[i - 1].trim());
