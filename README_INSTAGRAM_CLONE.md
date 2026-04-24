# 📱 ArcanjoHub - Rede Social de Projetos (Instagram Clone)

## 🎯 Visão Geral

**ArcanjoHub** é uma rede social moderna e responsiva para compartilhamento de projetos e portfólios, inspirada no Instagram, mas totalmente adaptada para profissionais criativos.

## ✨ Funcionalidades Principais

### 📌 Core Features
- ✅ **Feed de Projetos** - Timeline com projetos dos usuários que você segue
- ✅ **Exploração** - Descubra novos projetos por categorias e busca
- ✅ **Perfil de Usuário** - Portfólio completo com bio, banner, projetos salvos
- ✅ **Trending** - Projetos mais populares em diferentes períodos
- ✅ **Mensagens** - Chat em tempo real com outros usuários
- ✅ **Notificações** - Receba notificações de likes, comentários e seguidores
- ✅ **Histórias** - Stories temporárias de 24 horas
- ✅ **Sistema de Likes** - Aprecie projetos dos outros
- ✅ **Comentários** - Deixe feedback nos projetos
- ✅ **Seguidores** - Siga artistas e desenvolvedores
- ✅ **Salvos** - Guarde projetos para visualizar depois

### 📦 Categorias de Projetos
- Design (UX/UI, Graphic Design)
- Desenvolvimento (Web, Mobile, Backend)
- Marketing (Social Media, SEO)
- Fotografia
- Arte e Ilustração
- Customizável (adicione suas categorias)

## 🏗️ Arquitetura do Backend

### Modelos de Dados Expandidos

#### User
```
- id (Primary Key)
- username (Unique)
- password (Hashed)
- email
- full_name
- bio
- avatar_url
- banner_url
- is_private (boolean)
- created_at (timestamp)
```

#### Project
```
- id (Primary Key)
- title
- description
- user_id (Foreign Key)
- image_url
- category
- tags (JSON string)
- link
- likes_count
- comments_count
- is_featured
- created_at
- updated_at
```

#### Like
```
- id (Primary Key)
- user_id
- project_id
- created_at (timestamp)
- UNIQUE(user_id, project_id)
```

#### Comment
```
- id (Primary Key)
- user_id
- project_id
- content
- created_at (timestamp)
```

#### Follow
```
- id (Primary Key)
- follower_id
- following_id
- created_at (timestamp)
- UNIQUE(follower_id, following_id)
```

#### Notification
```
- id (Primary Key)
- user_id
- from_user_id
- type (like, comment, follow, message)
- project_id
- message
- is_read
- created_at (timestamp)
```

#### Story
```
- id (Primary Key)
- user_id
- image_url
- content
- expires_at (timestamp)
- created_at (timestamp)
```

#### Save
```
- id (Primary Key)
- user_id
- project_id
- created_at (timestamp)
- UNIQUE(user_id, project_id)
```

#### Message
```
- id (Primary Key)
- sender_id
- receiver_id
- content
- is_read
- created_at (timestamp)
```

## 🎨 Estrutura Frontend

### Componentes Reutilizáveis

#### Header.js
- Logo com navegação
- Barra de busca
- Menu principal (Home, Explorar, Mensagens, Notificações, Perfil)
- Responsivo para mobile

#### Sidebar.js
- Menu lateral com atalhos
- Sugestões de usuários
- Links úteis
- Desaparece em mobile

#### ProjectCard.js
- Exibição de projeto
- Likes, comentários e compartilhamento
- Avatar e info do usuário
- Tags e categoria
- Link para o projeto

#### UserCard.js
- Card de usuário
- Avatar, username, bio
- Botão de seguir/unfollow
- Estatísticas básicas

#### StoryBar.js
- Stories em formato carousel
- Botão para adicionar próprias histórias
- Avatar dos usuários

### Páginas Principais

#### Feed (/feed)
- Timeline com histórias no topo
- Projetos dos usuários que você segue
- Infinit scroll (implementar)
- Responsivo para todos os tamanhos

#### Explore (/explore)
- Grid de projetos ou lista de usuários
- Filtro por categoria
- Busca em tempo real
- Abas: Projetos e Usuários

#### Profile (/profile)
- Banner e avatar
- Bio e informações do usuário
- Estatísticas (projetos, seguidores, seguindo)
- Abas: Projetos, Galeria, Salvos
- Botões de Editar Perfil / Seguir / Mensagem

#### Messages (/messages)
- Lista de conversas
- Chat em tempo real
- Busca de usuários
- Typing indicator (opcional)

#### Notifications (/notifications)
- Filtros por tipo (Tudo, Likes, Comentários, Seguidores)
- Marcar como lido
- Limpar tudo

#### Trending (/trending)
- Projetos mais populares
- Filtros: Hoje, Esta Semana, Este Mês, Todos os Tempos
- Ranking numerado

#### Saved (/saved)
- Projetos salvos pelo usuário
- Filtro por categoria
- Gerenciamento de salvos

#### Create Project (/create-project)
- Formulário completo
- Upload de imagem
- Tags e categorias
- Link do projeto
- Validação

## 🎨 Design & Responsividade

### Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1024px
- Mobile: 480px - 768px
- Small Mobile: < 480px

### Color Scheme
- Cor primária: #0095f6 (Azul Instagram)
- Cor de fundo: #fafafa (Cinza claro)
- Texto principal: #000
- Texto secundário: #999
- Bordas: #e0e0e0

### Design Principles
- Clean e minimalista
- Inspirado em Instagram/TikTok
- Foco em conteúdo visual
- Navegação intuitiva
- Acessibilidade considerada

## 📁 Estrutura de Pastas

```
frontend/
├── components/
│   ├── Header.js
│   ├── Sidebar.js
│   ├── ProjectCard.js
│   ├── UserCard.js
│   └── StoryBar.js
├── pages/
│   ├── _app.js
│   ├── feed.js
│   ├── explore.js
│   ├── profile.js
│   ├── messages.js
│   ├── notifications.js
│   ├── trending.js
│   ├── saved.js
│   ├── create-project.js
│   └── register.js (existente)
├── styles/
│   ├── globals.css
│   ├── components/
│   │   ├── Header.module.css
│   │   ├── Sidebar.module.css
│   │   ├── ProjectCard.module.css
│   │   ├── UserCard.module.css
│   │   └── StoryBar.module.css
│   └── pages/
│       ├── feed.module.css
│       ├── explore.module.css
│       ├── profile.module.css
│       ├── messages.module.css
│       ├── notifications.module.css
│       ├── trending.module.css
│       ├── saved.module.css
│       └── createProject.module.css
└── utils/
    └── api.js

backend/
├── src/
│   ├── entities/
│   │   ├── User.js (expandido)
│   │   ├── Project.js (expandido)
│   │   ├── Like.js (novo)
│   │   ├── Comment.js (novo)
│   │   ├── Follow.js (novo)
│   │   ├── Notification.js (novo)
│   │   ├── Story.js (novo)
│   │   ├── Save.js (novo)
│   │   └── Message.js (expandido)
│   ├── routes/ (a expandir)
│   ├── controllers/ (a expandir)
│   ├── services/ (a expandir)
│   └── repositories/ (a expandir)
└── config/
    └── db.js (atualizado)
```

## 🚀 Como Executar

### Backend
```bash
cd backend
npm install
# Configure .env com dados do PostgreSQL
npm run dev
# Servidor rodando em http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Aplicação rodando em http://localhost:3001
```

### Banco de Dados
```bash
# Certifique-se que PostgreSQL está rodando
# Crie o banco 'arcanjo' (ou configure em .env)
# As tabelas serão criadas automaticamente na primeira execução
```

## 🔧 Próximos Passos (Backend)

1. **Expandir Controllers**
   - ProjectController (CRUD completo, likes, comentários)
   - UserController (perfil, seguir, busca)
   - LikeController, CommentController, etc

2. **Expandir Services**
   - Lógica de negócio para cada entidade
   - Validações

3. **Expandir Repositories**
   - Queries personalizadas
   - Paginação
   - Filtros

4. **Adicionar Middlewares**
   - Autenticação melhorada
   - Validação de entrada
   - Upload de imagens

5. **WebSocket (opcional)**
   - Mensagens em tempo real
   - Notificações em tempo real

## 🔐 Autenticação

- JWT para autenticação
- Hash de senha com bcrypt
- Token armazenado no localStorage (frontend)
- Protected routes (implementar)

## 📊 Recursos Futuros

- [ ] Áudio/Vídeo nos projetos
- [ ] Reações de emoji (como no Instagram)
- [ ] Sistema de hashtags
- [ ] Comentários em threads
- [ ] Menções (@username)
- [ ] DM grupos
- [ ] Stories com stickers
- [ ] Estatísticas/Analytics
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] Progressive Web App (PWA)

## 📝 Notas

- Design totalmente responsivo (mobile-first)
- Utiliza CSS Modules para evitar conflitos
- Componentes reutilizáveis e modulares
- API pronta para expansão
- Segurança como prioridade

## 👨‍💻 Desenvolvido com ❤️

**Stack:**
- Next.js 14
- Node.js + Express
- PostgreSQL
- TypeORM
- React Hooks
- CSS Modules

---

**Versão:** 1.0.0  
**Última atualização:** 24 de Abril de 2026
