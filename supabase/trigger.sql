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

  -- Mastery gate: os casos regulares do nível 1 já vêm liberados juntos
  -- (o aluno escolhe a ordem). O caso prioritário 1-10 (boss) só é liberado
  -- pelo app quando ≥80% dos regulares estiverem resolvidos.
  INSERT INTO public.challenge_progress (user_id, challenge_id, status)
  VALUES
    (NEW.id, '1-1', 'available'),
    (NEW.id, '1-2', 'available'),
    (NEW.id, '1-3', 'available'),
    (NEW.id, '1-4', 'available'),
    (NEW.id, '1-5', 'available'),
    (NEW.id, '1-6', 'available'),
    (NEW.id, '1-7', 'available'),
    (NEW.id, '1-8', 'available'),
    (NEW.id, '1-9', 'available'),
    (NEW.id, '1-10', 'locked');

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
