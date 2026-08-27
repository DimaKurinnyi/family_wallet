import { cookies } from 'next/headers';

export const ACTIVE_WALLET_COOKIE = 'activeWalletId';

type WalletLike = { id: string };

// Выбранный кошелёк держим в куке, чтобы серверный рендер знал его сразу
// и дашборд не мигал при загрузке.
//
// Значение куки сверяется со списком кошельков пользователя, а он уже
// отфильтрован по доступу. Подставить в куку чужой id бесполезно:
// такого кошелька в списке не окажется и выберется первый свой.
export async function resolveActiveWallet<T extends WalletLike>(wallets: T[]): Promise<T | null> {
  const preferredId = (await cookies()).get(ACTIVE_WALLET_COOKIE)?.value;
  return wallets.find((wallet) => wallet.id === preferredId) ?? wallets[0] ?? null;
}
