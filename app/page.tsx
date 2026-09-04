import prisma from '@/lib/db';
import Link from 'next/link';

export const revalidate = 3600;

const TICKER_TOPICS = [
  'AI Revolution 2026 · OpenAI launches GPT-6 with vision capabilities',
  'SpaceX Starship completes 12th orbital flight successfully',
  'Apple WWDC 2026: iOS 21 brings real-time AI translation',
  'NVIDIA announces Blackwell B200X GPU for consumer market',
  'Quantum computing achieves 1M qubit milestone in lab setting',
  'Meta Quest 5 announced: standalone MR at 120Hz per eye',
  'Tesla Full Self-Driving receives federal Level 4 certification',
];

function CategoryTag({ label }: { label: string }) {
  return (
    <span className="tech-tag">{label}</span>
  );
}

function EmptyCard({ title, index }: { title: string; index: number }) {
  const placeholders = [
    'The Next Frontier in Quantum Computing',
    'NVIDIA Blackwell B200X: Full Review',
    'Why Your Next Phone Will Have AI On-Device',
    'Self-Healing Materials Are Here',
    'The Metaverse Comeback: What Changed?',
    '5 Brain-Computer Interface Breakthroughs',
    'USB4 vs Thunderbolt 5: The Definitive Guide',
    'Inside the AI Chip War: AMD vs Intel vs NVIDIA',
    'Foldable Phones in 2026: Worth It Yet?',
    'Green Data Centers: The New Gold Rush',
  ];
  const desc = [
    'A deep look at how IBM and Google are racing to 1M qubit processors, and what it means for encryption.',
    'We spent 30 days with the most powerful consumer GPU ever made. The results will surprise you.',
    'Edge AI is reshaping how smartphones think. No cloud, no latency, pure local inference.',
    'MIT researchers have created polymers that bond back together after fracturing. Here\'s what it means.',
    'After the hype crash of 2024, virtual worlds are quietly reinventing themselves. Here\'s the new playbook.',
    'From Neuralink\'s latest trials to non-invasive EEG gaming controllers — this week in BCI.',
    'We ran 200 benchmark transfers across every cable protocol. One winner emerged.',
    'Trillions of dollars and national security are riding on GPU supremacy. Follow the money.',
    'The category that refused to die just got its best hardware yet. But is the software ready?',
    'Hyperscalers are betting billions on nuclear and geothermal. The era of dirty data ends now.',
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CategoryTag label={['Review', 'Deep Dive', 'Guide', 'News', 'Analysis'][index % 5]} />
      <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.75rem', flexGrow: 1 }}>
        {placeholders[index % placeholders.length]}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {desc[index % desc.length].substring(0, 110)}…
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>AI Generated · 3 min read</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Read →</span>
      </div>
    </div>
  );
}

function ArticleCard({ article, index }: { article: any; index: number }) {
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

export default async function Home() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 9,
  });

  const tickerContent = TICKER_TOPICS.join('   ·   ');
  const tickerDuplicated = `${tickerContent}   ·   ${tickerContent}`;

  // Pad with placeholders if not enough articles
  const displayItems = articles.length > 0
    ? articles
    : Array.from({ length: 9 }).map((_, i) => ({ id: String(i), slug: '#', isPlaceholder: true, index: i }));

  const [hero, ...rest] = displayItems;

  return (
    <>
      {/* Live Wire Ticker */}
      <div className="ticker-wrap">
        <div className="ticker" aria-label="Latest Tech News Ticker">
          {tickerDuplicated.split('   ·   ').map((item, i) => (
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
          <h2 className="title-section">Latest in Tech</h2>
        </div>

        {/* Bento Box Hero Grid */}
        <div className="bento-grid">

          {/* Hero Card — spans 8 columns and 2 rows */}
          <Link href={(hero as any).slug !== '#' ? `/article/${(hero as any).slug}` : '#'} style={{ display: 'contents' }}>
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
                <CategoryTag label={(hero as any).category || 'Cover Story'} />
                <h1 style={{
                  fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  marginBottom: '1rem',
                  color: '#fff',
                }}>
                  {(hero as any).title || 'The Next Frontier in Quantum Computing'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: '55ch' }}>
                  {(hero as any).seoDesc?.substring(0, 160) || 'A deep look at how IBM and Google are racing to 1M qubit processors, and what that means for the future of encryption and AI.'}
                </p>
              </div>
            </div>
          </Link>

          {/* Side Cards — span 4 each */}
          {rest.slice(0, 2).map((item: any, i: number) => (
            <Link key={item.id} href={item.slug !== '#' ? `/article/${item.slug}` : '#'} style={{ display: 'contents' }}>
              <div className="bento-cell span-4">
                {item.isPlaceholder
                  ? <EmptyCard title="" index={i + 1} />
                  : <ArticleCard article={item} index={i + 1} />}
              </div>
            </Link>
          ))}

          {/* Standard Row — 3 cards × 4 columns */}
          {rest.slice(2, 5).map((item: any, i: number) => (
            <Link key={item.id} href={item.slug !== '#' ? `/article/${item.slug}` : '#'} style={{ display: 'contents' }}>
              <div className="bento-cell span-4">
                {item.isPlaceholder
                  ? <EmptyCard title="" index={i + 3} />
                  : <ArticleCard article={item} index={i + 3} />}
              </div>
            </Link>
          ))}
        </div>

        {/* Ad Slot between sections */}
        <div className="ad-slot-tech" style={{ marginTop: '3rem' }}>
          [ Google AdSense — Responsive Leaderboard ]
        </div>

        {/* Deep Dives Section */}
        <div style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
          <h2 className="title-section">Deep Dives</h2>
        </div>

        <div className="bento-grid">
          {(rest.slice(5, 8) as any[]).map((item: any, i: number) => (
            <Link key={item.id || i} href={item.slug !== '#' ? `/article/${item.slug}` : '#'} style={{ display: 'contents' }}>
              <div className="bento-cell span-4" style={{
                background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(0,242,254,0.03) 100%)',
                borderLeft: '3px solid var(--neon-cyan)',
              }}>
                {item.isPlaceholder
                  ? <EmptyCard title="" index={i + 6} />
                  : <ArticleCard article={item} index={i + 6} />}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
