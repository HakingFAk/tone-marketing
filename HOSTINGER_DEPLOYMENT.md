# Publicação na Hostinger

## Arquitetura recomendada

Para esta aplicação completa, use a **Node.js Web App** da Hostinger para o React + Express e um PostgreSQL externo — por exemplo, Supabase — ou use uma VPS Hostinger caso queira administrar o PostgreSQL no próprio servidor. A Hostinger documenta suporte a aplicações Node.js em planos Business e Cloud, com implantação por GitHub ou arquivo ZIP; Express.js é listado entre os backends compatíveis. [1]

| Componente | Opção recomendada | Alternativa |
|---|---|---|
| Aplicação Tone Market | Hostinger Node.js Web App | Hostinger VPS com Node.js gerenciado manualmente |
| PostgreSQL | Supabase conectado pelo hPanel | PostgreSQL no Docker/VPS usando `docker-compose.yml` |
| Mídias | Bucket S3 ou Cloudflare R2 | Diretório `public/manus-storage` apenas para desenvolvimento |
| Login do Admin | Auth.js, Clerk, Auth0 ou Google OAuth | Keycloak em VPS |

## Opção A — Hostinger Web App + PostgreSQL externo

1. No hPanel, acesse **Websites → Add Website → Deploy Web App**.
2. Escolha **Import Git Repository** para atualizações automáticas ou **Upload your website files** para enviar o arquivo ZIP deste pacote. [1] 
3. Se o detector não reconhecer o projeto, selecione **Other**. Use o build do `package.json` e defina a entrada de servidor como `dist/index.js` após a compilação.
4. Em **Environment Variables**, cadastre `DATABASE_URL`, `SESSION_SECRET`, variáveis do provedor de login e as credenciais de armazenamento. Nunca envie essas informações pelo Git ou no ZIP.
5. Para Supabase, use o assistente **Database → Connect** no painel da Node.js Web App. A Hostinger informa que esse fluxo aplica as variáveis necessárias à próxima publicação, mas não altera o código da aplicação. [2]
6. Após a primeira publicação, rode as migrações PostgreSQL conforme `POSTGRESQL_SETUP.md` e valide o login de Admin, o upload de mídia e uma consulta real ao banco.

> A Hostinger aceita conexões de aplicações Node.js a bancos hospedados externamente, incluindo PostgreSQL. [2]

## Opção B — VPS Hostinger + PostgreSQL próprio

Use esta opção quando quiser controle total de firewall, Docker, Nginx, processos e banco. A documentação da Hostinger indica VPS para cenários que precisam de controle mais preciso do runtime e da configuração de servidor. [3]

1. Envie o projeto por Git ou ZIP.
2. Crie o `.env` a partir de `ENVIRONMENT_TEMPLATE.txt`.
3. Inicie PostgreSQL com `docker compose up -d postgres` ou conecte a um PostgreSQL já existente.
4. Execute `pnpm install`, `pnpm db:push`, `pnpm build` e `pnpm start`.
5. Coloque Nginx na frente da aplicação, habilite HTTPS e mantenha o processo Node ativo com systemd ou PM2.

## Acesso público e login administrativo

A loja é pública; clientes **não** precisam criar conta para catálogo, carrinho, Custom ou WhatsApp. O Admin é privado e, no servidor externo, precisa de um provedor de autenticação substituto. Veja `EXTERNAL_DEPLOYMENT.md` antes de ativar o domínio.

## Referências

[1] [Hostinger — How to add a Node.js Web App](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

[2] [Hostinger — Connecting a Supabase database to a Node.js application](https://www.hostinger.com/support/connecting-a-supabase-database-to-a-hostinger-node-js-application/)

[3] [Hostinger — Node.js hosting options](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/)
