# Deploy

## Visão geral

Deploy automático via GitHub Actions para:

- **Backend**: Cloudflare Workers (Wrangler)
- **Frontend**: Cloudflare Pages

## Secrets necessários (GitHub)

Configure em **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` (token com permissões Workers + Pages)
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT` (nome do projeto no Pages)
- `VITE_API_BASE_URL` (URL pública do Worker, ex.: `https://api.seudominio.com`)

## Backend (Worker)

Workflow: `.github/workflows/deploy-worker.yml`

- Deploy automático em push para `main` quando arquivos de `apps/worker/**` mudam.
- Variáveis padrão são definidas no comando do workflow.

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

Depois, copie o `database_id` retornado e preencha em `apps/worker/wrangler.toml`.
