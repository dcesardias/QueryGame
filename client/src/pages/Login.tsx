import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../services/supabase';
import { Terminal, AlertCircle, CheckCircle } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useGameStore();

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw new Error(error.message);
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else if (mode === 'register') {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Erro ao autenticar';
      if (msg.includes('Verifique') || msg.includes('Conta criada') || msg.includes('recuperação')) {
        setSuccess(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'register' ? 'Criar Conta' : mode === 'forgot' ? 'Recuperar Senha' : 'Acessar Terminal';
  const buttonText = mode === 'register' ? 'Registrar Agente' : mode === 'forgot' ? 'Enviar email' : 'Acessar';

  const inputClass =
    'w-full rounded-lg border border-line bg-bg-deep px-4 py-2.5 text-ink font-mono ' +
    'placeholder:text-ink-3 focus:outline-none focus:border-brass transition-colors';

  return (
    <div className="qg-app min-h-screen flex items-center justify-center px-4">
      <div className="qg-spot" />
      <div className="qg-grain" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="eyebrow">Data Investigation Agency</div>
          <h1 className="display text-[40px] font-bold mt-2.5">
            Query<span className="brass">Game</span>
          </h1>
          <p className="muted text-sm mt-2">Domine SQL resolvendo casos.</p>
        </div>

        {/* Form */}
        <div className="card">
          <h2 className="display text-xl font-semibold text-ink mb-6">{title}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm muted mb-1.5">Codinome</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Seu codinome de agente"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="agente@dia.gov"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm muted mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2 text-[13.5px] rounded-lg px-3 py-2"
                style={{ color: 'var(--oxblood)', background: 'color-mix(in srgb, var(--oxblood) 12%, var(--panel))' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="flex items-center gap-2 text-[13.5px] rounded-lg px-3 py-2"
                style={{ color: 'var(--sage)', background: 'color-mix(in srgb, var(--sage) 12%, var(--panel))' }}
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  {buttonText}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-line flex flex-col items-center gap-2">
            {mode === 'login' && (
              <>
                <button onClick={() => switchMode('forgot')} className="text-sm faint hover:text-brass transition-colors">
                  Esqueci minha senha
                </button>
                <button onClick={() => switchMode('register')} className="text-sm text-brass hover:underline">
                  Novo agente? Criar conta
                </button>
              </>
            )}
            {mode === 'register' && (
              <button onClick={() => switchMode('login')} className="text-sm text-brass hover:underline">
                Já tem conta? Acessar
              </button>
            )}
            {mode === 'forgot' && (
              <button onClick={() => switchMode('login')} className="text-sm text-brass hover:underline">
                Voltar para o login
              </button>
            )}
          </div>
        </div>

        {/* Decorative terminal lines */}
        <div className="mt-6 font-mono text-xs faint space-y-1">
          <div>{'>'} Connecting to DIA secure database…</div>
          <div>{'>'} Encryption protocol: AES-256</div>
          <div>{'>'} Status: <span className="sage-t">ONLINE</span></div>
        </div>
      </div>
    </div>
  );
}
