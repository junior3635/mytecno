const CATEGORY_CLASS: Record<string, string> = {
  technology: 'cat-technology',
  food: 'cat-food',
  news: 'cat-news',
  trends: 'cat-trends',
  reviews: 'cat-reviews',
  guides: 'cat-guides',
};

export function categoryClass(slug: string | null | undefined): string {
  return CATEGORY_CLASS[slug ?? ''] ?? 'cat-news';
}

export default function CategoryBadge({
  slug,
  label,
}: {
  slug: string | null | undefined;
  label: string;
}) {
  return <span className={`category-badge ${categoryClass(slug)}`}>{label}</span>;
}