-- Run this in Supabase SQL Editor
-- Adds total_xp column to track lifetime XP (never resets on level up)

ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Backfill existing users: estimate total_xp from current level + xp
-- Formula: sum of xp thresholds for all completed levels + current xp
UPDATE player_stats SET total_xp = (
  CASE
    WHEN level = 1 THEN xp
    WHEN level = 2 THEN 120 + xp
    WHEN level = 3 THEN 120 + 240 + xp
    WHEN level = 4 THEN 120 + 240 + 360 + xp
    WHEN level = 5 THEN 120 + 240 + 360 + 480 + xp
    ELSE 120 + 240 + 360 + 480 + 600 + xp
  END
);
