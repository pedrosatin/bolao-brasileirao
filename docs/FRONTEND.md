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
- Inputs bloqueados individualmente quando o horário do jogo em Brasília (UTC-3) já passou ou o status não é mais `SCHEDULED/TIMED`.
- Feedback visual para sucesso/erro.

## Theming (dark/light)

- Tema baseado em variáveis CSS em `src/styles/global.css`.
- Alternância automática com `@media (prefers-color-scheme: dark)`.
- CSS crítico inline nos HTMLs de entrada (`index.html`, `rankings.html`, `history.html`, `admin.html`) para evitar flash de light mode antes do bundle carregar.
