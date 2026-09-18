const { PrismaClient } = require('C:/pro/mytecno/node_modules/@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='GenerationMetric'"
  );
  const cols = await p.$queryRawUnsafe('PRAGMA table_info(GenerationMetric)');
  const names = cols.map(c => c.name).join(',');
  console.log('METRIC_TABLE=' + rows.length);
  console.log('METRIC_COLS=' + names);
  await p.$disconnect();
})().catch(e => { console.log('ERR=' + e.message); process.exit(1); });
