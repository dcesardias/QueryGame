-- ============================================
-- QueryGame — Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- Player stats (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS player_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'Estagiário',
  streak_days INTEGER DEFAULT 0,
  streak_shields INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge progress
CREATE TABLE IF NOT EXISTS challenge_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'completed')),
  attempts INTEGER DEFAULT 0,
  best_time_ms INTEGER,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

-- Concept health (spaced repetition)
CREATE TABLE IF NOT EXISTS concept_health (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  interval_days REAL DEFAULT 1,
  last_reviewed DATE DEFAULT CURRENT_DATE,
  consecutive_correct INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, concept)
);

-- Daily missions
CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  target INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  xp_reward INTEGER NOT NULL
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON daily_missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_player_stats_xp ON player_stats(xp DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- player_stats: users can read all (leaderboard), write own
CREATE POLICY "Anyone can read player_stats" ON player_stats
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own stats" ON player_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON player_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- challenge_progress: users can read/write own
CREATE POLICY "Users can read own progress" ON challenge_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- concept_health: users can read/write own
CREATE POLICY "Users can read own concepts" ON concept_health
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own concepts" ON concept_health
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own concepts" ON concept_health
  FOR UPDATE USING (auth.uid() = user_id);

-- daily_missions: users can read/write own
CREATE POLICY "Users can read own missions" ON daily_missions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions" ON daily_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON daily_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- user_badges: users can read all (profile), write own
CREATE POLICY "Anyone can read badges" ON user_badges
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
