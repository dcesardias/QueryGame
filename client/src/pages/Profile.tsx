import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../services/supabase';
import { User, KeyRound, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useGameStore();

  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMsg(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameMsg({ type: 'error', text: 'Codinome não pode ser vazio.' });
      return;
    }
    if (trimmed === user?.username) {
      setUsernameMsg({ type: 'error', text: 'Codinome é o mesmo de antes.' });
      return;
    }

    setUsernameLoading(true);
    try {
      const { error } = await supabase
        .from('player_stats')
        .update({ username: trimmed })
        .eq('user_id', user!.id);

      if (error) {
        if (error.message.includes('unique') || error.message.includes('duplicate') || error.code === '23505') {
          throw new Error('Esse codinome já está em uso.');
        }
        throw new Error(error.message);
      }

      // Update local state
      useGameStore.setState({
        user: { ...user!, username: trimmed },
      });

      setUsernameMsg({ type: 'success', text: 'Codinome atualizado!' });
    } catch (err: any) {
      setUsernameMsg({ type: 'error', text: err.message });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);

      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ type: 'success', text: 'Senha atualizada com sucesso!' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Perfil do Agente</h1>

      {/* Username */}
      <div className="card bg-bg-secondary">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-neon-cyan" />
          <h2 className="text-lg font-semibold text-text-primary">Codinome</h2>
        </div>

        <form onSubmit={handleUpdateUsername} className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Codinome atual</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5
                       text-text-primary font-mono placeholder:text-text-muted
                       focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan
                       transition-all"
              placeholder="Seu codinome"
              required
            />
          </div>

          {usernameMsg && (
            <Msg type={usernameMsg.type} text={usernameMsg.text} />
          )}

          <button
            type="submit"
            disabled={usernameLoading}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {usernameLoading ? <Spinner /> : <Save className="w-4 h-4" />}
            Salvar codinome
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card bg-bg-secondary">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-neon-magenta" />
          <h2 className="text-lg font-semibold text-text-primary">Alterar Senha</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5
                       text-text-primary font-mono placeholder:text-text-muted
                       focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan
                       transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5
                       text-text-primary font-mono placeholder:text-text-muted
                       focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan
                       transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {passwordMsg && (
            <Msg type={passwordMsg.type} text={passwordMsg.text} />
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary flex items-center gap-2 text-sm bg-neon-magenta hover:shadow-neon-magenta"
          >
            {passwordLoading ? <Spinner /> : <KeyRound className="w-4 h-4" />}
            Alterar senha
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="text-xs text-text-muted text-center">
        Email: {user?.email}
      </div>
    </div>
  );
}

function Msg({ type, text }: { type: 'success' | 'error'; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
      type === 'success' ? 'text-neon-green bg-neon-green/5' : 'text-neon-red bg-neon-red/5'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />;
}
