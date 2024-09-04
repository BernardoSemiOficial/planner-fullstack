# Journey Backend

Este é um guia para executar o projeto "journey-backend".

## Dependências

Certifique-se de ter as seguintes dependências instaladas:

- Node.js
- npm (Node Package Manager)

## Instalação

1. Clone este repositório em sua máquina local.
2. Navegue até o diretório do projeto: `cd journey-backend`.
3. Execute o comando `npm install` para instalar todas as dependências do projeto.

## Execução

Após a instalação, execute o seguinte comando para iniciar o servidor:

```
npm start
```

O servidor estará disponível em `http://localhost:3000`.

## Scripts disponíveis

No diretório do projeto, você pode executar os seguintes comandos:

- `npm start`: Inicia o servidor em modo de produção.
- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reloading.
- `server:build`: "tsx --watch src/server.ts",
- `server:watch`: Executa o servidor localmente com hot-reloading.
- `prisma:studio`: Executa o Prisma Studio, podendo consultar os dados salvos.
