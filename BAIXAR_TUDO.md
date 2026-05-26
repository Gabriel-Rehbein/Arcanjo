# Baixar TUDO para o Arcanjo funcionar

Use este arquivo para instalar todas as dependências necessárias do projeto. Cada linha abaixo pode ser executada individualmente no terminal, ou todas juntas copiando e colando o bloco completo.

## Comando único para copiar e colar tudo de uma vez

```powershell
cd C:\Users\gabri\Documents\Arcanjo
npm install;
cd backend;
npm install;
cd ..\frontend;
npm install;
```
## Rodar o projeto

### Backend
```powershell
cd C:\Users\gabri\Documents\Arcanjo\backend
npm run dev
```

### Frontend
```powershell
cd C:\Users\gabri\Documents\Arcanjo\frontend
npm run dev
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
