# Backend (Cloudflare Workers)

## Objetivo

Fornecer API REST para jogos, palpites, ranking e histórico de rodadas usando D1 e Football-Data.org.

## Stack

- Cloudflare Workers (TypeScript)
- D1 (SQL serverless)
- API externa: Football-Data.org

## Estrutura sugerida

```
/apps/worker
  /src
    index.ts
    routes.ts
    db.ts
    footballData.ts
    scoring.ts
    validation.ts
  schema.sql
  wrangler.toml
  package.json
  tsconfig.json
```

## Regras

- Palpites bloqueados por jogo: o Worker rejeita envios com status diferente de `SCHEDULED/TIMED` ou cujo `utc_date` já passou considerando Brasília (UTC-3). `cutoff_at` permanece para expiração/geração de token e exibição.
- Nomes únicos por rodada.
- Pontuação centralizada em `scoring.ts`.
- Cache de jogos: 6 dias via `rounds.last_sync_at`.

## Endpoints

- `GET /rounds/next`
- `GET /rounds/:id`
- `GET /rounds/history`
- `POST /predictions`
- `GET /rankings/round/:id`
- `GET /rankings/global`

## SQL (exemplos D1)

### Ranking da rodada

```sql
SELECT participant_name AS name, SUM(points) AS points
FROM predictions
WHERE round_id = ?
GROUP BY participant_name
ORDER BY points DESC, name ASC;
```

### Ranking geral

```sql
SELECT participant_name AS name, SUM(points) AS points
FROM predictions
GROUP BY participant_name
ORDER BY points DESC, name ASC;
```

### Histórico de rodadas finalizadas

```sql
SELECT r.id, r.season, r.round_number, r.cutoff_at
FROM rounds r
WHERE r.id IN (
  SELECT round_id
  FROM matches
  GROUP BY round_id
  HAVING SUM(CASE WHEN status != 'FINISHED' THEN 1 ELSE 0 END) = 0
)
ORDER BY r.season DESC, r.round_number DESC;
```

## Notas de integração

- Token da Football-Data.org via `FOOTBALL_DATA_TOKEN`.
- D1 binding `DB`.

## Migração D1 (se já existe banco)

```sql
ALTER TABLE rounds ADD COLUMN last_sync_at TEXT;
```
