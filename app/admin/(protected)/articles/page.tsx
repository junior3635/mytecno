import prisma from '@/lib/db';
import ArticleActions from './article-actions';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
            Articles
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
            {articles.length} total articles in the database
          </p>
        </div>
        <a href="/admin/generator" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(90deg, #00f2fe, #fe0979)',
          borderRadius: '0.75rem',
          fontWeight: 800,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#fff',
        }}>
          ✦ New Article
        </a>
      </div>

      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '1rem', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 120px 90px 220px',
          gap: '1rem',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #1a1a1a',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#52525b',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          <span>Title</span>
          <span>Category</span>
          <span>Published</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {articles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#52525b' }}>
            No articles yet. Use the AI Generator to create your first one.
          </div>
        ) : (
          articles.map((article, i) => (
            <div key={article.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 120px 90px 220px',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: i < articles.length - 1 ? '1px solid #111' : 'none',
              alignItems: 'center',
              transition: 'background-color 0.15s',
            }}>
              <div>
                <a
                  href={`/article/${article.slug}`}
                  target="_blank"
                  style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}
                >
                  {article.title.substring(0, 60)}{article.title.length > 60 ? '…' : ''}
                </a>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.2rem' }}>
                  /{article.slug}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>{article.category}</span>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: article.isPublished ? 'rgba(0,242,254,0.1)' : 'rgba(113,113,122,0.1)',
                color: article.isPublished ? '#00f2fe' : '#71717a',
                textAlign: 'center',
              }}>
                {article.isPublished ? 'Live' : 'Draft'}
              </span>
              <ArticleActions id={article.id} slug={article.slug} isPublished={article.isPublished} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
