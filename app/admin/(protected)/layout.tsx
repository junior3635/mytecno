import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import AdminSidebar from './sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "MyTechNews · Admin",
  robots: { index: false, follow: false },
};

// This layout only applies to /admin/(protected)/* routes.
// Route protection is handled upstream by middleware.ts.
// The layout reads the session here only to get the user email for the sidebar.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const [session, pendingComments] = await Promise.all([
    getSession(),
    prisma.comment.count({ where: { isApproved: false } }),
  ]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--paper)' }}>
      <AdminSidebar email={session.email || 'Admin'} pendingComments={pendingComments} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
