/*
  Warnings:

  - Added the required column `aluguelId` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Pagamento` ADD COLUMN `aluguelId` VARCHAR(191) NOT NULL;
