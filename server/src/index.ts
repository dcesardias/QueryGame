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

const ADMIN_EMAILS = ['dcesar@aacd.org.br'];

// Middleware: verify admin by checking the Supabase JWT and email
async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = header.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public leaderboard
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

// ==========================================
// Admin routes
// ==========================================

// List all users
app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  const { data: stats, error } = await supabase
    .from('player_stats')
    .select('user_id, username, xp, level, rank, streak_days, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Get emails from auth
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  const emailMap: Record<string, string> = {};
  for (const u of authUsers || []) {
    emailMap[u.id] = u.email || '';
  }

  const users = (stats || []).map(s => ({
    ...s,
    email: emailMap[s.user_id] || '',
  }));

  res.json(users);
});

// Update user (username, reset xp/level)
app.patch('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  if (username !== undefined) {
    const { error } = await supabase
      .from('player_stats')
      .update({ username })
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Reset user progress
app.post('/api/admin/users/:userId/reset', requireAdmin, async (req, res) => {
  const { userId } = req.params;

  // Reset stats
  await supabase.from('player_stats').update({
    xp: 0, level: 1, rank: 'Estagiário',
    streak_days: 0, streak_shields: 0, longest_streak: 0,
  }).eq('user_id', userId);

  // Delete all progress
  await supabase.from('challenge_progress').delete().eq('user_id', userId);
  await supabase.from('concept_health').delete().eq('user_id', userId);
  await supabase.from('daily_missions').delete().eq('user_id', userId);
  await supabase.from('user_badges').delete().eq('user_id', userId);

  // Re-create level 1 challenges
  const rows = [
    { user_id: userId, challenge_id: '1-1', status: 'available' },
    ...Array.from({ length: 9 }, (_, i) => ({
      user_id: userId,
      challenge_id: `1-${i + 2}`,
      status: 'locked',
    })),
  ];
  await supabase.from('challenge_progress').insert(rows);

  res.json({ ok: true });
});

// Delete user entirely
app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;

  // Delete from all tables (cascade should handle most, but be explicit)
  await supabase.from('daily_missions').delete().eq('user_id', userId);
  await supabase.from('user_badges').delete().eq('user_id', userId);
  await supabase.from('concept_health').delete().eq('user_id', userId);
  await supabase.from('challenge_progress').delete().eq('user_id', userId);
  await supabase.from('player_stats').delete().eq('user_id', userId);

  // Delete from auth
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[QueryGame Server] Running on port ${PORT}`);
});
