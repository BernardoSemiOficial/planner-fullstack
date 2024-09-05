# Documentação sobre o funcionamento do Prisma

# Criar migrations

As migrations são um processo para guardar as alterações realizadas em nossas tabelas e deixar isso registrado através arquivos .sql. Cada migration possui uma pasta com nome que representa aquela modificações. Ao acessar a pasta `journey-backend/prisma/migrations` verá que temos algumas pastas que possuem nomes como esse: `20240828214046_create_trips_table` e que possui um id e o nome dado no momento da criação da migration.

O comando para criar uma nova migration no prisma é `npx prisma migrate dev` ou do comando registrado no package.json `prisma:migrate`. Esse comando irá perguntar qual será o nome da migration que representa aquelas alterações
