# Poupa Mais Frontend

Aplicação frontend base do projeto **Poupa Mais**, construída com:
- React
- TypeScript
- Redux Toolkit
- Vite

## Pré-requisitos
- Node.js (recomendado: versão 22+)
- npm

## Como rodar
No diretório `poupa-mais-frontend`, execute:

```bash
npm install
npm run dev
```

A aplicação ficará disponível no endereço exibido pelo Vite (normalmente `http://localhost:5173`).

## Como interagir com a aplicação
Ao abrir a página, você verá a tela inicial com um contador global (Redux).

Use os botões para testar o estado global:
- `-1`: decrementa 1
- `+1`: incrementa 1
- `+10`: incrementa 10

Se o número atualizar na interface a cada clique, a integração React + Redux está funcionando corretamente.

## Scripts úteis
- `npm run dev`: inicia ambiente de desenvolvimento
- `npm run build`: gera build de produção
- `npm run preview`: serve localmente a build gerada
