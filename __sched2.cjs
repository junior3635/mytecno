const fs = require('fs');
const p = 'C:\\pro\\mytecno\\prisma\\schema.prisma';
let s = fs.readFileSync(p, 'utf8');
if (/publishAt\s+DateTime\?/.test(s)) { console.log('ALREADY'); process.exit(0); }
const anchor = '  isPublished  Boolean      @default(false)';
const i = s.indexOf(anchor);
if (i < 0) { console.log('NOANCHOR'); process.exit(1); }
const nl = '\r\n';
const start = s.slice(0, i + anchor.length);
const add = nl + '  publishAt    DateTime?' + nl + '  publishedAt  DateTime?' + nl + '  isScheduled  Boolean      @default(false)';
fs.writeFileSync(p, start + add + s.slice(i + anchor.length), 'utf8');
const check = fs.readFileSync(p, 'utf8');
console.log('PUBLISHED=' + (/publishAt\s+DateTime\?/.test(check) ? 'yes' : 'no') + ';COOK=' + (/recipeCookMin\s+Int\?/.test(check) ? 'yes' : 'no'));
