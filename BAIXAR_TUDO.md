# Baixar TUDO para o Arcanjo funcionar

Use este arquivo para instalar todas as dependências necessárias do projeto. Cada linha abaixo pode ser executada individualmente no terminal, ou todas juntas copiando e colando o bloco completo.

## Comando único para copiar e colar tudo de uma vez

```powershell
Set-Location -LiteralPath 'C:\Users\gabri\Documents\Repositórios\Arcanjo'
npm.cmd install
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
```


## Rodar o projeto

### Backend
```powershell
npm.cmd --prefix backend run dev
```

### Frontend
```powershell
npm.cmd --prefix frontend run dev
```

## Tecnologias usadas no projeto

- Node.js + Express no backend
- Next.js + React no frontend
- PostgreSQL como banco de dados
- TypeORM para ORM e `reflect-metadata`
- JWT para autenticação com `jsonwebtoken`
- bcrypt para hash de senhas
- CORS, Helmet e compression para segurança e performance
- express-rate-limit para proteção contra abuso de requisições
- dotenv para variáveis de ambiente
- Zod para validação de dados
- ESLint, eslint-config-prettier e Prettier para qualidade de código
- Nodemon para desenvolvimento local no backend
- Vitest e Supertest para testes backend
- eslint-config-next para regras específicas do Next.js
