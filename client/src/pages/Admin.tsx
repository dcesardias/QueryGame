import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../services/supabase';
import {
  Shield, Trash2, RotateCcw, Save, AlertCircle,
  CheckCircle, Users, Search, X,
} from 'lucide-react';

const ADMIN_EMAILS = ['dcesar@aacd.org.br'];

interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  rank: string;
  streak_days: number;
  created_at: string;
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function AdminPage() {
  const { user } = useGameStore();
  const isAdmin = ADMIN_EMAILS.includes(user?.email || '');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'reset'; userId: string; username: string } | null>(null);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/admin/users');
      setUsers(data);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async (userId: string) => {
    try {
      await adminFetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ username: editUsername }),
      });
      setMsg({ type: 'success', text: 'Codinome atualizado!' });
      setEditingId(null);
      loadUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleReset = async (userId: string) => {
    try {
      await adminFetch(`/admin/users/${userId}/reset`, { method: 'POST' });
      setMsg({ type: 'success', text: 'Progresso resetado!' });
      setConfirmAction(null);
      loadUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await adminFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: 'Usuário excluído!' });
      setConfirmAction(null);
      loadUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-oxblood mx-auto mb-4" />
        <h2 className="display text-xl font-bold text-ink mb-2">Acesso Restrito</h2>
        <p className="muted">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-brass" />
        <h1 className="display text-2xl font-bold text-ink">Painel Admin</h1>
        <span className="text-sm faint ml-2">{users.length} usuários</span>
      </div>

      {/* Message */}
      {msg && (
        <div
          className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4"
          style={{
            color: msg.type === 'success' ? 'var(--sage)' : 'var(--oxblood)',
            background: `color-mix(in srgb, ${msg.type === 'success' ? 'var(--sage)' : 'var(--oxblood)'} 12%, var(--panel))`,
          }}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por codinome ou email…"
          className="w-full rounded-lg border border-line bg-panel pl-10 pr-4 py-2.5
                   text-ink placeholder:text-ink-3 text-sm
                   focus:outline-none focus:border-brass transition-colors"
        />
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="card max-w-md w-full">
            <h3 className="display text-lg font-bold text-ink mb-2">
              {confirmAction.type === 'delete' ? 'Excluir Usuário' : 'Resetar Progresso'}
            </h3>
            <p className="text-sm muted mb-4">
              {confirmAction.type === 'delete'
                ? `Tem certeza que deseja excluir "${confirmAction.username}"? Isso remove a conta e todos os dados permanentemente.`
                : `Tem certeza que deseja resetar todo o progresso de "${confirmAction.username}"? XP, nível, streak e desafios voltam ao início.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="btn-secondary btn-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  confirmAction.type === 'delete'
                    ? handleDelete(confirmAction.userId)
                    : handleReset(confirmAction.userId)
                }
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:brightness-110"
                style={
                  confirmAction.type === 'delete'
                    ? { background: 'var(--oxblood)', color: '#fff' }
                    : { background: 'var(--brass)', color: '#1a1206' }
                }
              >
                {confirmAction.type === 'delete' ? 'Excluir' : 'Resetar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-line border-t-brass rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="qtable-wrap">
          <table className="qtable">
            <thead>
              <tr>
                <th>Codinome</th>
                <th>Email</th>
                <th className="!text-center">Nível</th>
                <th className="!text-center">XP</th>
                <th className="!text-center">Streak</th>
                <th className="!text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  {/* Username */}
                  <td>
                    {editingId === u.user_id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editUsername}
                          onChange={e => setEditUsername(e.target.value)}
                          className="rounded border border-brass/40 bg-bg-deep px-2 py-1 text-sm
                                   text-ink font-mono w-36
                                   focus:outline-none focus:border-brass"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveUsername(u.user_id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveUsername(u.user_id)}
                          className="text-sage hover:brightness-110"
                          title="Salvar"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-ink-3 hover:text-ink"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(u.user_id); setEditUsername(u.username); }}
                        className="text-ink hover:text-brass transition-colors font-medium"
                        title="Clique para editar"
                      >
                        {u.username}
                      </button>
                    )}
                  </td>

                  {/* Email */}
                  <td className="text-ink-2 text-xs">{u.email}</td>

                  {/* Level */}
                  <td className="!text-center">
                    <span className="text-ink">{u.level}</span>
                    <span className="text-ink-3 text-xs ml-1">({u.rank})</span>
                  </td>

                  {/* XP */}
                  <td className="!text-center text-brass-bright">{u.xp}</td>

                  {/* Streak */}
                  <td className="!text-center text-brass-deep">{u.streak_days}d</td>

                  {/* Actions */}
                  <td>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setConfirmAction({ type: 'reset', userId: u.user_id, username: u.username })}
                        className="p-1.5 rounded-lg text-ink-3 hover:text-brass transition-all"
                        title="Resetar progresso"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'delete', userId: u.user_id, username: u.username })}
                        className="p-1.5 rounded-lg text-ink-3 hover:text-oxblood transition-all"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="!text-center py-8 text-ink-3">
                    {search ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
