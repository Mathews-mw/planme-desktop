PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subtasks` (
	`id` text PRIMARY KEY NOT NULL,
	`task_definition_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`position` integer NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`task_definition_id`) REFERENCES `task_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_subtasks`("id", "task_definition_id", "title", "description", "position", "is_completed", "completed_at", "created_at", "updated_at") SELECT "id", "task_definition_id", "title", "description", "position", "is_completed", "completed_at", "created_at", "updated_at" FROM `subtasks`;--> statement-breakpoint
DROP TABLE `subtasks`;--> statement-breakpoint
ALTER TABLE `__new_subtasks` RENAME TO `subtasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `subtask_position_definition` ON `subtasks` (`task_definition_id`,`position`);