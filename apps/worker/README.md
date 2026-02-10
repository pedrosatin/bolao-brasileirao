# Backend (Cloudflare Worker)

## Requisitos

- Node.js (para Wrangler)
- Conta Cloudflare com Pages/Workers/D1

## Configuração

1. Instale dependências:

```bash
cd /Users/satin/Work/bolao-brasileirao/apps/worker
npm install
```

2. Configure o D1 e o token da Football-Data.org:

```bash
npx wrangler d1 create bolao-brasileirao
npx wrangler d1 execute DB --file=./schema.sql
npx wrangler secret put FOOTBALL_DATA_TOKEN
```

3. Atualize `wrangler.toml` com o `database_id` gerado (no bloco `[[d1_databases]]`).
4. (Opcional) Ajuste `FOOTBALL_DATA_COMPETITION_ID` se desejar outra competição.

## Migração (se o banco já existe)

```bash
npx wrangler d1 execute DB --command="ALTER TABLE rounds ADD COLUMN last_sync_at TEXT;"
```

## Rodar localmente

```bash
npm run dev
```

## Deploy

```bash
npm run deploy
```

## Endpoints principais

- `GET /rounds/next`
- `GET /rounds/:id`
- `GET /rounds/history`
- `POST /predictions`
- `GET /rankings/round/:id`
- `GET /rankings/global`
