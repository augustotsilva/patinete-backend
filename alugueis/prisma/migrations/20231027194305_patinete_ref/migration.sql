/*
  Warnings:

  - A unique constraint covering the columns `[idPatinete]` on the table `Aluguel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idPatinete` to the `Aluguel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Aluguel` ADD COLUMN `idPatinete` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Aluguel_idPatinete_key` ON `Aluguel`(`idPatinete`);
