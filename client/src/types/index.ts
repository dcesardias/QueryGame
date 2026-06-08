export interface User {
  id: string;
  username: string;
  email: string;
}

export interface PlayerStats {
  userId: string;
  xp: number;
  level: number;
  rank: Rank;
  streakDays: number;
  streakShields: number;
  longestStreak: number;
  lastActive: string;
}

export type Rank =
  | 'Estagiário'
  | 'Detetive Junior'
  | 'Detetive Sênior'
  | 'Inspetor'
  | 'Inspetor-Chefe';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  briefing: string;
  level: number;
  category: ChallengeCategory;
  type: ChallengeType;
  difficulty: number;
  xpReward: number;
  concept: string;
  initialCode?: string;
  expectedQuery?: string;
  expectedResultCheck: string;
  hints: string[];
  isBoss: boolean;
  setupSql: string;
  sampleDbKey: string;
}

export type ChallengeCategory =
  | 'fundamentals'
  | 'aggregation'
  | 'joins'
  | 'advanced';

export type ChallengeType =
  | 'write'
  | 'fix'
  | 'complete'
  | 'optimize';

export interface ChallengeProgress {
  challengeId: string;
  status: 'locked' | 'available' | 'completed';
  attempts: number;
  bestTimeMs?: number;
  completedAt?: string;
}

export interface ConceptHealth {
  concept: string;
  health: number;
  intervalDays: number;
  lastReviewed: string;
  consecutiveCorrect: number;
}

export interface DailyMission {
  id: string;
  type: MissionType;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}

export type MissionType =
  | 'solve_n'
  | 'review'
  | 'perfect'
  | 'explorer'
  | 'speed';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  error?: string;
}

export interface SubmissionResult {
  correct: boolean;
  feedback: FeedbackType;
  message: string;
  expected?: QueryResult;
  actual?: QueryResult;
  xpGained: number;
  bonuses: string[];
}

export type FeedbackType =
  | 'correct'
  | 'wrong_columns'
  | 'wrong_rows'
  | 'wrong_values'
  | 'wrong_order'
  | 'syntax_error'
  | 'timeout';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  playerRank: Rank;
}

export function getRankForLevel(level: number): Rank {
  if (level <= 5) return 'Estagiário';
  if (level <= 10) return 'Detetive Junior';
  if (level <= 15) return 'Detetive Sênior';
  if (level <= 20) return 'Inspetor';
  return 'Inspetor-Chefe';
}

export function getXpForNextLevel(currentLevel: number): number {
  return Math.floor(100 * currentLevel * 1.2);
}

/** Map a challenge difficulty (1–8 in the dataset) onto the 1–5 pip scale. */
export function difficultyToPips(difficulty: number): number {
  return Math.max(1, Math.min(5, Math.ceil((difficulty / 8) * 5)));
}

/** Brass chevron count for a rank's <Insignia> (0–4). */
export function getRankChevrons(rank: Rank): number {
  switch (rank) {
    case 'Estagiário': return 0;
    case 'Detetive Junior': return 1;
    case 'Detetive Sênior': return 2;
    case 'Inspetor': return 3;
    case 'Inspetor-Chefe': return 4;
  }
}
