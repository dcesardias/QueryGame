import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, Star, Zap } from 'lucide-react';
import type { Challenge, ChallengeProgress } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: ChallengeProgress;
}

export default function ChallengeCard({ challenge, progress }: ChallengeCardProps) {
  const navigate = useNavigate();
  const status = progress?.status || 'locked';

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <button
      onClick={() => !isLocked && navigate(`/challenge/${challenge.id}`)}
      disabled={isLocked}
      className={`
        card text-left w-full transition-all duration-200
        ${isLocked
          ? 'opacity-40 cursor-not-allowed border-white/5'
          : isCompleted
            ? 'border-neon-green/30 hover:shadow-neon-green cursor-pointer'
            : 'border-neon-cyan/20 hover:border-neon-cyan/40 hover:shadow-neon-cyan cursor-pointer'
        }
        ${challenge.isBoss && !isLocked
          ? 'border-neon-magenta/30 hover:border-neon-magenta/50 hover:shadow-neon-magenta ring-1 ring-neon-magenta/10'
          : ''
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {challenge.isBoss && (
              <span className="text-xs font-bold text-neon-magenta bg-neon-magenta/10 px-2 py-0.5 rounded">
                BOSS
              </span>
            )}
            <h3 className={`font-semibold truncate ${
              challenge.isBoss ? 'text-neon-magenta' : 'text-text-primary'
            }`}>
              {challenge.title}
            </h3>
          </div>
          <p className="text-sm text-text-secondary line-clamp-2">{challenge.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-neon-gold" />
              <span className="text-xs text-neon-gold">{challenge.xpReward} XP</span>
            </div>
            <span className="text-xs text-text-muted capitalize">{challenge.type}</span>
            {progress?.attempts ? (
              <span className="text-xs text-text-muted">
                {progress.attempts} tentativa{progress.attempts !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex-shrink-0">
          {isLocked && <Lock className="w-5 h-5 text-text-muted" />}
          {isCompleted && <CheckCircle className="w-5 h-5 text-neon-green" />}
          {status === 'available' && !challenge.isBoss && (
            <Star className="w-5 h-5 text-neon-cyan" />
          )}
          {status === 'available' && challenge.isBoss && (
            <Star className="w-5 h-5 text-neon-magenta" />
          )}
        </div>
      </div>

      {/* Difficulty dots */}
      <div className="flex gap-1 mt-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < challenge.difficulty
                ? challenge.isBoss
                  ? 'bg-neon-magenta'
                  : 'bg-neon-cyan'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </button>
  );
}
