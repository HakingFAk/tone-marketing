# Checklist de externalização

Esta lista transforma o pacote em uma aplicação independente do ambiente em que foi criada. Execute as etapas em uma branch separada e teste em staging antes de apontar o domínio definitivo.

## Itens obrigatórios antes de publicar

| Área | Ação necessária | Arquivos envolvidos |
| --- | --- | --- |
| Banco | Criar PostgreSQL, definir `DATABASE_URL`, aplicar migração e seed. | `drizzle/`, `database/` |
| Sessão e Admin | Trocar o provedor de autenticação atual por Auth.js, Clerk, Auth0, Keycloak ou outro provedor escolhido. | `server/_core/oauth.ts`, `server/_core/context.ts`, `server/_core/trpc.ts` |
| Permissões | Criar a conta do Thiago no novo provedor e atribuir `role = 'admin'` na tabela `users`. | `users` |
| Armazenamento | Configurar S3 ou R2 para novos uploads e preservar permissões dos documentos. | `server/storage.ts`, `.env` |
| Build | Remover ou substituir integrações de desenvolvimento específicas do ambiente original, conforme necessário. | `vite.config.ts`, `server/_core/` |
| URL pública | Definir `APP_BASE_URL` e os redirecionamentos do provedor de login usando HTTPS. | `.env`, configuração OAuth |
| Proteções | Guardar segredos somente no painel da Hostinger ou em cofre equivalente; nunca no Git. | `.env` |

## Critério de aceite

O projeto está pronto para produção externa somente quando catálogo e WhatsApp funcionarem sem login, um usuário autorizado conseguir acessar `/admin`, uploads novos chegarem ao armazenamento externo, a migração estiver documentada e `pnpm check`, `pnpm test` e `pnpm build` concluírem sem erro.
