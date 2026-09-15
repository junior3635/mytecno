'use client';

import { useEffect, useState } from 'react';
import { Article } from '@prisma/client';
import ArticleCard from '@/components/article/card';
import { useReadingHistory } from '@/lib/reading-history';

export default function ForYou() {
  const history = useReadingHistory();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (history.length === 0) return;
    let cancelled = false;
    fetch('/api/articles/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readSlugs: history }),
    })
      .then((res) => (res.ok ? res.json() : { articles: [] }))
      .then((data) => {
        if (!cancelled) setArticles(data.articles ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length]);

  if (history.length === 0 || articles.length === 0) return null;

  return (
    <section className="section-band" aria-label="Recommended for you">
      <header className="section-head">
        <h2 className="section-head__title">For you</h2>
      </header>
      <div className="section-grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}