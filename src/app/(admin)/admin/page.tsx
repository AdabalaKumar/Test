import { redirect } from 'next/navigation';
import AdminClient from '@/components/admin/AdminClient';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/dashboard');
  return <AdminClient admin={user} />;
}
