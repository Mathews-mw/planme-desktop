DROP INDEX `accounts_provider_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_id_unique` ON `accounts` (`provider_account_id`);