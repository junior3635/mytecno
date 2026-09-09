import prisma from '@/lib/db';
import SubscriberActions from './subscriber-actions';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="admin-page" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Subscribers</h1>
        <p className="admin-sub">
          {activeCount} active of {subscribers.length} total. Emails captured via the footer newsletter form.
        </p>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {subscribers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#52525b' }}>
            No subscribers yet. The newsletter form lives in the public footer.
          </div>
        ) : (
          subscribers.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < subscribers.length - 1 ? '1px solid #111' : 'none' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.15rem' }}>
                  Subscribed {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`admin-badge ${s.isActive ? 'admin-badge-live' : 'admin-badge-draft'}`}>
                {s.isActive ? 'Active' : 'Unsubscribed'}
              </span>
              <SubscriberActions id={s.id} token={s.token} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}