import prisma from '@/lib/db';
import Link from 'next/link';
import type { Article } from '@prisma/client';
import AdSlot from '@/components/ad-slot';

export const revalidate = 3600;

const TICKER_FALLBACK = [
  'Artificial intelligence timelines are getting aggressive',
  'Chipmakers race to shrink nodes below 1nm',
  'Spatial computing hardware hits the mainstream',
  'Open-source models close the gap with frontier lab releases',
  '5G-Advanced and 6G research enters real-world trials',
];

function CategoryTag({ label }: { label: string }) {
  return (
    <span className="tech-tag">{label}</span>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CategoryTag label={article.category} />
      <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.75rem', flexGrow: 1 }}>
        {article.title}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {(article.seoDesc || '').substring(0, 110)}…
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Read →</span>
      </div>
    </div>
  );
}

type HomeProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams;

  const where = category && category.trim() !== ''
    ? { isPublished: true, category: { equals: category.trim(), mode: 'insensitive' } }
    : { isPublished: true };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 9,
  });

  const featured = articles.slice(0, 4);
  const tickerItems = featured.length > 0
    ? [...featured.map((a) => a.title), ...TICKER_FALLBACK]
    : TICKER_FALLBACK;
  const tickerDuplicated = [...tickerItems, ...tickerItems];

  const [hero, ...rest] = articles;

  return (
    <>
      {/* Live Wire Ticker */}
      <div className="ticker-wrap">
        <div className="ticker" aria-label="Latest Tech News Ticker">
          {tickerDuplicated.map((item, i) => (
            <span key={i} className="ticker-item">
              <span style={{ opacity: 0.4, marginRight: '0.75rem' }}>▶</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '3rem 1.5rem' }}>

        {/* Section Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 className="title-section">Latest in Tech</h3>
          {category && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Showing articles in <strong>{category}</strong>
              {' · '}
              <Link href="/" style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>Clear filter</Link>
            </p>
          )}
        </div>

        {/* Bento Box Hero Grid */}
        <div className="bento-grid">

          {articles.length === 0 ? (
            /* Empty State — shown when there are no published articles yet */
            <div className="bento-cell span-12" style={{
              minHeight: '320px',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
              color: '#fff',
            }}>
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: '0 auto' }}>
                <CategoryTag label="New Portal" />
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  marginBottom: '1rem',
                  color: '#fff',
                }}>
                  No stories published yet
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6 }}>
                  The editorial team is preparing the first coverage. Check back soon for fresh AI-generated tech content.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Card — spans 8 columns and 2 rows */}
              <Link href={`/article/${hero.slug}`} style={{ display: 'contents' }}>
                <div className="bento-cell span-8 row-span-2" style={{
                  minHeight: '480px',
                  background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
                  color: '#fff',
                  justifyContent: 'flex-end',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    bottom: '1.5rem',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    borderRadius: '0.5rem',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <CategoryTag label={hero.category} />
                    <h1 style={{
                      fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      lineHeight: 1.05,
                      marginBottom: '1rem',
                      color: '#fff',
                    }}>
                      {hero.title}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: '55ch' }}>
                      {hero.seoDesc?.substring(0, 160)}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Side Cards — span 4 each */}
              {rest.slice(0, 2).map((item) => (
                <Link key={item.id} href={`/article/${item.slug}`} style={{ display: 'contents' }}>
                  <div className="bento-cell span-4">
                    <ArticleCard article={item} />
                  </div>
                </Link>
              ))}

              {/* Standard Row — 3 cards × 4 columns */}
              {rest.slice(2, 5).map((item) => (
                <Link key={item.id} href={`/article/${item.slug}`} style={{ display: 'contents' }}>
                  <div className="bento-cell span-4">
                    <ArticleCard article={item} />
                  </div>
                </Link>
              ))}

              {/* Deep Dives Section */}
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem' }}>
                <h2 className="title-section" style={{ margin: 0 }}>Deep Dives</h2>
              </div>

              <div style={{ display: 'contents' }}>
                {rest.slice(5, 8).map((item) => (
                  <Link key={item.id} href={`/article/${item.slug}`} style={{ display: 'contents' }}>
                    <div className="bento-cell span-4" style={{
                      background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(0,242,254,0.03) 100%)',
                      borderLeft: '3px solid var(--neon-cyan)',
                    }}>
                      <ArticleCard article={item} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {articles.length > 0 && (
          <AdSlot label="Advertisement" marginTop="3rem" />
        )}
      </div>
    </>
  );
}
