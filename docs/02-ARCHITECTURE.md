# Arquitetura e mapa do código

## Visão de responsabilidades

| Camada | Diretório | Responsabilidade principal |
| --- | --- | --- |
| Interface pública e administrativa | `client/src/` | React 19, Tailwind, rotas, formulário, carrinho, idiomas e experiência visual. |
| Componentes reutilizáveis | `client/src/components/` | Logo, áudio ambiente, vídeos, WhatsApp, carrinho e componentes de interface. |
| Páginas | `client/src/pages/` | Home, produto, envio, confiança e áreas administrativas. |
| API e regras de negócio | `server/` | tRPC, produtos, vídeos, documentos, câmbio, analytics e integrações de armazenamento. |
| Infraestrutura de sessão | `server/_core/` | Inicialização Express, contexto, autenticação atual e ligação com Vite. |
| Banco de dados | `drizzle/` | Schema PostgreSQL e migrações geradas pelo Drizzle. |
| Dados de primeira instalação | `database/` | Seed SQL do catálogo de demonstração e instruções de carga. |
| Configuração segura | `config/env.example` | Modelo de variáveis que deve ser copiado para `.env`. |
| Mídias portáteis | `client/public/media/` | Imagens, áudio e vídeos já referenciados pela aplicação. |
| Documentação | `docs/` e arquivos `*.md` na raiz | Operação, arquitetura, banco, autenticação e Hostinger. |

## Fluxo de uma alteração de produto

1. O administrador utiliza a interface administrativa para criar ou editar o produto.
2. As procedures em `server/routers.ts` validam a requisição e chamam as funções de `server/db.ts`.
3. O Drizzle persiste dados estruturados no PostgreSQL definido por `DATABASE_URL`.
4. Arquivos novos devem ser enviados ao armazenamento externo configurado em `server/storage.ts`; o banco guarda somente metadados e URLs.
5. O frontend consulta dados via tRPC e renderiza catálogo, detalhe, documentação, vídeos e CTAs para WhatsApp.

## Padrão de qualidade para mudanças

Antes de enviar qualquer alteração, execute `pnpm check`, `pnpm test` e `pnpm build`. Para mudanças de schema, altere `drizzle/schema.ts`, gere a migração, revise o SQL e aplique-a em ambiente de teste antes da produção. Não edite registros de produção diretamente sem backup verificável.
