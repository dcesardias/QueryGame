# Metodologia Educacional — QueryGame

## 1. Análise Crítica de Métodos e Combinação Escolhida

### Métodos Avaliados

| Método | Força | Fraqueza para SQL | Veredicto |
|--------|-------|-------------------|-----------|
| **Mastery Learning** (Bloom) | Só avança quando domina o nível atual | Pode frustrar se mal calibrado | **ADOTADO** — core da progressão |
| **Spaced Repetition** (Ebbinghaus) | Consolida memória de longo prazo | Requer tracking granular por conceito | **ADOTADO** — para erros recorrentes |
| **Problem-Based Learning** | Alta retenção por contexto real | Precisa de problemas bem desenhados | **ADOTADO** — cada desafio é um "caso" |
| **Aprendizagem Ativa** | Engajamento superior a aulas passivas | Já implícito no formato de desafios | Implícito |
| **Instrução Direta** | Boa para sintaxe inicial | Entediante se excessivo | Apenas micro-doses (hints) |
| **Gamification (Mecânicas)** | Motivação extrínseca potente | Pode virar "grind" vazio | Integrado ao core loop |

### Combinação Final: **Mastery-PBL com Repetição Adaptativa**

```
[Problem-Based Learning] → Contextualiza cada query em um "caso investigativo"
        ↓
[Mastery Learning] → Só desbloqueia próximo nível com ≥80% de acerto no atual
        ↓
[Spaced Repetition] → Erros voltam em intervalos crescentes (1, 3, 7, 14 dias)
        ↓
[Feedback Imediato] → Resultado visual instantâneo + diff entre esperado/obtido
```

**Justificativa técnica**: SQL é uma skill procedimental (como programação) onde a prática deliberada supera a teoria. Mastery Learning garante que lacunas não se acumulem (problema #1 em cursos de SQL). PBL mantém motivação intrínseca. Spaced Repetition combate a curva de esquecimento de Ebbinghaus para padrões sintáticos (JOINs, GROUP BY) que alunos esquecem em 48h sem reforço.

---

## 2. Progressão do Aprendizado

### Nível 1 — Fundamentos (Rank: Estagiário)
**Conceitos**: SELECT, FROM, WHERE, ORDER BY, LIMIT, operadores de comparação, LIKE, BETWEEN, IN, NULL handling.

| # | Desafio | Tipo | Conceito-alvo |
|---|---------|------|---------------|
| 1.1 | Listar todos os suspeitos | SELECT * | SELECT básico |
| 1.2 | Filtrar por cidade | WHERE = | Filtro simples |
| 1.3 | Encontrar suspeitos por faixa etária | WHERE BETWEEN | Ranges |
| 1.4 | Buscar por padrão de nome | WHERE LIKE | Pattern matching |
| 1.5 | Ordenar evidências por data | ORDER BY | Ordenação |
| 1.6 | Top 5 transações suspeitas | ORDER BY + LIMIT | Combinação |
| 1.7 | Registros com dados faltantes | IS NULL / IS NOT NULL | NULL handling |
| 1.8 | Múltiplos filtros combinados | WHERE AND/OR | Lógica booleana |
| 1.9 | Selecionar colunas específicas | SELECT col1, col2 | Projeção |
| 1.10 | Boss: Relatório completo do caso | Combina tudo | Avaliação de mastery |

**Critério de avanço**: 8/10 corretos (80% mastery threshold).

### Nível 2 — Intermediário (Rank: Detetive Junior)
**Conceitos**: COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, DISTINCT, aliases.

| # | Desafio | Tipo | Conceito-alvo |
|---|---------|------|---------------|
| 2.1 | Contar crimes por tipo | COUNT + GROUP BY | Agregação básica |
| 2.2 | Total de perdas financeiras | SUM | Soma |
| 2.3 | Média de idade dos suspeitos | AVG | Média |
| 2.4 | Cidade mais perigosa | COUNT + ORDER BY + LIMIT | Ranking |
| 2.5 | Valores únicos de categorias | DISTINCT | Deduplicação |
| 2.6 | Grupos com mais de N ocorrências | GROUP BY + HAVING | Filtro pós-agregação |
| 2.7 | Aliases para relatório | AS | Nomeação |
| 2.8 | Múltiplas agregações | COUNT, SUM, AVG juntos | Combinação |
| 2.9 | Agrupamento múltiplo | GROUP BY col1, col2 | Multi-group |
| 2.10 | Boss: Dashboard criminal | Combina tudo | Avaliação de mastery |

### Nível 3 — JOINs (Rank: Detetive Sênior)
**Conceitos**: INNER JOIN, LEFT JOIN, RIGHT JOIN, múltiplos JOINs, self-join.

| # | Desafio | Tipo | Conceito-alvo |
|---|---------|------|---------------|
| 3.1 | Ligar suspeito ao crime | INNER JOIN | JOIN básico |
| 3.2 | Todos os suspeitos (com/sem crime) | LEFT JOIN | Left outer |
| 3.3 | Crimes sem suspeito | LEFT JOIN + IS NULL | Anti-join |
| 3.4 | Três tabelas conectadas | Multi JOIN | Encadeamento |
| 3.5 | Suspeitos que conhecem suspeitos | Self JOIN | Auto-referência |
| 3.6 | JOIN com agregação | JOIN + GROUP BY | Combinação |
| 3.7 | JOIN com filtros complexos | JOIN + WHERE + HAVING | Pipeline completo |
| 3.8 | Boss: Rede de conexões | Combina tudo | Avaliação de mastery |

### Nível 4 — Avançado Leve (Rank: Inspetor)
**Conceitos**: Subqueries, CTEs (WITH), window functions básicas (ROW_NUMBER, RANK, LAG/LEAD).

| # | Desafio | Tipo | Conceito-alvo |
|---|---------|------|---------------|
| 4.1 | Acima da média | Subquery no WHERE | Subquery escalar |
| 4.2 | Cidades com mais crimes que X | Subquery com IN | Subquery de lista |
| 4.3 | Refatorar com CTE | WITH ... AS | CTE básica |
| 4.4 | CTE múltipla | WITH a AS, b AS | CTE encadeada |
| 4.5 | Ranking de detetives | ROW_NUMBER() | Window básica |
| 4.6 | Ranking com empates | RANK() / DENSE_RANK() | Window ranking |
| 4.7 | Comparar com registro anterior | LAG() / LEAD() | Window offset |
| 4.8 | Boss: Investigação final | Combina tudo | Avaliação de mastery |

---

## 3. Sistema de Feedback Imediato

```
[Usuário submete query]
        ↓
[Execução no sandbox sql.js (WASM)]
        ↓
   ┌─ Correto ──→ ✅ Resultado visual + animação de acerto + XP ganho
   │                  Mostra: resultado esperado vs obtido (match)
   │                  Se primeira tentativa: bônus "Perfect Run" (+50% XP)
   │
   └─ Incorreto ─→ ❌ Feedback em 3 camadas:
                      Camada 1: "Resultado diferente do esperado" + diff visual
                      Camada 2: Hint contextual (ex: "Tente usar GROUP BY para agrupar")
                      Camada 3: Mostrar a estrutura esperada (sem a resposta completa)
                      
                      Erro de sintaxe → Mensagem amigável traduzida do erro SQL
                      
   [Timeout/Loop] ─→ ⏱️ "Query muito pesada. Tente simplificar."
```

### Tipos de Feedback por Erro

| Tipo de Erro | Feedback | Exemplo |
|-------------|----------|---------|
| Sintaxe SQL | Tradução amigável | "Parece que falta uma vírgula entre as colunas" |
| Resultado errado (linhas) | Diff de contagem | "Esperado: 5 linhas. Obtido: 12 linhas. Revise seus filtros." |
| Resultado errado (colunas) | Diff de colunas | "Seu resultado tem colunas extras. Confira o SELECT." |
| Resultado errado (valores) | Primeira diferença | "Linha 3 difere: esperado 'São Paulo', obtido 'Rio'" |
| Resultado errado (ordem) | Hint de ordem | "Valores corretos, mas em ordem diferente. Confira ORDER BY." |

---

## 4. Sistema de Repetição Inteligente

### Algoritmo de Repetição (Inspirado em SM-2, simplificado)

```typescript
// Cada conceito tem um "health" score (0-100)
// Erros reduzem health → conceito volta para revisão

interface ConceptHealth {
  concept: string;        // ex: "GROUP_BY", "LEFT_JOIN"
  health: number;         // 0-100
  lastSeen: Date;
  interval: number;       // dias até próxima revisão
  consecutiveCorrect: number;
}

// Quando acerta:
health = min(100, health + 20)
interval = interval * 2.5  // 1 → 2.5 → 6 → 15 → 37 dias
consecutiveCorrect++

// Quando erra:
health = max(0, health - 30)
interval = 1              // Reset para amanhã
consecutiveCorrect = 0

// Conceitos com health < 50 entram na fila de "Revisão Urgente"
// Missões diárias priorizam conceitos com health baixo
```

### Curva de Dificuldade Progressiva

```
Dificuldade
    │
100%│                                    ╭───── Nível 4
    │                              ╭─────╯
 75%│                     ╭────────╯
    │               ╭─────╯ ← Platô de consolidação
 50%│         ╭─────╯         entre cada nível
    │    ╭────╯
 25%│────╯ Nível 1       Nível 2        Nível 3
    │
    └──────────────────────────────────────────── Tempo
    
    Cada nível: rampa suave → platô → boss → próximo nível
    Boss atua como "gate" de mastery
```

### Regras Anti-Frustração

1. **Máximo de 3 tentativas antes de hint automático** — não deixa o aluno preso
2. **Após 5 erros no mesmo desafio** → oferece "pular e voltar depois"
3. **Conceitos difíceis** → desafios de aquecimento antes de repetir o problema
4. **Streak protector** → 1 erro não quebra streak (sistema de "escudo")
5. **Dificuldade adaptativa** → se acerta tudo muito rápido, pode pular desafios básicos

---

## 5. Princípios Pedagógicos Aplicados

1. **Zero teoria sem prática**: cada conceito é introduzido POR um desafio, não antes dele
2. **Scaffolding progressivo**: primeiros desafios de cada conceito são "completar query", depois "escrever do zero"
3. **Contexto narrativo**: cada query resolve um pedaço do "caso" — motivação intrínseca
4. **Feedback imediato**: cérebro aprende melhor quando o loop ação→resultado é < 2 segundos
5. **Errar é seguro**: penalidade leve (perder um pouco de XP), nunca perde progresso permanente
6. **Variação de formato**: corrigir, completar, escrever, otimizar — combate monotonia
