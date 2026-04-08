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
        <Shield className="w-12 h-12 text-neon-red mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Acesso Restrito</h2>
        <p className="text-text-secondary">Você não tem permissão para acessar esta página.</p>
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
        <Shield className="w-6 h-6 text-neon-magenta" />
        <h1 className="text-2xl font-bold text-text-primary">Painel Admin</h1>
        <span className="text-sm text-text-muted ml-2">{users.length} usuários</span>
      </div>

      {/* Message */}
      {msg && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4 ${
          msg.type === 'success' ? 'text-neon-green bg-neon-green/5' : 'text-neon-red bg-neon-red/5'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por codinome ou email..."
          className="w-full bg-bg-secondary border border-white/10 rounded-lg pl-10 pr-4 py-2.5
                   text-text-primary placeholder:text-text-muted text-sm
                   focus:outline-none focus:border-neon-cyan/50 transition-all"
        />
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="card bg-bg-secondary max-w-md w-full">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {confirmAction.type === 'delete' ? 'Excluir Usuário' : 'Resetar Progresso'}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {confirmAction.type === 'delete'
                ? `Tem certeza que deseja excluir "${confirmAction.username}"? Isso remove a conta e todos os dados permanentemente.`
                : `Tem certeza que deseja resetar todo o progresso de "${confirmAction.username}"? XP, nível, streak e desafios voltam ao início.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  confirmAction.type === 'delete'
                    ? handleDelete(confirmAction.userId)
                    : handleReset(confirmAction.userId)
                }
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                  confirmAction.type === 'delete'
                    ? 'bg-neon-red text-white hover:shadow-neon-red'
                    : 'bg-neon-orange text-white hover:shadow-neon-gold'
                }`}
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
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="card bg-bg-secondary p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-bg-primary/50">
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">Codinome</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium">Email</th>
                <th className="text-center px-4 py-3 text-xs text-text-muted font-medium">Nível</th>
                <th className="text-center px-4 py-3 text-xs text-text-muted font-medium">XP</th>
                <th className="text-center px-4 py-3 text-xs text-text-muted font-medium">Streak</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  {/* Username */}
                  <td className="px-4 py-3">
                    {editingId === u.user_id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editUsername}
                          onChange={e => setEditUsername(e.target.value)}
                          className="bg-bg-primary border border-neon-cyan/30 rounded px-2 py-1 text-sm
                                   text-text-primary font-mono w-36
                                   focus:outline-none focus:border-neon-cyan"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveUsername(u.user_id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveUsername(u.user_id)}
                          className="text-neon-green hover:text-neon-green/80"
                          title="Salvar"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-text-muted hover:text-text-primary"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(u.user_id); setEditUsername(u.username); }}
                        className="text-text-primary hover:text-neon-cyan transition-colors font-medium"
                        title="Clique para editar"
                      >
                        {u.username}
                      </button>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs">{u.email}</td>

                  {/* Level */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-text-primary">{u.level}</span>
                    <span className="text-text-muted text-xs ml-1">({u.rank})</span>
                  </td>

                  {/* XP */}
                  <td className="px-4 py-3 text-center text-neon-gold font-mono">{u.xp}</td>

                  {/* Streak */}
                  <td className="px-4 py-3 text-center text-neon-orange">{u.streak_days}d</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setConfirmAction({ type: 'reset', userId: u.user_id, username: u.username })}
                        className="p-1.5 rounded-lg text-text-muted hover:text-neon-orange hover:bg-neon-orange/10 transition-all"
                        title="Resetar progresso"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: 'delete', userId: u.user_id, username: u.username })}
                        className="p-1.5 rounded-lg text-text-muted hover:text-neon-red hover:bg-neon-red/10 transition-all"
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
                  <td colSpan={6} className="text-center py-8 text-text-muted">
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
