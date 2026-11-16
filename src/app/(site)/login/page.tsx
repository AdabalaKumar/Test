import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Sign in' };

export default async function Page() {
  const user = await getSessionUser();
  if (user) redirect(user.role === 'admin' ? '/admin' : '/dashboard');
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
