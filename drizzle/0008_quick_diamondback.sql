ALTER TABLE `savedQuotes` MODIFY COLUMN `casePickRate` double NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` MODIFY COLUMN `layerPickRate` double NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` MODIFY COLUMN `palletSupplyFee` double NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` MODIFY COLUMN `shrinkWrapFee` double NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` MODIFY COLUMN `labelingFee` double NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` MODIFY COLUMN `orderProcessingFee` double NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` MODIFY COLUMN `cancellationFee` double NOT NULL;