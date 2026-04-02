CREATE TABLE `authorized_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('user','admin','super_admin','client') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(320) NOT NULL,
	CONSTRAINT `authorized_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `authorized_emails_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`pricing` int NOT NULL DEFAULT 0,
	`pipeline` int NOT NULL DEFAULT 0,
	`capacity` int NOT NULL DEFAULT 0,
	`proposals` int NOT NULL DEFAULT 0,
	`user_management` int NOT NULL DEFAULT 0,
	`integrations` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_permissions_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','super_admin','client') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `tutorialCompleted` int DEFAULT 0 NOT NULL;