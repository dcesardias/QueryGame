import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { challenges, getChallengesByLevel, levelNames, levelDescriptions } from '../data/challenges';
import ChallengeCard from '../components/ChallengeCard';
import Insignia from '../components/ui/Insignia';
import Bar from '../components/ui/Bar';
import Chip from '../components/ui/Chip';
import { getRankChevrons, getXpForNextLevel } from '../types';
import type { ChallengeProgress, ConceptHealth } from '../types';
import {
  Flame, FolderOpen, Star, Target, Sparkles, Lock, Check, RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Short concept label per division (shown as a chip on each level tab).
const levelConcepts: Record<number, string> = {
  1: 'SELECT · WHERE',
  2: 'GROUP BY · agregação',
  3: 'JOINs',
  4: 'Subqueries · CTEs',
};

function StatBlock({ icon: Icon, label, value, sub, color }: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex-1 px-[18px] py-1">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={15} style={{ color }} />
        <span className="kicker">{label}</span>
      </div>
      <div className="display text-[27px] font-bold leading-none" style={{ color }}>{value}</div>
      {sub && <div className="faint text-[12px] mt-1.5">{sub}</div>}
    </div>
  );
}

function LevelSection({ level, progress }: {
  level: number;
  progress: Record<string, ChallengeProgress>;
}) {
  const cases = getChallengesByLevel(level);
  const isUnlocked = cases.some(c => progress[c.id] && progress[c.id].status !== 'locked');
  const locked = !isUnlocked;
  const solved = cases.filter(c => progress[c.id]?.status === 'completed').length;
  const total = cases.length;

  return (
    <div style={{ opacity: locked ? 0.92 : 1 }}>
      {/* Manila tab header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[9px] border border-line-strong"
            style={{ background: locked ? 'var(--panel-2)' : 'var(--brass-glow)' }}
          >
            {locked
              ? <Lock size={18} className="text-ink-3" />
              : <span className="display brass text-[22px] font-bold">{level}</span>}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3
                className="display sec-h text-[22px] font-semibold m-0"
                style={{ color: locked ? 'var(--ink-2)' : 'var(--ink)' }}
              >
                {levelNames[level]}
              </h3>
              <Chip>{levelConcepts[level]}</Chip>
            </div>
            <div className="faint text-[13px] mt-0.5">
              {locked ? 'Bloqueado — encerre o caso prioritário anterior' : levelDescriptions[level]}
            </div>
          </div>
        </div>
        {!locked && (
          <div className="flex items-center gap-2.5">
            <span className="faint mono text-[12px]">{solved}/{total}</span>
            <div className="w-[90px]"><Bar value={solved} max={total} sage={total > 0 && solved === total} /></div>
          </div>
        )}
      </div>

      <div className="grid gap-3.5 case-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {cases.map(ch => (
          <ChallengeCard key={ch.id} challenge={ch} progress={progress[ch.id]} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { stats, challengeProgress, missions, conceptHealth, user, fetchMissions, fetchConceptHealth } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMissions();
    fetchConceptHealth();
  }, []);

  const totalCompleted = Object.values(challengeProgress).filter(p => p.status === 'completed').length;
  const totalChallenges = challenges.length;

  const weak: ConceptHealth[] = conceptHealth
    .filter(c => c.health < 70)
    .sort((a, b) => a.health - b.health);

  const hasOrders = missions.length > 0;
  const hasMemory = conceptHealth.length > 0;

  const reviewNow = () => {
    // Jump to an unlocked challenge that teaches the weakest concept.
    for (const c of weak) {
      const ch = challenges.find(
        h => h.concept === c.concept && challengeProgress[h.id] && challengeProgress[h.id].status !== 'locked'
      );
      if (ch) { navigate(`/challenge/${ch.id}`); return; }
    }
    const fallback = challenges.find(h => challengeProgress[h.id]?.status === 'available');
    if (fallback) navigate(`/challenge/${fallback.id}`);
  };

  return (
    <div className="mx-auto max-w-[1180px] flex flex-col gap-[30px]">
      {/* Header */}
      <div className="fade-up">
        <div className="eyebrow">Central de Casos · Turno da noite</div>
        <h1 className="display text-[clamp(30px,4.5vw,44px)] font-bold mt-2.5 tracking-tight">
          Boa noite, <span className="brass">{user?.username || 'Agente'}</span>.
        </h1>
        <p className="muted text-[15.5px] mt-2">Há casos abertos aguardando sua análise. Onde quer começar?</p>
      </div>

      {/* Identity + stats panel */}
      {stats && (
        <div className="card fade-up flex flex-wrap items-center gap-[18px]">
          <div className="flex items-center gap-4 min-w-[260px] flex-1 basis-[280px]">
            <Insignia chevrons={getRankChevrons(stats.rank)} size={52} />
            <div className="flex-1">
              <div className="display text-[20px] font-semibold">{stats.rank}</div>
              <div className="faint mono text-[12px] mt-0.5 mb-2">
                Nível {stats.level} · {stats.xp} / {getXpForNextLevel(stats.level)} XP
              </div>
              <Bar value={stats.xp} max={getXpForNextLevel(stats.level)} />
            </div>
          </div>
          <div className="flex flex-[2_1_460px] border-l border-line">
            <StatBlock
              icon={Flame}
              label="Em campo"
              value={`${stats.streakDays} dias`}
              sub={`${stats.streakShields} escudo${stats.streakShields !== 1 ? 's' : ''} · recorde ${stats.longestStreak}`}
              color="var(--brass)"
            />
            <div className="w-px bg-line" />
            <StatBlock
              icon={FolderOpen}
              label="Resolvidos"
              value={`${totalCompleted}/${totalChallenges}`}
              sub="casos encerrados"
              color="var(--sage)"
            />
            <div className="w-px bg-line" />
            <StatBlock
              icon={Star}
              label="Reputação"
              value={`${(stats as any).totalXp || 0}`}
              sub="XP acumulado"
              color="var(--brass-bright)"
            />
          </div>
        </div>
      )}

      {/* Orders of the day + Field memory */}
      {(hasOrders || hasMemory) && (
        <div
          className={hasOrders && hasMemory ? 'grid gap-5 case-layout' : 'flex flex-col gap-5'}
          style={hasOrders && hasMemory ? { gridTemplateColumns: '1.4fr 1fr' } : undefined}
        >
          {hasOrders && (
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <Target size={17} className="text-brass" />
                <h2 className="display sec-h text-[21px] font-semibold m-0">Ordens do dia</h2>
              </div>
              <div className="card !p-1.5">
                {missions.map((m: any, i: number) => {
                  const done = m.progress >= m.target;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3.5 px-3.5 py-3"
                      style={{ borderBottom: i < missions.length - 1 ? '1px solid var(--line)' : 0 }}
                    >
                      <div
                        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] border border-line"
                        style={{ background: done ? 'color-mix(in srgb, var(--sage) 18%, transparent)' : 'var(--panel-2)' }}
                      >
                        {done
                          ? <Check size={15} strokeWidth={2.4} className="text-sage" />
                          : <span className="mono brass text-[12px]">{m.progress}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[14px]"
                          style={{ color: done ? 'var(--ink-2)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none' }}
                        >
                          {m.description}
                        </div>
                        <div className="flex items-center gap-2.5 mt-1.5">
                          <div className="flex-1 max-w-[160px]"><Bar value={m.progress} max={m.target} sage={done} /></div>
                          <span className="faint mono text-[11px]">{m.progress}/{m.target}</span>
                        </div>
                      </div>
                      <Chip variant="brass">+{m.xp_reward} XP</Chip>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasMemory && (
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <Sparkles size={17} className="text-oxblood" />
                <h2 className="display sec-h text-[21px] font-semibold m-0">Memória de campo</h2>
              </div>
              <div className="card">
                <p className="faint text-[12.5px] mt-0 mb-3.5 leading-relaxed">
                  Conceitos que começam a enfraquecer. Revise antes que esfriem.
                </p>
                {weak.length > 0 ? (
                  <div className="flex flex-col gap-3.5">
                    {weak.map(c => (
                      <div key={c.concept}>
                        <div className="flex justify-between mb-1.5">
                          <span className="mono text-[12.5px] text-ink">{c.concept.replace(/_/g, ' ')}</span>
                          <span className="mono faint text-[11.5px]">{c.health}%</span>
                        </div>
                        <div className="bar">
                          <span
                            style={{
                              width: `${c.health}%`,
                              background: c.health < 40
                                ? 'linear-gradient(90deg,var(--oxblood-deep),var(--oxblood))'
                                : 'linear-gradient(90deg,var(--brass-deep),var(--brass))',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sage-t text-[13px] m-0">Seus conceitos estão em dia. Bom trabalho.</p>
                )}
                {weak.length > 0 && (
                  <button onClick={reviewNow} className="btn-secondary btn-sm mt-4 w-full justify-center">
                    <RotateCcw size={14} />
                    Revisar agora
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Case archive */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <FolderOpen size={18} className="text-brass" />
          <h2 className="display sec-h text-[23px] font-bold m-0">Arquivo de casos</h2>
        </div>
        <p className="faint text-[13.5px] mt-0 mb-5">
          Quatro divisões. Resolva o caso prioritário de cada uma para abrir a próxima.
        </p>

        <div className="flex flex-col gap-[26px]">
          {[1, 2, 3, 4].map(level => (
            <LevelSection key={level} level={level} progress={challengeProgress} />
          ))}
        </div>
      </div>
    </div>
  );
}
