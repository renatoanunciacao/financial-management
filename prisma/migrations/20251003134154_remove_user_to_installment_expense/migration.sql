/*
  Warnings:

  - You are about to drop the column `userId` on the `InstallmentExpense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InstallmentExpense" DROP CONSTRAINT "InstallmentExpense_userId_fkey";

-- AlterTable
ALTER TABLE "InstallmentExpense" DROP COLUMN "userId";
