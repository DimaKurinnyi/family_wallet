'use client';

import {
  deleteWalletAction,
  inviteAction,
  removeMemberAction,
  renameWalletAction,
  revokeInviteAction,
  type ActionState,
} from '@/app/(root)/wallets/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, Copy, Crown, Trash2, UserPlus, Users } from 'lucide-react';
import { useActionState, useState } from 'react';

const initial: ActionState = { error: null, ok: false };

export type Person = { id: string; name: string | null; email: string };
export type PendingInvite = { id: string; email: string; token: string };

export type WalletView = {
  id: string;
  name: string;
  transactionCount: number;
  type: 'personal' | 'shared';
  isOwner: boolean;
  owner: Person;
  members: Person[];
  invites: PendingInvite[];
};

const displayName = (person: Person) => person.name?.trim() || person.email;

export const WalletCard: React.FC<{ wallet: WalletView; currentUserId: string }> = ({
  wallet,
  currentUserId,
}) => {
  const [renameState, renameForm, renaming] = useActionState(renameWalletAction, initial);
  const [deleteState, deleteForm, deleting] = useActionState(deleteWalletAction, initial);
  const [inviteState, inviteForm, inviting] = useActionState(inviteAction, initial);
  const [memberState, memberForm] = useActionState(removeMemberAction, initial);
  const [revokeState, revokeForm] = useActionState(revokeInviteAction, initial);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const errors = [renameState, deleteState, inviteState, memberState, revokeState]
    .map((state) => state.error)
    .filter(Boolean);

  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {wallet.type === 'shared' ? (
            <Users className="h-5 w-5 text-gray-400 shrink-0" />
          ) : null}
          <h3 className="text-lg font-semibold truncate">{wallet.name}</h3>
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 shrink-0">
            {wallet.type === 'shared' ? 'общий' : 'личный'}
          </span>
        </div>

        {wallet.isOwner && !confirmingDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Удалить кошелёк"
            className="text-gray-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {/* Удаление необратимо и уносит операции, поэтому спрашиваем явно и
          называем число: «удалить кошелёк» и «удалить 47 записей» — это
          для человека разные по весу решения. */}
      {confirmingDelete ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Удалить кошелёк «{wallet.name}»
            {wallet.transactionCount > 0
              ? ` вместе с операциями (${wallet.transactionCount})`
              : ''}
            ? Это действие нельзя отменить.
          </p>
          <div className="mt-3 flex gap-2">
            <form action={deleteForm}>
              <input type="hidden" name="walletId" value={wallet.id} />
              <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
                {deleting ? 'Удаляем…' : 'Удалить'}
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmingDelete(false)}>
              Отмена
            </Button>
          </div>
        </div>
      ) : null}

      {wallet.isOwner ? (
        <form action={renameForm} className="mt-4 flex gap-2">
          <Input name="name" defaultValue={wallet.name} aria-label="Название кошелька" />
          <input type="hidden" name="walletId" value={wallet.id} />
          <Button type="submit" variant="outline" disabled={renaming}>
            {renaming ? '…' : 'Переименовать'}
          </Button>
        </form>
      ) : null}

      {wallet.type === 'shared' ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Кто имеет доступ</h4>

          <ul className="flex flex-col gap-2">
            <li className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 min-w-0">
                <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="truncate">{displayName(wallet.owner)}</span>
                <span className="text-gray-400 shrink-0">владелец</span>
              </span>
            </li>

            {wallet.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate pl-6">{displayName(member)}</span>
                {wallet.isOwner || member.id === currentUserId ? (
                  <form action={memberForm}>
                    <input type="hidden" name="walletId" value={wallet.id} />
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
                      {/* не «Выйти»: в шапке рядом уже есть выход из аккаунта */}
                      {member.id === currentUserId ? 'Покинуть' : 'Исключить'}
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>

          {wallet.isOwner ? (
            <>
              {wallet.invites.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Приглашения</h4>
                  <ul className="flex flex-col gap-2">
                    {wallet.invites.map((invite) => (
                      <li key={invite.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-gray-600">{invite.email}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLink(invite.token)}
                            aria-label={`Скопировать ссылку для ${invite.email}`}>
                            {copied === invite.token ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <form action={revokeForm}>
                            <input type="hidden" name="inviteId" value={invite.id} />
                            <Button type="submit" variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
                              Отозвать
                            </Button>
                          </form>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <form action={inviteForm} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="walletId" value={wallet.id} />
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="Почта участника"
                  aria-label="Почта участника"
                  className="flex-1 min-w-[180px]"
                />
                <Button type="submit" disabled={inviting}>
                  <UserPlus className="h-4 w-4" />
                  {inviting ? 'Приглашаем…' : 'Пригласить'}
                </Button>
              </form>

              {inviteState.ok && inviteState.inviteToken ? (
                <p
                  className={cn(
                    'mt-2 text-sm',
                    inviteState.emailSent ? 'text-green-700' : 'text-amber-700'
                  )}>
                  {inviteState.emailSent === true
                    ? 'Письмо со ссылкой отправлено. Ссылку можно ещё и скопировать кнопкой выше.'
                    : inviteState.emailSent === null
                      ? 'Приглашение создано. Отправка писем не настроена — скопируйте ссылку кнопкой выше и передайте человеку.'
                      : 'Приглашение создано, но письмо не ушло. Скопируйте ссылку кнопкой выше и передайте человеку.'}
                  {inviteState.emailError ? (
                    <span className="mt-1 block break-all font-mono text-xs text-gray-500">
                      {inviteState.emailError}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {errors.length > 0 ? (
        <p role="alert" className={cn('mt-3 text-sm text-red-600')}>
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
};
