CREATE TABLE `instapaySettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountPhone` varchar(20) NOT NULL DEFAULT '+201142839399',
	`accountName` varchar(255) NOT NULL DEFAULT 'Max Green Eats',
	`instructions` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instapaySettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutritionSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`planNameAr` varchar(255) NOT NULL,
	`planNameEn` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`instapayRef` varchar(100),
	`status` enum('pending','active','cancelled','expired') NOT NULL DEFAULT 'pending',
	`startDate` timestamp,
	`endDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutritionSubscriptions_id` PRIMARY KEY(`id`)
);
