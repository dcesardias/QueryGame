import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initSqlEngine, ensureReady, createDatabase, executeQuery } from '../services/sqlEngine';
import SqlEditor from '../components/SqlEditor';
import ResultTable from '../components/ResultTable';
import type { QueryResult } from '../types';
import { ChevronRight, ChevronLeft, Terminal, Database, Search, Filter, Zap, Check } from 'lucide-react';

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
    narrative: 'Todo banco de dados guarda informações em tabelas. Pense numa planilha: cada linha é um registro e cada coluna é um tipo de informação.',
    explanation: [
      'Abaixo está a tabela agentes da DIA. Ela tem 3 colunas:',
      '',
      'nome — o nome do agente',
      'rank — o cargo (Inspetor, Detetive, Recruta)',
      'missoes_completas — quantas missões já resolveu',
      '',
      'Para pedir dados ao banco, usamos comandos SQL. Vamos aprender o primeiro!',
    ],
    conceptDemo: 'SELECT * FROM agentes',
    showTable: true,
  },
  {
    id: 2,
    icon: <Search className="w-6 h-6" />,
    title: 'SELECT — Seu primeiro comando',
    narrative: 'O comando SELECT diz ao banco: "me mostra esses dados". Ele sempre vem acompanhado do FROM, que diz de qual tabela buscar.',
    explanation: [
      'SELECT * FROM agentes',
      '',
      'Traduzindo cada parte:',
      'SELECT = "me mostra"',
      '* = "tudo" (todas as colunas)',
      'FROM agentes = "da tabela agentes"',
      '',
      '→ Resultado: mostra nome, rank e missoes_completas de todos os agentes.',
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
    narrative: 'Às vezes você não quer ver tudo — só algumas informações. Em vez de *, escreva os nomes das colunas que quer ver.',
    explanation: [
      'Lembre: a tabela agentes tem estas colunas:',
      'nome — rank — missoes_completas',
      '',
      'Para ver só duas delas, liste separando com vírgula:',
      'SELECT nome, rank FROM agentes',
      '→ "Mostra só o nome e o rank de cada agente"',
    ],
    task: 'Agora mostre apenas o nome e a coluna missoes_completas:',
    hint: 'SELECT nome, missoes_completas FROM agentes',
    prefill: 'SELECT nome, ',
    validation: (result) => result.columns.length === 2 && result.columns.some(c => c === 'missoes_completas'),
  },
  {
    id: 4,
    icon: <Filter className="w-6 h-6" />,
    title: 'WHERE — Filtrando dados',
    narrative: 'Em uma investigação, você não quer todos os dados — quer dados específicos. O WHERE filtra os resultados, mostrando só o que interessa.',
    explanation: [
      'O WHERE vem depois do FROM:',
      'SELECT * FROM agentes WHERE rank = \'Detetive\'',
      '→ "Mostra agentes que são Detetives"',
      '',
      'Importante: textos ficam entre aspas simples.',
      '',
      'Na tabela agentes, a coluna rank tem 3 valores possíveis:',
      '\'Inspetor\' — \'Detetive\' — \'Recruta\'',
    ],
    task: 'Encontre todos os agentes que são Recrutas:',
    hint: 'SELECT * FROM agentes WHERE rank = \'Recruta\'',
    prefill: 'SELECT * FROM agentes WHERE ',
    validation: (result) => result.rows.length === 2 && !result.error,
  },
  {
    id: 5,
    icon: <Filter className="w-6 h-6" />,
    title: 'WHERE com números',
    narrative: 'Filtros também funcionam com números! Você pode usar sinais de comparação para encontrar valores maiores, menores ou iguais.',
    explanation: [
      'Os operadores de comparação:',
      '>  maior que        <  menor que',
      '>= maior ou igual   <= menor ou igual',
      '=  igual',
      '',
      'Exemplo com a coluna missoes_completas:',
      'SELECT * FROM agentes WHERE missoes_completas > 10',
      '→ "Agentes com mais de 10 missões completas"',
      '→ Retorna: Garcia (15) e Park (12)',
    ],
    task: 'Encontre agentes com mais de 5 missões completas:',
    hint: 'SELECT * FROM agentes WHERE missoes_completas > 5',
    prefill: 'SELECT * FROM agentes WHERE ',
    validation: (result) => result.rows.length === 3 && !result.error,
  },
  {
    id: 6,
    icon: <Zap className="w-6 h-6" />,
    title: 'Missão de recrutamento completa!',
    narrative: 'Excelente trabalho, recruta! Você aprendeu os fundamentos de SQL. Recapitulando:',
    explanation: [
      'SELECT — escolhe o que ver (* = tudo, ou nomes de colunas)',
      'FROM — indica de qual tabela buscar os dados',
      'WHERE — filtra os resultados por condições',
      '',
      'Com só esses 3 comandos você já consegue investigar qualquer banco de dados.',
      'Nos desafios reais você vai usar tabelas maiores e combinações mais poderosas. Vamos lá!',
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

  const isCodeLine = (line: string) =>
    line.startsWith('SELECT') || line.startsWith('→') || line.startsWith('>') ||
    line.startsWith('*') || line.startsWith('=') || line.startsWith('<');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top segmented progress */}
      <div className="w-full max-w-[760px] mx-auto px-6 pt-[22px] flex items-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full transition-colors duration-300"
            style={{ background: i <= currentStep ? 'var(--brass)' : 'var(--line-strong)' }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="fade-up w-full max-w-[640px]" key={currentStep}>
          {/* Eyebrow + skip */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="eyebrow">Recrutamento · Passo {currentStep + 1}/{steps.length}</div>
            <button
              onClick={() => {
                localStorage.setItem('querygame_onboarding_done', 'true');
                navigate('/');
              }}
              className="kicker hover:text-ink-2 transition-colors"
            >
              Pular →
            </button>
          </div>

          {/* Title */}
          <h1 className="display text-[clamp(30px,6vw,46px)] font-bold leading-[1.05] tracking-tight mb-4">
            {step.title}
          </h1>

          {/* Narrative */}
          <div className="border-l-[3px] border-l-brass bg-panel-2 rounded-r-lg px-4 py-3 mb-4">
            <p className="text-ink text-[14.5px] leading-relaxed m-0">{step.narrative}</p>
          </div>

          {/* Explanation */}
          <div className="flex flex-col gap-1.5 mb-5">
            {step.explanation.map((line, i) =>
              line === '' ? (
                <div key={i} className="h-2" />
              ) : isCodeLine(line) ? (
                <p key={i} className="mono text-[13px] text-brass-bright bg-bg-deep border border-line rounded px-3 py-1.5 m-0">
                  {line}
                </p>
              ) : (
                <p key={i} className="muted text-[14.5px] leading-relaxed m-0">{line}</p>
              )
            )}
          </div>

          {/* Concept demo table */}
          {step.showTable && demoResult && (
            <div className="mb-5">
              <div className="kicker mb-1.5">{step.conceptDemo}</div>
              <ResultTable result={demoResult} highlight="neutral" maxRows={10} />
            </div>
          )}

          {/* Task */}
          {hasTask && dbReady && (
            <div className="flex flex-col gap-3">
              <p className="brass text-[14px] font-semibold m-0">{step.task}</p>

              <SqlEditor value={code} onChange={setCode} onRun={handleRun} />

              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleRun} disabled={!code.trim()} className="btn-primary">
                  Executar
                </button>

                {showHint && step.hint && (
                  <span className="faint mono text-[12px]">
                    dica: <span className="brass">{step.hint}</span>
                  </span>
                )}
              </div>

              {/* Feedback (error / wrong) */}
              {feedback && !taskCompleted && (
                <div
                  className="text-[13.5px] px-3.5 py-2.5 rounded-lg"
                  style={{
                    color: 'var(--oxblood)',
                    border: '1px solid color-mix(in srgb, var(--oxblood) 45%, transparent)',
                    background: 'color-mix(in srgb, var(--oxblood) 12%, var(--panel))',
                  }}
                >
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
                <div className="flex items-center gap-2 sage-t text-[14px] font-semibold">
                  <Check size={18} strokeWidth={2.4} />
                  Perfeito. Você está pegando o jeito.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3.5 mt-7">
            {!isFirstStep && (
              <button onClick={goBack} className="btn-secondary">
                <ChevronLeft size={15} />
                Voltar
              </button>
            )}
            <button onClick={goNext} disabled={hasTask && !taskCompleted} className="btn-primary">
              {isLastStep ? 'Entrar na Central' : 'Próximo'}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
