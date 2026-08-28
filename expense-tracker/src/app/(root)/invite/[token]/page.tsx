import { AcceptInvite } from '@/components/shared/wallets/AcceptInvite';
import prisma from '@/lib/prisma';
import { getSession } from '@/server/session';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Приглашение — Expense Tracker' };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.walletInvite.findUnique({
    where: { token },
    include: { wallet: { select: { name: true } }, invitedBy: { select: { name: true, email: true } } },
  });

  const session = await getSession();

  // Гостя отправляем регистрироваться и возвращаем обратно на эту же ссылку.
  if (!session) {
    redirect(`/register?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const shell = (title: string, text: string) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="mt-3 text-gray-500">{text}</p>
        <Link href="/dashboard" className="mt-6 inline-block font-semibold text-[#8144e9] hover:underline">
          На дашборд
        </Link>
      </div>
    </div>
  );

  if (!invite || invite.status !== 'pending') {
    return shell('Приглашение недействительно', 'Ссылка уже использована или отозвана.');
  }
  if (invite.expiresAt < new Date()) {
    return shell('Срок приглашения истёк', 'Попросите владельца кошелька выписать новое.');
  }
  if (invite.email !== session.email.toLowerCase()) {
    return shell(
      'Приглашение на другую почту',
      `Ссылка выписана на ${invite.email}, а вы вошли как ${session.email}.`
    );
  }

  const from = invite.invitedBy.name?.trim() || invite.invitedBy.email;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-gray-800">Приглашение в кошелёк</h1>
        <p className="mt-3 text-gray-500">
          {from} приглашает вас в общий кошелёк «{invite.wallet.name}». Вы сможете видеть его баланс
          и добавлять операции.
        </p>
        <AcceptInvite token={token} />
      </div>
    </div>
  );
}
