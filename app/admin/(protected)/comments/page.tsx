import prisma from '@/lib/db';
import Link from 'next/link';
import CommentActions from './comment-actions';

export const dynamic = 'force-dynamic';

export default async function CommentsPage() {
  const [pending, approved] = await Promise.all([
    prisma.comment.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { article: { select: { title: true, slug: true } } },
    }),
    prisma.comment.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { article: { select: { title: true, slug: true } } },
    }),
  ]);

  function CommentRow({ c }: { c: { id: string; name: string; email: string | null; body: string; isApproved: boolean; createdAt: Date; article: { title: string; slug: string } } }) {
    return (
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #111' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#52525b' }}>{new Date(c.createdAt).toLocaleString()}</span>
              {c.email && <span style={{ fontSize: '0.7rem', color: '#3f3f46' }}>{c.email}</span>}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '0.4rem' }}>{c.body}</p>
            <Link href={`/article/${c.article.slug}`} style={{ fontSize: '0.7rem', color: '#00f2fe' }}>
              On: {c.article.title.substring(0, 60)}
            </Link>
          </div>
          <CommentActions id={c.id} isApproved={c.isApproved} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Comments</h1>
        <p className="admin-sub">Moderate reader comments.</p>
      </div>

      <h2 className="admin-row-label" style={{ letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '0.75rem' }}>
        Pending approval ({pending.length})
      </h2>
      <div className="admin-card" style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
        {pending.length === 0 ? (
          <div style={{ padding: '2rem', color: '#52525b', fontSize: '0.875rem' }}>No comments awaiting moderation.</div>
        ) : (
          pending.map((c) => <CommentRow key={c.id} c={c} />)
        )}
      </div>

      <h2 className="admin-row-label" style={{ letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '0.75rem' }}>
        Approved ({approved.length})
      </h2>
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {approved.length === 0 ? (
          <div style={{ padding: '2rem', color: '#52525b', fontSize: '0.875rem' }}>No approved comments yet.</div>
        ) : (
          approved.map((c) => <CommentRow key={c.id} c={c} />)
        )}
      </div>
    </div>
  );
}