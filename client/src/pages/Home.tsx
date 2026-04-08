import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { challenges, getChallengesByLevel, levelNames, levelDescriptions } from '../data/challenges';
import ChallengeCard from '../components/ChallengeCard';
import XpBar from '../components/XpBar';
import { getRankIcon, getXpForNextLevel } from '../types';
import { Flame, Target, Trophy, Brain, Shield, ChevronRight, ChevronDown, Lock } from 'lucide-react';

export default function HomePage() {
  const { stats, challengeProgress, missions, fetchMissions } = useGameStore();
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchMissions();
  }, []);

  const levels = [1, 2, 3, 4];

  const totalCompleted = Object.values(challengeProgress).filter(p => p.status === 'completed').length;
  const totalChallenges = challenges.length;

  const toggleLevel = (level: number) => {
    setCollapsed(prev => ({ ...prev, [level]: !prev[level] }));
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-bg-secondary">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getRankIcon(stats.rank)}</div>
              <div>
                <div className="text-lg font-bold text-text-primary">{stats.rank}</div>
                <div className="text-sm text-text-secondary">Nível {stats.level}</div>
                <XpBar current={stats.xp} max={getXpForNextLevel(stats.level)} showLabel className="mt-1.5 w-36" />
              </div>
            </div>
          </div>

          <div className="card bg-bg-secondary">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-neon-orange" />
              <div>
                <div className="text-lg font-bold text-text-primary">{stats.streakDays} dias</div>
                <div className="text-sm text-text-secondary">Streak atual</div>
                <div className="flex items-center gap-1 mt-1">
                  {stats.streakShields > 0 && (
                    <>
                      <Shield className="w-3.5 h-3.5 text-neon-cyan" />
                      <span className="text-xs text-neon-cyan">{stats.streakShields} escudo{stats.streakShields > 1 ? 's' : ''}</span>
                    </>
                  )}
                  <span className="text-xs text-text-muted ml-1">Recorde: {stats.longestStreak}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-bg-secondary">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-neon-green" />
              <div>
                <div className="text-lg font-bold text-text-primary">{totalCompleted}/{totalChallenges}</div>
                <div className="text-sm text-text-secondary">Casos resolvidos</div>
                <div className="h-1.5 bg-bg-primary rounded-full mt-2 w-36 overflow-hidden">
                  <div
                    className="h-full bg-neon-green rounded-full transition-all"
                    style={{ width: `${(totalCompleted / totalChallenges) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-bg-secondary">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-neon-gold" />
              <div>
                <div className="text-lg font-bold text-neon-gold glow-text-gold">
                  {(stats as any).totalXp || 0} XP
                </div>
                <div className="text-sm text-text-secondary">XP total acumulado</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Missions */}
      {missions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-magenta" />
            Missões Diárias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {missions.map((m: any) => (
              <div
                key={m.id}
                className={`card bg-bg-secondary flex items-center gap-3 ${
                  m.completed ? 'border-neon-green/20' : 'border-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  m.completed ? 'bg-neon-green/10' : 'bg-neon-magenta/10'
                }`}>
                  {m.completed ? (
                    <span className="text-neon-green text-lg">✓</span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-neon-magenta" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary">{m.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 bg-bg-primary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          m.completed ? 'bg-neon-green' : 'bg-neon-magenta'
                        }`}
                        style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">{m.progress}/{m.target}</span>
                    <span className="text-xs text-neon-gold">{m.xp_reward} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge Levels */}
      {levels.map(level => {
        const levelChallenges = getChallengesByLevel(level);
        const levelCompleted = levelChallenges.filter(
          c => challengeProgress[c.id]?.status === 'completed'
        ).length;
        const isLevelUnlocked = levelChallenges.some(
          c => challengeProgress[c.id] && challengeProgress[c.id].status !== 'locked'
        );
        const isCollapsed = collapsed[level] ?? false;

        return (
          <div key={level} className={!isLevelUnlocked ? 'opacity-50' : ''}>
            {/* Level Header — clickable to collapse (only if unlocked) */}
            <button
              onClick={() => isLevelUnlocked && toggleLevel(level)}
              className={`w-full flex items-center justify-between mb-3 group text-left ${
                !isLevelUnlocked ? 'cursor-default' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {!isLevelUnlocked ? (
                  <Lock className="w-5 h-5 text-text-muted" />
                ) : isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                )}
                <div>
                  <h2 className={`text-lg font-semibold transition-colors ${
                    isLevelUnlocked ? 'text-text-primary group-hover:text-neon-cyan' : 'text-text-muted'
                  }`}>
                    Nível {level}: {levelNames[level]}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {isLevelUnlocked
                      ? levelDescriptions[level]
                      : 'Complete o boss do nível anterior para desbloquear'
                    }
                  </p>
                </div>
              </div>
              {isLevelUnlocked && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">
                    {levelCompleted}/{levelChallenges.length}
                  </span>
                  <div className="h-1.5 w-20 bg-bg-primary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon-cyan rounded-full transition-all"
                      style={{ width: `${(levelCompleted / levelChallenges.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </button>

            {/* Challenge Grid (only if unlocked and not collapsed) */}
            {isLevelUnlocked && !isCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {levelChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    progress={challengeProgress[challenge.id]}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}
