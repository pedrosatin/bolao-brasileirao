# Graph Report - bolao-brasileirao  (2026-07-06)

## Corpus Check
- 48 files · ~15,757 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 332 nodes · 520 edges · 23 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f5c3f97`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `errorResponse()` - 16 edges
2. `jsonResponse()` - 15 edges
3. `Bolão Brasileirão` - 12 edges
4. `getNextRound()` - 11 edges
5. `Endpoints` - 11 edges
6. `Frontend (React)` - 10 edges
7. `createPredictions()` - 9 edges
8. `generateSubmissionToken()` - 9 edges
9. `Arquitetura` - 9 edges
10. `Backend (Cloudflare Workers)` - 9 edges

## Surprising Connections (you probably didn't know these)
- `MatchCard()` --calls--> `formatDate()`  [EXTRACTED]
  apps/web/src/components/MatchCard.tsx → apps/web/src/utils/date.ts
- `handleRequest()` --calls--> `withCors()`  [EXTRACTED]
  apps/worker/src/routes.ts → apps/worker/src/http.ts
- `recalculateRoundScores()` --calls--> `calculatePoints()`  [EXTRACTED]
  apps/worker/src/handlers.ts → apps/worker/src/scoring.ts
- `syncFinishedMatchesAndScores()` --calls--> `calculatePoints()`  [EXTRACTED]
  apps/worker/src/handlers.ts → apps/worker/src/scoring.ts
- `persistAndRespond()` --calls--> `getNextTuesdayCutoffUtcIso()`  [EXTRACTED]
  apps/worker/src/handlers.ts → apps/worker/src/time.ts

## Communities (23 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (37): AlertProps, inputStyle, MatchCard(), MatchCardProps, useHistoryData(), HistoryPage(), HomePageProps, initialScore (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (39): deletePredictionsByRoundAndName(), getLatestRound(), getMatchesByRoundId(), getSubmissionTokenByRoundId(), MatchRow, RoundRow, SubmissionTokenRow, upsertMatch() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): Ao fazer uma mudança relevante:, `API.md`, `ARCHITECTURE.md`, `BACKEND.md`, 🔍 Checklist para Atualização, code:markdown (### Data (Ex: 2026-02-11)), code:block2 (Mudança no código), `DATA_MODEL.md` (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (20): 1) Instalar dependências, 2) Iniciar os servidores, 3) Acessar, 🗺️ Arquitetura (resumo), Backend (`apps/worker`), Bolão Brasileirão, code:block1 (Frontend (Pages) ↔ Worker (API) ↔ D1), code:bash (cd apps/web && npm install) (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (20): Admin, API, Base URL, code:json ({), code:json ({), `DELETE /admin/rounds/:id/predictions/:name`, Endpoints, Erros comuns (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (17): Backend (Cloudflare Workers), code:block1 (/apps/worker), code:sql (SELECT participant_name AS name, SUM(points) AS points), code:sql (SELECT participant_name AS name, SUM(points) AS points), code:sql (SELECT r.id, r.season, r.round_number, r.cutoff_at), code:sql (ALTER TABLE rounds ADD COLUMN last_sync_at TEXT;), Endpoints, Estrutura sugerida (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (14): buildSecureUrl(), fetchCompetition(), fetchFinishedMatches(), fetchFromApi(), fetchMatchesByMatchday(), fetchScheduledMatches(), FootballCompetitionResponse, FootballMatch (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (12): Backend (Cloudflare Worker), code:bash (cd /Users/satin/Work/bolao-brasileirao/apps/worker), code:bash (npx wrangler d1 create bolao-brasileirao), code:bash (npx wrangler d1 execute DB --command="ALTER TABLE rounds ADD), code:bash (npm run dev), code:bash (npm run deploy), Configuração, Deploy (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (11): Analytics (Google Tag Manager), code:block1 (/apps/web), Configuração de ambiente, Estrutura sugerida, Fluxo de dados, Frontend (React), Objetivo, Stack (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (6): TabKey, tabs, TabsProps, useRoundData(), App(), getActiveTab()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (9): AdminAlerts(), AdminContext, AdminContextType, AdminDeletePredictions(), AdminHeader(), AdminRecalculateRound(), AdminSyncMatches(), AdminTokenGenerator() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (10): Arquitetura, code:block1 (/apps), Componentes, Comunicação frontend ↔ backend, Estrutura sugerida do repositório, Fechamento de palpites, Fluxos principais, Observações (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.27
Nodes (8): CorsEnv, parseAllowedOrigins(), parseJsonBody(), resolveCorsOrigin(), corsRes, req, res, withCors()

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (9): Build, code:block1 (VITE_API_BASE_URL=http://localhost:8787), code:bash (cd /Users/satin/Work/bolao-brasileirao/apps/web), code:bash (npm run build), Configuração, Deploy (Cloudflare Pages), Frontend (React), Requisitos (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.2
Nodes (9): `matches`, Modelo de Dados (D1), Índices recomendados, Observações sobre ranking, `predictions`, Regras de integridade, `rounds`, `scores` (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.2
Nodes (9): Dúvidas/ambigüidades, Decisões em aberto, Decisões técnicas já tomadas, Objetivo principal, Project Context, Propostas padrão (sugestões iniciais), Restrições importantes, Stack tecnológica definida (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (5): PredictionInput, PredictionsPayload, longName, result, validData

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (7): Backend (Worker), code:bash (cd /Users/satin/Work/bolao-brasileirao/apps/worker), Deploy, Frontend (Pages), Observações, Secrets necessários (GitHub), Visão geral

### Community 18 - "Community 18"
Cohesion: 0.43
Nodes (5): getNextTuesdayCutoffUtcIso(), hasMatchStartedInBrasilia(), referenceDate, toBrasiliaTime(), toUtcFromBrasilia()

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (6): 2026-02-10, 2026-02-11, 2026-02-12, 2026-04-12, 2026-04-14, Decisions Log

### Community 20 - "Community 20"
Cohesion: 0.47
Nodes (4): calculatePoints(), ScoreInput, SCORING_RULES, input

## Knowledge Gaps
- **146 isolated node(s):** `AlertProps`, `TabsProps`, `tabs`, `MatchCardProps`, `inputStyle` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `parsePredictionsPayload()` connect `Community 1` to `Community 16`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `AlertProps`, `TabsProps`, `tabs` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._