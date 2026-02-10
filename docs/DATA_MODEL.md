# Modelo de Dados (D1)

## Tabelas

### `rounds`

- `id` (INTEGER, PK)
- `season` (INTEGER)
- `round_number` (INTEGER)
- `cutoff_at` (TEXT, UTC ISO)
- `last_sync_at` (TEXT, UTC ISO)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `matches`

- `id` (INTEGER, PK)
- `round_id` (INTEGER, FK → rounds.id)
- `api_match_id` (INTEGER, UNIQUE)
- `utc_date` (TEXT)
- `status` (TEXT) — SCHEDULED | IN_PLAY | FINISHED
- `home_team` (TEXT)
- `away_team` (TEXT)
- `home_score` (INTEGER, nullable)
- `away_score` (INTEGER, nullable)
- `external_link` (TEXT, nullable)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `predictions`

- `id` (INTEGER, PK)
- `round_id` (INTEGER, FK → rounds.id)
- `match_id` (INTEGER, FK → matches.id)
- `participant_name` (TEXT)
- `pred_home_score` (INTEGER)
- `pred_away_score` (INTEGER)
- `points` (INTEGER, default 0)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `scores`

- `id` (INTEGER, PK)
- `round_id` (INTEGER, FK → rounds.id)
- `participant_name` (TEXT)
- `points_total` (INTEGER)
- `created_at` (TEXT)
- `updated_at` (TEXT)

## Índices recomendados

- `matches(api_match_id)` UNIQUE
- `predictions(round_id, participant_name)`
- `predictions(match_id)`
- `scores(round_id, participant_name)`

## Regras de integridade

- Nomes únicos por rodada: validar no Worker antes de inserir palpites.
- `predictions` deve existir apenas antes de `cutoff_at`.

## Observações sobre ranking

- Ranking por rodada: soma de `points` por `participant_name` filtrando por `round_id` (ou leitura direta de `scores`).
- Ranking geral: soma de `points` por `participant_name` em todas as rodadas (ou agregação de `scores`).
