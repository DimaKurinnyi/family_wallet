'use server';

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
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ActionState = { error: string | null; ok: boolean; inviteToken?: string };

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
    revalidatePath('/wallets');
    // Почту мы не отправляем — ссылку показываем владельцу, он передаёт сам.
    return ok({ inviteToken: invite.token });
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
    await acceptInvite({ id: user.id, email: user.email }, String(formData.get('token') ?? ''));
    revalidatePath('/wallets');
    revalidatePath('/dashboard');
  } catch (error) {
    return toState(error, 'acceptInviteAction');
  }

  // Уходим на сервере, а не через useEffect на клиенте: после принятия
  // страница приглашения перерисовывается, видит использованный токен и
  // показывает «недействительно», успевая размонтировать форму до перехода.
  redirect('/wallets');
}
