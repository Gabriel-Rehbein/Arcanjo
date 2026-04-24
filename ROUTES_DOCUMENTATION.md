# 📌 Rotas e Endpoints do ArcanjoHub

## 🔐 Autenticação (Auth)

### POST /auth/register
Registra um novo usuário
```json
{
  "username": "string",
  "password": "string"
}
```

### POST /auth/login
Faz login de um usuário
```json
{
  "username": "string",
  "password": "string"
}
```
Retorna: `{ token: "jwt_token" }`

---

## 👤 Usuários (Users)

### GET /users/:username
Obtém dados de um usuário
Retorna: User completo com stats

### GET /users/search?q=termo
Busca usuários por username ou nome
Retorna: Array de usuários

### GET /users/:id/projects
Lista projetos de um usuário
Retorna: Array de projetos

### POST /users/:id/follow
Segue um usuário
Requer: Autenticação

### POST /users/:id/unfollow
Deixa de seguir um usuário
Requer: Autenticação

### GET /users/:id/followers
Lista seguidores de um usuário
Retorna: Array de usuários

### GET /users/:id/following
Lista usuários que está seguindo
Retorna: Array de usuários

### PUT /users/profile
Atualiza perfil do usuário
```json
{
  "full_name": "string",
  "bio": "string",
  "avatar_url": "string",
  "banner_url": "string",
  "is_private": "boolean"
}
```
Requer: Autenticação

---

## 📌 Projetos (Projects)

### GET /projects/feed
Timeline de projetos (usuários que segue)
Requer: Autenticação
Retorna: Array de projetos com paginação

### GET /projects/explore
Projetos públicos para exploração
Retorna: Array de projetos populares

### GET /projects/trending?period=today|week|month|all
Projetos mais populares por período
Retorna: Array ordenado por likes

### GET /projects/category/:category
Projetos de uma categoria específica
Retorna: Array de projetos

### GET /projects/search?q=termo
Busca projetos por título ou tags
Retorna: Array de projetos

### POST /projects
Cria um novo projeto
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "tags": "string",
  "image_url": "string",
  "link": "string"
}
```
Requer: Autenticação

### GET /projects/:id
Obtém detalhes de um projeto
Retorna: Project com usuario, likes, comentarios

### PUT /projects/:id
Atualiza um projeto
Requer: Autenticação (owner)

### DELETE /projects/:id
Deleta um projeto
Requer: Autenticação (owner)

### GET /projects/:id/comments
Lista comentários de um projeto
Retorna: Array de comentários com usuarios

---

## ❤️ Likes

### POST /likes
Gera um like em um projeto
```json
{
  "project_id": "number"
}
```
Requer: Autenticação

### DELETE /likes/:projectId
Remove um like
Requer: Autenticação

### GET /projects/:id/likes
Lista quem curtiu um projeto
Retorna: Array de usuários

---

## 💬 Comentários

### POST /comments
Cria um comentário
```json
{
  "project_id": "number",
  "content": "string"
}
```
Requer: Autenticação

### PUT /comments/:id
Edita um comentário
```json
{
  "content": "string"
}
```
Requer: Autenticação (owner)

### DELETE /comments/:id
Deleta um comentário
Requer: Autenticação (owner)

---

## 💾 Salvos

### POST /saves
Salva um projeto
```json
{
  "project_id": "number"
}
```
Requer: Autenticação

### DELETE /saves/:projectId
Remove um projeto salvo
Requer: Autenticação

### GET /projects/saved
Lista projetos salvos do usuário
Requer: Autenticação

---

## 📱 Histórias (Stories)

### POST /stories
Cria uma nova história
```json
{
  "image_url": "string",
  "content": "string (optional)",
  "expires_at": "timestamp"
}
```
Requer: Autenticação

### GET /stories/feed
Lista histórias dos usuários que segue
Requer: Autenticação

### GET /stories/:id
Obtém detalhes de uma história
Retorna: Story com usuario

### DELETE /stories/:id
Deleta uma história
Requer: Autenticação (owner)

---

## 🔔 Notificações

### GET /notifications
Lista notificações do usuário
Requer: Autenticação
Query params: ?type=like|comment|follow|message

### PUT /notifications/:id/read
Marca notificação como lida
Requer: Autenticação

### DELETE /notifications/:id
Deleta uma notificação
Requer: Autenticação (owner)

### DELETE /notifications
Limpa todas as notificações
Requer: Autenticação

---

## 💌 Mensagens

### GET /messages/conversations
Lista todas as conversas do usuário
Requer: Autenticação
Retorna: Array com último mensagem de cada conversa

### GET /messages/:userId
Lista mensagens com um usuário específico
Requer: Autenticação
Retorna: Array de mensagens ordenadas

### POST /messages/send
Envia uma mensagem
```json
{
  "receiver_id": "number",
  "content": "string"
}
```
Requer: Autenticação

### PUT /messages/:id/read
Marca uma mensagem como lida
Requer: Autenticação

---

## 🔍 Busca Global

### GET /search?q=termo
Busca em projetos, usuários e tags
Retorna:
```json
{
  "projects": [...],
  "users": [...],
  "tags": [...]
}
```

---

## 📊 Estatísticas

### GET /stats/user/:userId
Estatísticas de um usuário
Retorna:
```json
{
  "projects_count": "number",
  "followers_count": "number",
  "following_count": "number",
  "likes_count": "number"
}
```

### GET /stats/project/:projectId
Estatísticas de um projeto
Retorna:
```json
{
  "likes_count": "number",
  "comments_count": "number",
  "saves_count": "number",
  "shares_count": "number"
}
```

---

## 🔐 Autenticação via Headers

Todos os endpoints que requerem autenticação devem incluir:
```
Authorization: Bearer <jwt_token>
```

---

## 📝 Códigos de Erro

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (ex: usuário já existe)
- `500`: Internal Server Error

---

## 🚧 Status de Implementação

- [x] Estrutura de models
- [x] Rotas de autenticação
- [ ] Controllers de projetos
- [ ] Controllers de usuários
- [ ] Controllers de interações (likes, comentários)
- [ ] Controllers de mensagens
- [ ] Controllers de notificações
- [ ] Services completos
- [ ] Repositories com queries avançadas
- [ ] Validação de entrada
- [ ] Upload de imagens
- [ ] WebSocket para tempo real

---

**Versão:** 1.0.0  
**Última atualização:** 24 de Abril de 2026
