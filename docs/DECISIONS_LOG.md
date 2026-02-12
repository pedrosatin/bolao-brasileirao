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

## 2026-02-12

- **Decisão**: Alterar `ENVIRONMENT` padrão no `wrangler.toml` de `development` para `production` e injetar explicitamente `--var ENVIRONMENT=production` no workflow de deploy.
  **Justificativa**: O Worker em produção estava rodando com `ENVIRONMENT=development`, o que desabilitava a validação de submission token — qualquer pessoa podia enviar palpites sem token.

- **Decisão**: Restringir o fallback de CORS de `"*"` (aceitar tudo) para `[]` (negar tudo) quando `CORS_ORIGINS` não está configurado.
  **Justificativa**: Reduzir superfície de ataque. Se a variável não for configurada, nenhuma origin é aceita, ao invés de aceitar todas.

- **Decisão**: Mover `CORS_ORIGINS` de produção do `wrangler.toml` para GitHub Actions variable.
  **Justificativa**: Evitar expor a URL de produção no repositório público. O `wrangler.toml` agora contém apenas `http://localhost:5173`.

- **Decisão**: Usar comparação timing-safe (via SHA-256 hash) para validação do `ADMIN_TOKEN`.
  **Justificativa**: Comparação direta de strings (`===`) é vulnerável a timing attacks que podem inferir o token caractere por caractere.

- **Decisão**: Adicionar limites de validação: `participantName` max 50 chars, scores inteiros entre 0-99.
  **Justificativa**: Prevenir abuso com nomes enormes ou valores de placar absurdos.

- **Decisão**: Corrigir lógica do bypass de token em dev: bypass só se token é completamente vazio; qualquer token fornecido é sempre validado contra o banco.
  **Justificativa**: Antes, tokens curtos (<10 chars) em dev passavam sem validação. Agora, se o usuário envia um token, ele é verificado independente do ambiente.
