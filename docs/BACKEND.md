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
- **Avanço de rodada**: `GET /rounds/next` verifica se `cutoff_at` da rodada atual expirou (`now > cutoff_at`). Se sim, busca `currentMatchday + 1` da Football-Data. Isso permite carregar a próxima rodada antes que a API externa atualize o `currentMatchday`.
- Nomes únicos por rodada (min 2, max 50 caracteres).
- Placares preditos devem ser inteiros entre 0 e 99.
- Pontuação centralizada em `scoring.ts`.
- Cache de jogos: 6 dias via `rounds.last_sync_at`.
- `ENVIRONMENT` padrão é `production`; submission token é obrigatório. Bypass só em `development` com token vazio.
- CORS: sem `CORS_ORIGINS` configurado, todas as origins são negadas (sem fallback para `*`).
- Admin token comparado via SHA-256 hash (timing-safe).

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
