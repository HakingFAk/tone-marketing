-- Execute APÓS o primeiro login da conta no provedor de autenticação externo.
-- O provedor deve registrar o e-mail informado na tabela "users".
-- Não insira senhas, tokens ou informações pessoais adicionais neste arquivo.

UPDATE "users"
SET "role" = 'admin',
    "updatedAt" = NOW()
WHERE LOWER("email") = LOWER('carlosmanoel100620@gmail.com');

-- Conferência: o resultado esperado é exatamente um usuário com role admin.
SELECT "id", "name", "email", "role"
FROM "users"
WHERE LOWER("email") = LOWER('carlosmanoel100620@gmail.com');
