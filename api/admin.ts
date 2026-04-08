import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const ADMIN_EMAILS = ['dcesar@aacd.org.br'];

async function verifyAdmin(req: VercelRequest): Promise<boolean> {
  const header = req.headers.authorization;
  if (!header?.toString().startsWith('Bearer ')) return false;
  const token = header.toString().split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  return !!user && ADMIN_EMAILS.includes(user.email || '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!(await verifyAdmin(req))) {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }

  // Parse path from query slug or from URL directly
  const { slug } = req.query;
  let path = Array.isArray(slug) ? slug.join('/') : slug || '';
  if (!path && req.url) {
    // Fallback: extract from URL (e.g. /api/admin/users -> users)
    const match = req.url.match(/\/api\/admin\/?(.*)$/);
    if (match) path = match[1].split('?')[0];
  }

  try {
    // GET /api/admin/users
    if (req.method === 'GET' && path === 'users') {
      const { data: stats } = await supabase
        .from('player_stats')
        .select('user_id, username, xp, level, rank, streak_days, created_at')
        .order('created_at', { ascending: false });

      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const emailMap: Record<string, string> = {};
      for (const u of authUsers || []) emailMap[u.id] = u.email || '';

      return res.json((stats || []).map(s => ({ ...s, email: emailMap[s.user_id] || '' })));
    }

    // Extract userId from path like "users/xxx" or "users/xxx/reset"
    const userMatch = path.match(/^users\/([^/]+)$/);
    const resetMatch = path.match(/^users\/([^/]+)\/reset$/);

    // PATCH /api/admin/users/:id
    if (req.method === 'PATCH' && userMatch) {
      const userId = userMatch[1];
      const { username } = req.body;
      if (username !== undefined) {
        const { error } = await supabase.from('player_stats').update({ username }).eq('user_id', userId);
        if (error) return res.status(500).json({ error: error.message });
      }
      return res.json({ ok: true });
    }

    // POST /api/admin/users/:id/reset
    if (req.method === 'POST' && resetMatch) {
      const userId = resetMatch[1];
      await supabase.from('player_stats').update({
        xp: 0, level: 1, rank: 'Estagiário',
        streak_days: 0, streak_shields: 0, longest_streak: 0,
      }).eq('user_id', userId);
      await supabase.from('challenge_progress').delete().eq('user_id', userId);
      await supabase.from('concept_health').delete().eq('user_id', userId);
      await supabase.from('daily_missions').delete().eq('user_id', userId);
      await supabase.from('user_badges').delete().eq('user_id', userId);
      const rows = [
        { user_id: userId, challenge_id: '1-1', status: 'available' },
        ...Array.from({ length: 9 }, (_, i) => ({
          user_id: userId, challenge_id: `1-${i + 2}`, status: 'locked',
        })),
      ];
      await supabase.from('challenge_progress').insert(rows);
      return res.json({ ok: true });
    }

    // DELETE /api/admin/users/:id
    if (req.method === 'DELETE' && userMatch) {
      const userId = userMatch[1];
      await supabase.from('daily_missions').delete().eq('user_id', userId);
      await supabase.from('user_badges').delete().eq('user_id', userId);
      await supabase.from('concept_health').delete().eq('user_id', userId);
      await supabase.from('challenge_progress').delete().eq('user_id', userId);
      await supabase.from('player_stats').delete().eq('user_id', userId);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true });
    }

    return res.status(404).json({ error: 'Rota não encontrada' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
