-- =============================================================================
-- Plinth — Required PostgreSQL Extensions
-- =============================================================================
-- citext: case-insensitive text type, used for email columns
-- pgcrypto: provides gen_random_uuid() on PostgreSQL < 13. Included for
--           compatibility; on PostgreSQL 13+ gen_random_uuid() is built-in.
-- =============================================================================

create extension if not exists citext;
create extension if not exists pgcrypto;
