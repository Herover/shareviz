CREATE TABLE `folder` (
	`id` text PRIMARY KEY NOT NULL,
	`folderId` text,
	`name` text NOT NULL,
	`teamId` text,
	`created` integer NOT NULL,
	`archived` integer,
	FOREIGN KEY (`folderId`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE `charts` ADD `folderId` text REFERENCES folder(id);