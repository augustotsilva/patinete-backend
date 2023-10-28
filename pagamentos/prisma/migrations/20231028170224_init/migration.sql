-- CreateTable
CREATE TABLE `Pagamento` (
    `id` VARCHAR(191) NOT NULL,
    `cartao` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,

    UNIQUE INDEX `Pagamento_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
