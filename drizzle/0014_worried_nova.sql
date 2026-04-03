CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`config` text,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`installed_by` varchar(255),
	`last_synced` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `authorized_emails` ADD `pre_assigned_permissions` text;