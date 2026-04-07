import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public leaderboard (uses service role to read all player_stats)
app.get('/api/leaderboard', async (_req, res) => {
  const { data, error } = await supabase
    .from('player_stats')
    .select('username, xp, level, rank')
    .order('xp', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  const leaderboard = (data || []).map((entry, i) => ({
    position: i + 1,
    ...entry,
  }));

  res.json(leaderboard);
});

app.listen(PORT, () => {
  console.log(`[QueryGame Server] Running on port ${PORT}`);
});
