-- У общих кошельков владельца не было вовсе: createWallet ставил ownerId
-- только личным. Из-за этого общий кошелёк нельзя было ни переименовать,
-- ни удалить — обе операции сверяются с ownerId.
UPDATE "Wallet" w
SET "ownerId" = (
  SELECT m."userId" FROM "WalletMember" m WHERE m."walletId" = w."id" ORDER BY m."id" LIMIT 1
)
WHERE w."ownerId" IS NULL;

-- Создатель общего кошелька записывался ещё и в участники. Теперь владелец
-- определяется через ownerId, поэтому дубль убираем.
DELETE FROM "WalletMember" m
USING "Wallet" w
WHERE m."walletId" = w."id" AND m."userId" = w."ownerId";

ALTER TABLE "Wallet" ALTER COLUMN "ownerId" SET NOT NULL;

-- Один человек мог оказаться в кошельке несколько раз — сначала чистим,
-- потом закрываем уникальным индексом.
DELETE FROM "WalletMember" a
USING "WalletMember" b
WHERE a."walletId" = b."walletId" AND a."userId" = b."userId" AND a."id" > b."id";

ALTER TABLE "WalletMember" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "WalletMember_walletId_userId_key" ON "WalletMember"("walletId", "userId");

-- Удаление кошелька должно уносить участников за собой.
ALTER TABLE "WalletMember" DROP CONSTRAINT "WalletMember_walletId_fkey";
ALTER TABLE "WalletMember" ADD CONSTRAINT "WalletMember_walletId_fkey"
  FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "InviteStatus" AS ENUM ('pending', 'accepted', 'revoked');

CREATE TABLE "WalletInvite" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'pending',
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "WalletInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WalletInvite_token_key" ON "WalletInvite"("token");
CREATE INDEX "WalletInvite_walletId_idx" ON "WalletInvite"("walletId");

ALTER TABLE "WalletInvite" ADD CONSTRAINT "WalletInvite_walletId_fkey"
  FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletInvite" ADD CONSTRAINT "WalletInvite_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
