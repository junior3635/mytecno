import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';
import ArticleActions from './article-actions';
import AdminSearchBox from './admin-search-box';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const where: Prisma.ArticleWhereInput = {};
  if (q && q.trim() !== '') {
    const needle = q.trim();
    where.OR = [
      { title: { contains: needle } },
      { slug: { contains: needle } },
      { category: { contains: needle } },
      { seoDesc: { contains: needle } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  function StatusBadge({ isPublished }: { isPublished: boolean }) {
    return (
      <span className={`admin-badge ${isPublished ? 'admin-badge-live' : 'admin-badge-draft'}`} style={{ textAlign: 'center' }}>
        {isPublished ? 'Live' : 'Draft'}
      </span>
    );
  }

  return (
    <div className="admin-page">
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="admin-heading">Articles</h1>
          <p className="admin-sub">
            {articles.length} total articles in the database{q ? ` matching “${q}”` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AdminSearchBox placeholder="Search articles…" />
          <a href="/admin/generator" className="admin-primary-btn" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem' }}>
            ✦ New Article
          </a>
        </div>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {/* Table Header */}
        <div className="admin-row-label" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 120px 90px 220px',
          gap: '1rem',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #1a1a1a',
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
              <StatusBadge isPublished={article.isPublished} />
              <ArticleActions id={article.id} slug={article.slug} isPublished={article.isPublished} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}