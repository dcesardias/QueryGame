import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChallengeById } from '../data/challenges';
import { INVESTIGATION_DB_SQL } from '../data/sampleDb';
import { ensureReady, createDatabase, executeQuery, compareResults } from '../services/sqlEngine';
import { useGameStore } from '../store/gameStore';
import SqlEditor from '../components/SqlEditor';
import ResultTable from '../components/ResultTable';
import SchemaViewer from '../components/SchemaViewer';
import type { QueryResult } from '../types';
import {
  Play, ArrowLeft, Lightbulb, CheckCircle, XCircle,
  Clock, RotateCcw, ChevronRight, Zap,
} from 'lucide-react';

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challenge = getChallengeById(id || '');
  const { submitChallenge, showXpPopup, challengeProgress } = useGameStore();

  const [code, setCode] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
  const [feedback, setFeedback] = useState<{ type: string; message: string } | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!challenge) return;

    let cancelled = false;

    setCode(challenge.initialCode || '');
    setResult(null);
    setExpectedResult(null);
    setFeedback(null);
    setHintIndex(-1);
    setAttempts(0);
    setSolved(challengeProgress[challenge.id]?.status === 'completed');
    setTimer(0);
    setIsRunning(false);
    setDbReady(false);

    const setup = async () => {
      try {
        await ensureReady();
        if (cancelled) return;

        createDatabase(INVESTIGATION_DB_SQL);

        if (challenge.expectedResultCheck) {
          const exp = executeQuery(challenge.expectedResultCheck);
          if (!cancelled) setExpectedResult(exp);
        }

        if (!cancelled) setDbReady(true);
      } catch (err) {
        console.error('Failed to initialize SQL database:', err);
      }
    };

    setup();

    // Start timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Desafio não encontrado.</p>
        <Link to="/" className="text-neon-cyan hover:underline mt-2 inline-block">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const handleRun = () => {
    if (!code.trim() || !dbReady) return;

    setIsRunning(true);

    try {
      createDatabase(INVESTIGATION_DB_SQL);
      const userResult = executeQuery(code);
      setResult(userResult);

      if (userResult.error) {
        setFeedback({ type: 'syntax_error', message: userResult.error });
        setIsRunning(false);
        return;
      }

      if (!expectedResult) {
        setFeedback({ type: 'info', message: 'Query executada com sucesso.' });
        setIsRunning(false);
        return;
      }

      const checkOrder = code.toLowerCase().includes('order by') ||
                         challenge.expectedResultCheck?.toLowerCase().includes('order by');
      const comparison = compareResults(userResult, expectedResult, !!checkOrder);

      setFeedback({ type: comparison.feedbackType, message: comparison.feedback });
      setAttempts(prev => prev + 1);

      if (comparison.correct && !solved) {
        setSolved(true);
        if (timerRef.current) clearInterval(timerRef.current);
        const timeMs = Date.now() - startTimeRef.current;

        submitChallenge(challenge.id, true, timeMs, challenge.concept).then(res => {
          if (res.xpGained > 0) {
            showXpPopup(res.xpGained, res.bonuses);
          }
        });
      } else if (!comparison.correct) {
        submitChallenge(challenge.id, false, 0, challenge.concept);

        // Auto-show hint after 3 failed attempts
        if (attempts + 1 >= 3 && hintIndex < 0) {
          setHintIndex(0);
        }
      }
    } catch (err) {
      console.error('Run error:', err);
      setFeedback({ type: 'syntax_error', message: 'Erro interno ao executar query.' });
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(challenge.initialCode || '');
    setResult(null);
    setFeedback(null);
  };

  const showNextHint = () => {
    setHintIndex(prev => Math.min(prev + 1, challenge.hints.length - 1));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Find next challenge
  const parts = challenge.id.split('-');
  const levelNum = parseInt(parts[0]);
  const challengeNum = parseInt(parts[1]);
  const nextId = `${levelNum}-${challengeNum + 1}`;
  const nextChallenge = getChallengeById(nextId);
  const nextAvailable = nextChallenge && challengeProgress[nextId]?.status !== 'locked';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {challenge.isBoss && (
                <span className="text-xs font-bold text-neon-magenta bg-neon-magenta/10 px-2 py-0.5 rounded">
                  BOSS
                </span>
              )}
              <h1 className={`text-xl font-bold ${challenge.isBoss ? 'text-neon-magenta' : 'text-text-primary'}`}>
                {challenge.title}
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
              <span>Nível {challenge.level}</span>
              <span>•</span>
              <span className="capitalize">{challenge.type}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-neon-gold" />
                <span className="text-neon-gold">{challenge.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTime(timer)}</span>
          </div>
          {solved && (
            <div className="flex items-center gap-1.5 text-neon-green">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Resolvido</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {!dbReady && (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary mt-4 text-sm">Carregando banco de dados...</p>
        </div>
      )}

      {dbReady && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Schema */}
          <div className="lg:col-span-1 space-y-4">
            {/* Briefing */}
            <div className="card bg-bg-secondary border-white/5">
              <h3 className="text-sm font-semibold text-neon-cyan mb-2">Briefing do Caso</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{challenge.briefing}</p>
            </div>

            <SchemaViewer />

            {/* Hints */}
            <div className="card bg-bg-secondary border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-neon-magenta" />
                  <h3 className="text-sm font-semibold text-text-primary">Dicas</h3>
                </div>
                {hintIndex < challenge.hints.length - 1 && (
                  <button
                    onClick={showNextHint}
                    className="text-xs text-neon-magenta hover:underline"
                  >
                    {hintIndex < 0 ? 'Mostrar dica' : 'Próxima dica'}
                  </button>
                )}
              </div>
              {hintIndex >= 0 ? (
                <div className="space-y-2">
                  {challenge.hints.slice(0, hintIndex + 1).map((hint, i) => (
                    <div key={i} className="text-sm text-text-secondary bg-neon-magenta/5 rounded-lg px-3 py-2 font-mono">
                      {hint}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">
                  {attempts < 3
                    ? `Tente resolver primeiro! (dica disponível após ${3 - attempts} tentativa${3 - attempts !== 1 ? 's' : ''})`
                    : 'Clique em "Mostrar dica" para ajuda.'
                  }
                </p>
              )}
            </div>
          </div>

          {/* Right: Editor + Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <div className="card bg-bg-secondary border-white/5">
              <p className="text-text-primary">{challenge.description}</p>
            </div>

            {/* SQL Editor */}
            <div>
              <SqlEditor value={code} onChange={setCode} onRun={handleRun} />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={handleRun} disabled={isRunning || !code.trim()} className="btn-primary flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Executar
                </button>
                <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                {solved && nextAvailable && (
                  <Link to={`/challenge/${nextId}`} className="btn-primary flex items-center gap-2 bg-neon-green text-bg-primary hover:shadow-neon-green ml-auto">
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
                  feedback.type === 'correct'
                    ? 'bg-neon-green/5 border-neon-green/30'
                    : feedback.type === 'syntax_error'
                      ? 'bg-neon-red/5 border-neon-red/30'
                      : 'bg-neon-orange/5 border-neon-orange/30'
                }`}
              >
                {feedback.type === 'correct' ? (
                  <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-medium ${
                    feedback.type === 'correct' ? 'text-neon-green' : 'text-neon-red'
                  }`}>
                    {feedback.type === 'correct' ? 'Correto!' : 'Incorreto'}
                  </div>
                  <div className="text-sm text-text-secondary mt-0.5">{feedback.message}</div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && !result.error && (
              <ResultTable
                result={result}
                label="Seu resultado"
                highlight={feedback?.type === 'correct' ? 'success' : feedback ? 'error' : 'neutral'}
              />
            )}

            {/* Expected result (show after solving or after 5 attempts) */}
            {expectedResult && (solved || attempts >= 5) && (
              <ResultTable
                result={expectedResult}
                label="Resultado esperado"
                highlight="neutral"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
