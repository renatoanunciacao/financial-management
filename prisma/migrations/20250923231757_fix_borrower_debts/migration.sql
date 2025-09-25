/*
  Warnings:

  - You are about to drop the column `borrowerId` on the `Debt` table. All the data in the column will be lost.
  - Added the required column `borrowerName` to the `Debt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_borrowerId_fkey";

-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "borrowerId",
ADD COLUMN     "borrowerName" TEXT NOT NULL;
