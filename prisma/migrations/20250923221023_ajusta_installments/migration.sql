/*
  Warnings:

  - Added the required column `installmentNumber` to the `InstallmentExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalInstallments` to the `InstallmentExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "installmentId" TEXT;

-- AlterTable
ALTER TABLE "InstallmentExpense" ADD COLUMN     "installmentNumber" INTEGER NOT NULL,
ADD COLUMN     "totalInstallments" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "InstallmentExpense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
