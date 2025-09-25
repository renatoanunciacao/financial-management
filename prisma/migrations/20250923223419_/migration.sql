/*
  Warnings:

  - You are about to drop the column `installmentId` on the `Debt` table. All the data in the column will be lost.
  - Made the column `cardId` on table `Debt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_installmentId_fkey";

-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "installmentId",
ALTER COLUMN "cardId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InstallmentExpense" ADD COLUMN     "debtId" TEXT;

-- AddForeignKey
ALTER TABLE "InstallmentExpense" ADD CONSTRAINT "InstallmentExpense_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
