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

## Fluxo de dados

1. `GET /rounds/next` para jogos e `cutoffAt`.
2. `POST /predictions` para enviar palpites.
3. `GET /rankings/round/:id` e `GET /rankings/global` para ranking.
4. `GET /rounds/history` para histórico de rodadas.

## Configuração de ambiente

- `VITE_API_BASE_URL` para apontar para o Worker.

## UX

- Validação de nome obrigatório.
- Bloqueio local de envio após `cutoffAt`.
- Feedback visual para sucesso/erro.
