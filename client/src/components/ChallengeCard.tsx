import { useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import Pips from './ui/Pips';
import Chip from './ui/Chip';
import { difficultyToPips } from '../types';
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
  const isBoss = challenge.isBoss;
  const statusClass = isCompleted ? 'is-solved' : isLocked ? 'is-locked' : 'is-available';

  return (
    <button
      onClick={() => !isLocked && navigate(`/challenge/${challenge.id}`)}
      disabled={isLocked}
      className={`case-card ${statusClass}${isBoss ? ' is-boss' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="mono faint text-[11px] tracking-[0.1em]">CASO Nº {challenge.id}</span>
        {isCompleted && <Check size={16} className="text-sage" />}
        {isLocked && <Lock size={14} className="text-ink-3" />}
        {isBoss && !isLocked && !isCompleted && <Chip variant="ox">Prioritário</Chip>}
      </div>

      <div>
        <div
          className="display text-[19px] font-semibold leading-tight"
          style={{ color: isBoss && !isLocked ? 'var(--oxblood)' : 'var(--ink)' }}
        >
          {challenge.title}
        </div>
        <div className="muted text-[13px] mt-1.5 leading-snug line-clamp-2">{challenge.description}</div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <Chip variant={isBoss ? 'ox' : 'brass'}>{challenge.concept.replace(/_/g, ' ')}</Chip>
        <div className="flex items-center gap-2.5">
          <Pips level={difficultyToPips(challenge.difficulty)} ox={isBoss} />
          <span className="mono text-[12px] text-brass">+{challenge.xpReward}</span>
        </div>
      </div>
    </button>
  );
}
