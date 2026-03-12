# 🚀 Guia Rápido - Arcanjo

## 📥 Para Começar

### 1️⃣ Iniciar o Servidor

Escolha uma opção:

**Python (recomendado para Windows):**
```powershell
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server
```

**VS Code:**
- Clique direito em `index.html`
- Selecione "Open with Live Server"

### 2️⃣ Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost:8000
```

### 3️⃣ Fazer Login

Use a conta de teste:
- **Usuário**: Gabriel
- **Senha**: Meu1234

## 🎯 Fluxo Principal

```
index.html (Landing)
    ↓
login.html (Autenticação)
    ↓
dashboard.html (Principal)
    ├─ 👥 Botão Perfil → profile.html
    ├─ ⚙️ Botão Configurações → settings.html
    └─ 🚪 Botão Logout → Sair
```

## ✨ O Que Fazer em Cada Página

### 📊 Dashboard
1. **Ver Projetos**: Todos seus projetos aparecem em cards
2. **Adicionar Projeto**: Clique no botão `+` ou "Adicionar Projeto"
3. **Filtrar**: Use a barra de busca ou selecione uma tag
4. **Editar**: Clique no ícone de lápis no card
5. **Deletar**: Clique no ícone de lixo (com confirmação)

### 👤 Perfil
1. Clique em "👥 Perfil" no dashboard
2. Edite suas informações:
   - Bio (máx 500 caracteres)
   - Localização
   - Profissão
   - Website
   - GitHub
   - Email de contato
3. Clique "Salvar Perfil"

### ⚙️ Configurações
1. Clique em "⚙️ Configurações" no dashboard
2. Configure:

**Notificações:**
- Ativar/desativar email
- Ativar/desativar digest diário
- Definir email e horário

**Aparência:**
- Escolher cor de fundo
- Escolher tema (escuro/claro)

**Privacidade:**
- Perfil público
- Mostrar email

**Dados:**
- Baixar backup em JSON
- Limpar cache

## 🧪 Teste Rápido

### Para Testar Tudo:

1. ✅ Ir para `/test-features.html` para ver status completo
2. ✅ Fazer login
3. ✅ Adicionar um projeto
4. ✅ Editar o projeto
5. ✅ Deletar o projeto
6. ✅ Ir para Perfil e editar informações
7. ✅ Ir para Configurações e mudar cor
8. ✅ Fazer logout

## 🔗 URLs Importantes

| URL | Descrição |
|-----|-----------|
| `/index.html` | Landing page |
| `/login.html` | Login/Signup |
| `/dashboard.html` | Painel principal |
| `/profile.html` | Perfil do usuário |
| `/settings.html` | Configurações |
| `/test-features.html` | Verificação de funcionalidades |

## 💾 Dados

Todos os dados são salvos em **localStorage** do navegador:

```javascript
// Essas chaves são usadas:
arcanjo_user_session      // Sessão do usuário
profile_{userId}          // Dados do perfil
settings_{userId}         // Configurações
arcanjo_projects_{userId} // Projetos
```

Para limpar tudo: Configurações → "Limpar Cache"

## ⚡ Dicas Rápidas

- 💡 Primeira vez? Use a conta Gabriel / Meu1234
- 🎨 Mudou a cor? Recarregue a página se não aparecer
- 📝 Bio tem limite de 500 caracteres
- 📧 Email de notificação é validado
- 🗑️ Deletar usa confirmação para evitar acidentes
- 🔐 Logout também confirma antes de sair
- 📥 Pode baixar seus dados em JSON a qualquer hora

## 🆘 Problemas Comuns

**"Página não encontrada"**
- Certifique-se que está usando um servidor local
- Não abra direto do arquivo (use http://)

**"Sessão perdida"**
- Limpe o cache em Configurações
- Faça login novamente

**"Email não salva"**
- Verifique se é um email válido
- Tente outro formato

**"Cor não mudou"**
- Recarregue a página (F5)
- Limpe cache do navegador (Ctrl+Shift+Del)

## 📞 Estrutura do Banco

Supabase - Tabela `users`:
```
id          - UUID único
username    - Nome do usuário
password    - Senha (hash)
created_at  - Data de criação
updated_at  - Data de atualização
```

## 🎓 Próximas Melhorias

- [ ] Fotos de perfil
- [ ] Mensagens entre usuários
- [ ] Compartilhamento de projetos
- [ ] Notificações em tempo real
- [ ] Histórico de atividades
- [ ] 2FA real
- [ ] Mudança de senha real
- [ ] Exclusão de conta real

---

**Pronto para começar! 🎉**

Qualquer dúvida, verifique os arquivos JavaScript em `/js/` ou consulte a documentação do Supabase.
