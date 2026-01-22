CREATE TABLE `task_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`position` integer NOT NULL,
	`icon` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_lists_slug_unique` ON `task_lists` (`slug`);