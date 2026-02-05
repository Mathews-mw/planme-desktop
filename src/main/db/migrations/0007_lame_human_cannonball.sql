PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_task_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`list_slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`deadline` text,
	`priority` text DEFAULT 'NONE' NOT NULL,
	`is_all_day` integer DEFAULT false NOT NULL,
	`is_starred` integer DEFAULT false NOT NULL,
	`recurrence_rule_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`list_slug`) REFERENCES `task_lists`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recurrence_rule_id`) REFERENCES `recurrence_rules`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_task_definitions`("id", "user_id", "list_slug", "title", "description", "deadline", "priority", "is_all_day", "is_starred", "recurrence_rule_id", "created_at", "updated_at") SELECT "id", "user_id", "list_slug", "title", "description", "deadline", "priority", "is_all_day", "is_starred", "recurrence_rule_id", "created_at", "updated_at" FROM `task_definitions`;--> statement-breakpoint
DROP TABLE `task_definitions`;--> statement-breakpoint
ALTER TABLE `__new_task_definitions` RENAME TO `task_definitions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `task_definitions_list_slug_unique` ON `task_definitions` (`list_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_definitions_recurrence_rule_id_unique` ON `task_definitions` (`recurrence_rule_id`);--> statement-breakpoint
CREATE INDEX `user_id_index` ON `task_definitions` (`user_id`);--> statement-breakpoint
CREATE INDEX `is_starred_index` ON `task_definitions` (`is_starred`);--> statement-breakpoint
CREATE INDEX `deadline_index` ON `task_definitions` (`deadline`);--> statement-breakpoint
CREATE INDEX `list_slug_index` ON `task_definitions` (`list_slug`);