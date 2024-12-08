DROP TABLE `teamsCharts`;--> statement-breakpoint
ALTER TABLE `charts` ADD `teamId` text REFERENCES teams(id);