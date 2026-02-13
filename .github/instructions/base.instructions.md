---
applyTo: '**'
---

# Bolão Brasileirão - Project Instructions

## 📖 For LLMs: Documentation Maintenance (CRITICAL)

**Every relevant code change MUST be documented in `/docs` AND reflected here.**

This ensures future AI assistance has accurate, up-to-date context.

### Documentation Workflow

1. Make code change
2. Update relevant markdown in `/docs` (see `docs/README.md` for guidelines)
3. Update corresponding section in this file
4. Add entry to `docs/DECISIONS_LOG.md` if architectural decision
5. Commit with clear message

### MANDATORY — Self-Check Before Finishing

After ANY code change, the LLM MUST ask itself:

1. Did I change an endpoint, payload, or response? → Update `docs/API.md` + API section here
2. Did I change env vars, secrets, or deploy config? → Update `docs/DEPLOY.md` + Environment Variables section here
3. Did I add/change validation rules? → Update `docs/BACKEND.md` + relevant section here
4. Did I change security behavior (CORS, auth, tokens)? → Update `docs/ARCHITECTURE.md` + Security section here
5. Did I make an architectural decision? → Add entry to `docs/DECISIONS_LOG.md` + Decision Log section here
6. Did I add/remove a file or component? → Update Project Structure section here

If ANY answer is yes, update the docs **in the same commit**. Do NOT leave documentation updates for a follow-up.

### When to Document

✅ **New endpoint** | ✅ **Schema change** | ✅ **Architecture decision** | ✅ **New component** | ✅ **Scoring rule change** | ✅ **Security change** | ✅ **Env var change** | ✅ **Validation rule change** | ✅ **Deploy config change**

❌ **Typo fix** | ❌ **Internal refactor (no behavior change)** | ❌ **Comment update** | ❌ **Patch dependency**

### Reference Documentation First

Before working on this codebase, check:

- `/docs/DECISIONS_LOG.md` - Why decisions were made
- `/docs/ARCHITECTURE.md` - System design
- `/docs/BACKEND.md` - API structure
- `/docs/FRONTEND.md` - UI patterns
- `/docs/DATA_MODEL.md` - Database
- `/docs/README.md` - Docs maintenance guide

---

## 📋 Overview

**Bolão Brasileirão** is a web application for managing betting pools on Brazilian Football League (Série A) matches. Users can make predictions, track scores, and view rankings—all without authentication using unique names per round.

**Stack**: React + TypeScript (Frontend) | Cloudflare Workers + TypeScript (Backend) | Cloudflare D1 (Database) | Cloudflare Pages (Hosting)

**Key Constraint**: Zero-cost infrastructure using only Cloudflare's free tier.

---

## 🏗️ Architecture Overview

### Components

1. **Frontend** (`/apps/web`): React + Vite SPA deployed on Cloudflare Pages
   - Pages: Palpites (Predictions), Ranking, Histórico (History)
   - API calls to Worker backend
   - Environment: `VITE_API_BASE_URL` points to Worker

2. **Backend** (`/apps/worker`): Cloudflare Workers (TypeScript)
   - REST API for rounds, matches, predictions, rankings
   - External data sync from Football-Data.org API
   - Automated cron jobs for scoring and updates

3. **Database** (`Cloudflare D1`): SQLite-compatible serverless DB
   - Tables: `rounds`, `matches`, `predictions`, `scores`, `submission_tokens`
   - Schema in `/apps/worker/schema.sql`

4. **External API**: Football-Data.org
   - Competition ID: `2013` (Brasileirão Série A)
   - Token stored in Worker env var `FOOTBALL_DATA_TOKEN`

### Communication Flow

```
Frontend (React) ←→ Cloudflare Worker ←→ D1 Database
                ↓ (scheduled)
         Football-Data.org API
```

---

## 🔑 Core Concepts

### Rounds & Matches

- Each **round** has a `cutoff_at` timestamp (Tuesday 17:00 BRT = 20:00 UTC) usado para exibição e expiração de token
- **Round advancement**: `GET /rounds/next` checks if `cutoff_at` has expired (`now > cutoff_at`). If yes, fetches `currentMatchday + 1` from Football-Data.org, allowing next round to load before the external API updates `currentMatchday`
- Predictions are locked per match: kickoff time (UTC) must still be in the future
- **Matches** linked to rounds store team names, scores, and status (SCHEDULED, IN_PLAY, FINISHED)
- Match data synced from Football-Data.org with 6-day cache via `rounds.last_sync_at`

### Participants & Predictions

- No authentication: participants identified by **unique names per round**
- Each prediction stores predicted scores for a single match
- Points calculated automatically when match finishes
- Submission requires valid `submission_token` (optional in DEV mode)

### Scoring

- Centralized in `scoring.ts` (backend)
- Rules: Points awarded based on accuracy of predicted result
- Cron job updates `points` in predictions table when matches finish
- Ranking aggregated from predictions table by sum of points per participant

### Frontend Architecture (MPA)

- **Multi-Page Application**: Three separate HTML files deployed
  - `index.html` → `/` (Palpites/Predictions)
  - `rankings.html` → `/rankings` (Ranking)
  - `history.html` → `/history` (Histórico)
- Navigation via normal links (not SPA hash routing)
- Each page loads the same React bundle and renders appropriate content

---

## 📁 Project Structure

```
/apps
  /web
    /src
      /components      # Reusable: Alert, Layout, MatchCard, Tabs
      /pages           # HomePage, RankingsPage, HistoryPage, AdminPage
      /services        # API calls (api.ts)
      /styles          # global.css
      /types           # TypeScript interfaces
      /utils           # Helpers: date.ts, geLineup.ts (removed)
    /index.html, /rankings.html, /history.html
    /package.json
    /vite.config.ts

  /worker
    /migrations        # D1 migrations: 0001_init.sql, 0002_submission_tokens.sql
    /src
      /db.ts           # Database queries
      /footballData.ts # Football-Data.org integration
      /handlers.ts     # Request handlers
      /http.ts         # HTTP helpers
      /index.ts        # Main entry, Env interface
      /routes.ts       # Route definitions
      /scheduler.ts    # Cron jobs
      /scoring.ts      # Point calculation logic
      /time.ts         # Date/time utilities
      /validation.ts   # Payload validation
      /geLineup.ts     # Lineup URL generation (not currently used)
    /schema.sql        # Database schema
    /wrangler.toml     # Cloudflare Worker config
    /package.json

/docs
  /PROJECT_CONTEXT.md  # Vision, objectives, decisions
  /ARCHITECTURE.md     # System design
  /FRONTEND.md         # Frontend guide
  /BACKEND.md          # Backend guide
  /DATA_MODEL.md       # Database schema
  /DECISIONS_LOG.md    # Decision log
  /DEPLOY.md           # Deployment guide
  /API.md              # API documentation
```

---

## 🗄️ Database Schema

### `rounds`

- `id` (PK), `season`, `round_number`, `cutoff_at` (UTC ISO), `last_sync_at`, timestamps

### `matches`

- `id` (PK), `round_id` (FK), `api_match_id` (UNIQUE), `utc_date`, `status` (SCHEDULED|IN_PLAY|FINISHED)
- `home_team`, `away_team`, `home_score`, `away_score`, `external_link`, timestamps

### `predictions`

- `id` (PK), `round_id` (FK), `match_id` (FK), `participant_name`, `pred_home_score`, `pred_away_score`
- `points` (default 0), timestamps
- UNIQUE constraint: (round_id, participant_name, match_id)

### `scores`

- `id` (PK), `round_id` (FK), `participant_name`, `points_total`, timestamps
- Cache table for ranking queries

### `submission_tokens`

- `round_id` (PK, FK), `token_hash`, `expires_at`, timestamps
- Tokens hashed with SHA-256

---

## 🔌 API Endpoints

### Public Endpoints

- `GET /rounds/next` → Current/next round with matches
- `GET /rounds/:id` → Specific round details
- `GET /rounds/history?includeActive=true` → Past rounds
- `POST /predictions` → Submit predictions (requires valid token or DEV mode)
- `GET /rankings/round/:id` → Round rankings
- `GET /rankings/global` → Global rankings
- `GET /rounds/:id/predictions` → Predictions for a round (sorted by participant)

### Admin Endpoints

- `POST /admin/rounds/:id/submission-token` → Generate submission token (requires `X-Admin-Token`)
- `DELETE /admin/rounds/:id/predictions/:name` → Delete participant predictions (requires `X-Admin-Token`)
- `POST /admin/sync-finished` → Manual sync of finished matches from Football-Data (requires `X-Admin-Token`, exposed in Admin page)
- `POST /rounds/:id/recalculate` → Force score recalculation for finished matches in a round (requires `X-Admin-Token`, exposed in Admin page)

---

## 🛠️ Key Implementation Details

### Timezone Handling

- All timestamps stored in UTC (ISO 8601)
- Cutoff time calculated from Tuesday 17:00 America/Sao_Paulo
- Brazil timezone is GMT-3 (UTC-3)
- Conversion: `cutoff = Tuesday 20:00 UTC`
- Match locking compares `matches.utc_date` to "now" converted to Brasília time (UTC-3) on both frontend and backend

### Token Validation

- In **production** (`ENVIRONMENT=production`): Submission token is **always required** and validated via SHA-256 hash against the stored token for the round
- In **development** (`ENVIRONMENT=development`): Token can be empty (bypass), but if any token is provided it is **always validated** against the database
- The `ENVIRONMENT` variable defaults to `production` in `wrangler.toml` and is also explicitly set via `--var` in the deploy workflow
- Frontend detects `import.meta.env.DEV` to skip token input requirement locally

### Admin Token Validation

- Admin endpoints require `X-Admin-Token` header
- Compared using **timing-safe SHA-256 hash comparison** (not direct string equality) to prevent timing attacks
- `ADMIN_TOKEN` is stored as a Cloudflare Worker secret (not in `wrangler.toml`)

### Match Synchronization

- Triggered by cron job scheduled daily
- Fetches from Football-Data.org API v4
- Stores/updates matches with cache expiration
- Calculates cutoff time based on Football-Data.org current matchday

### Scoring Logic

- Implemented in `scoring.ts` backend function
- Called by cron job when match status changes to FINISHED
- Updates `points` field in predictions table
- Aggregates into `scores` table for fast ranking queries

---

## 📦 Tech Stack Details

### Frontend

- **React 18.3** with TypeScript 5.7
- **Vite 5.4** for bundling
- **Fetch API** for HTTP requests
- **No external UI framework**: inline styles + CSS utilities
- **Theming**: CSS variables with `prefers-color-scheme` and critical inline CSS in HTML entry files to avoid light-mode flash

### Backend

- **Cloudflare Workers** (TypeScript)
- **D1** for database (serverless SQLite)
- **Hono** or native fetch for HTTP routing (check `routes.ts`)
- **Node.js crypto** for SHA-256 hashing

### Deployment

- **GitHub Actions**: Auto-deploy on push to `/main`
  - Workflows: `.github/workflows/deploy-*.yml`
  - Requires: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` secrets
- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers

---

## 🔐 Environment Variables

### Frontend (`apps/web`)

- `VITE_API_BASE_URL` (optional): Worker URL; defaults to `http://localhost:8787` in DEV, error in production

### Backend (`apps/worker`)

- `FOOTBALL_DATA_TOKEN` (required): Football-Data.org API key
- `FOOTBALL_DATA_BASE_URL` (default: `https://api.football-data.org/v4`)
- `FOOTBALL_DATA_COMPETITION_ID` (default: `2013`)
- `DEFAULT_EXTERNAL_LINK` (default: G1 Globo link)
- `CORS_ORIGINS` (default: `http://localhost:5173` in wrangler.toml; production value injected via GitHub Actions variable `CORS_ORIGINS`; **if unset, CORS denies all origins** — no wildcard fallback)
- `ADMIN_TOKEN` (required for admin endpoints): Stored as Worker secret, synced via GitHub Actions secret `WORKER_ADMIN_TOKEN`
- `ENVIRONMENT` (default: `production` in wrangler.toml; explicitly set to `production` via `--var` in deploy workflow; set to `development` only for local dev via `.dev.vars` or wrangler override)

---

## 🚀 Development Workflow

### Local Setup

```bash
# Install dependencies
cd apps/web && npm install
cd ../worker && npm install

# Start dev servers (in separate terminals)
cd apps/web && npm run dev          # → http://localhost:5173
cd apps/worker && npm run dev       # → http://localhost:8787

# Build for production
cd apps/web && npm run build
cd apps/worker && npm run build
```

### Key Features for Local Testing

- **No token required**: Set `ENVIRONMENT=development` in Worker
- **Auto-reload**: Vite dev server hot-reloads on file changes
- **Database**: Local D1 database for testing (migrations applied automatically)

### Deployment

```bash
# Deploy Worker (requires Cloudflare credentials)
wrangler deploy

# Deploy Pages (automatic via GitHub Actions on push to main)
```

---

## ✅ Coding Guidelines

### General

1. **TypeScript everywhere**: Strict mode, no `any` unless unavoidable
2. **Code organization**: Keep concerns separated (db, handlers, utils)
3. **Error handling**: Validate inputs, return meaningful error messages
4. **Comments**: Explain _why_, not _what_; code should be self-documenting

### Frontend

- **Component structure**: Props interface + component function (no class components)
- **Styling**: Inline `style` objects or CSS classes; prefer consistency
- **API calls**: Centralized in `/services/api.ts`
- **State management**: React hooks (useState, useMemo, useEffect)
- **No external UI lib**: Use semantic HTML + inline styles for simplicity

### Backend

- **Database layer**: Use `/db.ts` for all queries; abstract SQL behind functions
- **Handlers**: Request logic in `/handlers.ts`; keep endpoints thin
- **Validation**: Strict payload validation in `/validation.ts`
  - `participantName`: min 2, max 50 characters
  - `pred_home_score` / `pred_away_score`: integers, 0–99
  - All inputs validated before database operations
- **Responses**: Consistent JSON format with proper HTTP status codes
- **Async/await**: Prefer over `.then()` chains

### File Naming

- Components: PascalCase (e.g., `MatchCard.tsx`)
- Utilities: camelCase (e.g., `hasMatchStarted.ts`)
- Types: Keep in `/types/index.ts` or co-locate with usage
- No index files unless necessary for exports

---

## 🐛 Common Issues & Solutions

### Frontend can't reach Worker

- Check `VITE_API_BASE_URL` env var
- Verify Worker is running (`npm run dev` in `/apps/worker`)
- Check CORS: `CORS_ORIGINS` env var in Worker

### Database migrations not applied

- Run `wrangler d1 migrations apply DB --remote` manually
- Check migration files in `/apps/worker/migrations/`

### Token validation failing

- In production: ensure token is correct and not expired
- In dev: set `ENVIRONMENT=development` in `wrangler.toml`

### Football-Data.org API errors

- Verify `FOOTBALL_DATA_TOKEN` is valid
- Check rate limits (limited free tier)
- Ensure `FOOTBALL_DATA_COMPETITION_ID=2013`

---

## 📝 Decision Log

Key architectural decisions:

- **MPA over SPA**: Separate HTML files for better caching and simpler routing
- **No authentication**: Use unique names per round for simplicity
- **Centralized scoring**: All scoring logic in backend for consistency
- **6-day cache**: Balance between freshness and API quota
- **Token-based submissions**: Optional in dev, required in production
- **D1 over REST**: Serverless SQL for simplicity and cost

See `/docs/DECISIONS_LOG.md` for full history.

---

## 🎯 Common Tasks

### Add a new endpoint

1. Define handler in `handlers.ts`
2. Add route in `routes.ts`
3. Update API types in frontend `/types/index.ts`
4. Test with `curl` or Postman

### Modify scoring rules

1. Update logic in `scoring.ts`
2. Test with known match/prediction data
3. Run cron job manually if needed: check `scheduler.ts`

### Add database migration

1. Create SQL file in `/apps/worker/migrations/000X_description.sql`
2. Deploy: `wrangler d1 migrations apply DB --remote`

### Debug API calls

- Frontend: Open DevTools → Network tab
- Backend: Check Worker logs in Cloudflare dashboard
- Use `--verbose` flag with Wrangler for local dev

---

## 📚 Reference Documentation

For detailed information, consult:

- `/docs/PROJECT_CONTEXT.md` – Project vision and decisions
- `/docs/ARCHITECTURE.md` – System design and flows
- `/docs/FRONTEND.md` – Frontend specifics
- `/docs/BACKEND.md` – Backend specifics
- `/docs/DATA_MODEL.md` – Database schema
- `/docs/API.md` – Endpoint documentation
- `/docs/DEPLOY.md` – Deployment instructions

---

## 🎭 Maintenance Notes

- **Backend cron jobs** run automatically on Cloudflare's schedule
- **Frontend** auto-deploys on push to main branch
- **Database** persists data; migrations are immutable
- **Monitoring**: Check Cloudflare dashboard for Worker logs and D1 status

---

_Last updated: 2026-02-12_
_For questions, refer to project docs or existing code patterns._
