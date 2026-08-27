-- Категории получают сторону операции: доход, расход или обе.
-- Без этого поля форма добавления не могла разделить списки и показывала
-- все категории сразу — «Зарплату» можно было выбрать для расхода.
CREATE TYPE "CategoryFlow" AS ENUM ('income', 'expense', 'both');

ALTER TABLE "Category" ADD COLUMN "flow" "CategoryFlow" NOT NULL DEFAULT 'expense';

-- Размечаем уже засеянные системные категории, чтобы не пересеивать базу.
UPDATE "Category" SET "flow" = 'income' WHERE "type" = 'system' AND "name" IN ('Зарплата', 'Бонус');
UPDATE "Category" SET "flow" = 'both'   WHERE "type" = 'system' AND "name" IN ('Подарки', 'Другое');
