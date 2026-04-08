import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getRankIcon, getXpForNextLevel } from '../types';
import { Home, Trophy, LogOut, Flame, Shield, GraduationCap } from 'lucide-react';
import XpBar from './XpBar';

export default function Layout({ children }: { children: ReactNode }) {
  const { stats, user, logout } = useGameStore();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-neon-cyan' : 'text-text-secondary hover:text-text-primary';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top Bar */}
      <header className="bg-bg-secondary border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-neon-cyan font-mono font-bold text-xl glow-text-cyan">
              {'>'}_QueryGame
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {/* Stats (only if loaded) */}
            {stats && (
              <>
                {/* Streak */}
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-neon-orange" />
                  <span className="text-text-primary font-medium">{stats.streakDays}</span>
                  {stats.streakShields > 0 && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <Shield className="w-3.5 h-3.5 text-neon-cyan" />
                      <span className="text-xs text-neon-cyan">{stats.streakShields}</span>
                    </div>
                  )}
                </div>

                {/* Level & XP */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getRankIcon(stats.rank)}</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-text-secondary">
                      Nv.{stats.level} — {stats.rank}
                    </span>
                    <XpBar
                      current={stats.xp}
                      max={getXpForNextLevel(stats.level)}
                      className="w-32"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Nav (always visible) */}
            <nav className="flex items-center gap-4 ml-4">
              <Link to="/" className={`flex items-center gap-1.5 transition-colors ${isActive('/')}`}>
                <Home className="w-4 h-4" />
                <span className="text-sm">Casos</span>
              </Link>
              <Link to="/leaderboard" className={`flex items-center gap-1.5 transition-colors ${isActive('/leaderboard')}`}>
                <Trophy className="w-4 h-4" />
                <span className="text-sm">Ranking</span>
              </Link>
              <Link to="/onboarding" className={`flex items-center gap-1.5 transition-colors ${isActive('/onboarding')}`}>
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">Tutorial</span>
              </Link>
            </nav>

            {/* User + Logout (always visible) */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 group" title="Editar perfil">
                <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center group-hover:bg-neon-cyan/30 transition-colors">
                  <span className="text-neon-cyan font-bold text-sm">
                    {user?.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <span className="text-sm text-text-secondary hidden sm:inline group-hover:text-text-primary transition-colors">
                  {user?.username || 'Agent'}
                </span>
              </Link>
              <button
                onClick={logout}
                className="text-text-muted hover:text-neon-red transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* XP Popup */}
      <XpPopup />
    </div>
  );
}

function XpPopup() {
  const { xpPopup, hideXpPopup } = useGameStore();

  if (!xpPopup) return null;

  setTimeout(hideXpPopup, 3000);

  return (
    <div className="fixed top-20 right-6 z-50 animate-float-up">
      <div className="card bg-surface border-neon-gold/30 shadow-neon-gold px-4 py-3">
        <div className="text-neon-gold font-bold text-lg glow-text-gold">
          +{xpPopup.amount} XP
        </div>
        {xpPopup.bonuses.map((b, i) => (
          <div key={i} className="text-neon-cyan text-sm">{b}</div>
        ))}
      </div>
    </div>
  );
}
