import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import EditArticleForm from './edit-form';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) notFound();

  return (
    <div style={{ padding: '2.5rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>
            Edit Article
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
            Update the content, metadata and publish status.
          </p>
        </div>
        <a
          href={`/article/${article.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.875rem', color: '#00f2fe', fontWeight: 600 }}
        >
          View live →
        </a>
      </div>

      <EditArticleForm article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        content: article.content,
        seoTitle: article.seoTitle || '',
        seoDesc: article.seoDesc || '',
        isPublished: article.isPublished,
      }} />
    </div>
  );
}