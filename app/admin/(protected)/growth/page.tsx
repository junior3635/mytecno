import Link from 'next/link';
import prisma from '@/lib/db';
import GrowthForm from './growth-form';
import ReadershipChart from './readership-chart';
import { dayKeyOffset } from '@/lib/date-key';

export const dynamic = 'force-dynamic';

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="admin-row-label" style={{ color: 'var(--ink-faint)' }}>
      {children}
    </h2>
  );
}

export default async function AdminGrowth() {
  const start30 = dayKeyOffset(29);
  const [published, aggregate, comments, subscribers, settings, topArticles, pageViews] = await Promise.all([
    prisma.article.count({ where: { isPublished: true } }),
    prisma.article.aggregate({ where: { isPublished: true }, _sum: { views: true } }),
    prisma.comment.count({ where: { isApproved: true } }),
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.siteSettings.findUnique({ where: { id: 'global' } }),
    prisma.article.findMany({
      where: { isPublished: true },
      orderBy: [{ views: 'desc' }],
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ['date'],
      where: { date: { gte: start30 } },
      _sum: { views: true },
    }),
  ]);

  const totalViews = aggregate._sum.views ?? 0;
  const maxViews = totalViews > 0 && topArticles.length > 0 ? topArticles[0].views : 1;

  const byDate = new Map(pageViews.map((p) => [p.date, p._sum.views ?? 0]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const key = dayKeyOffset(29 - i);
    return { key, views: byDate.get(key) ?? 0 };
  });

  const socials = {
    socialX: settings?.socialX ?? '',
    socialFacebook: settings?.socialFacebook ?? '',
    socialInstagram: settings?.socialInstagram ?? '',
    socialYoutube: settings?.socialYoutube ?? '',
    socialTiktok: settings?.socialTiktok ?? '',
    socialLinkedin: settings?.socialLinkedin ?? '',
    socialShowFooter: settings?.socialShowFooter ?? true,
  };

  const glance = [
    { label: 'Published stories', value: published },
    { label: 'Comments approved', value: comments },
    { label: 'Active subscribers', value: subscribers },
  ];

  return (
    <div className="admin-page" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Growth</h1>
        <p className="admin-sub">Readership, most-read stories and social profiles</p>
      </div>

      <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <ReadershipChart days={days} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${glance.length}, 1fr)`,
          marginBottom: '2.5rem',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {glance.map((g, i) => (
          <div
            key={g.label}
            style={{
              padding: '1rem 1.5rem',
              borderLeft: i === 0 ? 'none' : '1px solid var(--hairline)',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', marginBottom: '0.2rem' }}>{g.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {g.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <PanelTitle>Most Read Stories</PanelTitle>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>By page views</span>
        </div>
        {topArticles.length === 0 ? (
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem' }}>
            No published stories yet. Views appear here as readers open your articles.
          </p>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {topArticles.map((a, i) => (
              <li
                key={a.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3.4rem 1fr 9rem',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '0.8rem 0',
                  borderBottom: i === topArticles.length - 1 ? 'none' : '1px solid var(--hairline)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.9rem',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--neon-cyan)',
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <Link
                    href={`/article/${a.slug}`}
                    target="_blank"
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.title}
                  </Link>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: '0.2rem' }}>
                    {a.category}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>
                    {a.views.toLocaleString()}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '5px',
                      marginTop: '0.4rem',
                      background: 'var(--hairline)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(4, Math.round((a.views / maxViews) * 100))}%`,
                        background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--ink-faint)', marginTop: '0.25rem' }}>reads</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-card" style={{ padding: '0 1.75rem 1.75rem' }}>
        <div style={{ padding: '1.75rem 0', borderBottom: '1px solid var(--hairline)' }}>
          <PanelTitle>Social Profiles</PanelTitle>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginTop: '0.3rem' }}>
            Links shown on the public footer. Leave a network empty to hide it.
          </p>
        </div>
        <GrowthForm socials={socials} />
      </div>
    </div>
  );
}