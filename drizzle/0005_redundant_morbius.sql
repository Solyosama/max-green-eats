CREATE TABLE `productExtras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`type` enum('sauce','spice','bread') NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`price` decimal(8,2) NOT NULL DEFAULT '0.00',
	`isDefault` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productExtras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `branchId` int;--> statement-breakpoint
ALTER TABLE `products` ADD `hasExtras` boolean DEFAULT false NOT NULL;