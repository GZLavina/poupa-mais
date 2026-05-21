# Plano de melhoria da UI do PoupaMais

## Contexto

Este plano parte de três fontes do repositório:

- A aplicação React atual em `poupa-mais-frontend/src`, que hoje concentra cadastro, login e CRUD parcial de categorias em uma única página.
- Os protótipos estáticos em `docs/sprint-3/prototipos-web`, que mostram uma experiência de baixa fidelidade para login, dashboard, transações, categorias e sumários.
- O contexto arquitetural em `docs/contexto-arquitetural-para-sessoes-agenticas.md`, que recomenda separar estado de servidor, estado de sessão e estado de UI, usando Redux Toolkit e RTK Query como fronteira principal de API.

O objetivo da melhoria não deve ser apenas "deixar bonito". A UI precisa transformar os casos de uso em fluxos reais de produto, com navegação clara, estados previsíveis e uso didático da arquitetura Flux.

## Diagnóstico da UI atual

A tela atual cumpre o papel de prova técnica dos casos UC-01, UC-08, UC-09 e UC-10, mas ainda não se comporta como uma aplicação financeira:

- Há uma única página longa, sem hierarquia entre autenticação, categorias e área financeira.
- O usuário precisa informar manualmente o ID da categoria para editar, o que expõe detalhe técnico da API.
- A lista de categorias representa apenas itens criados na sessão atual, sem uma consulta inicial ao servidor.
- O layout usa cards independentes para demonstrar a API, mas não apresenta dashboard, transações, filtros, sumários ou navegação de aplicação.
- O estado de servidor está sendo tratado com `createAsyncThunk` em slices manuais. Isso funciona para uma prova inicial, mas tende a duplicar responsabilidades que RTK Query resolveria melhor: cache, carregamento, erros e invalidação.
- O estado local dos formulários está todo em `App.tsx`, dificultando a evolução para telas e componentes reutilizáveis.

## Leitura dos protótipos

Os protótipos indicam uma boa direção de produto, mesmo sendo simples:

- `login.html`: entrada autenticada antes de acessar dados financeiros, com área para erro padronizado.
- `dashboard.html`: layout autenticado com navegação lateral, filtros de período, KPIs de saldo/receitas/despesas, gráfico de evolução e últimas transações.
- `transacoes.html`: formulário de nova transação, alternância entre receita/despesa, validações, filtros por período/tipo/categoria e tabela responsiva.
- `categorias-sumarios.html`: manutenção de categorias, status ativo/inativo, filtros de sumário e distribuição por categoria.
- `index.html`: mapa dos fluxos principais, útil como referência de escopo, mas não deve virar uma landing page dentro da aplicação final.

A implementação React deve usar esses protótipos como matriz de fluxo e densidade visual, não como CSS definitivo.

## Experiência alvo

A primeira versão melhorada deve ter duas áreas:

1. Área pública/de sessão:
   - Tela de login.
   - Fluxo de cadastro de usuário, se o backend continuar expondo criação pública.
   - Mensagens claras para credenciais inválidas, sessão expirada e usuário recém-criado.

2. Área autenticada:
   - Shell persistente com marca, navegação principal e ação de sair.
   - Dashboard como primeira tela após login.
   - Tela de transações para registrar, listar, filtrar, editar e excluir receitas/despesas.
   - Tela de categorias para criar, editar, inativar/excluir e consultar categorias.
   - Área de sumários integrada ao dashboard ou a categorias, dependendo dos endpoints disponíveis.

O app deve abrir na experiência útil, não em uma página explicativa. Quando autenticado, o usuário deve cair no dashboard. Quando não autenticado, deve cair no login.

## Arquitetura de frontend recomendada

A UI deve explicitar o fluxo Flux:

```text
Interação do usuário
  -> action, mutation ou atualização de filtro
  -> store Redux Toolkit / cache RTK Query
  -> selectors e hooks tipados
  -> renderização React
```

Separação de responsabilidades:

- Server state: usuários, categorias, transações, saldo, dashboard e sumários. Preferir RTK Query.
- Auth/session state: token, usuário autenticado, status de sessão e logout. Manter em slice próprio, integrado ao `baseQuery` autenticado.
- UI state: período selecionado, filtros de listas, modal aberto, linha em edição e aba ativa. Usar slices pequenos quando o estado for compartilhado entre componentes; usar estado React quando for local ao formulário.
- Derived state: totais formatados, agrupamentos para gráfico, maior categoria e labels de período. Preferir selectors memoizados ou `selectFromResult`/transformações de RTK Query.

Estrutura sugerida:

```text
src/
  app/
    store.ts
    hooks.ts
  api/
    poupaMaisApi.ts
  features/
    auth/
    dashboard/
    transactions/
    categories/
    summaries/
  components/
    layout/
    feedback/
    forms/
    data-display/
  routes/
```

Se o projeto não adotar React Router ainda, a navegação pode começar com um slice `ui.currentView`. Para uma evolução mais próxima de produto, React Router deve ser considerado, porque autenticar, proteger rotas e separar telas ficará mais natural.

## Plano de evolução

### Fase 1: Base visual e navegação

- Quebrar `App.tsx` em shell, tela de login/cadastro e área autenticada.
- Criar um layout responsivo inspirado nos protótipos: navegação lateral no desktop e navegação superior/compacta no mobile.
- Definir tokens básicos de UI em CSS: cores funcionais, espaçamento, bordas, tipografia, estados de foco e estados desabilitados.
- Substituir a página demonstrativa por fluxos orientados a usuário.

Entregável esperado: login funcional, logout visível, shell autenticado e navegação entre dashboard, transações e categorias.

### Fase 2: Camada de dados com RTK Query

- Criar um `createApi` central para a API REST.
- Mover categorias de `createAsyncThunk` para endpoints RTK Query com tags de invalidação.
- Adicionar queries de listagem, porque a UI não deve depender apenas de mutações feitas na sessão.
- Preparar endpoints para transações e sumários conforme o backend disponibilizar.
- Manter o slice de auth separado, fornecendo token ao `baseQuery`.

Entregável esperado: componentes consumindo hooks de query/mutation, com loading, empty state, erro e refetch padronizados.

### Fase 3: Categorias como fluxo real

- Trocar edição por ID por edição a partir da lista.
- Exibir categorias retornadas do backend em uma lista ou tabela simples.
- Adicionar estados de carregamento, lista vazia, erro e confirmação antes de exclusão.
- Separar formulário de criação/edição em componente próprio.
- Planejar suporte a status ativo/inativo caso o backend evolua nessa direção.

Entregável esperado: UC-08, UC-09 e UC-10 usáveis por uma pessoa sem conhecer detalhes técnicos.

### Fase 4: Transações e filtros

- Implementar tela de transações conforme o protótipo: tipo, descrição, valor, data e categoria.
- Usar categorias reais como opções do formulário.
- Adicionar filtros por período, tipo e categoria.
- Preparar edição/exclusão de transações se houver endpoints.
- Formatação de valores e datas deve ficar em helpers reutilizáveis, não espalhada pelos componentes.

Entregável esperado: fluxo principal de receitas/despesas integrado às categorias e pronto para alimentar dashboard e sumários.

### Fase 5: Dashboard e sumários

- Criar KPIs para saldo, receitas, despesas e maior categoria.
- Exibir últimas transações.
- Incluir visualização simples de evolução por período e distribuição por categoria.
- Priorizar componentes acessíveis e responsivos antes de adicionar bibliotecas de gráfico.
- Usar selectors ou responses agregadas do backend para evitar recalcular regra financeira crítica somente no frontend.

Entregável esperado: dashboard inicial coerente com o MVP arquitetural descrito na documentação.

## Roteiro de sessões com Codex

A implementação deve acontecer em sessões curtas, preferencialmente uma fase por sessão. Isso reduz acúmulo de contexto e evita que decisões dependentes sejam tomadas em paralelo antes da base estar estável.

Não é recomendado distribuir todas as fases para subagentes de uma vez. As fases são sequenciais: layout influencia rotas, rotas influenciam fronteiras de features, RTK Query influencia como categorias e transações consomem dados, e os endpoints disponíveis influenciam dashboard e sumários. Subagentes podem ajudar em tarefas pequenas e isoladas, mas a integração principal deve permanecer na sessão central.

### Sessão 1: Fase 1

Objetivo: transformar a página única demonstrativa em uma base de app com sessão, shell autenticado e navegação.

Escopo:

- Manter contratos de backend inalterados.
- Separar `App.tsx` em tela pública de login/cadastro e área autenticada.
- Criar shell autenticado com marca, navegação para Dashboard, Transações e Categorias, e ação de sair.
- Criar views estruturadas para Dashboard, Transações e Categorias.
- Preservar o comportamento existente de cadastro, login e categorias quando possível.
- Não migrar para RTK Query nesta sessão.
- Não implementar transações reais se os endpoints ainda não existirem.
- Rodar `npm run lint` e `npm run build` ao final.

Prompt curto sugerido:

```text
Implemente a Sessão 1 do plano em poupa-mais-frontend/docs/ui-improvements/plano-melhoria-ui.md.
Mantenha contratos de backend inalterados, crie a separação entre login/cadastro e área autenticada, adicione o shell com navegação e preserve os fluxos existentes. Não migre para RTK Query ainda. Rode lint e build ao final.
```

### Sessão 2: Fase 2

Objetivo: introduzir RTK Query como fronteira principal para server state.

Escopo:

- Criar `src/api/poupaMaisApi.ts` com `createApi`, `baseQuery`, injeção do token e tags.
- Registrar reducer e middleware do RTK Query em `src/app/store.ts`.
- Migrar chamadas de categorias para queries/mutations RTK Query.
- Criar query de listagem de categorias se o backend já oferecer endpoint compatível.
- Remover cópias manuais de server state em slices quando forem substituídas por RTK Query.
- Manter `authSlice` como fonte de estado de sessão.
- Padronizar loading, erro, vazio e refetch nos componentes afetados.
- Rodar `npm run lint` e `npm run build` ao final.

Prompt curto sugerido:

```text
Implemente a Sessão 2 do plano em poupa-mais-frontend/docs/ui-improvements/plano-melhoria-ui.md.
Introduza RTK Query, migre categorias para queries/mutations, preserve auth em slice próprio e remova server state manual substituído. Rode lint e build ao final.
```

### Sessão 3: Fase 3

Objetivo: tornar categorias um fluxo real de usuário.

Escopo:

- Exibir categorias vindas da query do backend.
- Criar/editar categorias por formulário próprio.
- Editar a partir de seleção na lista, sem exigir digitação manual de ID.
- Adicionar confirmação antes de exclusão.
- Implementar estados de carregamento, vazio e erro.
- Separar componentes de lista, formulário e feedback quando isso reduzir complexidade.
- Validar responsividade da tela.
- Rodar `npm run lint` e `npm run build` ao final.

Prompt curto sugerido:

```text
Implemente a Sessão 3 do plano em poupa-mais-frontend/docs/ui-improvements/plano-melhoria-ui.md.
Transforme categorias em um fluxo usável com listagem real, criação, edição por seleção, exclusão com confirmação e estados de loading/erro/vazio. Rode lint e build ao final.
```

### Sessão 4: Fase 4

Objetivo: implementar a experiência de transações.

Escopo:

- Primeiro verificar quais endpoints de transações existem no backend.
- Se endpoints existirem, criar os tipos e endpoints RTK Query correspondentes.
- Se endpoints não existirem, implementar a UI com contratos documentados e evitar fingir persistência real.
- Criar formulário de transação com tipo, descrição, valor, data e categoria.
- Usar categorias reais como opções do formulário.
- Criar lista/tabela responsiva com filtros por período, tipo e categoria.
- Preparar edição/exclusão apenas se houver suporte real ou contrato claramente documentado.
- Centralizar formatação de moeda e datas em helpers reutilizáveis.
- Rodar `npm run lint` e `npm run build` ao final.

Prompt curto sugerido:

```text
Implemente a Sessão 4 do plano em poupa-mais-frontend/docs/ui-improvements/plano-melhoria-ui.md.
Verifique os endpoints de transações, implemente a UI de formulário/lista/filtros e conecte com RTK Query quando houver backend real. Não simule persistência como se fosse real. Rode lint e build ao final.
```

### Sessão 5: Fase 5

Objetivo: implementar dashboard e sumários a partir de dados reais ou contratos explícitos.

Escopo:

- Primeiro verificar endpoints disponíveis para saldo, dashboard, sumários ou transações agregadas.
- Criar KPIs de saldo, receitas, despesas e maior categoria.
- Exibir últimas transações.
- Criar visualização simples de evolução por período e distribuição por categoria.
- Preferir componentes acessíveis e CSS simples antes de adicionar bibliotecas de gráfico.
- Não calcular saldo oficial apenas no frontend quando o backend já expuser essa regra.
- Documentar contratos ausentes caso alguma agregação dependa de endpoint futuro.
- Rodar `npm run lint` e `npm run build` ao final.

Prompt curto sugerido:

```text
Implemente a Sessão 5 do plano em poupa-mais-frontend/docs/ui-improvements/plano-melhoria-ui.md.
Verifique endpoints de dashboard/saldo/sumários, implemente KPIs, últimas transações e visualizações simples com dados reais ou contratos documentados. Rode lint e build ao final.
```

### Uso pontual de subagentes

Subagentes só devem ser usados para tarefas paralelas e bem delimitadas. Exemplos úteis:

- Um explorer pode mapear endpoints do backend enquanto a sessão principal trabalha na UI.
- Um explorer pode levantar todos os usos atuais de Redux/API antes de uma migração.
- Um worker pode criar componentes compartilhados de feedback ou layout, desde que o escopo de arquivos seja claro.

Evitar:

- Um subagente por fase.
- Subagentes alterando os mesmos arquivos da sessão principal.
- Delegar decisões centrais de integração, roteamento, store e contratos de API.

## Regras de implementação

- Não duplicar dados oficiais em `localStorage`; usar `localStorage` apenas para o token enquanto essa for a decisão de autenticação.
- Não manter cópias manuais de server state em slices quando RTK Query puder representar a fonte de verdade.
- Não calcular saldo oficial apenas no frontend. A UI pode formatar e derivar visualizações, mas o backend deve seguir como fonte de regra financeira.
- Evitar componentes grandes com múltiplas responsabilidades. Formulários, listas, filtros e feedback devem ser extraídos quando começarem a misturar fluxos.
- Todo fluxo remoto deve ter estados explícitos: carregando, sucesso, erro, vazio e bloqueado por falta de autenticação.
- A responsividade deve ser validada desde a primeira fase, porque os protótipos já preveem layouts mobile.

## Sequência sugerida de commits

1. Criar estrutura de layout e separar `App.tsx` em telas/componentes.
2. Introduzir RTK Query e migrar categorias.
3. Melhorar CRUD de categorias com listagem real e edição por seleção.
4. Implementar tela de transações conectada aos endpoints disponíveis.
5. Implementar dashboard/sumários com dados reais ou contratos de API documentados.
6. Refinar estados visuais, acessibilidade, responsividade e testes.

## Critérios de aceite para a primeira melhoria

- O usuário não vê mais uma página técnica de casos de uso; vê um app financeiro com fluxo de login e área autenticada.
- Categorias podem ser criadas, listadas, editadas e removidas sem digitar IDs manualmente.
- A store deixa clara a divisão entre sessão, UI state e server state.
- A UI possui estados de erro, carregamento e vazio para chamadas remotas.
- O código fica preparado para adicionar transações, dashboard e sumários sem reescrever a base.
