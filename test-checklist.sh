#!/bin/bash
# Script de teste para verificar se todas as funcionalidades do Arcanjo estão funcionando

echo "🔍 Verificando estrutura do projeto Arcanjo..."
echo ""

# Verificar arquivos HTML
echo "✓ Arquivos HTML:"
for file in index.html login.html dashboard.html profile.html settings.html; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - FALTANDO"
  fi
done

echo ""
echo "✓ Arquivos JavaScript:"
for file in js/auth.js js/auth-login.js js/dashboard.js js/profile.js js/settings.js js/supabase-config.js js/data.js; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - FALTANDO"
  fi
done

echo ""
echo "✓ Arquivos CSS:"
for file in css/style.css css/resposive.css; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - FALTANDO"
  fi
done

echo ""
echo "✓ Checklist de Funcionalidades:"
echo ""

# Função para verificar se um arquivo contém uma string
check_function() {
  local file=$1
  local search=$2
  local description=$3
  
  if grep -q "$search" "$file" 2>/dev/null; then
    echo "  ✅ $description"
  else
    echo "  ⚠️  $description - pode não estar implementado"
  fi
}

echo "Autenticação:"
check_function "js/auth.js" "getCurrentUser" "Função getCurrentUser()"
check_function "js/auth.js" "protectRoute" "Proteção de rotas"

echo ""
echo "Dashboard:"
check_function "js/dashboard.js" "loadProjects" "Carregar projetos"
check_function "js/dashboard.js" "editProject" "Editar projetos"
check_function "js/dashboard.js" "deleteProject" "Deletar projetos"

echo ""
echo "Perfil:"
check_function "js/profile.js" "loadProfileData" "Carregar dados do perfil"
check_function "js/profile.js" "saveProfileData" "Salvar dados do perfil"

echo ""
echo "Configurações:"
check_function "js/settings.js" "loadSettings" "Carregar configurações"
check_function "js/settings.js" "toggleNotifications" "Toggle de notificações"
check_function "js/settings.js" "selectColor" "Seletor de cores"

echo ""
echo "✓ Elementos HTML Críticos:"
echo ""

check_element() {
  local file=$1
  local element=$2
  local description=$3
  
  if grep -q "id=\"$element\"" "$file" 2>/dev/null; then
    echo "  ✅ $description"
  else
    echo "  ❌ $description - ID '$element' não encontrado"
  fi
}

echo "Dashboard:"
check_element "dashboard.html" "userWelcome" "Bem-vindo com nome"
check_element "dashboard.html" "logoutBtnTop" "Botão Logout"

echo ""
echo "Perfil:"
check_element "profile.html" "profileForm" "Formulário de Perfil"
check_element "profile.html" "profileBio" "Campo Bio"

echo ""
echo "Configurações:"
check_element "settings.html" "emailNotifications" "Toggle de Notificações"
check_element "settings.html" "themeSelect" "Seletor de Tema"

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "Para executar o projeto:"
echo "1. Python: python -m http.server 8000"
echo "2. Node.js: npx http-server"
echo "3. VS Code: Clique direito em index.html → Open with Live Server"
echo ""
echo "Conta de teste:"
echo "Usuário: Gabriel"
echo "Senha: Meu1234"
