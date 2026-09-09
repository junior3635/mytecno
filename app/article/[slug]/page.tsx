import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import AdSlot from '@/components/ad-slot';
import CommentSection from '@/components/comment-section';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.isPublished) return {};
  return {
    title: `${article.seoTitle || article.title} | MyTechNews`,
    description: article.seoDesc || undefined,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDesc || undefined,
      type: 'article',
      url: `/article/${article.slug}`,
      ...(article.featuredImage ? { images: [{ url: article.featuredImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle || article.title,
      description: article.seoDesc || undefined,
      ...(article.featuredImage ? { images: [article.featuredImage] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article || !article.isPublished) notFound();

  const readTime = Math.ceil(article.content.split(' ').length / 200);

  return (
    <div style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Article Hero */}
      <div style={{
        background: 'linear-gradient(180deg, #000 0%, var(--bg-color) 100%)',
        padding: '5rem 1.5rem 3rem',
        marginBottom: '0',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #00f2fe, #fe0979)',
              color: '#fff',
            }}>
              {article.category}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '1.5rem',
            color: '#ffffff',
          }}>
            {article.title}
          </h1>

          {article.seoDesc && (
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '60ch',
            }}>
              {article.seoDesc}
            </p>
          )}



          <div style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{readTime} min read</span>
            <span>·</span>
            <span>AI Generated</span>
          </div>
          </div>
        </div>

        {/* Featured Image — full-width below the text hero */}
        {article.featuredImage && (
          <div style={{ maxWidth: '900px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
            <Image
              src={article.featuredImage}
              alt={article.title}
              width={1600}
              height={840}
              unoptimized={article.featuredImage.startsWith('data:')}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '1rem',
                display: 'block',
                boxShadow: '0 0 60px rgba(0,242,254,0.15), 0 0 120px rgba(254,9,121,0.08)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            />
          </div>
        )}

      <div className="container" style={{ paddingTop: article.featuredImage ? '3rem' : '0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Top Ad Slot */}
          <AdSlot label="Advertisement" />

          {/* Article Body */}
          <div
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.85,
              color: 'var(--text-secondary)',
            }}
          />

          {/* Bottom Ad Slot */}
          <AdSlot label="Advertisement" />

          {/* Comments */}
          <CommentSection articleId={article.id} />

          {/* Back link */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            <Link href="/" style={{
              fontWeight: 800,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              ← Back to MyTechNews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
