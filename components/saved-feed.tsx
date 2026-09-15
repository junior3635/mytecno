'use client';

import { useEffect, useState } from 'react';
import { Article } from '@prisma/client';
import ArticleCard from '@/components/article/card';
import { readBookmarks, toggleBookmark } from '@/components/article/save-button';

export default function SavedFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = readBookmarks();
    fetch('/api/articles/by-slugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => (res.ok ? res.json() : { articles: [] }))
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function remove(slug: string) {
    toggleBookmark(slug);
    setArticles((list) => list.filter((a) => a.slug !== slug));
  }

  if (loading) {
    return <p className="search-count">Loading…</p>;
  }

  if (articles.length === 0) {
    return (
      <div className="home-empty">
        <h2 className="home-empty__title">No saved stories yet</h2>
        <p className="home-empty__text">
          Use “Save for later” on any story and it will appear here, ready to read.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="search-count">
        {articles.length} {articles.length === 1 ? 'story' : 'stories'} saved
      </p>
      <div className="section-grid">
        {articles.map((article) => (
          <div className="saved-card" key={article.id}>
            <ArticleCard article={article} />
            <button
              type="button"
              className="saved-card__remove"
              onClick={() => remove(article.slug)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}