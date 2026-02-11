# Decisions Log

## 2026-02-10

- **Decisão**: Adotar documentação de contexto e decisões como fonte de verdade.
  **Justificativa**: Garantir continuidade do projeto e reduzir ambiguidade.

- **Decisão**: Stack baseada em Cloudflare (Pages, Workers, D1) com React + TypeScript.
  **Justificativa**: Atender custo zero, simplicidade operacional e stack unificada.

- **Decisão**: API externa será Football-Data.org para dados do Brasileirão (BR1).
  **Justificativa**: Fonte oficial e já com token disponível.

- **Decisão**: Nomes de participantes serão únicos por rodada (sem autenticação).
  **Justificativa**: Simplificar cadastro e evitar login em um bolão pequeno.

- **Decisão**: Regras de pontuação centralizadas em função única no backend.
  **Justificativa**: Facilitar manutenção e mudanças de regra.

- **Decisão**: Atualização de resultados e pontuação via Cron Trigger no Worker.
  **Justificativa**: Evitar dependência de chamadas do frontend e automatizar cálculo.

- **Decisão**: Tabela `scores` para cache de pontuação por rodada.
  **Justificativa**: Consultas de ranking mais rápidas e simples.

- **Decisão**: Frontend em React + TypeScript com Vite.
  **Justificativa**: Setup simples, rápido e compatível com Cloudflare Pages.

- **Decisão**: Usar `FOOTBALL_DATA_COMPETITION_ID=2013` (Brasileirão Série A) para chamadas à Football-Data.
  **Justificativa**: Evitar 404 com o código BR1 e garantir compatibilidade com a API v4.

- **Decisão**: Cache de jogos por 6 dias usando `rounds.last_sync_at`.
  **Justificativa**: Reduzir chamadas à Football-Data e respeitar limites de requisição.

- **Decisão**: Deploy automático via GitHub Actions para Cloudflare Workers e Pages.
  **Justificativa**: Automatizar releases e manter fluxo simples com repositório único.

## 2026-02-11

- **Decisão**: Trocar o bloqueio global por `cutoff` por um bloqueio por jogo usando horário de Brasília (UTC-3) no frontend e no Worker.
  **Justificativa**: Permitir palpites em jogos futuros mesmo após terça-feira 17h e impedir manipulação manual para partidas já iniciadas.
