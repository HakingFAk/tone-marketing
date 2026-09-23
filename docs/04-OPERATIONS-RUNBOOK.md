# Runbook de desenvolvimento e operação

## Comandos de rotina

| Cenário | Comando | Resultado esperado |
| --- | --- | --- |
| Desenvolvimento | `pnpm dev` | Servidor local com recarga automática. |
| Tipos | `pnpm check` | Compilação TypeScript sem emissão de arquivos. |
| Testes | `pnpm test` | Validação automatizada de regras e componentes. |
| Build | `pnpm build` | Frontend em `dist/public` e servidor em `dist/index.js`. |
| Produção local | `pnpm start` | Execução do build produzido anteriormente. |
| Nova migração | `pnpm db:generate` | SQL novo a partir de `drizzle/schema.ts`. |
| Aplicar migrações | `pnpm db:migrate` | Banco atualizado com as migrações existentes. |

## Banco e backup

Faça backup do PostgreSQL antes de aplicar uma migração em produção. Mantenha o backup fora do servidor da aplicação, registre a data e valide a restauração em uma base isolada. O seed de `database/seed.sql` é destinado somente à primeira instalação de uma base nova e não deve ser reaplicado indiscriminadamente em uma base de operação.

## Mídias e documentos

Os ativos existentes em `client/public/media/` acompanham o build. Para materiais adicionados após a publicação, use armazenamento persistente configurado no backend. Documentos fiscais e arquivos privados não devem ser expostos por URL pública sem uma regra de autorização apropriada.

## Incidente e reversão

Quando um deploy apresentar falha, interrompa novas migrações, preserve logs e volte para o último build que passou por `pnpm check`, `pnpm test` e `pnpm build`. Uma reversão de código não desfaz automaticamente uma alteração destrutiva no banco; restaure dados somente a partir de backup validado.
