import prisma from '@/lib/db';

export async function publishScheduledArticles() {
  const now = new Date();
  const due = await prisma.article.findMany({
    where: {
      publishAt: { lte: now },
      isPublished: false,
    },
    select: { id: true, slug: true },
  });
  if (due.length === 0) return { published: 0 };

  const published = await prisma.$transaction(
    due.map((a) =>
      prisma.article.update({
        where: { id: a.id },
        data: { isPublished: true, publishedAt: now, publishAt: null },
        select: { id: true, slug: true },
      })
    )
  );
  return { published: published.length };
}
