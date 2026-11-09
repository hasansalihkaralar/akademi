-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `emailVerifyToken` VARCHAR(128) NULL,
    ADD COLUMN `emailVerifyExpires` DATETIME(3) NULL;

-- Mevcut hesapları doğrulanmış say
UPDATE `User` SET `emailVerifiedAt` = COALESCE(`createdAt`, CURRENT_TIMESTAMP(3)) WHERE `emailVerifiedAt` IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerifyToken_key` ON `User`(`emailVerifyToken`);
