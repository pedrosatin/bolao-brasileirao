# Arquitetura

## Visão geral

A solução é composta por um frontend React hospedado no Cloudflare Pages e um backend serverless em Cloudflare Workers, com persistência no Cloudflare D1. Os dados de jogos do Brasileirão (BR1) são sincronizados a partir da API Football-Data.org.

## Componentes

- **Frontend (Cloudflare Pages)**: UI para exibir jogos, coletar palpites e mostrar rankings.
- **Backend (Cloudflare Workers)**: API REST para leitura/escrita de dados e integração com Football-Data.org.
- **Banco (Cloudflare D1)**: Armazena rodadas, partidas, palpites e pontuações.
- **Scheduler (Cron Triggers)**: Atualiza jogos e calcula pontuações automaticamente.

## Comunicação frontend ↔ backend

- Comunicação via HTTPS/JSON.
- Opção recomendada: subdomínio dedicado para API (`api.seudominio.com`) apontando para o Worker.
- Alternativa simples: rota `/api/*` no Pages com proxy para Worker.
- Autenticação: não há login; uso de nomes únicos por rodada.

## Fluxos principais

1. **Sincronização de jogos**: Cron Trigger consulta Football-Data.org e atualiza a tabela `matches`.
2. **Exibição no frontend**: UI consulta `/rounds/next` e `/rounds/:id` para listar partidas.
3. **Envio de palpites**: UI envia `POST /predictions` com nome e placares.
4. **Fechamento automático**: Worker bloqueia palpites após `cutoff_at`.
5. **Cálculo de pontuação**: Cron Trigger detecta jogos `FINISHED` e atualiza `points`.
6. **Rankings**: UI consulta `/rankings/round/:id` e `/rankings/global`.

## Fechamento de palpites

- `cutoff_at` é calculado para cada rodada com base em terça-feira às 17h (America/Sao_Paulo) e armazenado em UTC.
- No `POST /predictions`, o Worker valida `now() <= cutoff_at`.

## Segurança e confiabilidade

- Rate limit simples por IP no Worker.
- Validação estrita de payloads.
- Evitar excesso de chamadas à API externa com cache de resultados em D1.

## Estrutura sugerida do repositório

```
/apps
  /web          # React + TS
  /worker       # Cloudflare Worker + TS
/packages
  /shared       # Tipos e utilitários compartilhados
/docs
```

## Observações

- Sem autenticação, o nome do participante é tratado como identificador lógico.
- Caso haja conflito de nomes, o ranking geral pode ficar impreciso.
