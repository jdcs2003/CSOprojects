ALTER TABLE `savedQuotes` ADD `selectedFacility` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` ADD `laborRate` int NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` ADD `taxRate` int NOT NULL;--> statement-breakpoint
ALTER TABLE `savedQuotes` ADD `cancellationMargin` int NOT NULL;