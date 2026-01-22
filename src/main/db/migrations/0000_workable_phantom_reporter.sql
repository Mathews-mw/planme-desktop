CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_unique` ON `accounts` (`provider`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_user_id_provider_unique` ON `accounts` (`user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `recurrence_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`frequency` text NOT NULL,
	`end_type` text NOT NULL,
	`start_datetime` text,
	`end_date` text,
	`interval` integer,
	`weekdays_bitmask` integer,
	`day_of_month` integer,
	`max_occurrences` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE INDEX `frequency_index` ON `recurrence_rules` (`frequency`);--> statement-breakpoint
CREATE TABLE `subtasks` (
	`id` text PRIMARY KEY NOT NULL,
	`task_definition_id` text NOT NULL,
	`title` text,
	`description` text,
	`position` integer NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`task_definition_id`) REFERENCES `task_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subtask_position_definition` ON `subtasks` (`task_definition_id`,`position`);--> statement-breakpoint
CREATE TABLE `task_definitions` (
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
	FOREIGN KEY (`recurrence_rule_id`) REFERENCES `recurrence_rules`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `user_id_index` ON `task_definitions` (`user_id`);--> statement-breakpoint
CREATE INDEX `is_starred_index` ON `task_definitions` (`is_starred`);--> statement-breakpoint
CREATE INDEX `deadline_index` ON `task_definitions` (`deadline`);--> statement-breakpoint
CREATE TABLE `task_occurrences` (
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
CREATE INDEX `occ_datetime_index` ON `task_occurrences` (`task_definition_id`,`occurrence_date_time`);--> statement-breakpoint
CREATE INDEX `occ_status_index` ON `task_occurrences` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`avatar_url` text,
	`timezone` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_index` ON `users` (`email`);