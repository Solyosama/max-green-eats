ALTER TABLE `nutritionPlans` ADD COLUMN IF NOT EXISTS `features` text;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `address` text;
