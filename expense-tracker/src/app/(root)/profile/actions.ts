'use server';

import {
  changePassword,
  ProfileError,
  removeAvatar,
  setAvatar,
  updateName,
} from '@/server/profile.service';
import { requireUserId } from '@/server/session';
import {
  changePasswordSchema,
  checkPasswordPair,
  updateNameSchema,
} from '@/server/validation/profile.schema';
import { revalidatePath } from 'next/cache';

export type ProfileFormState = { error: string | null; ok: boolean };

const initial = (error: string | null): ProfileFormState => ({ error, ok: false });

// Профиль виден и на самой странице, и в «Больше», поэтому обновляем оба.
function revalidateProfile() {
  revalidatePath('/profile');
  revalidatePath('/more');
}

async function run(action: () => Promise<void>, fallback: string): Promise<ProfileFormState> {
  try {
    await action();
    revalidateProfile();
    return { error: null, ok: true };
  } catch (error) {
    if (error instanceof ProfileError) {
      return initial(error.message);
    }
    console.error(fallback, error);
    return initial(fallback);
  }
}

export async function updateNameAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = updateNameSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    return initial(parsed.error.issues[0]?.message ?? 'Проверьте данные');
  }

  const userId = await requireUserId();
  return run(async () => {
    await updateName(userId, parsed.data);
  }, 'Не удалось сохранить имя');
}

export async function changePasswordAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    repeatPassword: formData.get('repeatPassword'),
  });
  if (!parsed.success) {
    return initial(parsed.error.issues[0]?.message ?? 'Проверьте данные');
  }

  const mismatch = checkPasswordPair(parsed.data);
  if (mismatch) {
    return initial(mismatch);
  }

  const userId = await requireUserId();
  return run(async () => {
    await changePassword(userId, parsed.data);
  }, 'Не удалось сменить пароль');
}

export async function updateAvatarAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const userId = await requireUserId();
  const dataUrl = String(formData.get('avatar') ?? '');

  return run(async () => {
    if (dataUrl === 'remove') {
      await removeAvatar(userId);
      return;
    }
    await setAvatar(userId, dataUrl);
  }, 'Не удалось сохранить аватар');
}
