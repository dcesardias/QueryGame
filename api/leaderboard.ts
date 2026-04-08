import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabase
    .from('player_stats')
    .select('username, total_xp, level, rank')
    .order('total_xp', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  res.json((data || []).map((entry, i) => ({
    position: i + 1,
    username: entry.username,
    xp: entry.total_xp || 0,
    level: entry.level,
    rank: entry.rank,
  })));
}
