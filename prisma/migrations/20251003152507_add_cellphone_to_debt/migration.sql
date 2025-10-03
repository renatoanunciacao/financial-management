-- AlterTable
ALTER TABLE "Borrower" ADD COLUMN     "cellphone" TEXT;

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "borrowerCellphone" TEXT;
