import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import AdSlot from '@/components/ad-slot';
import CommentSection from '@/components/comment-section';
import CategoryBadge from '@/components/article/category-badge';
import ArticleImage from '@/components/article/image';
import ArticleCard from '@/components/article/card';
import ShareControls from '@/components/article/share';
import ReadingProgress from '@/components/article/reading-progress';
import SaveButton from '@/components/article/save-button';
import ViewTracker from '@/components/article/view-tracker';
import { RecipeMeta, RecipeIngredients, RecipeInstructions, recipeTotalMinutes } from '@/components/article/recipe';
import { formatDate, readingTime, categoryKey } from '@/lib/format';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.isPublished) return {};
  const canonical = `/article/${article.slug}`;
  return {
    title: `${article.seoTitle || article.title} | MyTechNews`,
    description: article.seoDesc || undefined,
    alternates: { canonical },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDesc || undefined,
      type: 'article',
      url: canonical,
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

  const categorySlug = article.categorySlug ?? categoryKey(article.category);
  const readMin = readingTime(article.content);
  const canonical = `${SITE_URL}/article/${article.slug}`;

  const recipeIngredients = (() => {
    try {
      return article.recipeIngredients ? JSON.parse(article.recipeIngredients) : [];
    } catch {
      return [];
    }
  })();
  const recipeInstructions = (() => {
    try {
      return article.recipeInstructions ? JSON.parse(article.recipeInstructions) : [];
    } catch {
      return [];
    }
  })();
  const hasRecipe =
    (recipeIngredients.length > 0 || recipeInstructions.length > 0) &&
    article.category.toLowerCase() === 'food';
  const totalMinutes = recipeTotalMinutes(article);

  const sameCategory = await prisma.article.findMany({
    where: { isPublished: true, id: { not: article.id }, categorySlug: article.categorySlug },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const safeHtml = DOMPurify.sanitize(article.content);
  const toc: { id: string; text: string }[] = [];
  const contentHtml = safeHtml.replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, (heading) => {
    const text = heading.replace(/<[^>]+>/g, '').trim();
    const id = `sec-${toc.length}`;
    toc.push({ id, text });
    return heading.replace(/^<h2/, `<h2 id="${id}"`);
  });

  const contentParts = contentHtml.split(/<div class="ad-slot-insert"><\/div>/gi);
  const proseBlock =
    contentParts.length > 1 ? (
      <div className="prose">
        {contentParts.map((part, i) => (
          <Fragment key={i}>
            {part.length > 0 && <div dangerouslySetInnerHTML={{ __html: part }} />}
            {i < contentParts.length - 1 && <AdSlot where="article" />}
          </Fragment>
        ))}
      </div>
    ) : (
      <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    );

  let related = sameCategory;
  if (related.length < 3) {
    const excludeIds = [article.id, ...related.map((a) => a.id)];
    const extra = await prisma.article.findMany({
      where: { isPublished: true, id: { notIn: excludeIds } },
      orderBy: { createdAt: 'desc' },
      take: 3 - related.length,
    });
    related = [...related, ...extra];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDesc || undefined,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    image: article.featuredImage || undefined,
    ...(article.category ? { articleSection: article.category } : {}),
    author: { '@type': 'Organization', name: 'MyTechNews' },
    publisher: { '@type': 'Organization', name: 'MyTechNews' },
    mainEntityOfPage: canonical,
  };

  const recipeLd = hasRecipe
    ? {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: article.title,
        description: article.seoDesc || undefined,
        image: article.featuredImage || undefined,
        datePublished: article.createdAt.toISOString(),
        author: { '@type': 'Organization', name: 'MyTechNews' },
        publisher: { '@type': 'Organization', name: 'MyTechNews' },
        ...(article.recipePrepMin ? { prepTime: `PT${article.recipePrepMin}M` } : {}),
        ...(article.recipeCookMin ? { cookTime: `PT${article.recipeCookMin}M` } : {}),
        ...(totalMinutes > 0 ? { totalTime: `PT${totalMinutes}M` } : {}),
        ...(article.recipeServings ? { recipeYield: `${article.recipeServings} servings` } : {}),
        recipeCategory: 'Food',
        ...(recipeIngredients.length ? { recipeIngredient: recipeIngredients } : {}),
        ...(recipeInstructions.length
          ? {
              recipeInstructions: recipeInstructions.map((text: string) => ({
                '@type': 'HowToStep',
                text,
              })),
            }
          : {}),
        ...(article.recipeCalories
          ? {
              nutrition: {
                '@type': 'NutritionInformation',
                calories: `${article.recipeCalories} calories`,
              },
            }
          : {}),
      }
    : null;

  return (
    <div className="article-page">
      <ReadingProgress />
      <ViewTracker slug={article.slug} />
      <div className="container">
        <article
          className={
            toc.length >= 3 ? 'article-wrap article-wrap--toc' : 'article-wrap'
          }
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {recipeLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeLd) }}
            />
          )}

          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <Link href={`/${encodeURIComponent(categorySlug)}`}>{article.category}</Link>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <span aria-current="page">{article.title}</span>
          </nav>

          <header className="article-header">
            <CategoryBadge slug={categorySlug} label={article.category} />
            <h1 className="article-header__title">{article.title}</h1>
            {article.seoDesc && <p className="article-header__dek">{article.seoDesc}</p>}
            <div className="meta-line">
              <span>{formatDate(article.createdAt)}</span>
              <span>{readMin} min read</span>
            </div>
            <RecipeMeta article={article} />
          </header>

          {article.featuredImage && (
            <div className="article-hero">
              <ArticleImage
                src={article.featuredImage}
                alt={article.title}
                ratio="16 / 9"
                eager
                sizes="(min-width: 1024px) 900px, 100vw"
              />
            </div>
          )}

          {hasRecipe && (recipeIngredients.length > 0 || recipeInstructions.length > 0) && (
            <div className="recipe-grid">
              <RecipeIngredients article={article} />
              <RecipeInstructions article={article} />
            </div>
          )}

          <AdSlot where="article" />

          {toc.length >= 3 ? (
            <div className="article-layout">
              {proseBlock}
              <aside className="toc-rail" aria-label="Table of contents">
                <p className="toc-rail__label">In this story</p>
                <ol className="toc-rail__list">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="toc-rail__link">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          ) : (
            proseBlock
          )}

          <AdSlot where="article" />

          <ShareControls url={canonical} title={article.title} />

          <SaveButton slug={article.slug} />

          {related.length > 0 && (
            <section className="section-band related-stories" aria-label="Related stories">
              <header className="section-head">
                <h2 className="section-head__title">Related stories</h2>
              </header>
              <div className="section-grid">
                {related.map((item) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </section>
          )}

          <CommentSection articleId={article.id} />

          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Back to all stories
          </Link>
        </article>
      </div>
    </div>
  );
}