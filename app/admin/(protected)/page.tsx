import prisma from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub, href }: { label: string; value: string | number; sub?: string; href: string }) {
  return (
    <Link
      href={href}
      className="admin-card"
      style={{
        padding: '1.5rem',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div className="admin-row-label" style={{ marginBottom: '0.75rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.5rem' }}>{sub}</div>}
    </Link>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="admin-row-label" style={{ color: '#a1a1aa' }}>
      {children}
    </h2>
  );
}

export default async function AdminDashboard() {
  const [totalArticles, publishedArticles, recentLogs, successCount, pendingComments, recentArticles] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { isPublished: true } }),
      prisma.log.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.log.count({ where: { success: true } }),
      prisma.comment.count({ where: { isApproved: false } }),
      prisma.article.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

  return (
    <div className="admin-page" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Dashboard</h1>
        <p className="admin-sub">Overview of your automated tech portal</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Articles" value={totalArticles} href="/admin/articles" />
        <StatCard label="Published" value={publishedArticles} sub={`${totalArticles - publishedArticles} drafts`} href="/admin/articles" />
        <StatCard label="AI Generations" value={successCount} sub="Successful runs" href="/admin/logs" />
        <StatCard
          label="Pending moderation"
          value={pendingComments}
          sub={pendingComments === 0 ? 'All caught up' : 'Comments to review'}
          href="/admin/comments"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Articles */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <PanelTitle>Recent Articles</PanelTitle>
            <Link href="/admin/articles" style={{ fontSize: '0.75rem', color: '#00f2fe' }}>View all</Link>
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
                  <span className={`admin-badge ${a.isPublished ? 'admin-badge-live' : 'admin-badge-draft'}`} style={{ flexShrink: 0, marginLeft: '0.75rem' }}>
                    {a.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <PanelTitle>Activity Log</PanelTitle>
            <Link href="/admin/logs" style={{ fontSize: '0.75rem', color: '#00f2fe' }}>View all</Link>
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
        <Link href="/admin/generator" className="admin-primary-btn">
          ✦ Generate New Article
        </Link>
        <Link href="/admin/growth" className="admin-ghost-btn" style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 600, color: '#a1a1aa' }}>
          Readership →
        </Link>
      </div>
    </div>
  );
}