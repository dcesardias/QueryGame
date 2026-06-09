// Mini-lições de conceito, exibidas no topo do dossiê de cada desafio.
// Chave = campo `concept` do desafio (challenges.ts).
// O objetivo é ENSINAR o conceito ANTES de o aluno tentar — sem depender de
// errar para liberar dica. Mantenha cada lição curta: definição + sintaxe + 1 exemplo.
//
// IMPORTANTE: o `example` deve ilustrar o conceito em um caso DIFERENTE do
// gabarito do desafio — NUNCA a resposta exata. Use outra tabela/coluna/valor,
// para o aluno transferir o padrão (e adaptar), não copiar-colar-rodar.

export interface Lesson {
  /** Nome amigável do conceito. */
  title: string;
  /** Explicação em 1–3 frases. */
  summary: string;
  /** Padrão de sintaxe genérico. */
  syntax?: string;
  /** Exemplo concreto — num caso DIFERENTE do desafio (não é a resposta). */
  example?: string;
}

export const lessons: Record<string, Lesson> = {
  // ── Nível 1 — Fundamentos ──────────────────────────────
  SELECT_BASIC: {
    title: 'SELECT — ler dados',
    summary: 'O SELECT pede dados a uma tabela e o FROM diz de qual tabela. O asterisco (*) traz todas as colunas.',
    syntax: 'SELECT * FROM tabela',
    example: 'SELECT * FROM detectives',
  },
  WHERE_BASIC: {
    title: 'WHERE — filtrar linhas',
    summary: 'O WHERE mantém só as linhas que satisfazem a condição. Texto sempre entre aspas simples.',
    syntax: "SELECT * FROM tabela WHERE coluna = 'valor'",
    example: "SELECT * FROM crimes WHERE city = 'Curitiba'",
  },
  WHERE_BETWEEN: {
    title: 'BETWEEN — intervalos',
    summary: 'BETWEEN testa se um valor está dentro de um intervalo, incluindo os dois extremos.',
    syntax: 'WHERE coluna BETWEEN menor AND maior',
    example: 'SELECT * FROM crimes WHERE financial_loss BETWEEN 50000 AND 100000',
  },
  WHERE_LIKE: {
    title: 'LIKE — busca por padrão',
    summary: 'LIKE compara texto por padrão. O % representa "qualquer sequência de caracteres".',
    syntax: "WHERE coluna LIKE '%trecho%'",
    example: "SELECT * FROM crimes WHERE description LIKE '%digital%'",
  },
  ORDER_BY: {
    title: 'ORDER BY — ordenar',
    summary: 'Ordena o resultado por uma coluna. ASC é crescente (padrão); DESC é decrescente.',
    syntax: 'SELECT * FROM tabela ORDER BY coluna DESC',
    example: 'SELECT * FROM suspects ORDER BY age ASC',
  },
  LIMIT: {
    title: 'LIMIT — limitar linhas',
    summary: 'LIMIT corta o resultado às N primeiras linhas. Combinado com ORDER BY, dá o "top N".',
    syntax: 'SELECT * FROM tabela ORDER BY coluna DESC LIMIT N',
    example: 'SELECT * FROM detectives ORDER BY cases_solved DESC LIMIT 3',
  },
  NULL_HANDLING: {
    title: 'NULL — dados ausentes',
    summary: 'NULL significa "sem valor". Para testá-lo use IS NULL ou IS NOT NULL — nunca = NULL.',
    syntax: 'WHERE coluna IS NULL',
    example: 'SELECT * FROM suspects WHERE occupation IS NULL',
  },
  WHERE_AND_OR: {
    title: 'AND / OR — combinar condições',
    summary: 'AND exige que todas as condições sejam verdadeiras; OR exige ao menos uma. Use parênteses para deixar a lógica clara.',
    syntax: "WHERE cond1 AND (cond2 OR cond3)",
    example: "SELECT * FROM crimes WHERE city = 'São Paulo' AND solved = 0",
  },
  SELECT_COLUMNS: {
    title: 'Projeção — escolher colunas',
    summary: 'Em vez de *, liste as colunas desejadas separadas por vírgula, na ordem que quiser.',
    syntax: 'SELECT col1, col2, col3 FROM tabela',
    example: 'SELECT type, city, financial_loss FROM crimes',
  },
  FUNDAMENTALS_BOSS: {
    title: 'Revisão — fundamentos',
    summary: 'Combine tudo do nível 1: projeção de colunas, filtros com AND/OR e parênteses, ORDER BY e LIMIT.',
    syntax: 'SELECT cols FROM t WHERE (... OR ...) AND ... ORDER BY col DESC LIMIT N',
  },

  // ── Nível 2 — Agregação ────────────────────────────────
  COUNT_GROUP_BY: {
    title: 'GROUP BY + COUNT — contar por grupo',
    summary: 'GROUP BY junta linhas iguais em grupos; as funções de agregação resumem cada grupo. COUNT(*) conta linhas.',
    syntax: 'SELECT coluna, COUNT(*) FROM tabela GROUP BY coluna',
    example: 'SELECT city, COUNT(*) FROM suspects GROUP BY city',
  },
  SUM: {
    title: 'SUM — somar',
    summary: 'SUM soma todos os valores de uma coluna numérica.',
    syntax: 'SELECT SUM(coluna) FROM tabela',
    example: 'SELECT SUM(cases_solved) FROM detectives',
  },
  AVG: {
    title: 'AVG — média',
    summary: 'AVG calcula a média de uma coluna numérica. Valores NULL são ignorados no cálculo.',
    syntax: 'SELECT AVG(coluna) FROM tabela',
    example: 'SELECT AVG(financial_loss) FROM crimes',
  },
  COUNT_ORDER_LIMIT: {
    title: 'Agregar + ordenar + LIMIT',
    summary: 'Conte por grupo, ordene pela contagem e use LIMIT 1 para achar o maior grupo.',
    syntax: 'SELECT col, COUNT(*) FROM t GROUP BY col ORDER BY COUNT(*) DESC LIMIT 1',
    example: 'SELECT occupation, COUNT(*) FROM suspects GROUP BY occupation ORDER BY COUNT(*) DESC LIMIT 1',
  },
  DISTINCT: {
    title: 'DISTINCT — valores únicos',
    summary: 'DISTINCT remove as linhas duplicadas, deixando apenas os valores distintos.',
    syntax: 'SELECT DISTINCT coluna FROM tabela',
    example: 'SELECT DISTINCT city FROM suspects',
  },
  HAVING: {
    title: 'HAVING — filtrar grupos',
    summary: 'WHERE filtra linhas ANTES de agrupar; HAVING filtra os GRUPOS DEPOIS do GROUP BY, usando agregações.',
    syntax: 'GROUP BY coluna HAVING COUNT(*) > N',
    example: 'SELECT type, COUNT(*) FROM crimes GROUP BY type HAVING COUNT(*) >= 2',
  },
  ALIASES: {
    title: 'AS — apelidos de coluna',
    summary: 'Sem apelido, COUNT(*) vira uma coluna chamada "COUNT(*)". O AS dá um nome legível ao resultado.',
    syntax: 'SELECT coluna AS apelido, COUNT(*) AS total FROM tabela',
    example: 'SELECT city AS cidade, COUNT(*) AS qtd_suspeitos FROM suspects GROUP BY city',
  },
  MULTI_AGG: {
    title: 'Várias agregações juntas',
    summary: 'Você pode usar COUNT, SUM, AVG, MIN e MAX no mesmo SELECT para um resumo completo de cada grupo.',
    syntax: 'SELECT col, COUNT(*), AVG(x), MAX(x) FROM t GROUP BY col',
    example: 'SELECT city, COUNT(*), MIN(age), MAX(age) FROM suspects GROUP BY city',
  },
  MULTI_GROUP: {
    title: 'GROUP BY com várias colunas',
    summary: 'Agrupar por mais de uma coluna cria um grupo para cada combinação distinta de valores.',
    syntax: 'SELECT col1, col2, COUNT(*) FROM t GROUP BY col1, col2',
    example: 'SELECT type, city, COUNT(*) FROM crimes GROUP BY type, city',
  },
  AGGREGATION_BOSS: {
    title: 'Revisão — agregação',
    summary: 'Combine GROUP BY, várias agregações, HAVING (filtra grupos) e ORDER BY (ordena o resultado final).',
    syntax: 'SELECT col, COUNT(*), SUM(x) FROM t GROUP BY col HAVING COUNT(*) > N ORDER BY SUM(x) DESC',
  },

  // ── Nível 3 — JOINs ────────────────────────────────────
  INNER_JOIN: {
    title: 'INNER JOIN — conectar tabelas',
    summary: 'Combina linhas de duas tabelas onde a condição ON casa. Só aparecem pares que existem nos dois lados.',
    syntax: 'SELECT ... FROM a INNER JOIN b ON a.id = b.a_id',
    example: 'SELECT c.type, e.description FROM crimes c INNER JOIN evidence e ON c.id = e.crime_id',
  },
  LEFT_JOIN: {
    title: 'LEFT JOIN — manter a esquerda',
    summary: 'Mantém TODAS as linhas da tabela à esquerda. Quando não há par à direita, essas colunas vêm como NULL.',
    syntax: 'SELECT ... FROM a LEFT JOIN b ON a.id = b.a_id',
    example: 'SELECT c.type, e.description FROM crimes c LEFT JOIN evidence e ON c.id = e.crime_id',
  },
  ANTI_JOIN: {
    title: 'Anti-join — sem correspondência',
    summary: 'Um LEFT JOIN seguido de WHERE chave_da_direita IS NULL devolve as linhas da esquerda que NÃO têm par à direita.',
    syntax: 'FROM a LEFT JOIN b ON a.id = b.a_id WHERE b.a_id IS NULL',
    example: 'SELECT d.name FROM detectives d LEFT JOIN case_assignments ca ON d.id = ca.detective_id WHERE ca.detective_id IS NULL',
  },
  MULTI_JOIN: {
    title: 'Vários JOINs encadeados',
    summary: 'Encadeie vários JOIN para conectar 3 ou mais tabelas. Use aliases (AS) para diferenciar colunas de mesmo nome.',
    syntax: 'FROM a JOIN b ON ... JOIN c ON ...',
    example: 'SELECT d.name, c.type FROM detectives d JOIN case_assignments ca ON d.id = ca.detective_id JOIN crimes c ON ca.crime_id = c.id',
  },
  SELF_JOIN: {
    title: 'Self join — tabela com ela mesma',
    summary: 'Junte uma tabela a ela mesma com aliases diferentes para comparar linhas entre si (ex.: pares na mesma cidade).',
    syntax: 'FROM t x JOIN t y ON x.chave = y.chave AND x.id < y.id',
    example: 'SELECT a.name, b.name FROM suspects a JOIN suspects b ON a.city = b.city AND a.id < b.id',
  },
  JOIN_AGG: {
    title: 'JOIN + agregação',
    summary: 'Depois de juntar tabelas, agrupe e conte para resumir relacionados por grupo (ex.: evidências por crime).',
    syntax: 'FROM a JOIN b ON ... GROUP BY a.id ORDER BY COUNT(*) DESC',
    example: 'SELECT c.type, COUNT(e.id) FROM crimes c JOIN evidence e ON c.id = e.crime_id GROUP BY c.id, c.type',
  },
  JOIN_FILTER: {
    title: 'JOIN + GROUP BY + HAVING',
    summary: 'Junte, agrupe e use HAVING para manter só os grupos que passam de um limite.',
    syntax: 'FROM a JOIN b ON ... GROUP BY a.id HAVING COUNT(*) > N',
    example: 'SELECT c.type, COUNT(e.id) FROM crimes c JOIN evidence e ON c.id = e.crime_id GROUP BY c.id, c.type HAVING COUNT(e.id) > 1',
  },
  JOINS_BOSS: {
    title: 'Revisão — JOINs',
    summary: 'Combine vários LEFT JOIN, filtre no ON (não no WHERE) para não perder linhas, e ordene o resultado. Filtro na tabela principal vai no WHERE.',
    syntax: 'FROM a LEFT JOIN b ON a.id = b.a_id AND b.tipo = X ... WHERE a.flag = 0 ORDER BY ...',
  },

  // ── Nível 4 — Avançado ─────────────────────────────────
  SUBQUERY_SCALAR: {
    title: 'Subquery escalar',
    summary: 'Uma consulta entre parênteses que devolve um único valor pode ser usada dentro do WHERE para comparar.',
    syntax: 'WHERE coluna > (SELECT AVG(coluna) FROM tabela)',
    example: 'SELECT * FROM suspects WHERE age > (SELECT AVG(age) FROM suspects)',
  },
  SUBQUERY_IN: {
    title: 'Subquery com IN',
    summary: 'Uma subconsulta pode devolver uma lista de valores; IN (...) testa se a coluna está nessa lista.',
    syntax: 'WHERE coluna IN (SELECT coluna FROM outra WHERE ...)',
    example: 'SELECT name FROM detectives WHERE id IN (SELECT detective_id FROM case_assignments)',
  },
  CTE_BASIC: {
    title: 'CTE (WITH) — tabela temporária',
    summary: 'WITH nome AS (...) cria uma "tabela temporária" nomeada para organizar a consulta e depois usá-la no SELECT principal.',
    syntax: 'WITH nome AS (SELECT ...) SELECT * FROM nome WHERE ...',
    example: 'WITH por_cidade AS (SELECT city, COUNT(*) AS n FROM suspects GROUP BY city) SELECT * FROM por_cidade WHERE n > 2',
  },
  CTE_MULTI: {
    title: 'Várias CTEs',
    summary: 'Separe múltiplas CTEs por vírgula. Uma CTE pode referenciar outra definida antes dela.',
    syntax: 'WITH a AS (...), b AS (SELECT * FROM a ...) SELECT * FROM b',
    example: 'WITH por_cidade AS (SELECT city, COUNT(*) AS n FROM crimes GROUP BY city), maior AS (SELECT * FROM por_cidade ORDER BY n DESC LIMIT 1) SELECT * FROM maior',
  },
  WINDOW_ROW_NUMBER: {
    title: 'ROW_NUMBER() — numerar',
    summary: 'Função de janela que numera as linhas em sequência segundo uma ordenação, sem agrupar (mantém todas as linhas).',
    syntax: 'ROW_NUMBER() OVER (ORDER BY coluna DESC)',
    example: 'SELECT name, ROW_NUMBER() OVER (ORDER BY age DESC) AS pos FROM suspects',
  },
  WINDOW_RANK: {
    title: 'RANK() — ranking com empates',
    summary: 'RANK() dá a mesma posição a empates e pula números (1,1,3). DENSE_RANK() não pula (1,1,2).',
    syntax: 'RANK() OVER (ORDER BY ... DESC)',
    example: 'SELECT type, COUNT(*) AS n, RANK() OVER (ORDER BY COUNT(*) DESC) AS pos FROM crimes GROUP BY type',
  },
  WINDOW_LAG: {
    title: 'LAG() / LEAD() — linha vizinha',
    summary: 'LAG(coluna) acessa o valor da linha anterior segundo a ordenação; LEAD(coluna) acessa a próxima.',
    syntax: 'LAG(coluna) OVER (ORDER BY data)',
    example: 'SELECT name, cases_solved, LAG(cases_solved) OVER (ORDER BY hire_date) AS anterior FROM detectives',
  },
  ADVANCED_BOSS: {
    title: 'Revisão — avançado',
    summary: 'Combine CTE (para organizar a base) com função de janela (para rankear): calcule as estatísticas numa CTE e aplique RANK() no SELECT principal.',
    syntax: 'WITH stats AS (SELECT ... GROUP BY ...) SELECT *, RANK() OVER (ORDER BY ...) FROM stats',
  },
};

export function getLesson(concept: string): Lesson | undefined {
  return lessons[concept];
}
