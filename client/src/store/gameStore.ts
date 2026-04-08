import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { PlayerStats, ChallengeProgress, DailyMission, Badge, Rank } from '../types';

function getRankForLevel(level: number): Rank {
  if (level <= 5) return 'Estagiário';
  if (level <= 10) return 'Detetive Junior';
  if (level <= 15) return 'Detetive Sênior';
  if (level <= 20) return 'Inspetor';
  return 'Inspetor-Chefe';
}

function getXpForNextLevel(level: number): number {
  return Math.floor(100 * level * 1.2);
}

interface GameState {
  user: { id: string; email: string; username: string } | null;
  isAuthenticated: boolean;
  stats: PlayerStats | null;
  challengeProgress: Record<string, ChallengeProgress>;
  missions: DailyMission[];
  badges: Badge[];
  loading: boolean;
  xpPopup: { amount: number; bonuses: string[] } | null;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadSession: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchChallengeProgress: () => Promise<void>;
  fetchMissions: () => Promise<void>;
  submitChallenge: (challengeId: string, correct: boolean, timeMs: number, concept: string) => Promise<{ xpGained: number; bonuses: string[] }>;
  showXpPopup: (amount: number, bonuses: string[]) => void;
  hideXpPopup: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  stats: null,
  challengeProgress: {},
  missions: [],
  badges: [],
  loading: false,
  xpPopup: null,

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from('player_stats')
      .select('username')
      .eq('user_id', data.user.id)
      .single();

    set({
      user: { id: data.user.id, email: data.user.email!, username: profile?.username || 'Agent' },
      isAuthenticated: true,
    });
    await get().fetchStats();
    await get().fetchChallengeProgress();
  },

  register: async (username, email, password) => {
    // Pass username in metadata — the DB trigger creates player_stats + challenge_progress
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Erro ao criar conta');

    const userId = data.user.id;

    set({
      user: { id: userId, email: data.user.email!, username },
      isAuthenticated: true,
    });

    // Small delay to ensure the DB trigger has completed
    await new Promise(r => setTimeout(r, 500));
    await get().fetchStats();
    await get().fetchChallengeProgress();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      isAuthenticated: false,
      stats: null,
      challengeProgress: {},
      missions: [],
      badges: [],
    });
  },

  loadSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;
    const { data: profile } = await supabase
      .from('player_stats')
      .select('username')
      .eq('user_id', userId)
      .single();

    // If user was deleted from DB but session still exists, force logout
    if (!profile) {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      return;
    }

    set({
      user: { id: userId, email: session.user.email!, username: profile.username },
      isAuthenticated: true,
    });
    await get().fetchStats();
    await get().fetchChallengeProgress();
  },

  fetchStats: async () => {
    const user = get().user;
    if (!user) return;

    const { data: stats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) return;

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.last_active;
    const daysDiff = Math.floor(
      (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      const newStreak = stats.streak_days + 1;
      const newLongest = Math.max(newStreak, stats.longest_streak);
      await supabase.from('player_stats').update({
        streak_days: newStreak,
        longest_streak: newLongest,
        last_active: today,
      }).eq('user_id', user.id);
      stats.streak_days = newStreak;
      stats.longest_streak = newLongest;
    } else if (daysDiff > 1) {
      if (stats.streak_shields > 0) {
        await supabase.from('player_stats').update({
          streak_shields: stats.streak_shields - 1,
          last_active: today,
        }).eq('user_id', user.id);
        stats.streak_shields -= 1;
      } else {
        await supabase.from('player_stats').update({
          streak_days: 1,
          last_active: today,
        }).eq('user_id', user.id);
        stats.streak_days = 1;
      }
    } else if (daysDiff === 0 && stats.streak_days === 0) {
      await supabase.from('player_stats').update({
        streak_days: 1,
        last_active: today,
      }).eq('user_id', user.id);
      stats.streak_days = 1;
    }

    const { count } = await supabase
      .from('challenge_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    set({
      stats: {
        userId: user.id,
        xp: stats.xp,
        level: stats.level,
        rank: stats.rank as any,
        streakDays: stats.streak_days,
        streakShields: stats.streak_shields,
        longestStreak: stats.longest_streak,
        lastActive: stats.last_active,
        xpForNextLevel: getXpForNextLevel(stats.level),
        challengesCompleted: count || 0,
      } as any,
    });
  },

  fetchChallengeProgress: async () => {
    const user = get().user;
    if (!user) return;

    const { data } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', user.id);

    if (!data) return;

    const map: Record<string, ChallengeProgress> = {};
    for (const p of data) {
      map[p.challenge_id] = {
        challengeId: p.challenge_id,
        status: p.status,
        attempts: p.attempts,
        bestTimeMs: p.best_time_ms,
        completedAt: p.completed_at,
      };
    }
    set({ challengeProgress: map });
  },

  fetchMissions: async () => {
    const user = get().user;
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    let { data: missions } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    if (!missions || missions.length === 0) {
      const defs = [
        { type: 'solve_n', description: 'Resolva 3 desafios hoje', target: 3, xp_reward: 100 },
        { type: 'solve_5', description: 'Resolva 5 desafios hoje', target: 5, xp_reward: 75 },
        { type: 'perfect', description: 'Acerte 1 desafio de primeira', target: 1, xp_reward: 50 },
      ];

      const rows = defs.map(m => ({
        user_id: user.id,
        date: today,
        type: m.type,
        description: m.description,
        target: m.target,
        xp_reward: m.xp_reward,
      }));

      await supabase.from('daily_missions').insert(rows);

      const result = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      missions = result.data || [];
    }

    // Deduplicate by type (keep only the first of each type)
    const seen = new Set<string>();
    missions = missions.filter(m => {
      if (seen.has(m.type)) return false;
      seen.add(m.type);
      return true;
    });

    set({ missions: missions as any });
  },

  submitChallenge: async (challengeId, correct, timeMs, concept) => {
    const user = get().user;
    if (!user) return { xpGained: 0, bonuses: [] };

    // Read current state BEFORE modifying
    const { data: existing } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    // Previous attempts BEFORE this submission
    const previousAttempts = existing ? existing.attempts : 0;

    // Now increment attempts
    if (existing) {
      await supabase.from('challenge_progress').update({
        attempts: previousAttempts + 1,
      }).eq('user_id', user.id).eq('challenge_id', challengeId);
    } else {
      await supabase.from('challenge_progress').insert({
        user_id: user.id,
        challenge_id: challengeId,
        status: correct ? 'completed' : 'available',
        attempts: 1,
      });
    }

    let xpGained = 0;
    const bonuses: string[] = [];

    if (correct) {
      const alreadyCompleted = existing && existing.status === 'completed';

      if (!alreadyCompleted) {
        const isBoss = challengeId.endsWith('-10') || challengeId.endsWith('-8');
        xpGained = isBoss ? 150 : 50;

        // Perfect = zero previous attempts (this is the first try)
        if (previousAttempts === 0) {
          xpGained = Math.floor(xpGained * 1.5);
          bonuses.push('Perfect Run! +50%');
        }

        // Mark completed
        await supabase.from('challenge_progress').update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          best_time_ms: (!existing?.best_time_ms || timeMs < existing.best_time_ms) ? timeMs : existing.best_time_ms,
        }).eq('user_id', user.id).eq('challenge_id', challengeId);

        // Unlock next challenge
        const parts = challengeId.split('-');
        const levelNum = parseInt(parts[0]);
        const challengeNum = parseInt(parts[1]);
        const nextId = `${levelNum}-${challengeNum + 1}`;

        const { data: nextExist } = await supabase
          .from('challenge_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', nextId)
          .single();

        if (nextExist && nextExist.status === 'locked') {
          await supabase.from('challenge_progress').update({ status: 'available' })
            .eq('user_id', user.id).eq('challenge_id', nextId);
        } else if (!nextExist && isBoss) {
          // Unlock next level
          const nextLevel = levelNum + 1;
          if (nextLevel <= 4) {
            const count = nextLevel <= 3 ? 10 : 8;
            const rows = Array.from({ length: count }, (_, i) => ({
              user_id: user.id,
              challenge_id: `${nextLevel}-${i + 1}`,
              status: i === 0 ? 'available' : 'locked',
            }));
            await supabase.from('challenge_progress').insert(rows);
          }
        }

        // Award XP and level up
        const { data: stats } = await supabase
          .from('player_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (stats) {
          let newXp = stats.xp + xpGained;
          let newLevel = stats.level;
          let xpNeeded = getXpForNextLevel(newLevel);

          while (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel++;
            xpNeeded = getXpForNextLevel(newLevel);
          }

          const newRank = getRankForLevel(newLevel);
          if (newLevel !== stats.level) bonuses.push(`Level Up! Nível ${newLevel}`);
          if (newRank !== stats.rank) bonuses.push(`Novo Rank: ${newRank}`);

          let shields = stats.streak_shields;
          if (stats.streak_days > 0 && stats.streak_days % 7 === 0 && shields < 2) {
            shields++;
            bonuses.push('Streak Shield ganho!');
          }

          await supabase.from('player_stats').update({
            xp: newXp,
            level: newLevel,
            rank: newRank,
            streak_shields: shields,
          }).eq('user_id', user.id);
        }
      }

      // Update concept health (correct)
      if (concept) {
        const { data: ch } = await supabase
          .from('concept_health')
          .select('*')
          .eq('user_id', user.id)
          .eq('concept', concept)
          .single();

        if (ch) {
          await supabase.from('concept_health').update({
            health: Math.min(100, ch.health + 20),
            interval_days: ch.interval_days * 2.5,
            consecutive_correct: ch.consecutive_correct + 1,
            last_reviewed: new Date().toISOString().split('T')[0],
          }).eq('user_id', user.id).eq('concept', concept);
        } else {
          await supabase.from('concept_health').insert({
            user_id: user.id,
            concept,
            health: 100,
            interval_days: 2.5,
          });
        }
      }
    } else {
      // Wrong answer — decrease concept health
      if (concept) {
        const { data: ch } = await supabase
          .from('concept_health')
          .select('*')
          .eq('user_id', user.id)
          .eq('concept', concept)
          .single();

        if (ch) {
          await supabase.from('concept_health').update({
            health: Math.max(0, ch.health - 30),
            interval_days: 1,
            consecutive_correct: 0,
            last_reviewed: new Date().toISOString().split('T')[0],
          }).eq('user_id', user.id).eq('concept', concept);
        } else {
          await supabase.from('concept_health').insert({
            user_id: user.id,
            concept,
            health: 70,
            interval_days: 1,
            consecutive_correct: 0,
          });
        }
      }
    }

    // Update daily missions progress
    if (correct) {
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMissions } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('completed', false);

      if (todayMissions) {
        for (const mission of todayMissions) {
          let newProgress = mission.progress;

          if (mission.type === 'solve_n' || mission.type === 'solve_5') {
            newProgress = mission.progress + 1;
          } else if (mission.type === 'perfect') {
            // previousAttempts was captured before incrementing
            if (previousAttempts === 0) {
              newProgress = mission.progress + 1;
            }
          }

          if (newProgress !== mission.progress) {
            const isComplete = newProgress >= mission.target;
            await supabase.from('daily_missions').update({
              progress: newProgress,
              completed: isComplete,
            }).eq('id', mission.id);
          }
        }
      }
    }

    await get().fetchStats();
    await get().fetchChallengeProgress();
    await get().fetchMissions();
    return { xpGained, bonuses };
  },

  showXpPopup: (amount, bonuses) => set({ xpPopup: { amount, bonuses } }),
  hideXpPopup: () => set({ xpPopup: null }),
}));
