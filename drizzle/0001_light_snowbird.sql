CREATE TABLE `facilityCapacity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityCode` varchar(20) NOT NULL,
	`facilityName` varchar(100) NOT NULL,
	`month` varchar(7) NOT NULL,
	`totalSquareFeet` int NOT NULL,
	`availableSquareFeet` int NOT NULL,
	`notes` text,
	`updatedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facilityCapacity_id` PRIMARY KEY(`id`)
);
