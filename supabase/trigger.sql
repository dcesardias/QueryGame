-- ============================================
-- Auto-setup trigger: creates player data on signup
-- Run this in Supabase SQL Editor AFTER the migration
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create player stats with username from metadata
  INSERT INTO public.player_stats (user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Agent_' || LEFT(NEW.id::TEXT, 8))
  );

  -- Unlock first level challenges
  INSERT INTO public.challenge_progress (user_id, challenge_id, status)
  VALUES
    (NEW.id, '1-1', 'available'),
    (NEW.id, '1-2', 'locked'),
    (NEW.id, '1-3', 'locked'),
    (NEW.id, '1-4', 'locked'),
    (NEW.id, '1-5', 'locked'),
    (NEW.id, '1-6', 'locked'),
    (NEW.id, '1-7', 'locked'),
    (NEW.id, '1-8', 'locked'),
    (NEW.id, '1-9', 'locked'),
    (NEW.id, '1-10', 'locked');

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
