-- CreateTable
CREATE TABLE `Patinete` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('DISPONIVEL', 'ALUGADO', 'INATIVO') NOT NULL DEFAULT 'DISPONIVEL',
    `rentAt` DATETIME(3) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,

    UNIQUE INDEX `Patinete_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
