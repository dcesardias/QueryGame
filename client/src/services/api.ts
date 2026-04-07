const API_BASE = '/api';

export const api = {
  leaderboard: async () => {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },
};
