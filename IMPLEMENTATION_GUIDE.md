# 🚀 Guia de Implementação - Próximos Passos

## Backend - Controllers que Precisam Ser Implementados

### 1. ProjectController.js (Expandido)

```javascript
// Implementar estes métodos:
export async function getAllFeed(req, res, next) {
  // GET /projects/feed
  // Buscar projetos dos usuários que o user segue
}

export async function getExplore(req, res, next) {
  // GET /projects/explore
  // Buscar projetos públicos populares
}

export async function getTrending(req, res, next) {
  // GET /projects/trending?period=today|week|month|all
  // Buscar por período com mais likes
}

export async function getByCategory(req, res, next) {
  // GET /projects/category/:category
  // Filtrar por categoria
}

export async function search(req, res, next) {
  // GET /projects/search?q=termo
  // Buscar por título, tags, descrição
}

export async function update(req, res, next) {
  // PUT /projects/:id
  // Atualizar projeto (apenas owner)
}

export async function delete(req, res, next) {
  // DELETE /projects/:id
  // Deletar projeto (apenas owner)
}
```

### 2. UserController.js (Expandido)

```javascript
export async function getProfile(req, res, next) {
  // GET /users/:username
  // Retornar perfil com estatísticas
}

export async function updateProfile(req, res, next) {
  // PUT /users/profile
  // Atualizar nome, bio, avatar, banner
}

export async function search(req, res, next) {
  // GET /users/search?q=termo
  // Buscar usuários por username ou full_name
}

export async function getProjects(req, res, next) {
  // GET /users/:id/projects
  // Listar projetos de um usuário
}

export async function follow(req, res, next) {
  // POST /users/:id/follow
  // Começar a seguir um usuário
}

export async function unfollow(req, res, next) {
  // POST /users/:id/unfollow
  // Deixar de seguir
}

export async function getFollowers(req, res, next) {
  // GET /users/:id/followers
  // Listar seguidores
}

export async function getFollowing(req, res, next) {
  // GET /users/:id/following
  // Listar usuários que segue
}
```

### 3. LikeController.js (Novo)

```javascript
export async function create(req, res, next) {
  // POST /likes
  // Dar like em um projeto
}

export async function delete(req, res, next) {
  // DELETE /likes/:projectId
  // Remover like
}

export async function getByProject(req, res, next) {
  // GET /projects/:id/likes
  // Listar quem curtiu
}
```

### 4. CommentController.js (Novo)

```javascript
export async function create(req, res, next) {
  // POST /comments
}

export async function update(req, res, next) {
  // PUT /comments/:id
}

export async function delete(req, res, next) {
  // DELETE /comments/:id
}

export async function getByProject(req, res, next) {
  // GET /projects/:id/comments
}
```

### 5. SaveController.js (Novo)

```javascript
export async function create(req, res, next) {
  // POST /saves
}

export async function delete(req, res, next) {
  // DELETE /saves/:projectId
}

export async function getUserSaved(req, res, next) {
  // GET /projects/saved
}
```

### 6. StoryController.js (Novo)

```javascript
export async function create(req, res, next) {
  // POST /stories
}

export async function getFeed(req, res, next) {
  // GET /stories/feed
}

export async function getById(req, res, next) {
  // GET /stories/:id
}

export async function delete(req, res, next) {
  // DELETE /stories/:id
}
```

### 7. NotificationController.js (Novo)

```javascript
export async function getAll(req, res, next) {
  // GET /notifications
}

export async function markAsRead(req, res, next) {
  // PUT /notifications/:id/read
}

export async function delete(req, res, next) {
  // DELETE /notifications/:id
}

export async function clearAll(req, res, next) {
  // DELETE /notifications
}
```

### 8. MessageController.js (Expandido)

```javascript
export async function getConversations(req, res, next) {
  // GET /messages/conversations
}

export async function getByUser(req, res, next) {
  // GET /messages/:userId
}

export async function send(req, res, next) {
  // POST /messages/send
}

export async function markAsRead(req, res, next) {
  // PUT /messages/:id/read
}
```

## Backend - Novos Repositories

### 1. LikeRepository.js
```javascript
export async function create(userId, projectId) {}
export async function delete(userId, projectId) {}
export async function getByProject(projectId) {}
export async function getByUser(userId) {}
export async function isLiked(userId, projectId) {}
export async function count(projectId) {}
```

### 2. CommentRepository.js
```javascript
export async function create(data) {}
export async function update(id, content) {}
export async function delete(id) {}
export async function getByProject(projectId, limit, offset) {}
export async function getById(id) {}
```

### 3. FollowRepository.js
```javascript
export async function create(followerId, followingId) {}
export async function delete(followerId, followingId) {}
export async function isFollowing(followerId, followingId) {}
export async function getFollowers(userId) {}
export async function getFollowing(userId) {}
export async function countFollowers(userId) {}
export async function countFollowing(userId) {}
```

### 4. SearchRepository.js
```javascript
export async function searchProjects(query) {}
export async function searchUsers(query) {}
export async function searchTags(query) {}
export async function getTrending(period) {}
```

## Backend - Novas Rotas

### Arquivo: routes/like.routes.js
```javascript
import express from 'express';
import { create, delete, getByProject } from '../controllers/LikeController.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, create);
router.delete('/:projectId', authMiddleware, delete);
router.get('/project/:projectId', getByProject);

export default router;
```

### Atualizar app.js
```javascript
import likeRoutes from './routes/like.routes.js';
import commentRoutes from './routes/comment.routes.js';
// ... etc

app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);
// ... etc
```

## Frontend - API Utils Expandidos

### Atualizar utils/api.js

```javascript
// Adicionar funções específicas para cada entidade

export const projects = {
  getFeed: () => apiFetch('/projects/feed'),
  getExplore: () => apiFetch('/projects/explore'),
  getTrending: (period = 'all') => apiFetch(`/projects/trending?period=${period}`),
  search: (query) => apiFetch(`/projects/search?q=${encodeURIComponent(query)}`),
  create: (data) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),
};

export const likes = {
  create: (projectId) => apiFetch('/likes', { method: 'POST', body: JSON.stringify({ project_id: projectId }) }),
  delete: (projectId) => apiFetch(`/likes/${projectId}`, { method: 'DELETE' }),
  getByProject: (projectId) => apiFetch(`/projects/${projectId}/likes`),
};

// ... etc para outros
```

## Frontend - Componentes Adicionais

### Modal de Edição de Perfil
- Componente reutilizável para editar perfil
- Upload de avatar e banner
- Validação de campos

### Modal de Compartilhamento
- Copiar link
- Compartilhar em redes sociais
- Copiar para áreas de transferência

### Carregamento Infinito
- Implementar scroll infinito no feed
- Lazy loading de imagens

### Busca em Tempo Real
- Debounce de 300ms
- Dropdown com sugestões
- Histórico de buscas

## Frontend - Hooks Customizados

### useAuth.js
```javascript
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Implementar lógica de autenticação
}
```

### usePaginationFeed.js
```javascript
export function usePaginationFeed(endpoint) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Implementar paginação
}
```

### useIntersection.js
```javascript
export function useIntersection(ref, callback) {
  // Implementar Intersection Observer para lazy loading
}
```

## Frontend - Context API (Opcional)

### contexts/AuthContext.js
```javascript
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Gerenciar estado global de autenticação
}
```

### contexts/UserContext.js
```javascript
export const UserContext = createContext();

export function UserProvider({ children }) {
  // Gerenciar dados do usuário
}
```

## Segurança

### Implementar no Backend
- [ ] Rate limiting
- [ ] CORS configurado
- [ ] Validação de entrada com schema
- [ ] Sanitização de dados
- [ ] SQL Injection prevention (já está com TypeORM)
- [ ] HTTPS em produção

### Implementar no Frontend
- [ ] Proteção de rotas
- [ ] Refresh token
- [ ] Logout automático
- [ ] XSS prevention

## Testes

### Backend (Jest)
```javascript
// tests/projects.test.js
describe('Projects', () => {
  test('should create a project', async () => {
    // ...
  });
});
```

### Frontend (React Testing Library)
```javascript
// __tests__/components/ProjectCard.test.js
describe('ProjectCard', () => {
  test('should render project card', () => {
    // ...
  });
});
```

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Heroku/Railway)
```bash
heroku create arcanjo-hub
heroku config:set DB_HOST=...
git push heroku main
```

---

**Próximos Passos:**
1. Implementar Controllers
2. Implementar Repositories
3. Implementar Rotas
4. Testar Endpoints
5. Implementar Frontend Hooks
6. Testar Frontend
7. Deploy

**Tempo Estimado:** 2-3 semanas para implementação completa

---
