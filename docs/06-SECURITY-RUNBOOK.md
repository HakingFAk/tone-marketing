# Runbook de segurança para produção

## Controles implementados na distribuição externa

| Área | Controle aplicado | Arquivos principais |
| --- | --- | --- |
| Cabeçalhos HTTP | `helmet`, política de conteúdo, HSTS, anti-clickjacking, redução de fingerprint e política de referenciador. | `server/_core/index.ts` |
| Abuso de API | Limite por IP para API e limite mais restrito para autenticação. | `server/_core/security.ts` |
| Requisições cruzadas | Escritas com `Origin` externo ao `APP_BASE_URL` recebem `403`. | `server/_core/security.ts` |
| Sessão | Cookie `HttpOnly`, `Secure` sob HTTPS e `SameSite=Lax`; produção exige segredo de pelo menos 32 caracteres. | `server/_core/cookies.ts`, `server/_core/security.ts` |
| Administração | Procedures administrativas exigem usuário autenticado com `role = admin`. | `server/_core/trpc.ts`, `server/routers.ts` |
| Upload de imagens | Allowlist de JPEG, PNG e WebP; limite de 8 MB; validação de data URL, MIME e assinatura do arquivo; nome de armazenamento gerado pelo servidor. | `server/uploadPolicy.ts` |
| Upload por URL assinada | Tipos permitidos geram extensão no servidor para documentos, áudio e vídeo. | `server/routers.ts` |
| Banco | PostgreSQL com queries tipadas pelo Drizzle; use uma credencial exclusiva da aplicação e conexão TLS. | `drizzle/`, `server/db.ts` |

> Esses controles reduzem riscos comuns, mas não tornam um sistema "impossível de atacar". Segurança de produção exige atualização contínua, autenticação externa corretamente configurada, backups testados, monitoramento e revisão periódica.

## Checklist obrigatório antes de publicar

| Item | Ação exigida |
| --- | --- |
| HTTPS | Configure domínio com certificado válido e `APP_BASE_URL=https://seu-dominio`. |
| Segredo de sessão | Gere um valor aleatório com pelo menos 32 caracteres e guarde-o somente nos segredos da hospedagem. |
| Banco | Use `DATABASE_URL` com TLS, usuário com privilégios mínimos e senha exclusiva. |
| Admin | Configure o provedor OAuth externo, faça o primeiro login e execute `database/admin-bootstrap.sql` para atribuir `role = admin`. |
| Bucket | Use credenciais restritas ao bucket, bloqueie listagem pública e deixe documentos fiscais privados ou com URL temporária. |
| Arquivos | Considere antivírus/sandbox para documentos enviados por usuários e mantenha limites de tamanho alinhados ao plano de hospedagem. |
| Dependências | Execute `pnpm audit`, acompanhe avisos de segurança e atualize dependências antes de cada publicação. |
| Backup | Faça backup automático do PostgreSQL e teste uma restauração em ambiente isolado. |
| Logs | Registre falhas de autenticação, erros de upload e bloqueios de taxa sem armazenar senhas ou tokens. |

## Operação e resposta a incidentes

Se houver suspeita de acesso indevido, suspenda a conta afetada removendo ou reduzindo seu `role`, revogue sessões no provedor de autenticação, altere `SESSION_SECRET`, troque credenciais S3 e banco, preserve logs e restaure somente dados de backup validado. Antes de retornar o site ao ar, revise as mudanças recentes e execute `pnpm check`, `pnpm test` e `pnpm build`.

## Referências

As decisões de allowlist, validação de assinatura, geração de nomes pelo servidor, limites de tamanho e restrição de uploads autenticados seguem a orientação de defesa em profundidade para uploads da OWASP.[1] A regra de negar acesso administrativo por padrão, validar autorização em cada requisição e cobrir a lógica por testes é consistente com as recomendações da OWASP para autorização.[2] O uso de TLS, cookies seguros, redução de fingerprint, cabeçalhos de proteção e limitação contra tentativas de força bruta segue as boas práticas de segurança do Express.[3] A orientação de proteger sessões com HTTPS, atributos de cookie e ciclo de vida controlado está documentada pela OWASP.[4]

[1]: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html "OWASP — File Upload Cheat Sheet"
[2]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html "OWASP — Authorization Cheat Sheet"
[3]: https://expressjs.com/en/advanced/best-practice-security.html "Express — Production Best Practices: Security"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html "OWASP — Session Management Cheat Sheet"
