import { getSession } from '@/lib/session';
import AdminSidebar from './sidebar';

// This layout only applies to /admin/(protected)/* routes.
// Route protection is handled upstream by middleware.ts.
// The layout reads the session here only to get the user email for the sidebar.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000' }}>
      <AdminSidebar email={session.email || 'Admin'} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
