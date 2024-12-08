PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_charts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`chartRef` text NOT NULL,
	`teamId` text,
	`created` integer NOT NULL,
	`archived` integer,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_charts`("id", "name", "chartRef", "teamId", "created", "archived") SELECT "id", "name", "chartRef", "teamId", 1733686836104, null FROM `charts`;--> statement-breakpoint
DROP TABLE `charts`;--> statement-breakpoint
ALTER TABLE `__new_charts` RENAME TO `charts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `charts_chartRef_unique` ON `charts` (`chartRef`);