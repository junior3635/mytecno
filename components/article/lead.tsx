import Link from 'next/link';
import type { Article } from '@prisma/client';
import CategoryBadge from './category-badge';
import ArticleMetadata from './meta';
import ArticleImage from './image';
import { RecipeMeta } from './recipe';

export function LeadArticle({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} className="lead__main">
      <ArticleImage
        src={article.featuredImage}
        alt={article.title}
        ratio="16 / 9"
        eager
        sizes="(min-width: 1024px) 620px, (max-width: 700px) 100vw, 46vw"
      />
      <div className="lead__body">
        <CategoryBadge slug={article.categorySlug} label={article.category} />
        <h1 className="lead__title">{article.title}</h1>
        {article.seoDesc && <p className="lead__dek">{article.seoDesc}</p>}
        <RecipeMeta article={article} />
        <ArticleMetadata article={article} />
      </div>
    </Link>
  );
}

export function SecondaryStory({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} className="rail__item">
      <div className="rail__media">
        <ArticleImage src={article.featuredImage} alt={article.title} ratio="4 / 3" />
      </div>
      <div className="rail__body">
        <h2 className="rail__title">{article.title}</h2>
        <ArticleMetadata article={article} />
      </div>
    </Link>
  );
}