CREATE TABLE `branches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`addressAr` text,
	`addressEn` text,
	`phone` varchar(20),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`openingHours` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `branches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cateringRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`serviceId` int NOT NULL,
	`guestCount` int NOT NULL,
	`eventDate` date NOT NULL,
	`eventType` varchar(100),
	`locationAr` text,
	`locationEn` text,
	`contactName` varchar(100) NOT NULL,
	`contactPhone` varchar(20) NOT NULL,
	`contactEmail` varchar(100),
	`notes` text,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`totalPrice` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cateringRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cateringServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAr` varchar(100) NOT NULL,
	`titleEn` varchar(100) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`minGuests` int NOT NULL,
	`maxGuests` int,
	`pricePerPerson` decimal(10,2) NOT NULL,
	`imageUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cateringServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedbackComplaints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(100),
	`email` varchar(100),
	`phone` varchar(20),
	`type` enum('feedback','complaint','suggestion') NOT NULL,
	`orderId` int,
	`subject` varchar(200),
	`message` text NOT NULL,
	`rating` int,
	`status` enum('new','reviewed','resolved') NOT NULL DEFAULT 'new',
	`adminResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbackComplaints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalRedeemed` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyPoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyPoints_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earned','redeemed','expired') NOT NULL,
	`points` int NOT NULL,
	`orderId` int,
	`description` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `nutritionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAr` varchar(100) NOT NULL,
	`titleEn` varchar(100) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`durationDays` int NOT NULL,
	`mealsPerDay` int NOT NULL,
	`caloriesTarget` int,
	`price` decimal(10,2) NOT NULL,
	`imageUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutritionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`specialInstructions` text,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(20) NOT NULL,
	`branchId` int,
	`status` enum('pending','confirmed','preparing','ready','on_the_way','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('cash','card','instapay') NOT NULL DEFAULT 'cash',
	`paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`discountAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalAmount` decimal(10,2) NOT NULL,
	`promoCodeId` int,
	`deliveryType` enum('dine_in','delivery','pickup') NOT NULL DEFAULT 'delivery',
	`deliveryAddress` text,
	`notes` text,
	`estimatedDeliveryTime` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAr` varchar(100) NOT NULL,
	`titleEn` varchar(100) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`mealCount` int NOT NULL,
	`originalPrice` decimal(10,2) NOT NULL,
	`discountedPrice` decimal(10,2) NOT NULL,
	`discountPercentage` int,
	`imageUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`category` varchar(50) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`imageUrl` text,
	`calories` int,
	`protein` decimal(6,1),
	`carbs` decimal(6,1),
	`fat` decimal(6,1),
	`isAvailable` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`rating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promoCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`descriptionAr` varchar(255),
	`descriptionEn` varchar(255),
	`discountType` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
	`discountValue` decimal(10,2) NOT NULL,
	`minOrderAmount` decimal(10,2),
	`maxUsageCount` int,
	`currentUsageCount` int NOT NULL DEFAULT 0,
	`validFrom` timestamp NOT NULL,
	`validUntil` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promoCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promoCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `sliders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`subtitleAr` text,
	`subtitleEn` text,
	`imageUrl` text NOT NULL,
	`link` varchar(500),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sliders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);