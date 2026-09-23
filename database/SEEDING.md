# Dados iniciais do catálogo

O arquivo `seed.sql` inclui os **quatro produtos atuais**, oito registros de imagem, dois vídeos de demonstração e três faixas ambiente. Os arquivos de mídia correspondentes já estão em `client/public/media/`, portanto serão incorporados ao build em `dist/public/media/`.

O seed é indicado para uma **base PostgreSQL nova**, logo após aplicar a migração inicial. Ele não leva dados de usuários, cookies, sessões nem o histórico analítico anônimo, evitando transferir identidades e estatísticas de navegação para o novo servidor.

```bash
psql "$DATABASE_URL" -f drizzle/migrations/0000_far_sir_ram.sql
psql "$DATABASE_URL" -f database/seed.sql
```

> Os itens de demonstração podem ser editados ou removidos no painel administrativo depois da troca de autenticação descrita em `EXTERNAL_DEPLOYMENT.md`.
