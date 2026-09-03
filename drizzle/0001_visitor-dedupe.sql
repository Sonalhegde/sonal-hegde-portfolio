ALTER TABLE `visitors` ADD `dedupe_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `visitors_dedupe_key_idx` ON `visitors` (`dedupe_key`);--> statement-breakpoint
-- Rows recorded before dedupe (one per page load) overcount and cannot be
-- retro-deduped. Drop them so the counter only reflects deduped, real visits.
DELETE FROM `visitors` WHERE `dedupe_key` IS NULL;
