'use client';

import { createContext, useCallback, useContext, useTransition } from 'react';

type WalletSwitchValue = {
  isSwitching: boolean;
  startSwitch: (run: () => Promise<void>) => void;
};

// Переключение кошелька начинается в одном месте (карусель или список в
// шапке), а ждать его должны другие — операции и график. Общий контекст
// связывает их, не поднимая состояние в серверный компонент страницы.
const WalletSwitchContext = createContext<WalletSwitchValue>({
  isSwitching: false,
  startSwitch: (run) => {
    void run();
  },
});

export const WalletSwitchProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isPending, startTransition] = useTransition();

  // router.refresh() внутри перехода держит isPending до тех пор, пока не
  // приедет новая серверная разметка. Поэтому индикатор гаснет ровно
  // тогда, когда список уже подменился, а не раньше.
  const startSwitch = useCallback((run: () => Promise<void>) => {
    startTransition(async () => {
      await run();
    });
  }, []);

  return (
    <WalletSwitchContext.Provider value={{ isSwitching: isPending, startSwitch }}>
      {children}
    </WalletSwitchContext.Provider>
  );
};

export const useWalletSwitch = () => useContext(WalletSwitchContext);
