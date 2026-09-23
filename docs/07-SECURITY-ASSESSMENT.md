# Avaliação de segurança e correções

**Data da avaliação:** 20 de agosto de 2026.  
**Escopo:** aplicação Tone Market, API pública, controle de acesso administrativo, uploads, dependências e variante externa para hospedagem própria.

> A avaliação foi autorizada e **não destrutiva**. Não foram feitos testes de negação de serviço, força bruta, exploração de contas, alteração de dados, inserção de produtos falsos ou transferência de arquivos fora do fluxo normal da aplicação.

## Métodos usados

Foram inspecionados cabeçalhos HTTP, redirecionamentos, rotas públicas e administrativas, respostas de autorização, proteção para requisições de outra origem, regras de upload, controle de função administrativa e dependências de produção. O teste de escrita cross-origin usou uma carga deliberadamente inválida, portanto não persistiu eventos nem modificou registros.

| Verificação | Resultado |
| --- | --- |
| Página pública e rota administrativa sem sessão | Redirecionamento para autenticação no ambiente publicado atual. |
| Consulta administrativa sem sessão | Bloqueada com `401 Unauthorized`. |
| Escrita com `Origin` não confiável após a correção | Bloqueada com `403 Forbidden`. |
| Cabeçalhos de segurança no servidor atualizado | Presentes: HSTS, `nosniff`, anti-frame, política de referenciador, isolamento de origem e limite de taxa. |
| Validação de imagens | Coberta por testes de formato, assinatura binária e extensão permitida. |
| Auditoria de dependências de produção | Nenhuma vulnerabilidade conhecida após as atualizações. |

## Achados e remediações

| ID | Severidade antes | Achado confirmado | Correção aplicada | Validação |
| --- | --- | --- | --- | --- |
| SEC-01 | Média | O servidor expunha `X-Powered-By` e não tinha uma política centralizada de cabeçalhos defensivos. | `helmet`, remoção de `X-Powered-By`, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy` e CSP de produção. | Inspeção HTTP local após a alteração. |
| SEC-02 | Média | Escritas da API não tinham uma verificação explícita de origem no backend. | Middleware rejeita `POST`, `PUT`, `PATCH` e `DELETE` cujo `Origin` diverge do host esperado. | Teste automatizado e chamada HTTP retornaram `403`. |
| SEC-03 | Alta | Imagens em data URL eram decodificadas sem validação de assinatura binária e sem limite específico por arquivo. | Allowlist JPEG/PNG/WebP, limite de 8 MB por imagem, validação de data URL, MIME e magic bytes; extensões geradas no servidor. | Três testes unitários de política de upload aprovados. |
| SEC-04 | Média | Não havia limitação de taxa definida para API e autenticação. | Limites por IP configuráveis para API e fluxo de autenticação, com cabeçalhos padronizados de resposta. | Cabeçalhos `RateLimit` observados no servidor local. |
| SEC-05 | Crítica/alta | A auditoria inicial identificou dependências de produção vulneráveis, incluindo ORM, cliente HTTP, SDK de armazenamento, tRPC, Express, NanoID e cadeia de chat demonstrativa. | Atualização para versões corrigidas; remoção de `streamdown` e dos componentes demonstrativos não utilizados; atualização do lockfile. | `pnpm audit --prod --audit-level=high`: **No known vulnerabilities found**. |
| SEC-06 | Baixa | Erros locais de desenvolvimento exibiam detalhes técnicos; a implantação pública não expôs stack trace para o teste de rota administrativa. | A política de produção mantém erros de autorização resumidos; o runbook orienta não publicar logs ou detalhes de exceção. | Resposta pública `401` revisada sem stack trace. |
| SEC-07 | Informativa | A loja hospedada no ambiente atual redireciona inclusive a rota pública para uma camada de autenticação da plataforma. | A variante externa foi desacoplada de plugins, pasta de mídia e módulos auxiliares específicos; a publicação em Hostinger remove essa camada quando o provedor de autenticação externo for configurado. | Build externo aprovado e mídia migrada para `/media`. |

## Controles adicionados ao código

A implementação atual inclui os arquivos `server/_core/security.ts`, `server/uploadPolicy.ts` e seus testes. O servidor aplica os controles antes do tRPC; o painel continua protegido por `protectedProcedure` e por `role = admin`. A variante externa passa a usar `server/storage.ts` compatível com S3 e URLs assinadas, em vez de depender de armazenamento acoplado ao ambiente de origem.

As bibliotecas de segurança e as práticas aplicadas seguem a abordagem de defesa em profundidade recomendada para Express, uploads, autorização e gerenciamento de sessão.[1] [2] [3] [4]

## Resultado das validações

| Artefato | Resultado |
| --- | --- |
| Projeto principal | TypeScript aprovado, build de produção aprovado e **70 testes aprovados**. |
| Variante externa | TypeScript aprovado, build de produção aprovado e **70 testes aprovados**. |
| Auditoria de dependências de produção | Sem vulnerabilidades conhecidas após a correção. |
| Testes de autorização | Consulta administrativa sem sessão bloqueada com `401`. |
| Teste de origem cruzada | Escrita com origem não confiável bloqueada com `403`. |

## Ações obrigatórias antes de publicar fora do ambiente atual

O código reforçado reduz riscos técnicos comuns, mas a segurança final depende da configuração de produção. Defina `SESSION_SECRET` aleatório com no mínimo 32 caracteres, use HTTPS, configure `APP_BASE_URL` com o domínio real, mantenha `DATABASE_URL` com TLS e usuário de privilégios mínimos, e nunca envie `.env` ao Git.

Configure um provedor externo de autenticação antes de expor `/admin`, realize o primeiro login com `carlosamorim@seplag.mt.gov.br` e então execute `database/admin-bootstrap.sql`. Configure o bucket S3/R2 com credenciais restritas e mantenha documentos fiscais privados ou servidos por URL temporária. O checklist detalhado está em [`06-SECURITY-RUNBOOK.md`](./06-SECURITY-RUNBOOK.md).

## Limitações do teste

Esta avaliação não é uma certificação de inviolabilidade. Ela não incluiu auditoria de infraestrutura da Hostinger, revisão do futuro provedor OAuth, varredura autenticada do painel após login, análise de malware de documentos ou teste de carga. Esses controles devem ser revisados a cada mudança relevante, junto com backups testados e monitoramento de falhas de autenticação.

## Referências

[1]: https://expressjs.com/en/advanced/best-practice-security.html "Express — Production Best Practices: Security"
[2]: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html "OWASP — File Upload Cheat Sheet"
[3]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html "OWASP — Authorization Cheat Sheet"
[4]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html "OWASP — Session Management Cheat Sheet"
