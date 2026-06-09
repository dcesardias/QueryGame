-- ============================================
-- Migração: Mastery Gate (80%)
-- Roda no Supabase SQL Editor APÓS migration.sql e trigger.sql.
--
-- Muda o modelo de progressão de "sequencial 1 a 1" para:
--   • os casos REGULARES de um nível ficam liberados juntos;
--   • o caso PRIORITÁRIO (boss) abre só com ≥80% dos regulares resolvidos.
--
-- Bosses: 1-10, 2-10, 3-8, 4-8
-- Regulares por nível: 1-1..1-9, 2-1..2-9, 3-1..3-7, 4-1..4-7
-- Limiar (ceil(regulares * 0,8)): nível 1/2 → 8 de 9 ; nível 3/4 → 6 de 7
-- ============================================

-- 1) Libera todos os casos regulares (não-boss) de qualquer nível já iniciado
--    pelo jogador (i.e., que já tenha pelo menos uma linha naquele nível).
UPDATE challenge_progress cp
SET status = 'available'
WHERE cp.status = 'locked'
  AND cp.challenge_id NOT IN ('1-10', '2-10', '3-8', '4-8')
  AND EXISTS (
    SELECT 1 FROM challenge_progress x
    WHERE x.user_id = cp.user_id
      AND split_part(x.challenge_id, '-', 1) = split_part(cp.challenge_id, '-', 1)
  );

-- 2) Libera o caso prioritário (boss) dos níveis em que o jogador já atingiu
--    o limiar de 80% dos regulares resolvidos.
UPDATE challenge_progress cp
SET status = 'available'
WHERE cp.status = 'locked'
  AND cp.challenge_id IN ('1-10', '2-10', '3-8', '4-8')
  AND (
    SELECT COUNT(*) FROM challenge_progress x
    WHERE x.user_id = cp.user_id
      AND split_part(x.challenge_id, '-', 1) = split_part(cp.challenge_id, '-', 1)
      AND x.challenge_id NOT IN ('1-10', '2-10', '3-8', '4-8')
      AND x.status = 'completed'
  ) >= CASE split_part(cp.challenge_id, '-', 1)
         WHEN '1' THEN 8
         WHEN '2' THEN 8
         WHEN '3' THEN 6
         WHEN '4' THEN 6
       END;
