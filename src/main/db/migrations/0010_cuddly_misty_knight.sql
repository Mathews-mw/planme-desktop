PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_task_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`task_definition_id` text NOT NULL,
	`occurrence_date_time` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`note` text,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`task_definition_id`) REFERENCES `task_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_task_occurrences`("id", "task_definition_id", "occurrence_date_time", "status", "note", "completed_at", "created_at", "updated_at") SELECT "id", "task_definition_id", "occurrence_date_time", "status", "note", "completed_at", "created_at", "updated_at" FROM `task_occurrences`;--> statement-breakpoint
DROP TABLE `task_occurrences`;--> statement-breakpoint
ALTER TABLE `__new_task_occurrences` RENAME TO `task_occurrences`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `occ_datetime_index` ON `task_occurrences` (`task_definition_id`,`occurrence_date_time`);--> statement-breakpoint
CREATE INDEX `occ_status_index` ON `task_occurrences` (`status`);