import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useGameStore } from '../store/gameStore';
import { Trophy, Medal, Crown } from 'lucide-react';

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

  const getPositionIcon = (pos: number) => {
    switch (pos) {
      case 1: return <Crown className="w-5 h-5 text-neon-gold" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm text-text-muted font-mono">{pos}</span>;
    }
  };

  const getPositionStyle = (pos: number) => {
    switch (pos) {
      case 1: return 'border-neon-gold/30 bg-neon-gold/5';
      case 2: return 'border-gray-300/20 bg-gray-300/5';
      case 3: return 'border-amber-600/20 bg-amber-600/5';
      default: return 'border-white/5 bg-transparent';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-neon-gold" />
        <h1 className="text-2xl font-bold text-text-primary">Ranking Global</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
          <p className="text-text-muted mt-3">Carregando ranking...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="card bg-bg-secondary text-center py-8">
          <p className="text-text-secondary">Nenhum agente no ranking ainda.</p>
          <p className="text-sm text-text-muted mt-1">Resolva desafios para aparecer aqui!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const isCurrentUser = entry.username === user?.username;
            return (
              <div
                key={entry.position}
                className={`card flex items-center gap-4 transition-all ${
                  getPositionStyle(entry.position)
                } ${isCurrentUser ? 'ring-1 ring-neon-cyan/30' : ''}`}
              >
                {/* Position */}
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getPositionIcon(entry.position)}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCurrentUser ? 'bg-neon-cyan/20' : 'bg-surface'
                }`}>
                  <span className={`font-bold ${isCurrentUser ? 'text-neon-cyan' : 'text-text-secondary'}`}>
                    {entry.username[0].toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${isCurrentUser ? 'text-neon-cyan' : 'text-text-primary'}`}>
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-neon-cyan/10 text-neon-cyan px-1.5 py-0.5 rounded">
                        Você
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Nv.{entry.level} — {entry.rank}
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="font-bold text-neon-gold font-mono">{entry.xp.toLocaleString()}</div>
                  <div className="text-xs text-text-muted">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
