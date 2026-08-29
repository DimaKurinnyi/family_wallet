import { AutoAcceptInvite } from '@/components/shared/wallets/AutoAcceptInvite';
import prisma from '@/lib/prisma';
import { getSession } from '@/server/session';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Приглашение — Expense Tracker' };

function Message({ title, text }: { title: string; text: string }) {
  return (
    <Shell>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="mt-3 text-gray-500">{text}</p>
      <Link href="/dashboard" className="mt-6 inline-block font-semibold text-[#8144e9] hover:underline">
        На дашборд
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] rounded-3xl bg-white p-8 shadow-xl text-center">{children}</div>
    </div>
  );
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.walletInvite.findUnique({
    where: { token },
    include: {
      wallet: { select: { name: true } },
      invitedBy: { select: { name: true, email: true } },
    },
  });

  if (!invite) {
    return <Message title="Приглашение не найдено" text="Проверьте ссылку — возможно, она обрезалась при пересылке." />;
  }

  const session = await getSession();

  // Гостя отправляем регистрироваться и возвращаем сюда же. Приглашение
  // привязано к адресу, поэтому и регистрироваться надо на него — почту
  // подставляем, чтобы это не пришлось угадывать.
  if (!session) {
    const next = encodeURIComponent(`/invite/${token}`);
    redirect(`/register?next=${next}&email=${encodeURIComponent(invite.email)}`);
  }

  if (invite.status === 'accepted') {
    return <Message title="Приглашение уже принято" text="Кошелёк доступен в списке ваших кошельков." />;
  }

  if (invite.status !== 'pending') {
    return <Message title="Приглашение отозвано" text="Попросите владельца кошелька выписать новое." />;
  }

  if (invite.expiresAt < new Date()) {
    return <Message title="Срок приглашения истёк" text="Попросите владельца кошелька выписать новое." />;
  }

  if (invite.email !== session.email.toLowerCase()) {
    return (
      <Message
        title="Приглашение на другую почту"
        text={`Ссылка выписана на ${invite.email}, а вы вошли как ${session.email}. Войдите под нужным адресом.`}
      />
    );
  }

  const from = invite.invitedBy.name?.trim() || invite.invitedBy.email;

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-gray-800">Присоединяемся к кошельку</h1>
      <p className="mt-3 text-gray-500">
        {from} приглашает вас в общий кошелёк «{invite.wallet.name}». Ещё секунда — и он появится
        на вашем дашборде.
      </p>
      <AutoAcceptInvite token={token} />
    </Shell>
  );
}
