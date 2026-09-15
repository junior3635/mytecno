import prisma from '@/lib/db';
import Link from 'next/link';
import type { Article } from '@prisma/client';
import AdSlot from '@/components/ad-slot';
import NewsletterBand from '@/components/newsletter-band';
import ForYou from '@/components/for-you';
import { LeadArticle, SecondaryStory } from '@/components/article/lead';
import { SectionBand, LatestList } from '@/components/article/sections';
import { categoryKey } from '@/lib/format';

export const revalidate = 300;

const TICKER_FALLBACK = [
  'Artificial intelligence timelines are getting aggressive',
  'Chipmakers race to shrink nodes below 1nm',
  'Spatial computing hardware hits the mainstream',
  'Open-source models close the gap with frontier lab releases',
  '5G-Advanced and 6G research enters real-world trials',
];

function Ticker({ items }: { items: string[] }) {
  return (
    <div className="ticker-wrap">
      <span className="ticker-label">Latest</span>
      <div className="ticker" aria-label="Latest tech news ticker">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyHome() {
  return (
    <div className="home-empty">
      <h1 className="home-empty__title">No stories published yet</h1>
      <p className="home-empty__text">
        The editorial team is preparing the first coverage. Check back soon for fresh content.
      </p>
    </div>
  );
}

export default async function Home() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });

  const tickerItems =
    articles.length >= 4
      ? articles.slice(0, 4).map((article) => article.title)
      : TICKER_FALLBACK;
  const tickerDuplicated = [...tickerItems, ...tickerItems];

  const [lead, ...rest] = articles;
  const rail = rest.slice(0, 3);
  const latest = rest.slice(3, 9);
  const pool = rest.slice(9);

  const groups = new Map<string, Article[]>();
  for (const article of pool) {
    const key = (article.category || '').trim().toLowerCase() || 'news';
    const bucket = groups.get(key) ?? [];
    bucket.push(article);
    groups.set(key, bucket);
  }
  const verticals = [...groups.entries()]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) => ({
      key,
      title: items[0].category,
      slug: items[0].categorySlug ?? categoryKey(items[0].category),
      articles: items.slice(0, 4),
    }));

  const trending = await prisma.article.findMany({
    where: { isPublished: true, views: { gt: 0 } },
    orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
    take: 6,
  });
  const hasTrending = trending.length >= 3;

  return (
    <>
      <Ticker items={tickerDuplicated} />
      <div className="container home">
        {lead ? (
          <section className="lead" aria-label="Lead story">
            <LeadArticle article={lead} />
            <aside className="rail" aria-label="More stories">
              {rail.map((article) => (
                <SecondaryStory key={article.id} article={article} />
              ))}
            </aside>
          </section>
        ) : (
          <EmptyHome />
        )}

        {latest.length > 0 && <LatestList articles={latest} />}

        {verticals.map(({ key, title, slug, articles: items }) => (
          <SectionBand key={key} title={title} slug={slug} articles={items} />
        ))}

        {hasTrending && (
          <section className="section-band" aria-label="Trending stories">
            <header className="section-head">
              <h2 className="section-head__title">Trending</h2>
            </header>
            <ol className="popular-list">
              {trending.map((article, index) => (
                <li key={article.id} className="popular-item">
                  <span className="popular-rank">{index + 1}</span>
                  <Link href={`/article/${article.slug}`} className="popular-title">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <ForYou />

        {articles.length > 0 && <NewsletterBand />}

        {articles.length > 0 && <AdSlot where="home" />}
      </div>
    </>
  );
}