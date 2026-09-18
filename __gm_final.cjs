const fs = require('fs');
const cp = require('child_process');
const root = 'C:\\pro\\mytecno';
function run(cmd) {
  const r = cp.spawnSync('cmd', ['/c', cmd], { cwd: root, encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
const planp = root + '\\STRATEGIC-UPGRADE-PLAN.md';
let plan = fs.readFileSync(planp, 'utf8');
const metricRow = plan.split(/\r?\n/).findIndex(l => /GenerationMetric|generation-metric/i.test(l) && /\[[ x]\]/i.test(l));
console.log('METRIC_LINE=' + (metricRow + 1));
if (metricRow >= 0) {
  const lines = plan.split(/\r?\n/);
  const ln = lines[metricRow];
  if (/^\- \[ \]/.test(ln)) {
    lines[metricRow] = ln.replace(/^\- \[ \]/, '- [x]');
    fs.writeFileSync(planp, lines.join('\r\n'), 'utf8');
    console.log('MARKED=1 NEWLINE=' + lines[metricRow].trim());
  } else {
    console.log('ALREADY=' + /^\- \[x\]/.test(ln));
  }
}
const schema = fs.readFileSync(root + '\\prisma\\schema.prisma', 'utf8');
console.log('HAS_METRIC_MODEL=' + /model GenerationMetric/.test(schema));
console.log('DB_PUSH=' + /in sync with your Prisma schema/.test(run('npx prisma db push 2>&1')));
const tsc = run('npx tsc --noEmit 2>&1');
const errs = tsc.split(/\r?\n/).filter(l => /error TS/.test(l));
console.log('TSC_ERRORS=' + errs.length);
