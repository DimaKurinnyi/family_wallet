-- Раньше внешний ключ не давал удалить кошелёк, пока у него есть операции.
-- Из-за этого кошелёк с историей нельзя было удалить вовсе: способа
-- удалить операции в интерфейсе нет.
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_walletId_fkey";
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey"
  FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
