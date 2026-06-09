import initSqlJs from 'sql.js';
import type { QueryResult } from '../types';

let db: any = null;
let SQL: any = null;
let initPromise: Promise<void> | null = null;

export function isSqlReady(): boolean {
  return SQL !== null;
}

export async function initSqlEngine(): Promise<void> {
  if (SQL) return;
  if (initPromise) return initPromise;
  initPromise = initSqlJs({
    locateFile: () => '/sql-wasm.wasm',
  }).then(sql => {
    SQL = sql;
  });
  return initPromise;
}

export async function ensureReady(): Promise<void> {
  if (SQL) return;
  await initSqlEngine();
}

export function createDatabase(setupSql: string): void {
  if (!SQL) throw new Error('SQL engine not initialized');
  if (db) db.close();
  db = new SQL.Database();
  db.run(setupSql);
}

export function executeQuery(sql: string): QueryResult {
  if (!db) throw new Error('Database not created');

  try {
    const results = db.exec(sql);

    if (results.length === 0) {
      return { columns: [], rows: [] };
    }

    const first = results[0];
    return {
      columns: first.columns,
      rows: first.values as (string | number | null)[][],
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      error: translateSqlError(err.message),
    };
  }
}

export function compareResults(
  actual: QueryResult,
  expected: QueryResult,
  checkOrder: boolean,
  enforceColumnNames: boolean = false
): { correct: boolean; feedback: string; feedbackType: string } {
  if (actual.error) {
    return {
      correct: false,
      feedback: actual.error,
      feedbackType: 'syntax_error',
    };
  }

  // Check the NUMBER of columns — selecting columns a mais/a menos é um erro real
  // de projeção e deve ser sinalizado.
  if (actual.columns.length !== expected.columns.length) {
    return {
      correct: false,
      feedback: `Número de colunas diferente. Esperado: ${expected.columns.length}, obtido: ${actual.columns.length}. Confira quais colunas você colocou no SELECT.`,
      feedbackType: 'wrong_columns',
    };
  }

  // O NOME da coluna só é exigido em desafios que ensinam apelidos (AS) e que
  // dizem no enunciado qual nome usar. Em todo o resto, comparamos os DADOS:
  // `COUNT(*)` e `COUNT(*) AS total` devem ser aceitos igualmente.
  if (enforceColumnNames) {
    const expectedColsLower = expected.columns.map(c => c.toLowerCase());
    const actualColsLower = actual.columns.map(c => c.toLowerCase());
    for (let i = 0; i < expectedColsLower.length; i++) {
      if (expectedColsLower[i] !== actualColsLower[i]) {
        return {
          correct: false,
          feedback: `O nome da coluna na posição ${i + 1} não confere. Esperado: "${expected.columns[i]}", obtido: "${actual.columns[i]}". Use AS para nomear a coluna como pedido no enunciado.`,
          feedbackType: 'wrong_columns',
        };
      }
    }
  }

  // Check row count
  if (actual.rows.length !== expected.rows.length) {
    return {
      correct: false,
      feedback: `Número de linhas diferente. Esperado: ${expected.rows.length}, Obtido: ${actual.rows.length}. Revise seus filtros.`,
      feedbackType: 'wrong_rows',
    };
  }

  // Check values
  if (checkOrder) {
    for (let i = 0; i < expected.rows.length; i++) {
      for (let j = 0; j < expected.rows[i].length; j++) {
        if (String(actual.rows[i][j]) !== String(expected.rows[i][j])) {
          return {
            correct: false,
            feedback: `Linha ${i + 1}, coluna "${expected.columns[j]}": esperado "${expected.rows[i][j]}", obtido "${actual.rows[i][j]}".`,
            feedbackType: 'wrong_values',
          };
        }
      }
    }
  } else {
    // Sort both and compare
    const sortRow = (a: any[], b: any[]) => {
      for (let i = 0; i < a.length; i++) {
        if (String(a[i]) < String(b[i])) return -1;
        if (String(a[i]) > String(b[i])) return 1;
      }
      return 0;
    };

    const sortedExpected = [...expected.rows].sort(sortRow);
    const sortedActual = [...actual.rows].sort(sortRow);

    for (let i = 0; i < sortedExpected.length; i++) {
      for (let j = 0; j < sortedExpected[i].length; j++) {
        if (String(sortedActual[i][j]) !== String(sortedExpected[i][j])) {
          return {
            correct: false,
            feedback: `Valores incorretos encontrados. Verifique sua lógica de filtro e os dados retornados.`,
            feedbackType: 'wrong_values',
          };
        }
      }
    }
  }

  return { correct: true, feedback: 'Correto! Query perfeita.', feedbackType: 'correct' };
}

function translateSqlError(msg: string): string {
  if (msg.includes('no such table'))
    return `Tabela não encontrada. Verifique o nome da tabela no schema.`;
  if (msg.includes('no such column'))
    return `Coluna não encontrada. Verifique os nomes das colunas disponíveis.`;
  if (msg.includes('near'))  {
    const match = msg.match(/near "(.+?)"/);
    return `Erro de sintaxe próximo a "${match?.[1] || '???'}". Verifique a escrita do comando.`;
  }
  if (msg.includes('ambiguous column'))
    return `Coluna ambígua — use alias de tabela (ex: t.coluna) para especificar qual tabela.`;
  if (msg.includes('misuse of aggregate'))
    return `Uso incorreto de função de agregação. Precisa de GROUP BY?`;
  return `Erro SQL: ${msg}`;
}

export function resetDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
