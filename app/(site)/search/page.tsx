import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBox from '@/app/search-box';
import ArticleCard from '@/components/article/card';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Search | MyTechNews',
  alternates: { canonical: '/search' },
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

const PER_PAGE = 12;

export default async function SearchPage({ searchParams }: Props) {
  const { q, category, page } = await searchParams;
  const needle = (q ?? '').trim();
  const activeCategory = (category ?? '').trim();
  const currentPage = Math.max(1, Number.parseInt(page ?? '', 10) || 1);

  const where: Prisma.ArticleWhereInput = { isPublished: true };
  if (needle) {
    where.OR = [
      { title: { contains: needle } },
      { seoDesc: { contains: needle } },
      { content: { contains: needle } },
    ];
  }
  if (activeCategory) {
    where.categorySlug = { equals: activeCategory };
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take: 8,
  });

  const showAll = !needle && !activeCategory;
  const total = showAll ? 0 : await prisma.article.count({ where });
  const totalPages = showAll ? 1 : Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(currentPage, totalPages);
  const articles = showAll
    ? []
    : await prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (current - 1) * PER_PAGE,
        take: PER_PAGE,
      });

  function resultHref(nextCategory?: string, nextPage?: number) {
    const params = new URLSearchParams();
    if (needle) params.set('q', needle);
    if (nextCategory) params.set('category', nextCategory);
    if (nextPage && nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/search?${qs}` : '/search';
  }

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i += 1) pageNumbers.push(i);

  return (
    <div className="search-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb__sep" aria-hidden="true">/</span>
          <span aria-current="page">Search</span>
        </nav>

        <h1 className="search-title">
          {needle ? <>Results for {`“${needle}”`}</> : 'Search stories'}
        </h1>

        <SearchBox defaultValue={needle} />

        <div className="search-filters" role="group" aria-label="Filter by category">
          <Link
            href={resultHref()}
            className={`filter-pill${activeCategory === '' ? ' filter-pill--active' : ''}`}
            aria-current={activeCategory === '' ? 'page' : undefined}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={resultHref(cat.slug)}
              className={`filter-pill${activeCategory === cat.slug ? ' filter-pill--active' : ''}`}
              aria-current={activeCategory === cat.slug ? 'page' : undefined}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {showAll ? (
          <div className="home-empty">
            <h2 className="home-empty__title">Type to search</h2>
            <p className="home-empty__text">Search across articles, guides and recipes by title, summary or content.</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="home-empty">
            <h2 className="home-empty__title">No stories found</h2>
            <p className="home-empty__text">
              Nothing matched your search{activeCategory ? ` in ${activeCategory}` : ''}. Try another term or clear the filters.
            </p>
            <Link href="/search" className="filter-pill clear-filter-btn">Clear search</Link>
          </div>
        ) : (
          <>
            <p className="search-count">
              {total} {total === 1 ? 'story' : 'stories'} found
            </p>
            <div className="section-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="pager" aria-label="Search results pages">
                {pageNumbers.map((n) => (
                  <Link
                    key={n}
                    href={resultHref(activeCategory || undefined, n)}
                    className={`filter-pill${n === current ? ' filter-pill--active' : ''}`}
                    aria-current={n === current ? 'page' : undefined}
                  >
                    {n}
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}