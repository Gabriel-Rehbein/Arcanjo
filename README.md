# 🌟 Arcanjo

<p align="center">
  Plataforma social voltada para desenvolvedores, criadores e profissionais que desejam compartilhar seus projetos, ideias e portfólios de forma moderna, visual e interativa.
</p>

---

# 📖 Sobre o Projeto

O **Arcanjo** nasceu com a proposta de transformar a maneira como projetos são apresentados na internet.

Muitas pessoas possuem ideias incríveis, criam sistemas, designs, aplicações, artes ou soluções inovadoras, mas acabam tendo dificuldade para divulgar isso de forma profissional, organizada e visualmente atrativa.

O Arcanjo surge como uma plataforma onde:

- Criadores podem publicar seus projetos
- Desenvolvedores podem montar seus portfólios
- Usuários podem descobrir novas ideias
- Empresas podem visualizar talentos
- Projetos podem ganhar visibilidade de forma simples e moderna

---

# 🎯 Objetivo

O principal objetivo do Arcanjo é criar um ambiente digital onde criatividade, tecnologia e inovação possam ser compartilhadas de maneira acessível e inspiradora.

---

## 🧰 Tecnologias usadas

- Node.js + Express
- Next.js + React
- TypeORM + PostgreSQL
- JWT + bcrypt
- CORS + dotenv
- ESLint + Prettier
- express-rate-limit
- Nodemon (desenvolvimento)


A plataforma busca:

- Incentivar novos desenvolvedores
- Valorizar projetos independentes
- Aproximar criadores e oportunidades
- Facilitar a divulgação de portfólios
- Construir uma comunidade focada em tecnologia e inovação

---

# 🚀 Como Funciona

No Arcanjo, os usuários podem:

- Criar um perfil personalizado
- Publicar projetos
- Adicionar imagens e descrições
- Curtir conteúdos
- Comentar publicações
- Salvar projetos favoritos
- Explorar novas ideias
- Interagir com outros criadores

Tudo isso em uma experiência moderna, fluida e visual.

---

# 💡 Diferencial do Arcanjo

O Arcanjo não é apenas um espaço para postar projetos.

A ideia da plataforma é oferecer:

- Uma experiência visual moderna
- Interface inspiradora e dinâmica
- Ambiente focado em criatividade
- Valorização de portfólios
- Descoberta de talentos
- Interação entre criadores

O foco principal é transformar projetos em algo mais vivo, visual e compartilhável.

---

# 🌎 Impacto

O projeto busca impactar principalmente:

- Estudantes de tecnologia
- Desenvolvedores iniciantes
- Designers
- Criadores independentes
- Freelancers
- Profissionais em busca de oportunidades

O Arcanjo pretende ajudar pessoas a mostrarem seu potencial para o mundo de forma mais profissional e acessível.

---

# 🔮 Visão Futura

Entre as ideias futuras do projeto estão:

- Sistema de destaque para projetos
- Perfis profissionais avançados
- Feed inteligente de recomendações
- Sistema de networking
- Eventos e comunidades
- Área para recrutadores
- Gamificação da plataforma
- Recursos de inteligência artificial

---

# 🧠 Conceito da Plataforma

O Arcanjo foi pensado para unir:

- Rede social
- Portfólio profissional
- Compartilhamento de projetos
- Criatividade visual
- Tecnologia
- Networking

Tudo dentro de uma única plataforma.

A proposta é permitir que usuários transformem seus projetos em algo mais acessível, moderno e atrativo para outras pessoas.

---

# ✨ Experiência do Usuário

A plataforma possui foco em:

- Interface moderna
- Navegação intuitiva
- Experiência fluida
- Layout responsivo
- Interações dinâmicas
- Animações visuais
- Design profissional

O objetivo é criar uma experiência agradável tanto para quem publica quanto para quem explora conteúdos.

---

# 📈 Crescimento do Projeto

O Arcanjo possui potencial para expansão em diversas áreas, como:

- Educação
- Tecnologia
- Portfólios profissionais
- Comunidades criativas
- Recrutamento
- Freelancing
- Startups
- Compartilhamento de conhecimento

---

# 🔐 Segurança e Privacidade

O projeto também busca oferecer:

- Controle de privacidade
- Proteção de dados
- Segurança de contas
- Ambiente seguro para usuários
- Gerenciamento de conteúdos

---

# 👨‍💻 Criador

## Gabriel Menezes Rehbein

Desenvolvedor focado em inovação, tecnologia e experiência do usuário.

O projeto Arcanjo representa a ideia de transformar criatividade e desenvolvimento em uma plataforma social moderna e acessível.

---

# 📌 Status do Projeto

🚧 Projeto em desenvolvimento contínuo.

Novas funcionalidades, melhorias visuais e recursos estão sendo implementados constantemente.

---

## 🚀 Como rodar localmente

### Backend

1. Copie `backend/.env.example` para `backend/.env`
2. Ajuste as credenciais do banco conforme seu ambiente
3. No diretório `backend`, execute:
   - `npm install`
   - `npm run dev`

### Frontend

1. Copie `frontend/.env.example` para `frontend/.env.local`
2. No diretório `frontend`, execute:
   - `npm install`
   - `npm run dev`

> O frontend deve iniciar em `http://localhost:3001` e o backend em `http://localhost:3000`.

---

## Deploy: Render + GitHub Pages

O deploy completo usa dois destinos:

- `backend/`: Render, porque a API Node.js/Express precisa ficar online com PostgreSQL.
- `frontend/`: GitHub Pages, porque o Next.js esta configurado com `output: 'export'` e gera arquivos estaticos em `frontend/out`.

### Backend no Render

1. No Render, escolha `New > Blueprint`.
2. Conecte este repositorio do GitHub.
3. Use o arquivo `render.yaml` da raiz.
4. Na criacao do Blueprint, preencha `FRONTEND_URL` com a URL do GitHub Pages, por exemplo:

```env
https://SEU_USUARIO.github.io/Arcanjo
```

O Blueprint cria:

- web service `arcanjo-yayx`
- banco PostgreSQL `arcanjo-db`
- `DATABASE_URL` ligado automaticamente ao banco
- `JWT_SECRET` gerado automaticamente
- health check em `/health`

A URL esperada do backend e:

```text
https://arcanjo-yayx.onrender.com
```

### Frontend no GitHub Pages

1. No GitHub, va em `Settings > Secrets and variables > Actions > Variables`.
2. Crie a variavel `NEXT_PUBLIC_API_URL` com a URL publica do backend:

```env
https://arcanjo-yayx.onrender.com
```

3. Va em `Settings > Pages`.
4. Em `Build and deployment`, selecione `GitHub Actions`.
5. Faca push na branch `main`.

O workflow `.github/workflows/deploy.yml` instala as dependencias do frontend, executa `npm run build` dentro de `frontend/` e publica `frontend/out` no GitHub Pages.

Se o repositorio se chamar `Arcanjo`, a URL esperada do frontend sera:

```text
https://SEU_USUARIO.github.io/Arcanjo/
```

Se o repositorio tiver outro nome, o workflow usa automaticamente o nome real do repositorio como `basePath`.

### Comandos uteis

```bash
cd frontend
npm ci
npm run build
```

Para desenvolvimento local, mantenha `frontend/.env.local` apontando para o backend local:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
API_INTERNAL_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=/Arcanjo
```

Em producao no GitHub Pages, o frontend deve consumir o backend externo usando `NEXT_PUBLIC_API_URL`.

---

## ✨ Melhorias aplicadas

- CORS restrito ao frontend configurado via `FRONTEND_URL`
- Rate limiting no backend com `express-rate-limit`
- JWT protegido por `JWT_SECRET` e expirando em `JWT_EXPIRES_IN`
- `RUN_SEED=false` padrão para evitar seed automático em produção
- Pool de conexões PostgreSQL aumentado para até 10 conexões
- API `apiFetch` melhorada para aceitar `FormData` e usar env vars
- Scripts de lint e formatação adicionados em backend e frontend
- Arquivos de configuração adicionados: `.eslintrc.json`, `.prettierrc`, `.eslintignore`, `.prettierignore`

---

# ❤️ Arcanjo

> “Projetos merecem ser vistos, compartilhados e valorizados.”
