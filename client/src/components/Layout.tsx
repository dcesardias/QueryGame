import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';
import { getRankChevrons } from '../types';
import {
  Search, FolderOpen, Trophy, GraduationCap, ShieldCheck,
  Flame, Sun, Moon, LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Insignia from './ui/Insignia';

const ADMIN_EMAILS = ['dcesar@aacd.org.br'];

export default function Layout({ children }: { children: ReactNode }) {
  const { stats, user, logout } = useGameStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  const navItems: { to: string; label: string; icon: LucideIcon }[] = [
    { to: '/', label: 'Central', icon: FolderOpen },
    { to: '/leaderboard', label: 'Quadro de Honra', icon: Trophy },
    { to: '/onboarding', label: 'Tutorial', icon: GraduationCap },
  ];
  if (ADMIN_EMAILS.includes(user?.email || '')) {
    navItems.push({ to: '/admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <>
      <div className="qg-spot" />
      <div className="qg-grain" />
      <div className="qg-app min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="topbar">
          <div className="mx-auto max-w-[1180px] px-6 h-[62px] flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-line-strong bg-brass/[0.12]">
                <Search size={16} className="text-brass-bright" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="mono text-[15px] font-bold tracking-[0.04em] text-ink">QueryGame</span>
                <span className="mono text-[8.5px] tracking-[0.34em] text-ink-3 mt-0.5">D.I.A.</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-[22px]">
              {navItems.map(n => {
                const active = location.pathname === n.to;
                const Icon = n.icon;
                return (
                  <Link key={n.to} to={n.to} className={`nav-link${active ? ' active' : ''}`}>
                    <Icon size={15} />
                    <span className="hidden sm:inline">{n.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-4">
              {stats && (
                <span className="chip chip-brass" title="Dias em campo" style={{ gap: 5 }}>
                  <Flame size={13} />
                  {stats.streakDays}
                </span>
              )}
              {stats && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 pl-3.5 border-l border-line group"
                  title="Editar perfil"
                >
                  <Insignia chevrons={getRankChevrons(stats.rank)} size={30} />
                  <div className="leading-[1.1] hidden sm:block">
                    <div className="text-[12.5px] font-semibold text-ink group-hover:text-brass-bright transition-colors">
                      {user?.username || 'Agente'}
                    </div>
                    <div className="faint mono text-[10.5px]">Nv {stats.level} · {stats.rank}</div>
                  </div>
                </Link>
              )}
              <button onClick={toggleTheme} className="nav-link" title="Alternar tema" style={{ padding: 6 }}>
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button onClick={logout} className="nav-link" title="Sair" style={{ padding: 6 }}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 w-full mx-auto max-w-[1180px] px-6 py-7">
          {children}
        </main>

        {/* XP popup */}
        <XpPopup />
      </div>
    </>
  );
}

function XpPopup() {
  const { xpPopup, hideXpPopup } = useGameStore();

  if (!xpPopup) return null;

  setTimeout(hideXpPopup, 3000);

  return (
    <div className="xp-pop">
      <div
        className="card"
        style={{
          padding: '14px 18px',
          borderColor: 'color-mix(in srgb, var(--brass) 45%, transparent)',
          boxShadow: 'var(--shadow-lift)',
        }}
      >
        <div className="display brass" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
          +{xpPopup.amount} XP
        </div>
        {xpPopup.bonuses.map((b, i) => (
          <div key={i} className="mono sage-t" style={{ fontSize: 12, marginTop: 5 }}>{b}</div>
        ))}
      </div>
    </div>
  );
}
