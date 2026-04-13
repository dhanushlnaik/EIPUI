-- InitialSchema
-- This migration represents the baseline v4 schema
-- All models use @@map to preserve existing table names
-- This ensures zero data loss and full backward compatibility

-- The v4 schema maintains all existing tables while updating Prisma model names to PascalCase
-- Database tables remain unchanged due to @@map() annotations

-- All existing tables from v3 are preserved:
-- user, account, session, api_token, api_usage, blog, blog_category, blog_comment, blog_like, 
-- blog_editor_profile, video, feedback, page_comment, comment_vote, user_preferences, 
-- verification, membership_tier, notification_outbox, notifier_checkpoint, proposal_subscription,
-- repository_subscription, upgrade_subscription, eips, eip_category_events, eip_deadline_events,
-- eip_files, eip_snapshots, eip_status_events, eip_type_events, pull_requests, pull_request_eips,
-- pr_events, pr_governance_state, pr_label_snapshot, pr_monthly_snapshot, pr_reviews,
-- pull_request_eips, repositories, contributor_activity, contributor_scores, issue_custom_tags,
-- issue_eips, issue_events, issues, pr_custom_tags, insights_monthly, pr_monthly_board_stats,
-- rips, rip_commits, scheduler_state, scheduler_runs, upgrade_composition_current,
-- upgrade_composition_events, upgrade_meta_eip_events, upgrades, pgmigrations

-- Schema validation: All model names are now PascalCase with @@map() to database table names
-- Generator: Prisma Client is configured to output to ../src/generated/prisma
-- Database: PostgreSQL
-- Connection: Configured via DATABASE_URL environment variable
