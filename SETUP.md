# 🎭 Arcanjo - Rede Social de Projetos

## ✅ Configuração Completa

Seu aplicativo agora é uma **rede social real** integrada com **Supabase**!

### ✨ Novas Páginas Adicionadas:
- ✅ **profile.html** - Página de edição de perfil do usuário
- ✅ **settings.html** - Página completa de configurações
- ✅ Links de navegação no dashboard para profile e settings

### 📋 O que foi configurado:

1. **Autenticação com Supabase**
   - Login com username e senha
   - Registro de novos usuários
   - Sessão segura no localStorage

2. **Banco de Dados**
   - Tabela `users` criada no Supabase
   - Conta de teste: `Gabriel` / `Meu1234`

3. **Pages**
   - `index.html` - Página de boas-vindas
   - `login.html` - Login e registro
   - `dashboard.html` - Painel principal

### 🚀 Como usar:

#### 1. **Primeira Vez - Criar Conta**
- Vá para `login.html`
- Clique em "Criar Conta"
- Preencha username, senha e confirmação
- Clique em "Criar Conta"

#### 2. **Entrar na Conta**
- Use seu username e senha
- Exemplo: `Gabriel` / `Meu1234`
- Será redirecionado para o dashboard

#### 3. **Dashboard**
- Visualize seus projetos
- Adicione novos projetos
- Edite ou delete projetos
- Busque e filtre por tags
- Saia da conta com segurança

### 📁 Estrutura de Arquivos

```
js/
├── supabase-config.js    # Configuração do Supabase
├── auth.js               # Sistema de autenticação
├── auth-login.js         # Lógica de login/registro
└── dashboard.js          # Lógica do painel

login.html               # Tela de login/registro
dashboard.html           # Painel principal
index.html              # Página de boas-vindas
```

### 🔐 Informações do Supabase


### ⚠️ Notas Importantes

1. **Senha em Produção**: Atualmente as senhas são armazenadas em texto plano. Em produção, use bcrypt!
2. **CORS**: O Supabase está configurado para aceitar requisições do seu domínio
3. **Backup**: Sempre faça backup do seu banco de dados
4. **Segurança**: Não compartilhe a ANON KEY em públicos

### 🎯 Próximos Passos

- [ ] Adicionar perfis de usuários
- [ ] Implementar sistema de seguidores
- [ ] Adicionar comentários em projetos
- [ ] Criar sistema de notifications
- [ ] Implementar busca global
- [ ] Adicionar imagens para projetos
- [ ] Criar dashboard de analytics

### 💡 Funcionalidades Atuais

✅ Login e Registro
✅ Gerenciamento de Sessão
✅ CRUD de Projetos (Create, Read, Update, Delete)
✅ Busca e Filtro por Tags
✅ Dashboard Responsivo
✅ Menu de Usuário
✅ Logout Seguro

---

**Desenvolvido com ❤️ por Gabriel - Rehbein**
