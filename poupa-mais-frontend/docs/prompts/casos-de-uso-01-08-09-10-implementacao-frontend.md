### Plano: Limpeza do Frontend + Integração UC-01, UC-08, UC-09, UC-10

### Resumo
Substituir o template padrão do Vite/Redux por uma aplicação focada no domínio `poupa-mais`, removendo o contador de cliques e implementando uma tela única com:
- cadastro de usuário (UC-01),
- login para obtenção de JWT,
- criação, edição e exclusão de categorias autenticadas (UC-08/09/10).

### Mudanças de Implementação
1. Limpeza de arquivos não relacionados
- Remover feature de contador e Redux do template:
  - `src/features/counter/*`
  - `src/app/store.ts`
  - `src/app/hooks.ts`
  - uso de `Provider` no `src/main.tsx`
  - imports/estilos do contador em `src/App.tsx` e `src/App.css`
- Remover assets padrão não usados (`react.svg`, `vite.svg`) e CSS base de template que não pertence ao app.
- Ajustar `package.json` para remover dependências Redux (`@reduxjs/toolkit`, `react-redux`) caso não haja mais uso.

2. Camada de integração HTTP com backend
- Criar módulo de API com `fetch` nativo e `baseUrl` configurável por `VITE_API_BASE_URL` (fallback para `http://localhost:8080`).
- Implementar funções tipadas:
  - `createUser(payload)` → `POST /users`
  - `login(payload)` → `POST /auth/login`
  - `createCategory(payload, token)` → `POST /categories`
  - `updateCategory(id, payload, token)` → `PUT /categories/{id}`
  - `deleteCategory(id, token)` → `DELETE /categories/{id}`
- Tratar respostas de erro do backend (`ApiError`: `timestamp`, `status`, `message`, `path`) e exibir mensagens de forma amigável.

3. Interface única (CRUD funcional)
- Cadastro de usuário (nome, email, senha) com feedback de sucesso/erro.
- Login (email, senha) para obter JWT e armazenar em `localStorage`.
- Seção de categorias:
  - criar categoria (`name`, `description`),
  - listar no estado local da página as categorias criadas/alteradas durante a sessão,
  - editar categoria existente (preenchendo form com item selecionado),
  - excluir categoria com confirmação simples.
- Enviar `Authorization: Bearer <token>` nas operações de categoria.
- Botões com estado de loading e bloqueio durante requisições.

4. Tipos e contratos públicos
- Definir tipos TS alinhados ao backend:
  - `CreateUserRequest`, `UserResponse`
  - `LoginRequest`, `LoginResponse`
  - `CreateCategoryRequest`, `UpdateCategoryRequest`, `CategoryResponse`
  - `ApiError`
- Garantir normalização mínima de input (trim em campos textuais) antes do envio.

### Testes e Cenários de Aceite
- Build/lint do frontend sem erros após remoção do template.
- Fluxo feliz:
  1. Cadastrar usuário (201),
  2. Logar e obter token,
  3. Criar categoria (201),
  4. Editar categoria (200),
  5. Excluir categoria (204).
- Fluxos de erro:
  - validação inválida (400),
  - email já cadastrado (409 em UC-01),
  - token ausente/inválido em categorias (401/403),
  - categoria inexistente na edição/exclusão (404).
- Persistência do token em reload da página e logout manual (limpeza de token).

### Assumptions (travadas)
- Interface será uma tela única com seções (decisão escolhida).
- Login será implementado na própria tela e token salvo em `localStorage` (decisão escolhida).
- Não será implementada listagem `GET /categories` nesta etapa, pois não faz parte dos UCs solicitados; a UI refletirá operações no estado local.
