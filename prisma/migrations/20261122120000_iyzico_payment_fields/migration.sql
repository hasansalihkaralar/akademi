ALTER TABLE `Payment` ADD COLUMN `iyzicoToken` VARCHAR(191) NULL,
    ADD COLUMN `iyzicoPaymentId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Payment_iyzicoToken_key` ON `Payment`(`iyzicoToken`);
