import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useGameStore } from '../store/gameStore';
import Insignia from '../components/ui/Insignia';
import Chip from '../components/ui/Chip';
import { getRankChevrons } from '../types';
import type { Rank } from '../types';

interface LeaderEntry {
  username: string;
  xp: number;
  level: number;
  rank: string;
  position: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGameStore();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('player_stats')
          .select('username, total_xp, level, rank')
          .order('total_xp', { ascending: false })
          .limit(50);
        setEntries(
          (data || []).map((e, i) => ({
            username: e.username,
            xp: e.total_xp || 0,
            level: e.level,
            rank: e.rank,
            position: i + 1,
          }))
        );
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const podium = entries.length >= 3 ? [entries[1], entries[0], entries[2]] : [];

  return (
    <div className="mx-auto max-w-[880px]">
      {/* Header */}
      <div className="fade-up text-center mb-[34px]">
        <div className="eyebrow">Departamento · Reconhecimento</div>
        <h1 className="display text-[clamp(30px,5vw,42px)] font-bold mt-2.5">Quadro de Honra</h1>
        <p className="muted text-[15px] mt-2">Os agentes que mais encerraram casos.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-line border-t-brass rounded-full animate-spin mx-auto" />
          <p className="faint mt-3">Carregando ranking…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-8">
          <p className="muted">Nenhum agente no quadro ainda.</p>
          <p className="faint text-sm mt-1">Encerre casos para aparecer aqui.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podium.length === 3 && (
            <div className="flex items-end justify-center gap-4 mb-[38px]">
              {podium.map(p => {
                const isFirst = p.position === 1;
                const height = p.position === 1 ? 132 : p.position === 2 ? 104 : 86;
                return (
                  <div key={p.position} className="flex flex-col items-center" style={{ flex: '0 1 200px' }}>
                    <Insignia chevrons={getRankChevrons(p.rank as Rank)} size={isFirst ? 56 : 44} />
                    <div
                      className="display sec-h font-semibold mt-2 text-center"
                      style={{ fontSize: isFirst ? 18 : 16 }}
                    >
                      {p.username}
                    </div>
                    <div className="faint mono text-[11.5px] mt-0.5">Nível {p.level}</div>
                    <div
                      className="w-full mt-3 flex flex-col items-center justify-center rounded-[14px] border"
                      style={{
                        height,
                        background: isFirst ? 'var(--brass-glow)' : 'var(--panel)',
                        borderColor: isFirst ? 'color-mix(in srgb, var(--brass) 40%, transparent)' : 'var(--line)',
                      }}
                    >
                      <div
                        className="display brass font-extrabold leading-none"
                        style={{ fontSize: isFirst ? 38 : 30 }}
                      >
                        {p.position}º
                      </div>
                      <div className="mono text-ink-2 text-[12px] mt-1.5">{p.xp.toLocaleString('pt-BR')} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List */}
          <div className="card !p-1.5">
            {entries.map((p, i) => {
              const you = p.username === user?.username;
              return (
                <div
                  key={p.position}
                  className="flex items-center gap-4 px-4 py-3.5"
                  style={{
                    borderBottom: i < entries.length - 1 ? '1px solid var(--line)' : 0,
                    background: you ? 'var(--brass-glow)' : 'transparent',
                    borderRadius: you ? 8 : 0,
                  }}
                >
                  <span
                    className="display font-bold text-[18px] w-[34px]"
                    style={{ color: p.position <= 3 ? 'var(--brass)' : 'var(--ink-3)' }}
                  >
                    {p.position}
                  </span>
                  <Insignia chevrons={getRankChevrons(p.rank as Rank)} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="display sec-h font-semibold text-[16px] truncate"
                        style={{ color: you ? 'var(--brass-bright)' : 'var(--ink)' }}
                      >
                        {p.username}
                      </span>
                      {you && <Chip variant="brass">você</Chip>}
                    </div>
                    <div className="faint mono text-[11.5px] mt-0.5">{p.rank} · Nível {p.level}</div>
                  </div>
                  <span className="mono text-ink text-[13.5px] text-right" style={{ minWidth: 70 }}>
                    {p.xp.toLocaleString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
