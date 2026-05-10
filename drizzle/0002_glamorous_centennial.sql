CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('order_status','promo','general') NOT NULL DEFAULT 'general',
	`titleAr` varchar(255) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`messageAr` text NOT NULL,
	`messageEn` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`orderId` int,
	`orderNumber` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
