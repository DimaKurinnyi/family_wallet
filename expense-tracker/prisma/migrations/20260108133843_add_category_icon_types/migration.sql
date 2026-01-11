/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,type]` on the table `Icon` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Icon` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('system', 'custom');

-- CreateEnum
CREATE TYPE "IconType" AS ENUM ('system', 'custom');

-- DropIndex
DROP INDEX "Category_userId_idx";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "CategoryType" NOT NULL;

-- AlterTable
ALTER TABLE "Icon" ADD COLUMN     "type" "IconType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_userId_key" ON "Category"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Icon_name_type_key" ON "Icon"("name", "type");
