CREATE TABLE `chartPublication` (
	`id` text PRIMARY KEY NOT NULL,
	`chartId` text NOT NULL,
	`v` integer NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`chartId`) REFERENCES `charts`(`id`) ON UPDATE no action ON DELETE cascade
);
