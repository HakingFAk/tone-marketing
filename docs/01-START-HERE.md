# Início profissional no VS Code

## Objetivo

Este pacote deve ser aberto como uma única pasta de projeto no VS Code. Ele já contém código-fonte, testes, esquema PostgreSQL, migração inicial, seed do catálogo, mídias locais e documentação. Nenhuma credencial de produção é incluída.

## Sequência recomendada

| Etapa | Ação | Comando |
| --- | --- | --- |
| 1 | Abra `tone-marketing-vscode-postgres` no VS Code. | — |
| 2 | Crie a configuração local sem expor segredos. | `cp config/env.example .env` |
| 3 | Suba o PostgreSQL local. | `docker compose up -d postgres` |
| 4 | Instale versões travadas das dependências. | `pnpm install --frozen-lockfile` |
| 5 | Aplique a migração do schema. | `pnpm db:migrate` |
| 6 | Carregue o catálogo e as mídias de demonstração. | `psql "$DATABASE_URL" -f database/seed.sql` |
| 7 | Verifique o projeto. | `pnpm check && pnpm test` |
| 8 | Inicie o ambiente local. | `pnpm dev` |

O endereço padrão é `http://localhost:3000`. Mantenha o `.env` fora do repositório e altere a senha de desenvolvimento presente no `docker-compose.yml` antes de compartilhar a máquina ou subir qualquer ambiente público.

> O catálogo público funciona sem login. O painel administrativo requer a substituição da autenticação original por um provedor externo; siga `EXTERNAL_DEPLOYMENT.md` e o checklist de externalização antes de publicar.