# Poupa Mais Frontend

Aplicacao frontend do projeto **PoupaMais**, construida com React, TypeScript, Vite, Redux Toolkit, React Redux e RTK Query.

Este diretorio deixou de ser apenas um template Vite/Redux. No estado atual, ele implementa uma area autenticada com navegacao entre Dashboard, Transacoes e Categorias, alem dos fluxos publicos de cadastro e login.

## Estado atual

Funcionalidades implementadas:

- Cadastro de usuario (`UC-01`) via `POST /users`.
- Login via `POST /auth/login`, recebendo JWT do backend.
- Persistencia do token em `localStorage` para manter a sessao apos reload.
- Logout local, removendo o token salvo.
- Shell autenticado com navegacao lateral (desktop) e compacta (mobile) entre Dashboard, Transacoes e Categorias.
- Listagem persistida de categorias via `GET /categories`.
- Criacao, edicao por selecao e exclusao com confirmacao de categorias (`UC-08`/`UC-09`/`UC-10`).
- Registro de transacoes de receita/despesa via `POST /transactions`, usando categorias reais como opcoes.
- Listagem de transacoes via `GET /transactions`, com filtros por tipo, categoria e periodo.
- Resumo derivado da lista filtrada de transacoes (receitas, despesas e resultado) calculado apenas para exibicao.
- Consulta de saldo por periodo (`UC-02`) via `GET /summary/balance`, com totais agregados no backend.
- Dashboard com KPIs reais de saldo, receitas e despesas, seletor de periodo (mes/trimestre/ano) e lista das ultimas transacoes.
- RTK Query como camada principal de server state (categorias, transacoes e saldo), com cache, loading, erro e invalidacao por tags.
- Tratamento padronizado de erros HTTP retornados pelo backend.

Ainda nao estao implementados:

- Roteamento real com rotas publicas/protegidas (a navegacao ainda usa estado local em `App.tsx`).
- Grafico de evolucao financeira no Dashboard (ainda placeholder).
- Sumarios financeiros agregados por categoria/periodo (`UC-05`).
- Testes automatizados do frontend.

O resumo exibido na tela de Transacoes e derivado apenas da lista carregada do backend e nao substitui um endpoint oficial de saldo. Regras financeiras oficiais devem permanecer no backend.

## Alinhamento arquitetural

O documento `../docs/contexto-arquitetural-para-sessoes-agenticas.md` define o PoupaMais como uma aplicacao web didatica de controle financeiro pessoal, com frontend React/Redux, backend Spring Boot e banco SQL.

Diretrizes importantes para proximas evolucoes:

- Dados financeiros oficiais nao devem ser armazenados em `localStorage`.
- O token de autenticacao pode ser armazenado temporariamente no navegador nesta fase, mas regras financeiras e dados persistidos devem vir do backend.
- Transacoes, categorias, saldo e sumarios sao server state. A direcao arquitetural preferida para essas chamadas e cache e RTK Query.
- Estado local ou slices Redux devem ficar restritos a estado de UI, sessao e fluxos pequenos quando fizer sentido.
- A proxima fatia vertical recomendada deve cobrir saldo simples e dashboard inicial a partir de endpoints agregados do backend.

## Estrutura relevante

```text
src/
|-- api/
|   |-- client.ts             # Cliente HTTP com fetch nativo (auth e usuario)
|   `-- poupaMaisApi.ts        # RTK Query: categorias e transacoes
|-- app/
|   |-- hooks.ts              # Hooks tipados do Redux
|   `-- store.ts              # Store com auth, user e poupaMaisApi
|-- features/
|   |-- auth/
|   |   `-- authSlice.ts      # Login, logout e token
|   |-- categories/
|   |   |-- CategoryForm.tsx  # Formulario de criacao/edicao
|   |   `-- CategoryList.tsx  # Tabela com selecao e exclusao
|   |-- transactions/
|   |   |-- TransactionForm.tsx  # Formulario de receita/despesa
|   |   `-- TransactionList.tsx  # Tabela, filtros e resumo derivado
|   `-- user/
|       `-- userSlice.ts      # Cadastro de usuario
|-- utils/
|   |-- format.ts             # Helpers de moeda (BRL) e data
|   `-- period.ts             # Faixas de data por periodo (mes/trimestre/ano)
|-- types/
|   `-- api.ts                # Contratos TypeScript da API
|-- App.tsx                   # Shell autenticado e views
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

O backend atual roda em `http://localhost:8081` (via `server.port`) e permite CORS para `http://localhost:5173` e `http://localhost:5174`.

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

Para testar o fluxo completo, o backend tambem precisa estar rodando em `http://localhost:8081` ou na URL configurada por `VITE_API_BASE_URL`. Como o banco H2 e em memoria, os dados sao reiniciados a cada restart do backend.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: executa TypeScript e gera build de producao.
- `npm run lint`: executa ESLint.
- `npm run preview`: serve localmente a build gerada.

## Fluxo manual esperado

1. Cadastrar um usuario com nome, email e senha.
2. Fazer login com o usuario cadastrado.
3. Em Categorias, criar uma ou mais categorias e edita-las selecionando-as na lista (sem digitar ID).
4. Em Transacoes, registrar uma receita e uma despesa usando as categorias criadas.
5. Conferir a lista de transacoes ordenada por data, o resumo derivado e os filtros por tipo, categoria e periodo.
6. Abrir o Dashboard e conferir os KPIs de saldo/receitas/despesas e as ultimas transacoes, trocando o periodo no seletor.

Os endpoints de categorias, transacoes e saldo exigem `Authorization: Bearer <token>`.

## Pendencias recomendadas

- Implementar o endpoint de sumario por categoria/periodo (`UC-05`) e a visualizacao de distribuicao/evolucao no Dashboard.
- Substituir a navegacao baseada em estado por rotas reais com protecao de sessao.
- Adicionar testes focados em autenticacao, erros de API e fluxos de categorias/transacoes.
