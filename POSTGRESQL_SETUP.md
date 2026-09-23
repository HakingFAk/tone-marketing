# Configuração PostgreSQL

## Desenvolvimento local

O arquivo `docker-compose.yml` sobe um PostgreSQL 16 local. Antes de iniciar, altere a senha padrão tanto no `docker-compose.yml` quanto no `.env`.

```bash
docker compose up -d postgres
pnpm db:migrate
psql "$DATABASE_URL" -f database/seed.sql
```

Para confirmar a conexão, use:

```bash
docker compose exec postgres psql -U tone_user -d tone_marketing
```

## Servidor ou serviço gerenciado

Crie um banco PostgreSQL no seu provedor, copie a URL de conexão segura para `DATABASE_URL`, execute `pnpm db:migrate` e, em uma base nova, carregue o catálogo inicial com `psql "$DATABASE_URL" -f database/seed.sql`. Não use dados reais no banco de desenvolvimento.

## Migração de dados do banco anterior

O esquema foi adaptado para PostgreSQL. Caso importe uma operação já existente, faça backup antes de qualquer migração e mova dados em ordem controlada: `users`, `products`, mídias e documentos, sons, eventos de analytics e vendas. Valide contagens e relações antes de direcionar tráfego para o novo servidor. O seed incluído carrega somente dados iniciais de catálogo e não cria usuários nem transfere histórico de navegação.
