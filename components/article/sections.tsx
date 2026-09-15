import Link from 'next/link';
import type { Article } from '@prisma/client';
import ArticleCard from './card';
import ArticleMetadata from './meta';

export function SectionBand({
  title,
  slug,
  articles,
}: {
  title: string;
  slug?: string | null;
  articles: Article[];
}) {
  const [lead, ...rest] = articles;
  const isRecipe = slug === 'food';
  return (
    <section className="section-band">
      <header className="section-head">
        <h2 className="section-head__title">{title}</h2>
        {slug && (
          <Link className="section-head__side" href={`/${encodeURIComponent(slug)}`}>
            View all {title} stories
          </Link>
        )}
      </header>
      {lead && <ArticleCard variant={isRecipe ? 'recipe' : 'featured'} article={lead} />}
      {rest.length > 0 && (
        <div className="section-grid">
          {rest.slice(0, 3).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant={isRecipe ? 'recipe' : 'standard'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function LatestList({ articles }: { articles: Article[] }) {
  return (
    <section className="section-band">
      <header className="section-head">
        <h2 className="section-head__title">Latest</h2>
      </header>
      <div className="latest-grid">
        {articles.map((article) => (
          <Link key={article.id} href={`/article/${article.slug}`} className="latest-row">
            <span className="latest-row__title">{article.title}</span>
            <ArticleMetadata article={article} />
          </Link>
        ))}
      </div>
    </section>
  );
}