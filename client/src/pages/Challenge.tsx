import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChallengeById } from '../data/challenges';
import { getLesson } from '../data/lessons';
import { INVESTIGATION_DB_SQL } from '../data/sampleDb';
import { ensureReady, createDatabase, executeQuery, compareResults } from '../services/sqlEngine';
import { useGameStore } from '../store/gameStore';
import SqlEditor from '../components/SqlEditor';
import ResultTable from '../components/ResultTable';
import SchemaViewer from '../components/SchemaViewer';
import Pips from '../components/ui/Pips';
import Stamp from '../components/ui/Stamp';
import { difficultyToPips } from '../types';
import type { QueryResult } from '../types';
import {
  Play, ArrowLeft, Lightbulb, CheckCircle, XCircle,
  Clock, RotateCcw, ArrowRight, Search, GraduationCap,
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
  const [hintIndex, setHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [justSolved, setJustSolved] = useState(false);
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
    setHintIndex(0);
    setAttempts(0);
    setFailedAttempts(0);
    setSolved(challengeProgress[challenge.id]?.status === 'completed');
    setJustSolved(false);
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
        <p className="muted">Caso não encontrado.</p>
        <Link to="/" className="text-brass hover:underline mt-2 inline-block">
          Voltar ao arquivo
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

      // A ordem das linhas só importa quando o desafio diz que importa
      // (orderMatters) ou, na ausência da flag, quando o GABARITO ordena o
      // resultado final. Nunca inferimos da query do aluno: adicionar um
      // ORDER BY inofensivo não deve reprovar uma resposta correta.
      const checkOrder = challenge.orderMatters ??
        !!challenge.expectedResultCheck?.toLowerCase().includes('order by');
      const comparison = compareResults(
        userResult,
        expectedResult,
        checkOrder,
        !!challenge.enforceColumnNames,
      );

      setFeedback({ type: comparison.feedbackType, message: comparison.feedback });
      setAttempts(prev => prev + 1);

      if (comparison.correct && !solved) {
        setSolved(true);
        setJustSolved(true);
        if (timerRef.current) clearInterval(timerRef.current);
        const timeMs = Date.now() - startTimeRef.current;

        submitChallenge(challenge.id, true, timeMs, challenge.concept).then(res => {
          if (res.xpGained > 0) {
            showXpPopup(res.xpGained, res.bonuses);
          }
        });
      } else if (!comparison.correct) {
        const newFailed = failedAttempts + 1;
        setFailedAttempts(newFailed);
        submitChallenge(challenge.id, false, 0, challenge.concept);

        // Scaffolding progressivo: a cada erro, revela mais uma pista
        // (a primeira — o conceito — já está visível desde o início).
        setHintIndex(prev => Math.min(prev + 1, challenge.hints.length - 1));
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

  const feedbackOk = feedback?.type === 'correct';
  const feedbackColor = feedbackOk ? 'var(--sage)' : 'var(--oxblood)';
  const lesson = getLesson(challenge.concept);

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 mb-6">
        <div className="flex items-center gap-3.5">
          <button onClick={() => navigate('/')} className="btn-secondary btn-sm">
            <ArrowLeft size={15} />
            Arquivo
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="mono faint text-xs tracking-[0.1em]">CASO Nº {challenge.id}</span>
              {challenge.isBoss && <span className="chip chip-ox">Prioritário</span>}
            </div>
            <h1
              className="display sec-h text-[28px] font-bold mt-1"
              style={{ color: challenge.isBoss ? 'var(--oxblood)' : 'var(--ink)' }}
            >
              {challenge.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-1.5 text-ink-2">
            <Clock size={15} />
            <span className="mono text-[13px]">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Pips level={difficultyToPips(challenge.difficulty)} ox={challenge.isBoss} />
            <span className="mono brass text-[13px]">+{challenge.xpReward} XP</span>
          </div>
          {solved && <Stamp label="Resolvido" kind="solved" animate={justSolved} />}
        </div>
      </div>

      {/* Loading state */}
      {!dbReady && (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-line border-t-brass rounded-full animate-spin mx-auto" />
          <p className="muted mt-4 text-sm">Carregando banco de dados…</p>
        </div>
      )}

      {dbReady && (
        <div
          className="grid gap-[22px] items-start case-layout"
          style={{ gridTemplateColumns: '0.85fr 1.3fr' }}
        >
          {/* LEFT — dossier */}
          <div className="flex flex-col gap-4">
            {/* Conceito — mini-lição (ensina ANTES de tentar) */}
            {lesson && (
              <div className="card border-l-[3px] border-l-brass">
                <div className="flex items-center gap-2 mb-2.5">
                  <GraduationCap size={16} className="text-brass" />
                  <span className="eyebrow">Conceito · {lesson.title}</span>
                </div>
                <p className="text-ink text-[14px] leading-relaxed m-0">{lesson.summary}</p>
                {lesson.syntax && (
                  <div className="mt-3">
                    <div className="kicker mb-1">Sintaxe</div>
                    <p className="mono text-[12.5px] text-brass-bright bg-bg-deep border border-line rounded px-3 py-1.5 m-0 overflow-x-auto">
                      {lesson.syntax}
                    </p>
                  </div>
                )}
                {lesson.example && (
                  <div className="mt-2.5">
                    <div className="kicker mb-1">Exemplo</div>
                    <p className="mono text-[12.5px] text-ink-2 bg-bg-deep border border-line rounded px-3 py-1.5 m-0 overflow-x-auto">
                      {lesson.example}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Briefing */}
            <div className="card">
              <div className="eyebrow mb-2.5">Briefing do caso</div>
              <p className="muted text-[14.5px] leading-relaxed m-0">{challenge.briefing}</p>
            </div>

            <SchemaViewer />

            {/* Hints — "Linha de raciocínio" */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-brass" />
                  <span className="eyebrow">Linha de raciocínio</span>
                </div>
                {hintIndex < challenge.hints.length - 1 && (
                  <button onClick={showNextHint} className="btn-secondary btn-sm">
                    Próxima dica
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                {challenge.hints.slice(0, hintIndex + 1).map((hint, i) => (
                  <div key={i} className="fade-up flex items-start gap-2.5 text-[13.5px] text-ink-2 leading-relaxed">
                    <span className="mono brass shrink-0">{i + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
              {hintIndex < challenge.hints.length - 1 && (
                <p className="faint text-[12px] m-0 mt-3 leading-relaxed">
                  Tente resolver com a pista acima. Mais pistas aparecem a cada
                  tentativa — ou clique em "Próxima dica".
                </p>
              )}
            </div>
          </div>

          {/* RIGHT — work */}
          <div className="flex flex-col gap-4">
            {/* Task — "Sua missão" */}
            <div className="card flex items-start gap-3 border-l-[3px] border-l-brass">
              <Search size={18} className="text-brass mt-0.5 shrink-0" />
              <div>
                <div className="kicker mb-1">Sua missão</div>
                <p className="text-[15.5px] m-0 leading-relaxed text-ink">{challenge.description}</p>
              </div>
            </div>

            {/* SQL Editor */}
            <div>
              <SqlEditor value={code} onChange={setCode} onRun={handleRun} />
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button onClick={handleRun} disabled={isRunning || !code.trim()} className="btn-primary">
                  <Play size={15} />
                  Investigar
                </button>
                <button onClick={handleReset} className="btn-secondary">
                  <RotateCcw size={15} />
                  Reiniciar
                </button>
                {solved && nextAvailable && (
                  <Link to={`/challenge/${nextId}`} className="btn-solve ml-auto">
                    Próximo caso
                    <ArrowRight size={15} />
                  </Link>
                )}
                {solved && !nextAvailable && (
                  <Link to="/" className="btn-solve ml-auto">
                    Voltar ao arquivo
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className="fade-up flex items-start gap-3 px-4 py-3.5"
                style={{
                  borderRadius: 'var(--r)',
                  border: `1px solid color-mix(in srgb, ${feedbackColor} 55%, transparent)`,
                  borderLeft: `3px solid ${feedbackColor}`,
                  background: `color-mix(in srgb, ${feedbackColor} 15%, var(--panel))`,
                }}
              >
                {feedbackOk ? (
                  <CheckCircle size={19} className="shrink-0 mt-0.5" style={{ color: feedbackColor }} />
                ) : (
                  <XCircle size={19} className="shrink-0 mt-0.5" style={{ color: feedbackColor }} />
                )}
                <div>
                  <div className="display font-semibold text-[16.5px]" style={{ color: feedbackColor }}>
                    {feedbackOk
                      ? 'Caso encerrado.'
                      : feedback.type === 'syntax_error'
                        ? 'A consulta falhou.'
                        : 'Ainda não.'}
                  </div>
                  <div className="text-[13.5px] mt-0.5 text-ink">{feedback.message}</div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && !result.error && (
              <ResultTable
                result={result}
                label="Seu resultado"
                highlight={feedbackOk ? 'success' : feedback ? 'error' : 'neutral'}
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
