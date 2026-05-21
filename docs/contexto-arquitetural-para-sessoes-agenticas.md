# Contexto Arquitetural para Sessões Futuras com Agentes

**Projeto:** PoupaMais  
**Objetivo:** consolidar o estado atual da documentação, os conceitos arquiteturais relevantes e os principais pontos em aberto para orientar futuras sessões de planejamento e implementação com agentes.

## 1. Leitura Atual dos Documentos

Os documentos Markdown em `docs/` indicam que o PoupaMais evoluiu de uma proposta frontend-only com `localStorage` para uma aplicação web separada em frontend, backend e banco SQL. A documentação da Sprint 3 já assume React, TypeScript, Redux Toolkit, RTK Query, Java, Spring Boot, Spring Security, Spring Data JPA/Hibernate e persistência relacional.

Os documentos principais são:

- `docs/README.md`: índice mínimo dos artefatos de Grau A.
- `docs/sprint-3/Documento de Visão do Produto.md`: visão de produto, stack proposta, escopo funcional, requisitos, roadmap e decisões arquiteturais.
- `docs/sprint-3/Documento de Arquitetura do Sistema.md`: visão arquitetural mais ampla, componentes, dados, implantação, qualidade, testes e alternativas.
- `docs/sprint-3/Documento de Realização de Caso de Uso.md`: realização mais pragmática dos casos de uso centrais.

A leitura sugere três camadas de intenção:

1. **Produto:** uma ferramenta simples de controle financeiro pessoal.
2. **Arquitetura de referência:** frontend React/Redux, backend Spring Boot, banco SQL e API REST.
3. **Objetivo didático:** usar o projeto para explorar arquitetura, padrões, testes e organização de código, sem a pressão de uma aplicação pública pronta para produção.

Esse terceiro ponto deve influenciar decisões futuras. O objetivo não é entregar a menor implementação possível, nem criar complexidade artificial. O projeto deve tornar decisões arquiteturais visíveis, testáveis e comparáveis.

## 2. Escopo Funcional de Base

Há uma diferença importante entre a visão completa e a realização dos casos de uso. A visão de produto menciona dashboard, gráficos, sumários, autenticação, categorias, receitas, despesas, metas, alertas e relatórios. O documento de realização reduz o foco para:

- autenticar usuário;
- registrar despesa;
- registrar receita básica;
- consultar saldo;
- cadastrar categoria;
- consultar sumário financeiro simples.

Para um primeiro MVP arquitetural, a menor fatia coerente parece ser:

1. Autenticação simples ou usuário fixo de desenvolvimento, conforme a prioridade da sessão.
2. Categorias por usuário.
3. Transações com tipo `RECEITA` ou `DESPESA`.
4. Consulta de saldo por período.
5. Dashboard inicial com totais e lista recente.

Metas, alertas, exportação de relatórios, geração assíncrona e observabilidade avançada devem permanecer no roadmap até que o núcleo transacional esteja claro.

## 3. Tensões e Decisões em Aberto

Os documentos atuais deixam algumas decisões explícitas ou implícitas:

| Tema | Estado atual | Decisão a tomar |
| --- | --- | --- |
| Banco de dados | Docs citam PostgreSQL como referência, mas o projeto pode começar com SQLite. | SQLite é suficiente para o objetivo didático inicial, desde que as limitações sejam documentadas. |
| Backend | Docs usam fluxo Controller -> Service -> Repository. | Decidir se a implementação será uma camada simples ou uma adaptação de Clean/Hexagonal com portas e adaptadores. |
| Frontend | Docs citam Redux Toolkit e RTK Query. | Separar claramente estado de UI, estado de sessão e server state. |
| Autenticação | Docs assumem Spring Security, token ou cookie seguro. | Definir se a primeira versão terá autenticação real ou usuário de desenvolvimento para destravar domínio. |
| MVP | Visão ampla, realização menor. | Definir uma primeira fatia vertical antes de implementar telas avançadas. |
| CQRS | Citado como possibilidade. | Usar separação leve entre comandos e consultas, sem múltiplos bancos ou event sourcing no início. |

## 4. Flux, Redux Toolkit e Mapeamento com NgRx

Flux é mais um padrão arquitetural do que um framework. A ideia central é fluxo unidirecional: a UI dispara ações, as ações passam por um mecanismo de despacho, o estado é atualizado em stores, e a UI renderiza novamente a partir do novo estado. O valor didático para o PoupaMais está em tornar alterações de estado previsíveis e rastreáveis.

Redux é uma evolução influenciada por esse estilo. A forma moderna recomendada de escrever Redux é Redux Toolkit, que reduz boilerplate, padroniza configuração de store, cria slices e inclui RTK Query para busca e cache de dados de servidor.

Para alguém vindo de Angular + NgRx, o mapa mental inicial pode ser:

| Angular + NgRx | React + Redux Toolkit | Observação para o PoupaMais |
| --- | --- | --- |
| `StoreModule` / store global | `configureStore` | Centraliza reducers, middlewares e DevTools. |
| Actions | Slice actions ou endpoints RTK Query | Devem descrever intenções, não setters genéricos. |
| Reducers | `createSlice` reducers | Mantêm transições síncronas e previsíveis. |
| Effects | RTK Query, `createAsyncThunk` ou listener middleware | Chamadas HTTP CRUD devem começar por RTK Query. |
| Selectors | `createSelector` / typed hooks | Usados para derivar dados de estado cliente. |
| `store.select(...)` | `useSelector` / hooks tipados | Componentes leem estado por hooks. |
| Async pipe | Hooks de consulta/mutação | RTK Query expõe `data`, `isLoading`, `error` etc. |
| Facades Angular | Hooks e módulos por feature | Úteis para esconder detalhes de store da UI. |
| Signals | Estado local React, selectors memoizados ou stores menores | Signals e Redux não são equivalentes, mas ambos ajudam a derivar UI a partir de estado explícito. |

### Separação de estados no frontend

O PoupaMais deve evitar colocar tudo no Redux manualmente. Uma divisão útil:

- **Server state:** transações, categorias, saldo e sumários retornados pela API. Preferir RTK Query.
- **Client/UI state:** filtros ativos, abas, modal aberto, seleção de linha, preferências visuais. Usar slices locais ou estado React, conforme escopo.
- **Auth/session state:** usuário autenticado, status de sessão e talvez permissões. Pode ser slice próprio mais integração com o mecanismo de autenticação.
- **Derived state:** totais formatados, agrupamentos para gráficos e labels. Preferir selectors ou transformação de resposta em RTK Query.

Para este projeto, RTK Query deve representar a fronteira HTTP principal. Isso ajuda a explorar Flux sem reimplementar manualmente cache, loading, erro e invalidação para cada endpoint.

## 5. Backend: Clean Architecture, Hexagonal Architecture e Spring

Clean Architecture e Hexagonal Architecture apontam para a mesma preocupação prática: regras de negócio e casos de uso não devem depender diretamente de detalhes como framework web, banco, serialização JSON ou tecnologia de persistência.

Em uma aplicação Spring tradicional, é fácil cair no fluxo:

```text
Controller -> Service -> Repository -> Database
```

Esse fluxo não é necessariamente errado, mas pode virar apenas uma divisão por tecnologia. Para o objetivo didático do PoupaMais, vale tornar explícita a direção das dependências:

```text
Entrada HTTP
  -> Adapter in: controller REST, DTOs, mappers
  -> Application: casos de uso, comandos, consultas, transações
  -> Domain: entidades, value objects, regras e invariantes
  -> Ports out: interfaces necessárias pela aplicação
  -> Adapter out: Spring Data JPA, SQLite/PostgreSQL, mappers de persistência
```

### Adaptação pragmática para Spring Boot

Uma estrutura possível para uma feature como transações:

```text
transacoes/
├── application/
│   ├── CriarTransacaoUseCase.java
│   ├── CriarTransacaoCommand.java
│   ├── ConsultarTransacoesQueryService.java
│   └── port/
│       ├── TransacaoRepositoryPort.java
│       └── CategoriaLookupPort.java
├── domain/
│   ├── Transacao.java
│   ├── TipoTransacao.java
│   └── Dinheiro.java
├── adapter/
│   ├── in/web/
│   │   ├── TransacaoController.java
│   │   └── dto/
│   └── out/persistence/
│       ├── TransacaoJpaEntity.java
│       ├── SpringDataTransacaoRepository.java
│       └── TransacaoPersistenceAdapter.java
```

Essa estrutura é mais pesada que a abordagem comum de `controller/service/repository`. Ela só vale a pena se a sessão quiser exercitar fronteiras arquiteturais. Uma alternativa intermediária é organizar por feature e manter `controller`, `application`, `domain` e `persistence` separados, sem criar interfaces para cada operação simples.

### Regras de aplicação para o backend

- Controllers devem receber HTTP, validar DTOs e delegar.
- DTOs não devem vazar para o domínio.
- Use cases ou application services devem ser o limite transacional com `@Transactional`.
- Regras financeiras devem ficar no domínio ou na aplicação, não no controller.
- Spring Data repositories são adapters de persistência, não o contrato do domínio por padrão.
- Consultas de dashboard podem usar projections ou query services, sem forçar o domínio a carregar grafos desnecessários.
- O `usuarioId` deve vir do contexto autenticado, nunca do corpo de requisições financeiras.

## 6. DDD no PoupaMais

O domínio inicial é pequeno. Isso é bom para aprendizado, mas exige cuidado para não exagerar nos padrões. O vocabulário atual já sugere uma linguagem ubíqua:

- `Usuario`
- `Categoria`
- `Transacao`
- `TipoTransacao`
- `Saldo`
- `ResumoFinanceiro`
- `SumarioFinanceiro`
- `MetaFinanceira`, em versão futura

Bounded contexts separados provavelmente ainda não são necessários. Uma divisão inicial plausível:

- **Identidade e acesso:** autenticação, credenciais e sessão.
- **Finanças pessoais:** categorias, transações, saldo e sumários.

Mesmo que tudo rode em um único backend monolítico, essa separação conceitual ajuda a evitar que autenticação, persistência e regras financeiras se misturem.

Possíveis objetos de domínio:

| Conceito | Tipo provável | Observação |
| --- | --- | --- |
| `Transacao` | Entidade ou aggregate root simples | Deve proteger tipo, valor positivo, data e associação com categoria/usuário. |
| `Categoria` | Entidade | Nome único por usuário, status ativa/inativa. |
| `Dinheiro` | Value object | Evita espalhar regras de escala, sinal e arredondamento. |
| `Periodo` | Value object | Centraliza validação de data inicial/final. |
| `ResumoFinanceiro` | DTO de aplicação ou modelo de leitura | Calculado a partir de consultas, não necessariamente entidade persistida. |

## 7. CQRS como Separação Leve

CQRS não precisa significar dois bancos, event sourcing ou infraestrutura assíncrona. Para este projeto, a versão útil é separar intenções:

- **Commands:** criar transação, atualizar transação, excluir transação, criar categoria, inativar categoria.
- **Queries:** listar transações, consultar saldo, consultar dashboard, consultar sumário por categoria/período.

Isso permite que comandos sejam modelados como casos de uso com validações e transações, enquanto queries podem usar modelos de leitura otimizados para tela. Um exemplo:

```text
POST /api/transacoes
  -> CriarTransacaoCommand
  -> CriarTransacaoUseCase
  -> valida categoria, valor, ownership
  -> persiste transação

GET /api/dashboard/resumo?inicio=...&fim=...
  -> ConsultarResumoFinanceiroQuery
  -> DashboardQueryService
  -> consulta agregada por usuario_id e período
  -> response próprio para UI
```

Essa separação já entrega o aprendizado central de CQRS sem aumentar demais o custo da primeira implementação.

## 8. Banco de Dados: SQLite Primeiro, SQL Portável Depois

Os documentos da Sprint 3 usam PostgreSQL como referência. Para um projeto pequeno e didático, SQLite é uma boa primeira opção, desde que algumas decisões sejam tomadas conscientemente:

- Habilitar `PRAGMA foreign_keys = ON` em cada conexão.
- Usar migrations versionadas desde o início.
- Manter constraints no banco, além das validações de aplicação.
- Criar índices por `usuario_id`, `data`, `tipo` e `categoria_id`.
- Considerar `valor_centavos INTEGER` no schema, mantendo `Dinheiro` ou `BigDecimal` no domínio/API.
- Documentar que SQLite aceita somente um writer simultâneo, o que é aceitável para desenvolvimento e MVP educativo.
- Validar antes da implementação qual dialeto Hibernate/SQLite será usado, pois isso pode exigir dependência adicional ou configuração específica.

Um modelo mínimo:

```text
usuarios(id, nome, email, senha_hash, criado_em, atualizado_em)
categorias(id, usuario_id, nome, ativa, criado_em, atualizado_em)
transacoes(id, usuario_id, categoria_id, tipo, valor_centavos, data, descricao, criado_em, atualizado_em)
```

Se o projeto migrar para PostgreSQL depois, a fronteira de persistência deve reduzir o impacto sobre aplicação e domínio.

## 9. Primeira Fatia Vertical Recomendada

Uma boa primeira sessão de implementação deveria criar uma fatia vertical pequena, com frontend, backend e banco:

1. Banco com migrations para `usuarios`, `categorias` e `transacoes`.
2. Backend com endpoint de criação/listagem de categorias.
3. Backend com endpoint de criação/listagem de transações.
4. Backend com query de saldo simples por usuário.
5. Frontend com store Redux Toolkit, API slice RTK Query e telas mínimas para categorias/transações/saldo.
6. Testes focados em regras de domínio, endpoint principal e isolamento por usuário.

Se autenticação real atrasar a fatia vertical, usar um usuário fixo de desenvolvimento pode ser aceitável por uma sessão, desde que a fronteira seja clara e removível.

## 10. Critérios para Futuras Sessões

Antes de modificar código, uma sessão futura deve responder:

- Qual fatia vertical será implementada?
- A sessão quer exercitar arquitetura didática ou entregar uma funcionalidade mínima?
- O backend usará camada simples ou portas/adaptadores explícitos?
- O banco inicial será SQLite?
- Haverá autenticação real nesta fatia?
- Qual estado do frontend pertence ao RTK Query e qual pertence a slices locais?
- Quais testes demonstram a decisão arquitetural tomada?

Durante implementação, manter estas regras:

- Não duplicar dados oficiais no `localStorage`.
- Não calcular regras financeiras críticas somente no frontend.
- Não deixar controller acessar diretamente repository de persistência para casos de uso com regra.
- Não criar abstração sem uma razão didática ou prática clara.
- Preferir uma feature completa pequena a várias telas desconectadas.

## 11. Referências Consultadas

Referências consultadas em maio de 2026.

- Flux: https://facebookarchive.github.io/flux/docs/in-depth-overview
- Redux concepts and one-way data flow: https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow
- Redux Toolkit getting started: https://redux-toolkit.js.org/introduction/getting-started
- RTK Query overview: https://redux-toolkit.js.org/rtk-query/overview
- RTK Query automated refetching: https://redux-toolkit.js.org/rtk-query/usage/automated-refetching
- NgRx store principles: https://github.com/ngrx/store
- Angular signals: https://angular.dev/guide/signals
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Hexagonal Architecture: https://alistair.cockburn.us/hexagonal-architecture
- Spring Boot reference: https://docs.spring.io/spring-boot/reference/using/index.html
- Spring Web MVC reference: https://docs.spring.io/spring-framework/reference/web/webmvc.html
- Spring Data JPA reference: https://docs.spring.io/spring-data/jpa/reference/jpa.html
- Spring declarative transactions: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html
- Spring Security servlet applications: https://docs.spring.io/spring-security/reference/servlet/index.html
- CQRS by Martin Fowler: https://martinfowler.com/bliki/CQRS.html
- Microsoft domain analysis and DDD overview: https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis
- SQLite foreign keys: https://www.sqlite.org/foreignkeys.html
- SQLite transactions: https://www.sqlite.org/lang_transaction.html
- SQLite datatypes: https://www.sqlite.org/datatype3.html
