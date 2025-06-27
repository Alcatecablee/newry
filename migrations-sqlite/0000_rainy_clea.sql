CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`paypal_payment_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD',
	`status` text DEFAULT 'pending',
	`payment_type` text DEFAULT 'subscription',
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_paypal_payment_id_unique` ON `payments` (`paypal_payment_id`);--> statement-breakpoint
CREATE TABLE `team_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`user_id` text,
	`action` text NOT NULL,
	`project` text,
	`details` text,
	`type` text DEFAULT 'scan',
	`created_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`user_id` text,
	`role` text DEFAULT 'developer',
	`joined_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`name` text NOT NULL,
	`repository` text,
	`health_score` integer DEFAULT 0,
	`total_issues` integer DEFAULT 0,
	`fixed_issues` integer DEFAULT 0,
	`last_scan` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`owner_id` text,
	`plan_type` text DEFAULT 'team',
	`monthly_limit` integer DEFAULT 1000,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transformations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`file_name` text,
	`original_code_length` integer,
	`transformed_code_length` integer,
	`layers_used` text,
	`changes_count` integer DEFAULT 0,
	`execution_time_ms` integer,
	`success` integer DEFAULT true,
	`error_message` text,
	`is_guest` integer DEFAULT false,
	`guest_session_id` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `usage_analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`date` integer,
	`transformations_count` integer DEFAULT 0,
	`total_execution_time_ms` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`plan_type` text DEFAULT 'free',
	`monthly_transformations_used` integer DEFAULT 0,
	`monthly_limit` integer DEFAULT 25,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);