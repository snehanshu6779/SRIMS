-- AlterTable
ALTER TABLE `stock_transactions` ADD COLUMN `linkedRequisitionId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `stock_transactions_linkedRequisitionId_fkey` ON `stock_transactions`(`linkedRequisitionId`);

-- AddForeignKey
ALTER TABLE `stock_transactions` ADD CONSTRAINT `stock_transactions_linkedRequisitionId_fkey` FOREIGN KEY (`linkedRequisitionId`) REFERENCES `requisitions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
