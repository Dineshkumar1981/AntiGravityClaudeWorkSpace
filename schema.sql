-- Blueprint App — D1 database schema
-- Run locally:  npx wrangler d1 execute blueprints-db --local --file=schema.sql
-- Run remotely: npx wrangler d1 execute blueprints-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS blueprints (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name        TEXT    NOT NULL,
  application_purpose TEXT    NOT NULL,
  description         TEXT    NOT NULL,
  submitted_at        TEXT    NOT NULL
);
