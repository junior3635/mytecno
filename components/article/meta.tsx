import type { Article } from '@prisma/client';
import { formatDate, readingTime } from '@/lib/format';

export default function ArticleMetadata({
  article,
}: {
  article: Pick<Article, 'createdAt' | 'content'>;
}) {
  return (
    <div className="meta-line">
      <span>{formatDate(article.createdAt)}</span>
      <span>{readingTime(article.content)} min read</span>
    </div>
  );
}