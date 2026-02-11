# 📚 Documentação - Guia de Manutenção

## Overview

Este diretório contém toda a documentação do projeto Bolão Brasileirão. A documentação serve como **fonte de verdade** para decisões arquiteturais, guias técnicos e contexto do projeto.

## ⚠️ Importante: Sincronização com Instructions

**Toda mudança relevante no código DEVE ser documentada aqui e refletida em `/github/instructions/base.instructions.md`.**

As LLMs são instruídas através do arquivo `base.instructions.md` - portanto, manter esse arquivo atualizado é crítico para que futuras contribuições sigam os padrões corretos.

## Estrutura de Arquivos

### `PROJECT_CONTEXT.md`

Visão geral, objetivos, stack tecnológica, restrições e decisões em aberto.

**Quando atualizar:**

- Nova decisão técnica tomada
- Mudança na stack tecnológica
- Novo objetivo ou restrição identificada

### `ARCHITECTURE.md`

Design do sistema, componentes, fluxos principais, segurança.

**Quando atualizar:**

- Novo componente adicionado ao sistema
- Mudança no fluxo de dados entre sistemas
- Nova integração com serviço externo
- Alteração na estrutura de comunicação frontend/backend

### `FRONTEND.md`

Stack frontend, estrutura de diretórios, telas, UX, configuração.

**Quando atualizar:**

- Nova página/componente principal adicionado
- Mudança na estrutura de pastas
- Nova dependência frontend
- Alteração em padrão de UX/UI

### `BACKEND.md`

Stack backend, endpoints, regras, estrutura de código, integração D1.

**Quando atualizar:**

- Novo endpoint adicionado/removido
- Mudança em regra de negócio
- Nova estrutura de arquivo/módulo
- Alteração em padrão de validação ou resposta

### `DATA_MODEL.md`

Schema D1, descrição de tabelas, colunas, relacionamentos, constraints.

**Quando atualizar:**

- Nova tabela criada
- Coluna adicionada/removida/modificada
- Mudança em constraints ou índices
- Alteração em tipo de dado

### `DECISIONS_LOG.md`

Histórico de decisões técnicas com justificativa.

**Quando atualizar:**

- TODA decisão técnica relevante deve ser registrada aqui
- Data, contexto, justificativa, e alternativas consideradas
- Decisões já implementadas

### `DEPLOY.md`

Guia de deployment, variáveis de ambiente, checklist.

**Quando atualizar:**

- Nova variável de ambiente necessária
- Alteração no processo de deployment
- Novo passo pré-deployment/pós-deployment
- Mudança em permissões ou configurações Cloudflare

### `API.md`

Documentação completa de endpoints, payloads, responses, códigos de erro.

**Quando atualizar:**

- Novo endpoint adicionado
- Mudança em payload ou response de endpoint existente
- Novo código de erro documentado
- Alteração em autenticação/autorização de endpoint

---

## 🔄 Processo de Documentação

### Ao fazer uma mudança relevante:

1. **Identifique qual(is) documento(s) se aplica(m)**
2. **Atualize o markdown correspondente**
   - Seja claro e conciso
   - Use exemplos quando pertinente
   - Atualize data se aplicável
3. **Sincronize com `/github/instructions/base.instructions.md`**
   - Atualize a seção relevante no arquivo de instruções
   - Mantenha referências cruzadas consistentes
4. **Commit com mensagem clara**
   - Exemplo: `docs: add new endpoint POST /predictions`
   - Exemplo: `docs: update database schema with teams table`

### Exemplos de mudanças que precisam de documentação:

✅ Novo endpoint na API
✅ Mudança na estrutura de resposta JSON
✅ Novo arquivo/componente maior que 50 linhas
✅ Alteração em regra de scoring ou validação
✅ Mudança no schema do banco de dados
✅ Nova variável de ambiente
✅ Novo padrão de código estabelecido
✅ Decisão arquitetural tomada
✅ Nova integração com serviço externo
✅ Mudança no fluxo de usuário

❌ Não precisa de documentação:

- Correção de typo/bug menor
- Refactoring interno sem mudança de comportamento
- Atualização de dependência patch/minor
- Comentário/clarificação de código

---

## 📝 Template para Decisões

Ao registrar decisão em `DECISIONS_LOG.md`:

```markdown
### Data (Ex: 2026-02-11)

- **Decisão**: [Breve descrição]
  **Justificativa**: [Por que essa decisão foi tomada]
  **Alternativas consideradas**: [O que foi descartado e por quê]
  **Impacto**: [Impacto no código/arquitetura/performance]
```

---

## 🔍 Checklist para Atualização

Antes de fazer commit com mudanças relevantes:

- [ ] Markdown relevante foi atualizado?
- [ ] Exemplos/código no markdown está correto?
- [ ] Referências cruzadas estão consistentes?
- [ ] `/github/instructions/base.instructions.md` foi atualizado?
- [ ] Decisão registrada em `DECISIONS_LOG.md` (se aplicável)?
- [ ] Mensagem de commit deixa claro o que mudou?

---

## 🚀 Para LLMs

**Ao trabalhar neste projeto:**

1. Consulte sempre os markdowns em `/docs` para entender contexto
2. Verifique o `DECISIONS_LOG.md` para decisões já tomadas
3. Ao fazer mudanças relevantes, **ATUALIZE TAMBÉM a documentação**
4. Se não tiver certeza se algo precisa de docs, **documente mesmo assim**
5. Mantenha `/github/instructions/base.instructions.md` sincronizado com as mudanças

**Exemplo de workflow correto:**

```
Mudança no código
    ↓
Identificar documentação relevante
    ↓
Atualizar markdown(s) em /docs
    ↓
Atualizar /github/instructions/base.instructions.md
    ↓
Commit com mensagem descritiva
```

---

## 📚 Referências

- Checkout `/docs/DECISIONS_LOG.md` para histórico de decisões
- Checkout `/docs/ARCHITECTURE.md` para visão geral do sistema
- Checkout `/github/instructions/base.instructions.md` para instruções completas do projeto

---

_Última atualização: 2026-02-11_
