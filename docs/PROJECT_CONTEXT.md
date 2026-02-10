# Project Context

## Visão geral do projeto

- Projeto para gestão de bolão do Brasileirão, com foco em participação, palpites e acompanhamento de resultados.

## Objetivo principal

- Entregar uma aplicação web para criação e gerenciamento de bolões, cadastro de participantes, envio de palpites e cálculo de pontuações.

## Stack tecnológica definida

- **Frontend**: React + TypeScript
- **Backend**: Cloudflare Workers (TypeScript)
- **Hospedagem frontend**: Cloudflare Pages
- **Banco de dados**: Cloudflare D1 (SQL serverless, estilo SQLite)
- **API externa**: Football-Data.org (token já disponível)
- **Domínio**: Cloudflare (já configurado)

## Restrições importantes

- Custo zero: usar apenas serviços gratuitos.
- Infra baseada em Cloudflare (Pages, Workers, D1).

## Decisões técnicas já tomadas

- Documentação de contexto e decisões será mantida nos arquivos `/docs/PROJECT_CONTEXT.md` e `/docs/DECISIONS_LOG.md`.
- Stack definida conforme seção “Stack tecnológica definida”.
- Nomes serão únicos por rodada (sem autenticação).
- Pontuação centralizada em função única no backend.
- Frontend será criado com Vite (React + TypeScript).
- Integração Football-Data usa `FOOTBALL_DATA_COMPETITION_ID=2013` (Série A).
- Cache de jogos por 6 dias no backend.
- Deploy automático via GitHub Actions para Workers e Pages.

## Decisões em aberto

- Identidade do participante em ranking geral (mesmo nome em rodadas diferentes pode conflitar).
- Estratégia de atualização de resultados (cron horário fixo vs. checagem por status dos jogos).
- Política de histórico e retenção de dados.
- URL padrão para link externo de cada partida (G1 ou outro provedor).

## Dúvidas/ambigüidades

- Como tratar nomes iguais em rodadas diferentes no ranking geral.
- Frequência exata de sincronização com a Football-Data.org.
- Horário de fechamento dos palpites em UTC (America/Sao_Paulo vs UTC fixo).

## Propostas padrão (sugestões iniciais)

- **Identidade**: usar o nome como identificador global e exigir unicidade por rodada.
- **Fechamento**: calcular e armazenar o `cutoff_at` em UTC para cada rodada (terça 17h BRT).
- **Sincronização**: cron horário (ex.: a cada 1h) e ajuste por status de jogo (SCHEDULED/FINISHED).
- **Link externo**: armazenar `external_link` por partida e permitir edição manual.
