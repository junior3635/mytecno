import prisma from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: '1rem',
      padding: '1.5rem',
    }}>
      <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.5rem' }}>{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const [totalArticles, publishedArticles, recentLogs] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { isPublished: true } }),
    prisma.log.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const successCount = await prisma.log.count({ where: { success: true } });
  const recentArticles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
          Dashboard
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
          Overview of your automated tech portal
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        <StatCard label="Total Articles" value={totalArticles} />
        <StatCard label="Published" value={publishedArticles} sub={`${totalArticles - publishedArticles} drafts`} />
        <StatCard label="AI Generations" value={successCount} sub="Successful runs" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Articles */}
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa' }}>
              Recent Articles
            </h2>
            <Link href="/admin/articles" style={{ fontSize: '0.75rem', color: '#00f2fe' }}>View all →</Link>
          </div>
          {recentArticles.length === 0 ? (
            <p style={{ color: '#52525b', fontSize: '0.875rem' }}>No articles yet. Generate your first one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentArticles.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid #141414' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem', lineHeight: 1.3 }}>
                      {a.title.substring(0, 50)}{a.title.length > 50 ? '…' : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#52525b' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: a.isPublished ? 'rgba(0,242,254,0.1)' : 'rgba(113,113,122,0.1)',
                    color: a.isPublished ? '#00f2fe' : '#71717a',
                    flexShrink: 0,
                    marginLeft: '0.75rem',
                  }}>
                    {a.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa' }}>
              Activity Log
            </h2>
            <Link href="/admin/logs" style={{ fontSize: '0.75rem', color: '#00f2fe' }}>View all →</Link>
          </div>
          {recentLogs.length === 0 ? (
            <p style={{ color: '#52525b', fontSize: '0.875rem' }}>No activity yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid #141414' }}>
                  <span style={{ fontSize: '0.75rem', marginTop: '1px', flexShrink: 0 }}>
                    {log.success ? '✓' : '✗'}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.825rem', color: log.success ? '#a1a1aa' : '#fe0979', lineHeight: 1.4 }}>
                      {log.message.substring(0, 70)}{log.message.length > 70 ? '…' : ''}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#52525b', marginTop: '0.2rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link href="/admin/generator" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.875rem 1.5rem',
          background: 'linear-gradient(90deg, #00f2fe, #fe0979)',
          borderRadius: '0.75rem',
          fontWeight: 800,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#fff',
        }}>
          ✦ Generate New Article
        </Link>
        <Link href="/" target="_blank" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.875rem 1.5rem',
          border: '1px solid #27272a',
          borderRadius: '0.75rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#a1a1aa',
        }}>
          View Live Site →
        </Link>
      </div>
    </div>
  );
}
