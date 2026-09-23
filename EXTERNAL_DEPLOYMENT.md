# Implantação externa e logins

## O que funciona para o público

A loja pública não exige login. Clientes podem pesquisar catálogo, consultar instrumentos vendidos, enviar uma ideia Custom, adicionar itens ao carrinho, assistir aos vídeos e iniciar conversas no WhatsApp.

## O que precisa ser trocado para o Admin

O acesso administrativo original é baseado no provedor de autenticação do ambiente gerenciado. Ao mover para um servidor próprio, mantenha o modelo de usuários e a coluna `role`, mas substitua a origem da sessão em `server/_core/context.ts` e `server/_core/trpc.ts` por um provedor externo. A regra necessária é simples: somente usuários autenticados com `role = 'admin'` podem chamar procedimentos administrativos e acessar `/admin`, `/admin/videos`, `/admin/ambient` e `/admin/insights`.

### Opções recomendadas

| Estratégia | Quando usar | Observação |
|---|---|---|
| Auth.js + Google | Proprietário usa conta Google | Boa opção para um Admin pequeno e privado. |
| Clerk/Auth0 | Projeto com crescimento e múltiplos administradores | Simplifica sessões, convite e recuperação de acesso. |
| Keycloak | Empresa com infraestrutura própria | Mais controle, porém exige operação adicional. |
| Basic Auth temporário | Apenas ambiente de homologação | Não é recomendado como acesso final ao Admin. |

Após o primeiro login externo, crie ou atualize o usuário na tabela `users` e defina `role = 'admin'` para `carlosmanoel100620@gmail.com`, a conta administrativa definida para esta implantação. O script [`database/admin-bootstrap.sql`](./database/admin-bootstrap.sql) fornece a atualização controlada após o primeiro login. Não coloque senha, token ou chave de serviço no Git.

## Armazenamento e domínio

O pacote inclui os ativos existentes para desenvolvimento local. Em produção, configure S3/R2 e atualize as URLs de mídia e o módulo `server/storage.ts`. Configure HTTPS no domínio antes de ativar OAuth externo. Mantenha logs, variáveis de ambiente e backups de banco no provedor escolhido.
