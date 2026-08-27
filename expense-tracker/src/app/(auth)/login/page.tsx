import { AuthForm } from '@/components/shared/auth/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Вход — Expense Tracker' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={next} />;
}
