# Acesso administrativo externo

## Conta administrativa definida

O e-mail reservado para a administração da Tone Market é **`carlosmanoel100620@gmail.com`**. Ele já aparece como referência no modelo `config/env.example` e em `ENVIRONMENT_TEMPLATE.txt` por meio da variável `ADMIN_EMAILS`.

## Procedimento correto

1. Implemente e configure o provedor de autenticação externo escolhido.
2. Entre uma vez usando `carlosamorim@seplag.mt.gov.br` para que o provedor crie ou sincronize o registro em `users`.
3. Execute `psql "$DATABASE_URL" -f database/admin-bootstrap.sql`.
4. Confirme que a consulta final retornou exatamente uma linha com `role = admin`.
5. Valide os endereços `/admin`, `/admin/videos`, `/admin/ambient` e `/admin/insights` em uma janela anônima e em uma sessão autenticada.

> A variável `ADMIN_EMAILS` é uma configuração de referência. A proteção real deve continuar sendo aplicada no backend pela sessão validada e pelo campo `role` da tabela `users`; nunca por um controle visual apenas no frontend.
