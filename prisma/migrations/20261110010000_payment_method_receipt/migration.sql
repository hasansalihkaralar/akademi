-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `method` VARCHAR(20) NOT NULL DEFAULT 'kart',
    ADD COLUMN `receiptUrl` VARCHAR(500) NULL;
