import { AuthForm } from '@/components/shared/auth/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Регистрация — Expense Tracker' };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="register" next={next} />;
}
