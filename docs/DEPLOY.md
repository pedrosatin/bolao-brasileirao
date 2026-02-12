# Deploy

## Visão geral

Deploy automático via GitHub Actions para:

- **Backend**: Cloudflare Workers (Wrangler)
- **Frontend**: Cloudflare Pages

## Secrets necessários (GitHub)

Configure em **Settings → Secrets and variables → Actions**:

**Secrets** (sensíveis):

- `CLOUDFLARE_API_TOKEN` (token com permissões Workers + Pages)
- `WORKER_ADMIN_TOKEN` (segredo para endpoints admin; sincroniza como `ADMIN_TOKEN` no Worker)

**Variables** (não sensíveis):

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT` (nome do projeto no Pages)
- `VITE_API_BASE_URL` (URL pública do Worker, ex.: `https://api.seudominio.com`)
- `CLOUDFLARE_D1_DATABASE_ID` (id do D1 usado no binding `DB`)
- `CORS_ORIGINS` (origins permitidas para CORS em produção, ex.: `https://bolao-brasileirao.pages.dev`)

## Backend (Worker)

Workflow: `.github/workflows/deploy-worker.yml`

- Deploy automático em push para `main` quando arquivos de `apps/worker/**` mudam.
- Variáveis padrão são definidas no comando do workflow, incluindo `ENVIRONMENT=production` e `CORS_ORIGINS` (via GitHub variable).
- Se `WORKER_ADMIN_TOKEN` estiver definido, o workflow sincroniza o secret `ADMIN_TOKEN` no Worker.
- **IMPORTANTE**: O `wrangler.toml` usa `ENVIRONMENT=production` por padrão. Para desenvolvimento local, use `.dev.vars` ou passe `ENVIRONMENT=development` manualmente.

## Frontend (Pages)

Workflow: `.github/workflows/deploy-pages.yml`

- Build com `VITE_API_BASE_URL`.
- Deploy automático em push para `main` quando arquivos de `apps/web/**` mudam.

## Observações

- O D1 deve estar criado no Cloudflare e associado no `wrangler.toml`.
- O workflow do Worker aplica as migrations automaticamente (remoto) antes do deploy.
- Para primeira publicação (criar o banco e obter o `database_id`), rode localmente:

```bash
cd /Users/satin/Work/bolao-brasileirao/apps/worker
npx wrangler d1 create bolao-brasileirao
```

Depois, pegue o `database_id` retornado e escolha uma opção:

- (Recomendado) Defina a GitHub Actions **Variable** `CLOUDFLARE_D1_DATABASE_ID` com esse valor.
- Ou preencha `database_id` em `apps/worker/wrangler.toml`.
