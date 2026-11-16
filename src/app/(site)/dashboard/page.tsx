import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';
import { getSessionUser } from '@/lib/auth';
import { listEnquiries, listProperties } from '@/lib/repo';

export const metadata = { title: 'My Account' };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/dashboard');
  return <DashboardClient user={user} properties={listProperties()} enquiries={listEnquiries(user.id)} />;
}
