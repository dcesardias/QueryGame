import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Terminal, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Erro ao autenticar';
      if (msg.includes('Verifique') || msg.includes('Conta criada')) {
        setSuccess(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/[0.02] via-transparent to-neon-magenta/[0.02]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Terminal className="w-10 h-10 text-neon-cyan" />
            <h1 className="text-4xl font-mono font-bold text-neon-cyan glow-text-cyan">
              QueryGame
            </h1>
          </div>
          <p className="text-text-secondary text-sm">
            Data Investigation Agency — Domine SQL resolvendo casos
          </p>
        </div>

        {/* Form */}
        <div className="card bg-bg-secondary/80 backdrop-blur-sm border-neon-cyan/10">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            {isRegister ? 'Criar Conta' : 'Acessar Terminal'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Codinome</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5
                           text-text-primary font-mono placeholder:text-text-muted
                           focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan
                           transition-all"
                  placeholder="Seu codinome de agente"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5
                         text-text-primary font-mono placeholder:text-text-muted
                         focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan
                         transition-all"
                placeholder="agente@dia.gov"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5
                         text-text-primary font-mono placeholder:text-text-muted
                         focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan
                         transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-neon-red text-sm bg-neon-red/5 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-neon-green text-sm bg-neon-green/5 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  {isRegister ? 'Registrar Agente' : 'Acessar'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-neon-cyan hover:underline"
            >
              {isRegister ? 'Já tem conta? Acessar' : 'Novo agente? Criar conta'}
            </button>
          </div>
        </div>

        {/* Decorative terminal lines */}
        <div className="mt-6 font-mono text-xs text-text-muted/40 space-y-1">
          <div>{'>'} Connecting to DIA secure database...</div>
          <div>{'>'} Encryption protocol: AES-256</div>
          <div>{'>'} Status: <span className="text-neon-green/60">ONLINE</span></div>
        </div>
      </div>
    </div>
  );
}
