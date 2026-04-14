# Frontend (React)

## Objetivo

Interface simples e mobile-first para listar jogos, coletar palpites, exibir rankings e histórico.

## Stack

- React + TypeScript
- Vite
- Fetch API
- Deploy: Cloudflare Pages

## Estrutura sugerida

```
/apps/web
  /src
    /components
    /pages
    /services
    /styles
    /types
    /utils
```

## Telas

- **Palpites**: lista de jogos da rodada atual + formulário de palpites.
- **Ranking**: ranking da rodada e geral.
- **Histórico**: rodadas anteriores e resultados.
- **Admin**: geração de tokens, remoção de palpites por nome, sincronização manual de partidas finalizadas e botão para forçar o recálculo (parcial) da pontuação da rodada usando `X-Admin-Token`.

## Fluxo de dados

1. `GET /rounds/next` para jogos (com `utcDate` e `status`) e `cutoffAt`.
2. `POST /predictions` para enviar palpites.
3. `GET /rankings/round/:id` e `GET /rankings/global` para ranking.
4. `GET /rounds/history` para histórico de rodadas.

## Configuração de ambiente

- `VITE_API_BASE_URL` para apontar para o Worker.

## UX

- Validação de nome obrigatório.
- Inputs bloqueados individualmente quando o horário do jogo (UTC) já passou.
- Feedback visual para sucesso/erro.

## Theming (dark/light)

- Tema baseado em variáveis CSS em `src/styles/global.css`.
- Alternância automática com `@media (prefers-color-scheme: dark)`.
- CSS crítico inline nos HTMLs de entrada (`index.html`, `rankings.html`, `history.html`, `admin.html`) para evitar flash de light mode antes do bundle carregar.

## Analytics (Google Tag Manager)

- GTM ID: `GTM-KFNL362J`
- O snippet `<script>` do GTM é adicionado ao final do `<head>` (antes de `</head>`) em cada um dos 4 HTMLs de entrada. O snippet `<noscript>` é adicionado imediatamente após `<body>` abre.
- O script GTM é assíncrono por design (`j.async=true`) — não bloqueia renderização.
- Eventos nativos capturados automaticamente pelo GTM (sem código extra): `page_view` a cada carregamento de página, scroll depth, cliques em links externos.
- **Utilitário `src/utils/analytics.ts`**: exporta `trackEvent(eventName, params?)` que:
  - Em `import.meta.env.DEV` (local): faz `console.log('[GTM dev]', ...)` e não envia nada ao GTM.
  - Em produção: empurra para `window.dataLayer` consumido pelo GTM.
- **Eventos customizados rastreados**:

| Evento                       | Onde                                             | Parâmetros                                      |
| ---------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `predictions_submit_success` | `HomePage.tsx` — após POST bem-sucedido          | `round_id`, `round_number`, `predictions_count` |
| `predictions_submit_error`   | `HomePage.tsx` — no catch do POST                | `error_message`                                 |
| `history_round_select`       | `HistoryPage.tsx` — onChange do select de rodada | `round_id`, `round_number`                      |
