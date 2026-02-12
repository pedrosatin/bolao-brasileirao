# Bolão Brasileirão

Aplicação web para gerenciar bolões do Brasileirão Série A: palpites por rodada, cálculo automático de pontos e rankings — sem autenticação, usando nomes únicos por rodada.

## ✨ Principais recursos

- Palpites por rodada com bloqueio por horário do jogo e status
- Rankings por rodada e ranking geral
- Histórico de rodadas finalizadas
- Tokens de submissão (obrigatório em produção, opcional em dev)
- Sincronização automática com Football-Data.org

## 🧱 Stack

- **Frontend**: React + TypeScript + Vite (Cloudflare Pages)
- **Backend**: Cloudflare Workers + TypeScript
- **Banco**: Cloudflare D1 (SQLite serverless)
- **API externa**: Football-Data.org

## 🗺️ Arquitetura (resumo)

```
Frontend (Pages) ↔ Worker (API) ↔ D1
                        ↕
               Football-Data.org
```

## ✅ Requisitos

- Node.js 18+ (recomendado)
- Conta Cloudflare (para deploy)
- Token da Football-Data.org

## 🚀 Rodando localmente

### 1) Instalar dependências

```bash
cd apps/web && npm install
cd ../worker && npm install
```

### 2) Iniciar os servidores

```bash
# Frontend
cd apps/web && npm run dev

# Backend (em outro terminal)
cd apps/worker && npm run dev
```

### 3) Acessar

- Frontend: `http://localhost:5173`
- Worker: `http://localhost:8787`

## ⚙️ Variáveis de ambiente

### Frontend (`apps/web`)

- `VITE_API_BASE_URL` (opcional em dev): URL pública do Worker
  - Em dev, se não definida, usa `http://localhost:8787`

### Backend (`apps/worker`)

- `FOOTBALL_DATA_TOKEN` (obrigatório)
- `FOOTBALL_DATA_BASE_URL` (default: `https://api.football-data.org/v4`)
- `FOOTBALL_DATA_COMPETITION_ID` (default: `2013`)
- `DEFAULT_EXTERNAL_LINK` (default: link G1)
- `CORS_ORIGINS` (obrigatório em produção; se vazio, bloqueia todas as origins)
- `ADMIN_TOKEN` (secret; necessário para endpoints admin)
- `ENVIRONMENT` (default: `production`)

## 🔐 Segurança e regras

- Sem autenticação: nomes são únicos por rodada
- Palpites bloqueados após horário do jogo (considerando Brasília)
- `submission_token` é obrigatório em produção
- Endpoints admin usam `X-Admin-Token`

## 📦 Deploy

Deploy automático via GitHub Actions (Workers + Pages). Veja detalhes em `docs/DEPLOY.md`.

## 📚 Documentação

- `docs/PROJECT_CONTEXT.md` — visão geral e objetivos
- `docs/ARCHITECTURE.md` — arquitetura e fluxos
- `docs/FRONTEND.md` — frontend
- `docs/BACKEND.md` — backend
- `docs/DATA_MODEL.md` — schema do banco
- `docs/API.md` — endpoints
- `docs/DEPLOY.md` — deploy

## 🧪 Testes

Ainda não há suíte de testes automatizados.

## 📄 Licença

Não definido.
