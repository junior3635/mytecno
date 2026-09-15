import Link from 'next/link';
import type { Article } from '@prisma/client';
import CategoryBadge from './category-badge';
import ArticleMetadata from './meta';
import ArticleImage from './image';
import { RecipeMeta } from './recipe';

export default function ArticleCard({
  article,
  variant = 'standard',
}: {
  article: Article;
  variant?: 'standard' | 'compact' | 'horizontal' | 'featured' | 'recipe';
}) {
  if (variant === 'featured') {
    return (
      <Link href={`/article/${article.slug}`} className="article-card article-card--featured">
        <div className="article-card__media">
          <ArticleImage src={article.featuredImage} alt={article.title} ratio="16 / 9" eager />
        </div>
        <div className="article-card__body">
          <CategoryBadge slug={article.categorySlug} label={article.category} />
          <h3 className="article-card__title">{article.title}</h3>
          {article.seoDesc && <p className="article-card__dek">{article.seoDesc}</p>}
          <RecipeMeta article={article} />
          <ArticleMetadata article={article} />
        </div>
      </Link>
    );
  }

  if (variant === 'recipe') {
    return (
      <Link href={`/article/${article.slug}`} className="article-card article-card--recipe">
        <div className="article-card__media">
          <ArticleImage src={article.featuredImage} alt={article.title} ratio="4 / 3" />
        </div>
        <div className="article-card__body">
          <CategoryBadge slug={article.categorySlug} label={article.category} />
          <h3 className="article-card__title">{article.title}</h3>
          <RecipeMeta article={article} />
          <ArticleMetadata article={article} />
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/article/${article.slug}`} className="article-card article-card--compact">
        <h3 className="article-card__title">{article.title}</h3>
        <ArticleMetadata article={article} />
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="article-card article-card--horizontal">
        <div className="article-card__media">
          <ArticleImage src={article.featuredImage} alt={article.title} ratio="4 / 3" />
        </div>
        <div className="article-card__body">
          <CategoryBadge slug={article.categorySlug} label={article.category} />
          <h3 className="article-card__title">{article.title}</h3>
          <ArticleMetadata article={article} />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className="article-card">
      <div className="article-card__media">
        <ArticleImage src={article.featuredImage} alt={article.title} ratio="16 / 9" />
      </div>
      <div className="article-card__body">
        <CategoryBadge slug={article.categorySlug} label={article.category} />
        <h3 className="article-card__title">{article.title}</h3>
        {article.seoDesc && <p className="article-card__dek">{article.seoDesc}</p>}
        <RecipeMeta article={article} />
        <ArticleMetadata article={article} />
      </div>
    </Link>
  );
}