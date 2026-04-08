import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initSqlEngine, ensureReady, createDatabase, executeQuery } from '../services/sqlEngine';
import SqlEditor from '../components/SqlEditor';
import ResultTable from '../components/ResultTable';
import type { QueryResult } from '../types';
import { ChevronRight, ChevronLeft, Terminal, Database, Search, Filter, Zap } from 'lucide-react';

// Mini database for onboarding
const ONBOARDING_DB = `
  CREATE TABLE agentes (
    nome TEXT,
    rank TEXT,
    missoes_completas INTEGER
  );
  INSERT INTO agentes VALUES ('Garcia', 'Inspetor', 15);
  INSERT INTO agentes VALUES ('Nakamura', 'Detetive', 8);
  INSERT INTO agentes VALUES ('Torres', 'Recruta', 0);
  INSERT INTO agentes VALUES ('Park', 'Detetive', 12);
  INSERT INTO agentes VALUES ('Você', 'Recruta', 0);
`;

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  narrative: string;
  explanation: string[];
  task?: string;
  hint?: string;
  prefill?: string;
  validation?: (result: QueryResult) => boolean;
  showTable?: boolean;
  conceptDemo?: string;
}

const steps: Step[] = [
  {
    id: 0,
    icon: <Terminal className="w-6 h-6" />,
    title: 'Bem-vindo à DIA',
    narrative: 'Recruta, bem-vindo à Data Investigation Agency. Aqui, resolvemos crimes analisando dados. Nossa arma? Uma linguagem chamada SQL.',
    explanation: [
      'SQL (Structured Query Language) é a linguagem universal para conversar com bancos de dados.',
      'Um banco de dados é como uma planilha gigante — organiza informações em tabelas com linhas e colunas.',
      'Vamos começar com o básico. Pronto?',
    ],
  },
  {
    id: 1,
    icon: <Database className="w-6 h-6" />,
    title: 'O que é uma tabela?',
    narrative: 'Todo banco de dados guarda informações em tabelas. Pense numa tabela como uma planilha do Excel. Veja a tabela "agentes" da DIA:',
    explanation: [
      'Cada linha é um registro (um agente).',
      'Cada coluna é uma informação (nome, rank, missões).',
      'Para ver uma tabela, usamos o comando SELECT.',
    ],
    conceptDemo: 'SELECT * FROM agentes',
    showTable: true,
  },
  {
    id: 2,
    icon: <Search className="w-6 h-6" />,
    title: 'SELECT — Seu primeiro comando',
    narrative: 'O comando SELECT diz ao banco: "me mostra esses dados". O asterisco (*) significa "todas as colunas". O FROM diz de qual tabela.',
    explanation: [
      'SELECT = o que você quer ver',
      '* = tudo (todas as colunas)',
      'FROM = de qual tabela',
      '',
      'Juntando: SELECT * FROM agentes',
      '→ "Me mostra tudo da tabela agentes"',
    ],
    task: 'Sua vez! Digite o comando para ver todos os agentes:',
    hint: 'SELECT * FROM agentes',
    prefill: '',
    validation: (result) => result.columns.length === 3 && result.rows.length === 5,
  },
  {
    id: 3,
    icon: <Search className="w-6 h-6" />,
    title: 'Escolhendo colunas',
    narrative: 'Às vezes você não quer ver tudo — só algumas informações. Em vez de *, liste as colunas pelo nome.',
    explanation: [
      'SELECT nome, rank FROM agentes',
      '→ "Me mostra só o nome e o rank de cada agente"',
      '',
      'Separe as colunas com vírgula.',
    ],
    task: 'Mostre apenas o nome e as missões completas dos agentes:',
    hint: 'SELECT nome, missoes_completas FROM agentes',
    prefill: 'SELECT ',
    validation: (result) => result.columns.length === 2 && result.columns.some(c => c === 'missoes_completas'),
  },
  {
    id: 4,
    icon: <Filter className="w-6 h-6" />,
    title: 'WHERE — Filtrando dados',
    narrative: 'Em uma investigação, você não quer todos os dados — quer dados específicos. O WHERE filtra resultados.',
    explanation: [
      'SELECT * FROM agentes WHERE rank = \'Detetive\'',
      '→ "Me mostra agentes que são Detetives"',
      '',
      'O WHERE vem depois do FROM.',
      'Textos ficam entre aspas simples: \'Detetive\'',
    ],
    task: 'Encontre todos os Recrutas na agência:',
    hint: 'SELECT * FROM agentes WHERE rank = \'Recruta\'',
    prefill: 'SELECT * FROM agentes WHERE ',
    validation: (result) => result.rows.length === 2 && !result.error,
  },
  {
    id: 5,
    icon: <Filter className="w-6 h-6" />,
    title: 'WHERE com números',
    narrative: 'Filtros também funcionam com números. Você pode usar =, >, <, >= e <= para comparar.',
    explanation: [
      'SELECT * FROM agentes WHERE missoes_completas > 10',
      '→ "Agentes com mais de 10 missões"',
      '',
      '> maior que    < menor que',
      '>= maior ou igual    <= menor ou igual',
      '= igual',
    ],
    task: 'Encontre agentes com mais de 5 missões completas:',
    hint: 'SELECT * FROM agentes WHERE missoes_completas > 5',
    prefill: 'SELECT * FROM agentes WHERE missoes_completas ',
    validation: (result) => result.rows.length === 3 && !result.error,
  },
  {
    id: 6,
    icon: <Zap className="w-6 h-6" />,
    title: 'Missão de recrutamento completa!',
    narrative: 'Excelente trabalho, recruta! Você já sabe o básico de SQL. Vamos recapitular:',
    explanation: [
      'SELECT — escolhe o que ver (* = tudo, ou liste colunas)',
      'FROM — de qual tabela buscar',
      'WHERE — filtra os resultados',
      '',
      'Com esses 3 comandos você já consegue investigar dados.',
      'Agora vamos para os casos reais!',
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [demoResult, setDemoResult] = useState<QueryResult | null>(null);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const hasTask = !!step.task;

  useEffect(() => {
    const setup = async () => {
      await ensureReady();
      createDatabase(ONBOARDING_DB);
      setDbReady(true);
    };
    setup();
  }, []);

  useEffect(() => {
    setCode(step.prefill || '');
    setResult(null);
    setDemoResult(null);
    setTaskCompleted(false);
    setShowHint(false);
    setFailedAttempts(0);
    setFeedback('');

    if (step.conceptDemo && dbReady) {
      createDatabase(ONBOARDING_DB);
      const res = executeQuery(step.conceptDemo);
      setDemoResult(res);
    }
  }, [currentStep, dbReady]);

  const handleRun = () => {
    if (!code.trim() || !dbReady) return;

    createDatabase(ONBOARDING_DB);
    const res = executeQuery(code);
    setResult(res);

    if (res.error) {
      setFeedback(res.error);
      setFailedAttempts(prev => prev + 1);
      return;
    }

    if (step.validation && step.validation(res)) {
      setTaskCompleted(true);
      setFeedback('');
    } else {
      setFailedAttempts(prev => {
        const next = prev + 1;
        if (next >= 2) setShowHint(true);
        return next;
      });
      setFeedback('Quase! O resultado não é o esperado. Tente de novo.');
    }
  };

  const goNext = () => {
    if (isLastStep) {
      localStorage.setItem('querygame_onboarding_done', 'true');
      navigate('/');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (!isFirstStep) setCurrentStep(prev => prev - 1);
  };

  // Progress dots
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/[0.02] via-transparent to-neon-magenta/[0.02]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted font-mono">
              Treinamento {currentStep + 1}/{steps.length}
            </span>
            <button
              onClick={() => {
                localStorage.setItem('querygame_onboarding_done', 'true');
                navigate('/');
              }}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Pular introdução →
            </button>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00f0ff, #ff00aa)',
              }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card bg-bg-secondary/80 backdrop-blur-sm border-neon-cyan/10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
              {step.icon}
            </div>
            <h2 className="text-xl font-bold text-text-primary">{step.title}</h2>
          </div>

          {/* Narrative */}
          <div className="bg-bg-primary/50 rounded-lg px-4 py-3 mb-4 border-l-2 border-neon-cyan/50">
            <p className="text-text-primary text-sm leading-relaxed">{step.narrative}</p>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5 mb-5">
            {step.explanation.map((line, i) =>
              line === '' ? (
                <div key={i} className="h-2" />
              ) : line.startsWith('SELECT') || line.startsWith('→') || line.startsWith('>') || line.startsWith('*') || line.startsWith('=') ? (
                <p key={i} className="text-sm font-mono text-neon-cyan/90 bg-bg-primary/50 rounded px-3 py-1">
                  {line}
                </p>
              ) : (
                <p key={i} className="text-sm text-text-secondary">{line}</p>
              )
            )}
          </div>

          {/* Concept demo table */}
          {step.showTable && demoResult && (
            <div className="mb-5">
              <div className="text-xs text-text-muted mb-1.5 font-mono">
                {'>'} {step.conceptDemo}
              </div>
              <ResultTable result={demoResult} highlight="neutral" maxRows={10} />
            </div>
          )}

          {/* Task */}
          {hasTask && dbReady && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-neon-magenta">{step.task}</p>

              <SqlEditor value={code} onChange={setCode} onRun={handleRun} />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRun}
                  disabled={!code.trim()}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  Executar
                </button>

                {showHint && step.hint && (
                  <div className="text-xs text-text-muted bg-neon-magenta/5 rounded-lg px-3 py-1.5 font-mono border border-neon-magenta/10">
                    Dica: <span className="text-neon-magenta">{step.hint}</span>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {feedback && !taskCompleted && (
                <div className="text-sm text-neon-red bg-neon-red/5 rounded-lg px-3 py-2">
                  {feedback}
                </div>
              )}

              {/* Result */}
              {result && !result.error && (
                <ResultTable
                  result={result}
                  highlight={taskCompleted ? 'success' : 'neutral'}
                  maxRows={10}
                />
              )}

              {/* Success */}
              {taskCompleted && (
                <div className="text-sm text-neon-green bg-neon-green/5 rounded-lg px-3 py-2 border border-neon-green/20">
                  Correto! Você está pegando o jeito.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <button
              onClick={goBack}
              disabled={isFirstStep}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isFirstStep ? 'text-text-muted cursor-default' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>

            <button
              onClick={goNext}
              disabled={hasTask && !taskCompleted}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                hasTask && !taskCompleted
                  ? 'text-text-muted cursor-default'
                  : isLastStep
                    ? 'btn-primary'
                    : 'text-neon-cyan hover:glow-text-cyan'
              }`}
            >
              {isLastStep ? 'Começar os casos!' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative */}
        <div className="mt-4 font-mono text-xs text-text-muted/30 text-center">
          {'>'} DIA Training Protocol v1.0 — SQL Fundamentals
        </div>
      </div>
    </div>
  );
}
