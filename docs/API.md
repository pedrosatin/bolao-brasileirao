# API

## Base URL

- `https://api.seudominio.com`

## Endpoints

### `GET /`

Retorna status básico e lista de endpoints.

### `GET /health`

Healthcheck simples.

### `GET /rounds/next`

Retorna a próxima rodada com partidas.

**Response (200)**

```json
{
  "round": {
    "id": 12,
    "season": 2026,
    "roundNumber": 5,
    "cutoffAt": "2026-02-11T20:00:00Z"
  },
  "matches": [
    {
      "id": 999,
      "utcDate": "2026-02-12T00:00:00Z",
      "status": "SCHEDULED",
      "homeTeam": "Palmeiras",
      "awayTeam": "Flamengo",
      "externalLink": "https://g1.globo.com/"
    }
  ]
}
```

### `GET /rounds/:id`

Retorna detalhes de uma rodada específica.

### `GET /rounds/:id/predictions`

Retorna os palpites da rodada com os jogos correspondentes.

### `GET /rounds/history`

Retorna o histórico de rodadas já finalizadas.

**Query params**

- `includeActive=true`: inclui a rodada atual ainda não finalizada.

### `POST /predictions`

Cria palpites para uma rodada.

**Request**

```json
{
  "roundId": 12,
  "participantName": "Pedro",
  "submissionToken": "<token>",
  "predictions": [{ "matchId": 999, "home": 1, "away": 2 }]
}
```

**Rules**

- Rejeitar palpites para jogos cujo status não seja `SCHEDULED`/`TIMED` ou cujo `utc_date` já tenha passado (comparação no fuso de Brasília / UTC-3).
- Rejeitar se já existir palpite do mesmo nome na rodada.
- Rejeitar se `submissionToken` não for válido/expirado para a rodada.
  - Tokens vencem em `round.cutoff_at`.

### Admin

Todos os endpoints abaixo exigem o header:

- `X-Admin-Token: <ADMIN_TOKEN>`

#### `POST /admin/rounds/:id/submission-token`

Gera/rotaciona o token de envio da rodada (retorna o token em texto).

#### `DELETE /admin/rounds/:id/predictions/:name`

Deleta os palpites (`predictions`) e a linha de `scores` daquele participante na rodada.

#### `POST /admin/sync-finished`

Executa manualmente a sincronização das partidas finalizadas usando a Football-Data para atualizar placares antes do recálculo. Requer `X-Admin-Token`.

#### `POST /rounds/:id/recalculate`

Força o recálculo dos pontos da rodada usando os placares já armazenados. Pode ser executado mesmo que a rodada ainda tenha partidas sem placar; apenas os jogos com `home_score`/`away_score` definidos são reprocessados. Requer o header `X-Admin-Token` e é o mesmo endpoint acionado pela página de Admin para liberar rapidamente resultados parciais após jogos concluídos.

### `GET /rankings/round/:id`

Ranking da rodada.

### `GET /rankings/global`

Ranking geral.

## Erros comuns

- `400`: payload inválido (nome curto/longo, scores fora de 0-99, scores não inteiros)
- `401`: submission token ausente ou expirado / admin token ausente
- `403`: submission token inválido / origin não permitida / token não configurado para a rodada
- `409`: nome já usado na rodada
- `423`: jogo já começou / status não permite palpite
