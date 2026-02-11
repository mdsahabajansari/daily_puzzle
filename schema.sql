/**
 * schema.sql — PostgreSQL schema for Neon.tech
 *
 * RUN THIS ON YOUR NEON DATABASE to create all required tables.
 * These tables store server-side data synced from the client.
 *
 * Tables:
 *   users          — Registered users (from Firebase Auth)
 *   puzzles        — Daily puzzle metadata
 *   user_progress  — Per-puzzle completion records
 *   streaks        — Daily streak history
 *   scores         — Leaderboard entries
 */

-- ============================================================
-- Users table — mirrors Firebase Auth users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,               -- Firebase UID
  email         TEXT UNIQUE,                    -- User's email
  display_name  TEXT,                           -- Display name
  photo_url     TEXT,                           -- Profile photo URL
  provider      TEXT NOT NULL DEFAULT 'google', -- Auth provider (google, truecaller)
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- Puzzles table — daily puzzle metadata (server-side record)
-- ============================================================
CREATE TABLE IF NOT EXISTS puzzles (
  id          TEXT PRIMARY KEY,                     -- "2026-02-11-logic"
  date        DATE NOT NULL,                        -- Puzzle date
  type        TEXT NOT NULL CHECK (type IN ('logic', 'math', 'pattern', 'sequence', 'memory')),
  difficulty  INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  max_score   INTEGER NOT NULL,
  time_limit  INTEGER NOT NULL,                     -- Seconds
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_puzzles_date ON puzzles(date);

-- ============================================================
-- User Progress — per-puzzle completion records
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id     TEXT NOT NULL,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  score         INTEGER NOT NULL DEFAULT 0,
  time_taken    INTEGER NOT NULL DEFAULT 0,         -- Seconds
  hints_used    INTEGER NOT NULL DEFAULT 0 CHECK (hints_used BETWEEN 0 AND 3),
  completed_at  TIMESTAMP WITH TIME ZONE,
  synced_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user can only have one record per puzzle
  UNIQUE(user_id, puzzle_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_puzzle ON user_progress(puzzle_id);

-- ============================================================
-- Streaks — daily streak records per user
-- ============================================================
CREATE TABLE IF NOT EXISTS streaks (
  id                SERIAL PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  puzzles_completed INTEGER NOT NULL DEFAULT 0,
  total_score       INTEGER NOT NULL DEFAULT 0,
  
  -- One streak record per user per day
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_date ON streaks(user_id, date);

-- ============================================================
-- Scores — leaderboard entries (aggregated daily scores)
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  total_score     INTEGER NOT NULL DEFAULT 0,
  puzzles_solved  INTEGER NOT NULL DEFAULT 0,
  streak_length   INTEGER NOT NULL DEFAULT 0,
  
  -- One score entry per user per day
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_scores_date_score ON scores(date, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);

-- ============================================================
-- Rate limiting table (for API security)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  endpoint    TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits ON rate_limits(user_id, endpoint);
