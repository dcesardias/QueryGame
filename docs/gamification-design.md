# Design de Gamificação — QueryGame

## 1. Core Loop

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Resolver Desafio SQL                                  │
│         ↓                                               │
│   Receber Feedback Imediato (acerto/erro + diff)        │
│         ↓                                               │
│   Ganhar XP + Moedas (ou perder HP do desafio)          │
│         ↓                                               │
│   Desbloquear → Novos Desafios / Níveis / Cosméticos    │
│         ↓                                               │
│   Ranking atualizado → Motivação social                 │
│         ↓                                               │
│   Missão diária → Re-engajamento                        │
│         │                                               │
│         └──────── Volta ao início ──────────────────────┘
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tempo médio por loop**: 2-5 minutos (micro-sessões possíveis).

---

## 2. Tema: "Data Detective" — Investigação Cyberpunk

### Narrativa
> Em Neo-DataCity, crimes digitais estão fora de controle. Corporações corrompem bancos de dados, hackers apagam evidências, e a única forma de desvendar a verdade é dominando a linguagem universal dos dados: SQL. Você é um(a) recruta na **Data Investigation Agency (DIA)**. Cada query correta revela uma pista. Cada caso resolvido te promove na hierarquia.

### Por que este tema funciona
- **SQL como ferramenta diegética**: queries são literalmente o que um investigador de dados faria
- **Progressão narrativa natural**: recruta → detetive → inspetor → diretor
- **Estética cyberpunk**: visualmente atraente, palette de cores neon que funciona bem para UI de código
- **Cada desafio é um "caso"**: motivação intrínseca para resolver

### Palette de Cores

| Elemento | Cor | Hex |
|----------|-----|-----|
| Background principal | Azul escuro profundo | `#0a0e1a` |
| Background secundário | Azul noite | `#111827` |
| Acento primário (ações, acertos) | Cyan neon | `#00f0ff` |
| Acento secundário (especial) | Magenta neon | `#ff00aa` |
| XP / Ouro | Dourado | `#ffd700` |
| Sucesso / Código correto | Verde neon | `#00ff88` |
| Erro | Vermelho suave | `#ff4757` |
| Texto principal | Branco frio | `#e2e8f0` |
| Texto secundário | Cinza azulado | `#94a3b8` |
| Cards / Surfaces | Slate escuro | `#1e293b` |

---

## 3. Sistema de Progressão

### Ranks (Níveis Narrativos)

| Rank | Nível | XP necessário | Ícone | Desbloqueia |
|------|-------|--------------|-------|-------------|
| Estagiário | 1-5 | 0 - 500 | 🔰 | Tutorial, desafios básicos |
| Detetive Junior | 6-10 | 500 - 1500 | 🔍 | Agregações, avatar customizado |
| Detetive Sênior | 11-15 | 1500 - 3500 | 🕵️ | JOINs, tema de editor |
| Inspetor | 16-20 | 3500 - 6000 | ⭐ | Subqueries, CTEs, badges especiais |
| Inspetor-Chefe | 21-25 | 6000 - 10000 | 👑 | Window functions, ranking global |

### Fórmula de XP por Nível
```
XP para próximo nível = 100 * nivel_atual * 1.2
```
Suave o suficiente para não frustrar, crescente o suficiente para dar sensação de progresso.

### XP por Ação

| Ação | XP Base | Modificadores |
|------|---------|---------------|
| Desafio correto | 50 | +50% primeira tentativa ("Perfect") |
| Desafio correto (boss) | 150 | +50% Perfect |
| Missão diária completa | 100 | — |
| Streak diário (por dia) | 25 × dias | Cap em 7 dias (175 XP) |
| Desafio de revisão correto | 30 | — |
| Primeiro acesso do dia | 10 | — |

### Penalidade por Erro
- **Desafio errado**: 0 XP (não ganha, mas NÃO perde)
- **Desistir de desafio**: -10 XP (penalidade leve)
- **Conceito**: errar é gratuito, desistir tem custo mínimo — incentiva tentar

---

## 4. Sistema de Streak

```
Dia 1: 🔥 (25 XP)
Dia 2: 🔥🔥 (50 XP)
Dia 3: 🔥🔥🔥 (75 XP)
Dia 4: 🔥🔥🔥🔥 (100 XP)
Dia 5: 🔥🔥🔥🔥🔥 (125 XP)
Dia 6: 🔥🔥🔥🔥🔥🔥 (150 XP)
Dia 7+: 🔥🔥🔥🔥🔥🔥🔥 (175 XP — cap)
```

### Proteção de Streak
- **Streak Shield**: ganha 1 escudo a cada 7 dias de streak
- **Máximo de 2 escudos acumulados**
- Escudo é usado automaticamente se perder um dia
- **Freeze manual**: pode pausar streak 1 vez por semana (fim de semana)

### Streak quebrado
- Reset para 0, mas mantém o "Recorde pessoal" visível
- Mensagem motivacional, não punitiva: "Hora de construir um novo recorde!"

---

## 5. Missões Diárias

Cada dia gera 3 missões baseadas no progresso do jogador:

### Tipos de Missão

| Tipo | Descrição | Recompensa |
|------|-----------|-----------|
| **Resolver N desafios** | "Resolva 3 desafios hoje" | 100 XP |
| **Revisão** | "Revise 2 conceitos com health baixo" | 75 XP + health boost |
| **Perfeição** | "Acerte 1 desafio de primeira" | 50 XP |
| **Explorador** | "Tente um desafio do próximo nível" | 60 XP (mesmo se errar) |
| **Velocidade** | "Resolva um desafio em menos de 60s" | 80 XP |

### Geração de Missões (Algoritmo)
```
1. Sempre inclui 1 missão de revisão (se há conceitos com health < 60)
2. 1 missão do nível atual do jogador
3. 1 missão variada (perfeição, velocidade, ou explorador)
```

---

## 6. Tipos de Desafio

### 6.1 Correção de Query
```sql
-- Esta query deveria retornar crimes em São Paulo, mas tem um erro.
-- Corrija-a:
SELECT * FROM crimes
WHERE city = São Paulo  -- falta aspas
ORDER BY date
```
**Dificuldade**: Fácil a Médio. Bom para introduzir sintaxe.

### 6.2 Completar Query
```sql
-- Retorne o total de crimes por cidade, 
-- apenas cidades com mais de 5 crimes
SELECT city, _____(crime_id) as total
FROM crimes
GROUP BY _____
_____ total > 5
```
**Dificuldade**: Médio. Scaffolding que guia sem dar resposta.

### 6.3 Escrever do Zero
```
📋 Briefing do Caso:
"Precisamos de um relatório mostrando os 10 suspeitos 
com mais conexões a crimes, incluindo nome, cidade, 
e total de crimes vinculados."

Tabelas disponíveis: suspects, crimes, suspect_crimes
```
**Dificuldade**: Médio a Difícil. Teste real de competência.

### 6.4 Otimização
```sql
-- Esta query funciona mas é lenta. Reescreva de forma mais eficiente:
SELECT * FROM suspects 
WHERE id IN (SELECT suspect_id FROM crimes WHERE type = 'fraude')
-- Hint: considere usar JOIN
```
**Dificuldade**: Avançado. Para jogadores experientes.

---

## 7. Recompensas e Cosméticos

### Desbloqueáveis

| Item | Como desbloquear | Tipo |
|------|-------------------|------|
| Temas de editor | Rank up | Visual do editor SQL |
| Avatares | Completar casos | Foto de perfil |
| Badges | Conquistas específicas | Exibição no perfil |
| Títulos | Milestones | Texto sob o nome |
| Borders de card | Streaks longos | Visual do ranking |

### Badges (Conquistas)

| Badge | Condição | Nome |
|-------|----------|------|
| 🏆 | Primeiro desafio correto | "Primeira Query" |
| ⚡ | 5 corretos seguidos | "Em Chamas" |
| 🎯 | 10 Perfect Runs | "Precisão Cirúrgica" |
| 🔥 | 7 dias de streak | "Dedicação" |
| 🧠 | Completar Nível 1 | "Fundamentos Sólidos" |
| 🔗 | Primeiro JOIN correto | "Conector de Dados" |
| 📊 | Primeiro GROUP BY correto | "Analista" |
| 👑 | Completar todos os níveis | "Mestre dos Dados" |
| ⏱️ | Resolver em < 30s | "Velocista" |
| 💪 | 30 dias de streak | "Imparável" |

---

## 8. Jornada do Usuário

```
[Onboarding — 2 minutos]
│ "Bem-vindo à DIA. Vamos testar suas habilidades."
│ Tutorial interativo: 1 query guiada passo a passo
│ Ganha primeiro avatar + nome de detetive
│
├──→ [Dashboard]
│     Mapa de casos (níveis)
│     Missões diárias
│     Barra de XP + Rank
│     Streak counter
│
├──→ [Caso Selecionado]
│     Briefing narrativo
│     Editor SQL
│     Tabelas de referência (schema visible)
│     Submeter → Feedback → XP
│
├──→ [Boss Fight]
│     Desafio que combina todos os conceitos do nível
│     Narrativa especial ("O caso final!")
│     Recompensa maior
│     Desbloqueia próximo nível
│
├──→ [Progressão]
│     Novo rank → animação
│     Novas missões desbloqueadas
│     Desafios ficam mais complexos
│     
└──→ [Engajamento diário]
      Missões diárias
      Streak
      Revisão de conceitos fracos
      Ranking atualizado
```

---

## 9. Arquitetura Funcional

### Frontend — React + TypeScript + Vite

**Justificativa**: 
- React: ecossistema maduro, componente de editor SQL (CodeMirror) excelente
- TypeScript: segurança de tipos para lógica de gamificação complexa
- Vite: build rápido, HMR instantâneo, melhor DX que CRA
- Tailwind CSS: design system consistente sem CSS custom verboso
- Zustand: state management leve (menor boilerplate que Redux, suficiente para MVP)
- sql.js: SQLite compilado para WASM — **sandbox perfeito** (roda no browser, zero risco)

### Backend — Express + TypeScript + better-sqlite3

**Justificativa**:
- Express: rápido para MVP, amplamente conhecido
- better-sqlite3: síncrono, performático, zero config (arquivo local)
- TypeScript: consistência com frontend
- **SQL NÃO roda no servidor** — toda execução de query do usuário acontece no browser via sql.js

### Banco de Dados da Plataforma

```sql
-- Tabela de usuários
users (id, username, email, password_hash, created_at)

-- Progresso do jogador
player_stats (user_id, xp, level, rank, streak_days, streak_shields, 
              last_active, longest_streak)

-- Progresso por desafio
challenge_progress (user_id, challenge_id, status, attempts, 
                    best_time_ms, completed_at)

-- Saúde de conceitos (spaced repetition)
concept_health (user_id, concept, health, interval_days, 
                last_reviewed, consecutive_correct)

-- Missões diárias
daily_missions (id, user_id, date, type, target, progress, 
                completed, xp_reward)

-- Conquistas/Badges
user_badges (user_id, badge_id, earned_at)
```

### Sistema de Avaliação Automática de Queries

```
[Query do usuário] 
    ↓
[sql.js executa no browser]
    ↓
[Compara resultado com expected_result]
    ↓
    ├─ Compara: colunas (nomes e quantidade)
    ├─ Compara: linhas (quantidade e conteúdo)
    ├─ Compara: ordem (se ORDER BY é requerido)
    └─ Compara: tipos de dados
    ↓
[Score: CORRECT / WRONG_COLUMNS / WRONG_ROWS / WRONG_ORDER / SYNTAX_ERROR]
    ↓
[Feedback específico baseado no tipo de erro]
```

### API Endpoints

```
POST   /api/auth/register     — Criar conta
POST   /api/auth/login        — Login (retorna JWT)

GET    /api/challenges         — Listar desafios disponíveis
GET    /api/challenges/:id     — Detalhes de um desafio

POST   /api/progress/submit    — Submeter resultado de query
GET    /api/progress/stats     — Stats do jogador
GET    /api/progress/concepts  — Health de conceitos

GET    /api/missions/daily     — Missões do dia
POST   /api/missions/:id/claim — Coletar recompensa

GET    /api/leaderboard        — Ranking global
GET    /api/badges             — Badges do jogador
```
