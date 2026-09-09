import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const logs = await prisma.log.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const successCount = logs.filter(l => l.success).length;
  const failCount = logs.filter(l => !l.success).length;

  return (
    <div className="admin-page" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Activity Logs</h1>
        <p className="admin-sub">Showing the last {logs.length} events</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.15)', borderRadius: '0.75rem', padding: '1rem 1.5rem' }}>
          <div className="admin-row-label">Successful</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00f2fe' }}>{successCount}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(254,9,121,0.05)', border: '1px solid rgba(254,9,121,0.15)', borderRadius: '0.75rem', padding: '1rem 1.5rem' }}>
          <div className="admin-row-label">Failed</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fe0979' }}>{failCount}</div>
        </div>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {/* Table Header */}
        <div className="admin-row-label" style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 160px',
          gap: '1rem',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #1a1a1a',
        }}>
          <span></span>
          <span>Message</span>
          <span>Timestamp</span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#52525b' }}>No logs yet.</div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id} style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 160px',
              gap: '1rem',
              padding: '0.875rem 1.5rem',
              borderBottom: i < logs.length - 1 ? '1px solid #111' : 'none',
              alignItems: 'center',
              fontFamily: 'monospace',
              fontSize: '0.825rem',
            }}>
              <span style={{ color: log.success ? '#00f2fe' : '#fe0979', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>
                {log.success ? '✓' : '✗'}
              </span>
              <span style={{ color: log.success ? '#a1a1aa' : '#fe0979' }}>
                {log.message}
              </span>
              <span style={{ color: '#52525b', fontSize: '0.75rem' }}>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
