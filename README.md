# Tone Market — pacote para VS Code e PostgreSQL

Este pacote contém **todo o código criado para a Tone Market**: loja pública bilíngue, catálogo, filtros de promoção, produtos vendidos, Custom, galeria com zoom, carrinho de interesse, WhatsApp, vídeos, sons ambientes, painel administrativo, documentação de produtos e painel executivo de métricas.

## Início rápido no VS Code

Instale **Node.js 22+**, **pnpm** e PostgreSQL 16+ no seu computador ou servidor. Depois, abra esta pasta no VS Code, copie o modelo de ambiente para um arquivo `.env` local e instale as dependências:

```bash
cp config/env.example .env
pnpm install --frozen-lockfile
docker compose up -d postgres
pnpm db:migrate
psql "$DATABASE_URL" -f database/seed.sql
pnpm dev
```

O site abre em `http://localhost:3000`. Para gerar a versão de produção, use `pnpm build`; para executá-la, use `pnpm start`.

Para um roteiro completo de trabalho, leia primeiro [`docs/01-START-HERE.md`](./docs/01-START-HERE.md). O mapa técnico está em [`docs/02-ARCHITECTURE.md`](./docs/02-ARCHITECTURE.md), e as adaptações obrigatórias para servidor próprio estão em [`docs/03-EXTERNALIZATION-CHECKLIST.md`](./docs/03-EXTERNALIZATION-CHECKLIST.md).

## Banco de dados PostgreSQL

A cópia já usa Drizzle com driver PostgreSQL (`pg`). Configure a variável `DATABASE_URL` no `.env` com sua conexão real. Em produção, use uma URL com SSL quando o provedor exigir.

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?sslmode=require
```

O comando `pnpm db:generate` cria novas migrações após mudanças no esquema. O comando `pnpm db:migrate` aplica as migrações ao banco. Depois da primeira migração, execute `psql "$DATABASE_URL" -f database/seed.sql` para carregar o catálogo atual. O atalho `pnpm db:push` executa a geração e aplicação de migrações, mas não carrega o seed automaticamente.

## Acesso público e administrativo

| Área | Acesso esperado | Configuração externa |
|---|---|---|
| Loja pública | Aberto, sem login | Nenhuma conta é exigida para catálogo, Custom, Vendidos, vídeos ou formulário de WhatsApp. |
| Admin | Somente proprietário/equipe autorizada | Deve usar um provedor de autenticação externo e atribuir a função `admin` ao proprietário. |
| Indicadores | Somente `admin` | Depende do mesmo login administrativo; dados comerciais permanecem protegidos. |

> **Importante:** o projeto original usa a autenticação gerenciada do ambiente em que foi criado. Em um servidor externo, substitua-a por Auth.js, Clerk, Auth0, Keycloak, Google OAuth ou outra solução antes de publicar. O arquivo [`EXTERNAL_DEPLOYMENT.md`](./EXTERNAL_DEPLOYMENT.md) explica o ponto de troca e o fluxo recomendado.

## Ativos incluídos

Os arquivos em `client/public/media/` preservam as imagens, áudios e vídeos criados para a loja. Durante o desenvolvimento e no build externo, os caminhos `/media/...` continuam funcionando. A pasta é copiada para `dist/public/media/` por `pnpm build`. Para uploads posteriores, configure S3, Cloudflare R2 ou serviço equivalente pelos valores `S3_*`; o módulo `server/storage.ts` já usa URLs assinadas e não depende do armazenamento local.

## Comandos úteis

| Objetivo | Comando |
|---|---|
| Desenvolvimento | `pnpm dev` |
| Checar TypeScript | `pnpm check` |
| Executar testes | `pnpm test` |
| Gerar migração PostgreSQL | `pnpm db:generate` |
| Aplicar migrações | `pnpm db:migrate` |
| Carregar catálogo inicial | `psql "$DATABASE_URL" -f database/seed.sql` |
| Gerar build | `pnpm build` |
| Rodar produção | `pnpm start` |

Leia também [`POSTGRESQL_SETUP.md`](./POSTGRESQL_SETUP.md), [`database/SEEDING.md`](./database/SEEDING.md), [`EXTERNAL_DEPLOYMENT.md`](./EXTERNAL_DEPLOYMENT.md), [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md), o [`runbook operacional`](./docs/04-OPERATIONS-RUNBOOK.md) e o [`runbook de segurança`](./docs/06-SECURITY-RUNBOOK.md) antes de apontar um domínio ou compartilhar o Admin.
