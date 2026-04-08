import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabase
    .from('player_stats')
    .select('username, xp, level, rank')
    .order('xp', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  res.json((data || []).map((entry, i) => ({ position: i + 1, ...entry })));
}
