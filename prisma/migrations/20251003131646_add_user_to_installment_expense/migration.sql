-- AlterTable
ALTER TABLE "InstallmentExpense" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "InstallmentExpense" ADD CONSTRAINT "InstallmentExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
