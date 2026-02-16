-- schema.sql — PostgreSQL Schema for Heatmap & Leaderboard

-- Users table (Simplified)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Scores (The core sync table)
CREATE TABLE IF NOT EXISTS daily_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    score INT NOT NULL DEFAULT 0,
    time_taken INT, -- in seconds
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one entry per user per day
    UNIQUE(user_id, date)
);

-- Achievements (Synced status)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

-- Leaderboard View (aggregated daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_daily AS
SELECT 
    user_id,
    u.username,
    SUM(score) as total_score,
    COUNT(*) as days_played
FROM daily_scores ds
JOIN users u ON ds.user_id = u.id
WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
GROUP BY user_id, u.username
ORDER BY total_score DESC;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_scores(user_id, date);
