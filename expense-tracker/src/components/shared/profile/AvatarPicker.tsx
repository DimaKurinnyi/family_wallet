'use client';

import { updateAvatarAction, type ProfileFormState } from '@/app/(root)/profile/actions';
import { Button } from '@/components/ui/button';
import { Camera, Trash2 } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Avatar } from './Avatar';

const initialState: ProfileFormState = { error: null, ok: false };

// Аватар нужен размером с кружок, а не с фотографию: уменьшаем до этого
// квадрата в браузере. Иначе в базу уезжали бы мегабайты, которые всё равно
// негде показать.
const SIZE = 256;
const QUALITY = 0.82;

interface Props {
  userId: string;
  name: string;
  updatedAt: Date | null;
}

/** Обрезает по центру в квадрат SIZE×SIZE и отдаёт data-URL. */
const resize = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Это не похоже на изображение'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Браузер не дал обработать изображение'));
          return;
        }
        // Квадрат из середины: в кружке всё равно видно только центр.
        const side = Math.min(image.width, image.height);
        context.drawImage(
          image,
          (image.width - side) / 2,
          (image.height - side) / 2,
          side,
          side,
          0,
          0,
          SIZE,
          SIZE
        );
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

export const AvatarPicker: React.FC<Props> = ({ userId, name, updatedAt }) => {
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(updateAvatarAction, initialState);

  // Отправляем сразу после выбора файла: отдельная кнопка «сохранить» для
  // одной картинки — лишний шаг.
  useEffect(() => {
    if (value) form.current?.requestSubmit();
  }, [value]);

  useEffect(() => {
    if (state.ok) setPreview(null);
  }, [state.ok]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);
    try {
      const dataUrl = await resize(file);
      setPreview(dataUrl);
      setValue(dataUrl);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Не удалось открыть файл');
    }
  };

  const error = localError ?? state.error;

  return (
    <div className="flex items-center gap-4">
      <span className="relative">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <Avatar
            userId={userId}
            updatedAt={updatedAt}
            name={name}
            className="h-20 w-20"
            letterClassName="text-3xl"
          />
        )}
        {isPending ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 text-xs text-gray-600">
            …
          </span>
        ) : null}
      </span>

      <form ref={form} action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="avatar" value={value} />
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0])}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => input.current?.click()}>
            <Camera className="h-4 w-4" />
            {updatedAt ? 'Заменить' : 'Загрузить'}
          </Button>

          {updatedAt ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="text-gray-500 hover:text-red-600"
              onClick={() => {
                setPreview(null);
                // Значение должно измениться, иначе эффект не сработает
                // на повторное удаление.
                setValue(`remove`);
                form.current?.requestSubmit();
              }}>
              <Trash2 className="h-4 w-4" />
              Убрать
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-gray-400">
          Картинка обрезается по центру в квадрат и уменьшается до {SIZE} пикселей.
        </p>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
};
