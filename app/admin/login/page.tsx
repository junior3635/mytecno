export const dynamic = 'force-dynamic';

import AdminLoginForm from './login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in · MyTechNews Admin',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}