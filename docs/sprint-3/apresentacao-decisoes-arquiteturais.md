---
marp: true
title: PoupaMais - Decisões Arquiteturais
paginate: true
---

# PoupaMais

## Decisões Arquiteturais Implementadas até Agora

Como as escolhas de arquitetura aparecem no código do backend, frontend, API e banco.

---

## Objetivo da Apresentação

- Explicar a arquitetura atual do repositório e não apenas a intenção documentada.
- Justificar as escolhas de stack: React, TypeScript, Redux Toolkit, Spring Boot, REST, JPA, Flyway e banco SQL.
- Mostrar onde padrões, camadas, fronteiras e estratégias aparecem em código.
- Separar o que já está implementado do que é direção arquitetural para as próximas fatias.

Referência documental: [`Documento de Arquitetura do Sistema.md`](Documento%20de%20Arquitetura%20do%20Sistema.md#L69-L105).

---

## Visão Geral da Solução

```text
Browser / React SPA
  -> HTTP JSON / REST
  -> Spring Boot API
  -> Services de aplicação
  -> Spring Data JPA
  -> Banco SQL versionado com Flyway
```

- A UI fica no frontend; regras críticas, autenticação e persistência ficam no backend.
- O backend é a fonte de verdade para dados persistidos.
- A integração entre camadas acontece por contratos HTTP JSON.

Evidências: [`package.json`](../../poupa-mais-frontend/package.json#L12-L17), [`pom.xml`](../../poupa-mais-backend/pom.xml#L20-L80), [`application.properties`](../../poupa-mais-backend/src/main/resources/application.properties#L3-L18).

---

## Decisão: Frontend e Backend Separados

- O frontend é uma SPA React/Vite focada em experiência, estado de tela e chamadas HTTP.
- O backend expõe API REST e concentra autenticação, autorização, validações e persistência.
- Essa separação permite evoluir interface, regras e banco com responsabilidades claras.

No código:

- Bootstrap da SPA com React e Redux Provider: [`main.tsx`](../../poupa-mais-frontend/src/main.tsx#L8-L14).
- API backend com controllers REST: [`AuthController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/AuthController.java#L9-L22), [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java#L10-L42).
- Camada HTTP centralizada no frontend: [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L30-L59), [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L50-L105).

---

## Decisão: API REST como Fronteira entre Apps

- Endpoints representam recursos e casos de uso: `/users`, `/auth/login`, `/categories`.
- Requests e responses trafegam como JSON.
- O frontend não acessa banco nem entidades JPA diretamente.

No código:

- Endpoints REST: [`UserController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/UserController.java#L17-L20), [`AuthController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/AuthController.java#L19-L21), [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java#L20-L41).
- Chamadas correspondentes no frontend: [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L67-L79), [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L66-L97).
- Tipos TypeScript dos contratos: [`api.ts`](../../poupa-mais-frontend/src/types/api.ts#L1-L44).

---

## Decisão: Backend em Camadas Simples

```text
Controller -> Service -> Repository -> Database
```

- Controllers lidam com HTTP, validação de entrada e usuário autenticado.
- Services executam regras de aplicação e controlam transações.
- Repositories isolam acesso relacional por Spring Data JPA.
- A escolha é pragmática: suficiente para o estágio atual sem criar portas/adaptadores prematuramente.

Evidências:

- Controller delegando: [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java#L20-L41).
- Service com regras: [`CategoryService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryService.java#L21-L66).
- Repository JPA: [`CategoryRepository.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryRepository.java#L7-L9).

---

## Decisão: Organização por Feature no Backend

- O código é agrupado por capacidade funcional: `auth`, `user`, `category`, `security`, `common`.
- Isso reduz acoplamento por tecnologia e facilita evoluir cada fatia vertical.
- A estrutura atual combina organização por feature com camadas internas simples.

Exemplos:

- `auth`: [`AuthController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/AuthController.java), [`AuthService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/AuthService.java).
- `category`: [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java), [`CategoryService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryService.java), [`CategoryRepository.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryRepository.java).
- `common`: [`GlobalExceptionHandler.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/common/GlobalExceptionHandler.java), [`ApiError.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/common/ApiError.java).

---

## Decisão: DTOs Protegem a Fronteira da API

- Requests e responses são tipos próprios, não entidades JPA expostas diretamente.
- Bean Validation entra nos DTOs de entrada.
- Responses removem campos internos, como `passwordHash`.

No código:

- DTO de criação de usuário com validações: [`CreateUserRequest.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/CreateUserRequest.java#L7-L11).
- Response sem senha: [`UserResponse.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/UserResponse.java#L3-L4).
- DTOs de categoria: [`CreateCategoryRequest.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CreateCategoryRequest.java#L6-L10), [`CategoryResponse.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryResponse.java#L3-L4).
- Controllers recebem `@Valid @RequestBody`: [`UserController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/UserController.java#L19-L20), [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java#L22-L35).

---

## Decisão: Persistência Relacional com JPA

- Usuários e categorias são entidades persistidas com JPA.
- Relacionamento `User -> Category` é modelado como chave estrangeira.
- Constraints de unicidade existem tanto no mapeamento JPA quanto na migration.

No código:

- Entidade `User`: [`User.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/User.java#L7-L28).
- Entidade `Category` com relação obrigatória para usuário: [`Category.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/Category.java#L8-L24).
- Constraint única por usuário e nome da categoria: [`Category.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/Category.java#L8-L9), [`V1__create_users_and_categories.sql`](../../poupa-mais-backend/src/main/resources/db/migration/V1__create_users_and_categories.sql#L11-L20).

---

## Decisão: Schema Versionado por Migration

- O schema nasce de scripts Flyway, não de geração automática livre do Hibernate.
- `ddl-auto=validate` faz o Hibernate validar se entidades e banco estão compatíveis.
- Essa escolha torna mudanças de banco revisáveis, reproduzíveis e auditáveis.

No código:

- Dependência Flyway: [`pom.xml`](../../poupa-mais-backend/pom.xml#L29-L32).
- Flyway habilitado e Hibernate validando schema: [`application.properties`](../../poupa-mais-backend/src/main/resources/application.properties#L8-L12).
- Migration inicial: [`V1__create_users_and_categories.sql`](../../poupa-mais-backend/src/main/resources/db/migration/V1__create_users_and_categories.sql#L1-L20).

Observação: a implementação atual usa H2 em memória para desenvolvimento, mantendo o desenho relacional portável.

---

## Decisão: Services como Casos de Uso Transacionais

- Escritas passam por services anotados com `@Transactional`.
- Services normalizam dados, aplicam regras e coordenam repositories.
- Isso evita regras relevantes dentro do controller ou do frontend.

No código:

- Criação de usuário com email normalizado e senha com hash: [`UserService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/UserService.java#L19-L31).
- Criação de categoria validando duplicidade por usuário: [`CategoryService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryService.java#L21-L38).
- Atualização e exclusão sempre filtram por dono: [`CategoryService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryService.java#L40-L62).

---

## Decisão: Segurança Stateless com JWT

- Login retorna token Bearer.
- O backend não usa sessão server-side para autenticação da API.
- Um filtro valida o token em cada request protegida e popula o contexto de segurança.

No código:

- Configuração stateless e proteção global: [`SecurityConfig.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/SecurityConfig.java#L38-L56).
- Geração e validação de JWT: [`JwtService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/JwtService.java#L20-L41).
- Filtro lendo `Authorization: Bearer`: [`JwtAuthenticationFilter.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/JwtAuthenticationFilter.java#L30-L57).
- Login validando senha antes de emitir token: [`AuthService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/AuthService.java#L24-L34).

---

## Decisão: Isolamento por Usuário

- Categorias pertencem a um usuário.
- Endpoints autenticados obtêm o usuário pelo principal, não pelo corpo da requisição.
- Queries de alteração usam `id + userId`, evitando acesso cruzado entre contas.

No código:

- Relação obrigatória categoria-usuário: [`Category.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/Category.java#L22-L24).
- Principal autenticado extraído no controller: [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java#L22-L49).
- Repository com filtros por usuário: [`CategoryRepository.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryRepository.java#L7-L9).
- Service usando `findByIdAndUserId`: [`CategoryService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryService.java#L40-L62).

---

## Decisão: Erros Padronizados para a API

- O backend centraliza exceções em `@RestControllerAdvice`.
- O frontend recebe uma forma previsível de erro: status, mensagem e path.
- Erros comuns são mapeados para HTTP apropriado: 400, 401, 403, 404, 409, 500.

No código:

- Contrato de erro: [`ApiError.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/common/ApiError.java#L5-L10).
- Handler global: [`GlobalExceptionHandler.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/common/GlobalExceptionHandler.java#L20-L83).
- Handlers específicos de segurança REST: [`RestAuthenticationEntryPoint.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/RestAuthenticationEntryPoint.java#L17-L23), [`RestAccessDeniedHandler.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/RestAccessDeniedHandler.java#L16-L21).
- Normalização no frontend: [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L21-L52).

---

## Decisão: Redux Toolkit como Estado de Aplicação

- A store centraliza estado de autenticação, usuário e cache de API.
- Slices representam transições previsíveis de estado.
- Thunks encapsulam login/cadastro; RTK Query encapsula mutações de categorias.

No código:

- Store Redux: [`store.ts`](../../poupa-mais-frontend/src/app/store.ts#L6-L15).
- Provider no bootstrap: [`main.tsx`](../../poupa-mais-frontend/src/main.tsx#L8-L14).
- Hooks tipados: [`hooks.ts`](../../poupa-mais-frontend/src/app/hooks.ts#L1-L5).
- Slice de autenticação: [`authSlice.ts`](../../poupa-mais-frontend/src/features/auth/authSlice.ts#L29-L80).
- API slice de categorias: [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L50-L105).

---

## Como Flux Aparece na Implementação Atual

Flux é a ideia de que a tela não altera dados importantes diretamente; ela dispara intenções, essas intenções passam por uma camada controlada, o estado muda em um lugar previsível, e a UI renderiza de novo a partir desse estado.

```text
View
  -> dispatch / hook de mutação
  -> thunk ou RTK Query endpoint
  -> reducer/cache da store
  -> selector/hook
  -> View atualizada
```

No código:

- A view dispara intenções: login/cadastro via `dispatch(...)` e categorias via hooks de mutação: [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L60-L84), [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L411-L493).
- A store é o ponto central de composição do estado: [`store.ts`](../../poupa-mais-frontend/src/app/store.ts#L6-L16).
- `authSlice` descreve transições explícitas de sessão: loading, authenticated e failed: [`authSlice.ts`](../../poupa-mais-frontend/src/features/auth/authSlice.ts#L47-L80).
- `poupaMaisApi` concentra chamadas de categoria, cache e invalidação em vez de deixar cada componente decidir sozinho: [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L50-L105).

---

## Decisão: Camada HTTP Centralizada no Frontend

- A URL base da API fica em fronteiras explícitas (`VITE_API_BASE_URL`).
- O tratamento de erro HTTP é padronizado.
- O cabeçalho Bearer é montado em uma função comum.
- A UI consome funções e hooks de API, sem espalhar `fetch` por componentes.

No código:

- Base URL configurável: [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L12-L12).
- Função genérica de request: [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L30-L59).
- RTK Query com Bearer token: [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L50-L64).
- Mutações de categorias com invalidação: [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L66-L97).
- Operações de usuário e login: [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L67-L79).

---

## Decisão: Estado de Sessão Separado do Estado de Tela

- Token e status de login ficam no slice `auth`.
- A tela escolhe entre sessão pública e área autenticada a partir do token.
- A navegação interna atual é estado local do componente, porque ainda não há roteamento real.
- O token é persistido em `localStorage`; dados financeiros oficiais não devem seguir essa estratégia.

No código:

- Persistência do token: [`authSlice.ts`](../../poupa-mais-frontend/src/features/auth/authSlice.ts#L11-L27).
- Login/logout: [`authSlice.ts`](../../poupa-mais-frontend/src/features/auth/authSlice.ts#L29-L80).
- Decisão de renderizar sessão pública ou autenticada: [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L25-L47).
- Estado local de view: [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L13-L29).
- Diretriz registrada no README: [`poupa-mais-frontend/README.md`](../../poupa-mais-frontend/README.md#L39-L45).

---

## Decisão: UI Composta em Fatia Vertical Inicial

- A tela atual cobre cadastro, login e categorias.
- A área autenticada já reserva navegação para dashboard, transações e categorias.
- Transações e dashboard ainda são placeholders, deixando claro o limite da fatia implementada.

No código:

- Fluxos públicos de cadastro e login: [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L49-L255).
- Shell autenticado e navegação: [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L259-L318).
- Tela de categorias integrada ao RTK Query: [`App.tsx`](../../poupa-mais-frontend/src/App.tsx#L411-L634).
- Pendências documentadas: [`poupa-mais-frontend/README.md`](../../poupa-mais-frontend/README.md#L20-L31).

---

## Decisão: Contratos Tipados no Frontend

- O frontend declara tipos equivalentes aos DTOs do backend.
- Isso reduz chamadas com payloads inconsistentes.
- A fronteira entre UI e API fica mais explícita.

Exemplos:

- `CreateUserRequest` no backend: [`CreateUserRequest.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/CreateUserRequest.java#L7-L11).
- `CreateUserRequest` no frontend: [`api.ts`](../../poupa-mais-frontend/src/types/api.ts#L8-L12).
- `LoginResponse` no backend: [`LoginResponse.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/LoginResponse.java#L3-L4).
- `LoginResponse` no frontend: [`api.ts`](../../poupa-mais-frontend/src/types/api.ts#L25-L28).
- `CategoryResponse` nos dois lados: [`CategoryResponse.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryResponse.java#L3-L4), [`api.ts`](../../poupa-mais-frontend/src/types/api.ts#L40-L44).

---

## Decisão: Testes Focados nas Fronteiras de Risco

- Services são testados para regras de negócio e conflitos.
- Repositories são testados com Spring Boot e transação de teste.
- Segurança JWT tem teste próprio.
- Controller testa comportamento de autenticação obrigatório.

No código:

- Regras de usuário: [`UserServiceTest.java`](../../poupa-mais-backend/src/test/java/com/poupa_mais_backend/user/UserServiceTest.java#L27-L53).
- Regras de categoria e ownership: [`CategoryServiceTest.java`](../../poupa-mais-backend/src/test/java/com/poupa_mais_backend/category/CategoryServiceTest.java#L32-L83).
- Repository integrado: [`CategoryRepositoryIntegrationTest.java`](../../poupa-mais-backend/src/test/java/com/poupa_mais_backend/category/CategoryRepositoryIntegrationTest.java#L12-L38).
- JWT: [`JwtServiceTest.java`](../../poupa-mais-backend/src/test/java/com/poupa_mais_backend/security/JwtServiceTest.java#L10-L25).

---

## Trade-offs Atuais

- **Camadas simples, não Clean/Hexagonal completa:** reduz cerimônia agora; pode evoluir quando transações e relatórios criarem mais regras.
- **H2 em memória:** acelera desenvolvimento; uma migração para PostgreSQL ou outro SQL deve manter Flyway/JPA como fronteira.
- **RTK Query parcial:** categorias já usam RTK Query; login/cadastro ainda usam thunks simples.
- **Tela única em vez de rotas:** aceitável na validação inicial; rotas protegidas devem entrar quando houver mais fluxos reais.

Evidências: [`poupa-mais-frontend/README.md`](../../poupa-mais-frontend/README.md#L20-L31), [`poupa-mais-frontend/README.md`](../../poupa-mais-frontend/README.md#L130-L136), [`application.properties`](../../poupa-mais-backend/src/main/resources/application.properties#L3-L18).

---

## Próximas Decisões Arquiteturais

- Implementar `GET /categories` para fechar CRUD persistido no frontend.
- Criar a feature de transações com a mesma disciplina: DTOs, service transacional, repository e testes.
- Expandir RTK Query para transações, saldo, dashboard e relatórios.
- Externalizar segredos, CORS e banco por ambiente.
- Decidir quando migrar de H2 em memória para PostgreSQL ou outro banco SQL persistente.

Referências de direção já documentadas: [`contexto-arquitetural-para-sessoes-agenticas.md`](../contexto-arquitetural-para-sessoes-agenticas.md#L79-L89), [`Documento de Arquitetura do Sistema.md`](Documento%20de%20Arquitetura%20do%20Sistema.md#L799-L815).

---

## Decisões Agrupadas por Camada

| Camada | Decisões principais |
| --- | --- |
| Frontend | React SPA, TypeScript, Redux Toolkit, RTK Query parcial, estado de sessão separado. |
| API / Integração | REST JSON, DTOs como contrato, tratamento padronizado de erros, Bearer token. |
| Backend | Spring Boot, controllers finos, services transacionais, repositories JPA, organização por feature. |
| Segurança | JWT stateless, Spring Security, autorização por usuário autenticado, CORS explícito em desenvolvimento. |
| Dados | Banco SQL, JPA/Hibernate, Flyway, constraints relacionais, H2 em memória nesta fase. |
| Qualidade | Testes unitários de services, integração de repository, teste de JWT e comportamento de autenticação. |

---

## Backend: Decisões Agrupadas

- **Framework:** Spring Boot com Web MVC, Security, JPA, Flyway e OpenAPI.
- **Camadas:** controllers recebem HTTP; services aplicam regras; repositories acessam o banco.
- **Transações:** escritas de usuário e categoria passam por services com `@Transactional`.
- **Domínio atual:** usuário, autenticação e categorias formam a primeira fatia vertical.
- **Erros:** exceções são centralizadas em uma resposta REST consistente.

Evidências: [`pom.xml`](../../poupa-mais-backend/pom.xml#L20-L80), [`UserController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/UserController.java#L17-L20), [`CategoryService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryService.java#L21-L66), [`GlobalExceptionHandler.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/common/GlobalExceptionHandler.java#L20-L83).

---

## Frontend: Decisões Agrupadas

- **Framework:** React com TypeScript e Vite para uma SPA.
- **Estado:** Redux Toolkit centraliza autenticação, usuário e cache de API.
- **Assíncrono:** thunks cobrem login/cadastro; RTK Query cobre mutações de categoria.
- **API:** `client.ts` cobre fluxos simples; `poupaMaisApi.ts` cobre server state com cache, hooks e tags.
- **UI atual:** tela única valida cadastro, login e categorias antes da introdução de rotas.

Evidências: [`package.json`](../../poupa-mais-frontend/package.json#L12-L30), [`main.tsx`](../../poupa-mais-frontend/src/main.tsx#L8-L14), [`store.ts`](../../poupa-mais-frontend/src/app/store.ts#L6-L16), [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L50-L105), [`client.ts`](../../poupa-mais-frontend/src/api/client.ts#L12-L79).

---

## API e Segurança: Decisões Agrupadas

- **Contrato externo:** REST sobre JSON, com DTOs separados de entidades JPA.
- **Autenticação:** login emite JWT e o frontend envia `Authorization: Bearer`.
- **Sessão:** backend stateless; frontend guarda token localmente nesta fase.
- **Autorização:** endpoints de categoria usam o usuário autenticado e queries filtradas por `userId`.
- **Falhas:** 401, 403, 404, 409 e validações chegam ao frontend como mensagens tratáveis.

Evidências: [`AuthService.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/auth/AuthService.java#L24-L34), [`SecurityConfig.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/SecurityConfig.java#L38-L56), [`JwtAuthenticationFilter.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/security/JwtAuthenticationFilter.java#L30-L57), [`CategoryController.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/CategoryController.java#L22-L49), [`poupaMaisApi.ts`](../../poupa-mais-frontend/src/api/poupaMaisApi.ts#L54-L62).

---

## Dados e Persistência: Decisões Agrupadas

- **Modelo:** relacional, com usuários e categorias ligados por chave estrangeira.
- **Integridade:** email único e nome de categoria único por usuário.
- **Evolução:** schema versionado por Flyway.
- **Validação:** Hibernate não cria schema livremente; ele valida o schema aplicado.
- **Ambiente atual:** H2 em memória acelera desenvolvimento, mantendo a arquitetura compatível com SQL persistente.

Evidências: [`User.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/user/User.java#L7-L28), [`Category.java`](../../poupa-mais-backend/src/main/java/com/poupa_mais_backend/category/Category.java#L8-L24), [`V1__create_users_and_categories.sql`](../../poupa-mais-backend/src/main/resources/db/migration/V1__create_users_and_categories.sql#L1-L20), [`application.properties`](../../poupa-mais-backend/src/main/resources/application.properties#L3-L18).

---

## Conclusão

- A arquitetura atual já demonstra uma separação clara entre apresentação, API, aplicação, segurança e persistência.
- As decisões principais são visíveis em código: REST, DTOs, services transacionais, repositories JPA, migrations, JWT e Redux Toolkit.
- A próxima evolução deve preservar essas fronteiras ao implementar transações, saldo e dashboard.
- O ponto mais importante: regras financeiras oficiais devem permanecer no backend e no banco, não no estado local do navegador.
