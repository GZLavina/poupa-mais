# Poupa Mais Frontend

Aplicacao frontend do projeto **PoupaMais**, construida com React, TypeScript, Vite, Redux Toolkit e React Redux.

Este diretorio deixou de ser apenas um template Vite/Redux. No estado atual, ele implementa uma primeira tela unica para validar integracao com o backend nos fluxos de usuario, autenticacao e categorias.

## Estado atual

Funcionalidades implementadas:

- Cadastro de usuario (`UC-01`) via `POST /users`.
- Login via `POST /auth/login`, recebendo JWT do backend.
- Persistencia do token em `localStorage` para manter a sessao apos reload.
- Logout local, removendo o token salvo.
- Criacao de categoria autenticada (`UC-08`) via `POST /categories`.
- Edicao de categoria autenticada (`UC-09`) via `PUT /categories/{id}`.
- Exclusao de categoria autenticada (`UC-10`) via `DELETE /categories/{id}`.
- Tratamento basico de erros HTTP retornados pelo backend.

Ainda nao estao implementados:

- Rotas publicas/protegidas.
- Dashboard financeiro.
- Transacoes de receita/despesa.
- Consulta de saldo por periodo.
- Sumarios financeiros.
- RTK Query.
- Testes automatizados do frontend.
- Listagem persistida de categorias via `GET /categories`.

Como ainda nao existe endpoint de listagem de categorias nesta fatia, a lista exibida na tela reflete apenas categorias criadas ou alteradas durante a sessao atual da pagina.

## Alinhamento arquitetural

O documento `../docs/contexto-arquitetural-para-sessoes-agenticas.md` define o PoupaMais como uma aplicacao web didatica de controle financeiro pessoal, com frontend React/Redux, backend Spring Boot e banco SQL.

Este frontend deve ser entendido como uma fatia inicial de autenticacao/categorias, nao como o MVP financeiro completo descrito no contexto arquitetural.

Diretrizes importantes para proximas evolucoes:

- Dados financeiros oficiais nao devem ser armazenados em `localStorage`.
- O token de autenticacao pode ser armazenado temporariamente no navegador nesta fase, mas regras financeiras e dados persistidos devem vir do backend.
- Transacoes, categorias, saldo e sumarios sao server state. A direcao arquitetural preferida para essas chamadas e cache e RTK Query.
- Estado local ou slices Redux devem ficar restritos a estado de UI, sessao e fluxos pequenos quando fizer sentido.
- A primeira fatia vertical financeira recomendada deve cobrir categorias, transacoes, saldo simples e dashboard inicial.

## Estrutura relevante

```text
src/
|-- api/
|   `-- client.ts             # Cliente HTTP com fetch nativo
|-- app/
|   |-- hooks.ts              # Hooks tipados do Redux
|   `-- store.ts              # Store com auth, user e categories
|-- features/
|   |-- auth/
|   |   `-- authSlice.ts      # Login, logout e token
|   |-- categories/
|   |   `-- categoriesSlice.ts
|   `-- user/
|       `-- userSlice.ts
|-- types/
|   `-- api.ts                # Contratos TypeScript da API
|-- App.tsx                   # Tela unica atual
`-- main.tsx                  # Provider Redux e bootstrap React
```

## Configuracao

Por padrao, o frontend chama o backend em:

```text
http://localhost:8081
```

Para usar outra URL, configure a variavel:

```bash
VITE_API_BASE_URL=http://localhost:8081
```

Exemplo com arquivo local:

```bash
echo "VITE_API_BASE_URL=http://localhost:8081" > .env.local
```

O backend atual permite CORS para `http://localhost:5173` e `http://localhost:5174`.

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

O Vite exibira a URL local, normalmente:

```text
http://localhost:5173
```

Para testar o fluxo completo, o backend tambem precisa estar rodando em `http://localhost:8081` ou na URL configurada por `VITE_API_BASE_URL`.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: executa TypeScript e gera build de producao.
- `npm run lint`: executa ESLint.
- `npm run preview`: serve localmente a build gerada.

## Fluxo manual esperado

1. Cadastrar um usuario com nome, email e senha.
2. Fazer login com o usuario cadastrado.
3. Criar uma categoria.
4. Editar uma categoria informando o ID retornado/criado.
5. Excluir uma categoria listada na sessao atual.

Os endpoints de categoria exigem `Authorization: Bearer <token>`.

## Pendencias recomendadas

- Adicionar `GET /categories` no backend e consumir no frontend.
- Migrar server state para RTK Query antes de implementar transacoes, saldo e dashboard.
- Separar a tela unica em features e rotas quando houver mais de um fluxo real.
- Atualizar os contratos para a nomenclatura final de dominio (`usuarios`, `categorias`, `transacoes`) se a API for padronizada em portugues.
- Adicionar testes focados em autenticacao, erros de API e fluxo de categorias.
