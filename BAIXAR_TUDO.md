# Baixar TUDO para o Arcanjo funcionar

Use este arquivo para instalar todas as dependências necessárias do projeto. Cada linha abaixo pode ser executada individualmente no terminal, ou todas juntas copiando e colando o bloco completo.

## Comando único para copiar e colar tudo de uma vez

```powershell
Set-Location -LiteralPath 'C:\Users\gabri\Documents\Repositórios\Arcanjo'
npm.cmd install
Copy-Item backend\.env.example backend\.env -ErrorAction SilentlyContinue
Copy-Item frontend\.env.example frontend\.env.local -ErrorAction SilentlyContinue
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
```

Antes de iniciar, substitua no `backend/.env` as credenciais do PostgreSQL e o
`JWT_SECRET` por uma chave aleatória própria com pelo menos 32 caracteres.
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

- Node.js + Express
- TypeORM + PostgreSQL
- JWT para autenticação
- bcrypt para hash de senha
- CORS configurado para frontend
- express-rate-limit para proteção contra abuso de requisições
- Next.js + React no frontend
- ESLint + Prettier para qualidade de código
- dotenv para variáveis de ambiente
- Nodemon no backend para desenvolvimento
- eslint-config-next para regras específicas do Next.js
