import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticleCard from '@/components/article/card';
import CategoryBadge from '@/components/article/category-badge';

export const revalidate = 3600;

type Props = {
  params: Promise<{ vertical: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vertical } = await params;
  const category = await prisma.category.findUnique({ where: { slug: vertical } });
  if (!category) return {};
  return {
    title: `${category.name} | MyTechNews`,
    description: `Editorial coverage, reviews and guides on ${category.name} from MyTechNews.`,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function VerticalPage({ params }: Props) {
  const { vertical } = await params;
  const category = await prisma.category.findUnique({ where: { slug: vertical } });
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
      OR: [{ categorySlug: category.slug }, { category: category.name }],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const [lead, ...rest] = articles;
  const isRecipe = category.slug === 'food';

  return (
    <div className="vertical-page">
      <div className="container">
        <header className="vertical-header">
          <CategoryBadge slug={category.slug} label={category.name} />
          <h1 className="vertical-header__title">{category.name}</h1>
          <p className="vertical-header__dek">
            {articles.length === 0
              ? 'No stories published in this section yet.'
              : `${articles.length} published ${articles.length === 1 ? 'story' : 'stories'} in ${category.name}`}
          </p>
        </header>

        {typeof lead === 'undefined' && (
          <div className="home-empty">
            <h2 className="home-empty__title">No stories published yet</h2>
            <p className="home-empty__text">
              The editorial team is preparing the first coverage for {category.name}. Check back soon.
            </p>
          </div>
        )}

        {lead && <ArticleCard variant={isRecipe ? 'recipe' : 'featured'} article={lead} />}
        {rest.length > 0 && (
          <div className="section-grid vertical-grid">
            {rest.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant={isRecipe ? 'recipe' : 'standard'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}