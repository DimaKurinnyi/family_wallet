-- Валюта операции. Раньше переключатель в шапке менял только символ, и
-- суммы разных валют складывались как одинаковые числа.
--
-- Существующие записи размечаем долларом: осмысленной валюты у них не
-- было, а доллар стоит по умолчанию и у пользователя.
ALTER TABLE "Transaction" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

CREATE TABLE "ExchangeRate" (
    "base" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("base", "currency")
);
