'use server';

import prisma from '@/lib/prisma';
import { ACTIVE_WALLET_COOKIE } from '@/server/activeWallet';
import { getCurrentUser, requireUserId } from '@/server/session';
import { createWalletSchema, inviteSchema, updateWalletSchema } from '@/server/validation/wallet.schema';
import {
  acceptInvite,
  createWallet,
  deleteWallet,
  inviteToWallet,
  removeMember,
  revokeInvite,
  updateWallet,
  WalletError,
} from '@/server/wallet.service';
import { isMailConfigured, sendInviteEmail } from '@/server/mail';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type ActionState = {
  error: string | null;
  ok: boolean;
  inviteToken?: string;
  /** null — почта не настроена, письма не шлём вовсе */
  emailSent?: boolean | null;
};

const ok = (extra?: Partial<ActionState>): ActionState => ({ error: null, ok: true, ...extra });
const fail = (error: string): ActionState => ({ error, ok: false });

// Ошибки сервиса — это сообщения для человека; всё остальное прячем.
function toState(error: unknown, where: string): ActionState {
  if (error instanceof WalletError) {
    return fail(error.message);
  }
  console.error(`Error in ${where}:`, error);
  return fail('Не удалось выполнить действие');
}

export async function createWalletAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const parsed = createWalletSchema.safeParse({
      name: formData.get('name'),
      type: formData.get('type') ?? 'personal',
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? 'Проверьте данные');
    }
    await createWallet(userId, parsed.data.name, parsed.data.type);
    revalidatePath('/wallets');
    revalidatePath('/dashboard');
    return ok();
  } catch (error) {
    return toState(error, 'createWalletAction');
  }
}

export async function renameWalletAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const walletId = String(formData.get('walletId') ?? '');
    const parsed = updateWalletSchema.safeParse({ name: formData.get('name') });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? 'Проверьте данные');
    }
    await updateWallet(userId, walletId, parsed.data.name);
    revalidatePath('/wallets');
    revalidatePath('/dashboard');
    return ok();
  } catch (error) {
    return toState(error, 'renameWalletAction');
  }
}

export async function deleteWalletAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    await deleteWallet(userId, String(formData.get('walletId') ?? ''));
    revalidatePath('/wallets');
    revalidatePath('/dashboard');
    return ok();
  } catch (error) {
    return toState(error, 'deleteWalletAction');
  }
}

export async function inviteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    const walletId = String(formData.get('walletId') ?? '');
    const parsed = inviteSchema.safeParse({ email: formData.get('email') });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? 'Проверьте почту');
    }
    const invite = await inviteToWallet(userId, walletId, parsed.data.email);

    // Адрес берём из заголовков запроса: на Vercel он разный у превью и
    // продакшена, и держать его в переменной окружения значит однажды
    // разослать ссылки на чужой домен.
    const host = (await headers()).get('host');
    const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const link = `${proto}://${host}/invite/${invite.token}`;

    const [wallet, inviter] = await Promise.all([
      prisma.wallet.findUnique({ where: { id: walletId }, select: { name: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);

    const delivery = await sendInviteEmail({
      to: parsed.data.email,
      inviterName: inviter?.name?.trim() || inviter?.email || 'Участник',
      walletName: wallet?.name ?? 'Общий кошелёк',
      link,
    });

    revalidatePath('/wallets');
    // Ссылку показываем в любом случае: письмо может не дойти, а копия
    // ссылки — надёжный запасной путь.
    return ok({
      inviteToken: invite.token,
      emailSent: isMailConfigured() ? delivery.sent : null,
    });
  } catch (error) {
    return toState(error, 'inviteAction');
  }
}

export async function revokeInviteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    await revokeInvite(userId, String(formData.get('inviteId') ?? ''));
    revalidatePath('/wallets');
    return ok();
  } catch (error) {
    return toState(error, 'revokeInviteAction');
  }
}

export async function removeMemberAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = await requireUserId();
    await removeMember(
      userId,
      String(formData.get('walletId') ?? ''),
      String(formData.get('memberId') ?? '')
    );
    revalidatePath('/wallets');
    revalidatePath('/dashboard');
    return ok();
  } catch (error) {
    return toState(error, 'removeMemberAction');
  }
}

export async function acceptInviteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    const wallet = await acceptInvite(
      { id: user.id, email: user.email },
      String(formData.get('token') ?? '')
    );

    // Сразу делаем новый кошелёк активным: иначе человек попадёт на
    // дашборд своего личного и решит, что ничего не произошло.
    // Куки можно менять только здесь — серверный компонент при рендере
    // этого не умеет.
    (await cookies()).set(ACTIVE_WALLET_COOKIE, wallet.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    revalidatePath('/wallets');
    revalidatePath('/dashboard');
  } catch (error) {
    return toState(error, 'acceptInviteAction');
  }

  redirect('/dashboard');
}
