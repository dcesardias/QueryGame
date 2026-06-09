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

**Critério de avanço**: resolver ≥80% dos casos regulares (8 de 9) libera o caso prioritário (boss); encerrar o boss abre o próximo nível. Os 9 casos regulares ficam disponíveis juntos — o aluno escolhe a ordem e nunca fica preso num único caso.

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
| Sintaxe SQL | Tradução amigável | "Erro de sintaxe próximo a 'FORM'. Verifique a escrita do comando." |
| Resultado errado (nº de colunas) | Diff de contagem | "Número de colunas diferente. Esperado: 3, obtido: 2. Confira quais colunas você colocou no SELECT." |
| Resultado errado (valores) | Primeira diferença | "Linha 3, coluna 'city': esperado 'São Paulo', obtido 'Rio'." |
| Resultado errado (linhas) | Diff de contagem | "Número de linhas diferente. Esperado: 5, obtido: 12. Revise seus filtros." |

> **Correção por equivalência de resultado.** A banca compara os **dados** das células e a **quantidade** de colunas — **não** os nomes/aliases. Logo `COUNT(*)` e `COUNT(*) AS total` valem igual, e o aluno pode escolher os próprios apelidos. Os nomes só são exigidos no desafio que ensina ALIASES (2-7), cujo enunciado diz quais nomes usar (flag `enforceColumnNames`). A **ordem das linhas** só é cobrada quando o gabarito a define (ou via flag `orderMatters`); nunca é inferida da query do aluno, então adicionar um `ORDER BY` extra jamais reprova uma resposta correta.

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

1. **Conceito ensinado antes da tentativa + dicas progressivas** — cada desafio abre com um cartão "Conceito" (definição + sintaxe + exemplo) e a 1ª pista da linha de raciocínio já visível. A cada erro, uma pista a mais é revelada (e o aluno pode pedir "Próxima dica" a qualquer momento). A explicação nunca fica trancada atrás do fracasso.
2. **Após 5 erros no mesmo desafio** → oferece "pular e voltar depois"
3. **Conceitos difíceis** → desafios de aquecimento antes de repetir o problema
4. **Streak protector** → 1 erro não quebra streak (sistema de "escudo")
5. **Dificuldade adaptativa** → se acerta tudo muito rápido, pode pular desafios básicos

---

## 5. Princípios Pedagógicos Aplicados

1. **Teoria mínima, na hora certa**: cada desafio abre com um cartão "Conceito" curto (definição + sintaxe + exemplo) do conceito-alvo, imediatamente seguido pela prática — sem aula longa antes
2. **Scaffolding progressivo**: cartão de conceito → comentário-guia no editor (`initialCode`) → linha de raciocínio que revela uma pista por vez → solução completa na última pista
3. **Contexto narrativo**: cada query resolve um pedaço do "caso" — motivação intrínseca
4. **Feedback imediato**: cérebro aprende melhor quando o loop ação→resultado é < 2 segundos
5. **Errar é seguro**: penalidade leve (perder um pouco de XP), nunca perde progresso permanente
6. **Variação de formato** *(aspiracional)*: corrigir, completar, escrever, otimizar — hoje todos os desafios são do tipo "escrever"; os demais formatos ainda não foram implementados

---

## 6. Estado de implementação

Este documento mistura o que **já existe** com o que é **visão de produto**. Para evitar confusão entre quem mantém o projeto e a realidade do código:

### Implementado
- **PBL / narrativa investigativa**: 38 "casos" em 4 níveis (`client/src/data/challenges.ts`).
- **Onboarding** de SELECT/FROM/WHERE (`client/src/pages/Onboarding.tsx`).
- **Cartão de Conceito por desafio** (`client/src/data/lessons.ts`) — ensina antes da tentativa.
- **Linha de raciocínio progressiva** — 1ª pista visível, mais pistas a cada erro.
- **Correção por equivalência de resultado** (`client/src/services/sqlEngine.ts`) — ignora nomes de coluna; ordem só quando o gabarito a define.
- **Mastery gate de 80%** (`client/src/store/gameStore.ts` + `supabase/trigger.sql`/`mastery_gate.sql`): os casos regulares de um nível ficam liberados juntos; o caso prioritário (boss) abre com ≥80% dos regulares resolvidos (nível 1/2 → 8 de 9; nível 3/4 → 6 de 7) e é o gate para o próximo nível.
- **Feedback imediato** com diff de colunas/linhas/valores e tradução de erros de sintaxe.
- **Gamificação**: XP (vindo do dataset do desafio), ranks, leaderboard, missões diárias.

### Ainda aspiracional (não implementado)
- **Spaced repetition / "concept health" (seção 4)**: a `concept_health` é gravada e exibida ("Memória de campo"), mas não há motor que reintroduza casos em intervalos crescentes nem missões que priorizem conceitos fracos.
- **Dificuldade adaptativa** (pular casos fáceis automaticamente) e **streak shield** consumido na quebra de streak (seção 4): não implementados.
- **Formatos "completar/corrigir/otimizar"** (princípio 6): só existe "escrever".

> Ao implementar qualquer item aspiracional, mover a linha correspondente para "Implementado" e referenciar o arquivo.
