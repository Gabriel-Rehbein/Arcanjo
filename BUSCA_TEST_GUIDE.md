# 🔍 Guia de Teste - Funcionalidade de Busca

## Alterações Realizadas

### ✅ Backend (Node.js + Express)
1. **ProjectRepository.js**: Adicionado `searchProjects(query)` com suporte a busca por:
   - Título do projeto
   - Descrição do projeto
   - Tags/Categorias

2. **ProjectService.js**: Adicionado `search(query)` que:
   - Valida se a query é uma string não-vazia
   - Retorna array vazio se query for inválida
   - Chama o repositório para fazer a busca

3. **ProjectController.js**: Adicionado método `search()` que:
   - Recebe o parâmetro `q` da query string
   - Retorna array vazio se `q` for vazio
   - Chama o serviço de busca

4. **project.routes.js**: Adicionada rota:
   ```
   GET /projects/search?q=termo
   ```

### ✅ Frontend (React + Next.js)

1. **Header.js** - Melhorias:
   - ✅ Suporte a busca ao pressionar **Enter**
   - ✅ Desabilitar botão quando input está vazio
   - ✅ Mostrar feedback visual durante a busca
   - ✅ Melhor tratamento de erro

2. **Header.module.css** - Estilos:
   - ✅ Hover effect no botão
   - ✅ Estado desabilitado com cursor `not-allowed`
   - ✅ Transição suave de cores
   - ✅ Feedback visual ao clicar

## 🧪 Como Testar

### 1. Testar Backend Diretamente
```bash
# Substitua {termo} por uma palavra que existe em seus projetos
curl "http://localhost:3000/api/projects/search?q=react"
```

### 2. Testar Frontend - Interface

#### 2.1 Busca Normal (Clicando no Botão)
1. Abra a aplicação no navegador
2. Vá para qualquer página que tenha o Header
3. Digite algo na barra de busca (ex: "React")
4. Clique no botão "Buscar"
5. Você deve ser redirecionado para `/explore?search=React`
6. Os resultados devem aparecer nas abas "Projetos" e "Usuários"

#### 2.2 Busca com Enter
1. Abra a aplicação no navegador
2. Clique na barra de busca
3. Digite algo (ex: "Node")
4. Pressione **Enter** no teclado
5. Você deve ser redirecionado para `/explore?search=Node`
6. Os resultados devem aparecer

#### 2.3 Teste o Botão Desabilitado
1. Abra a página
2. Observe que o botão "Buscar" está com cor mais clara (desabilitado)
3. Digite algo na barra
4. Observe que o botão fica mais escuro e clickável
5. Apague o texto
6. Observe que o botão volta a ficar desabilitado

#### 2.4 Teste o Feedback Visual
1. Digite algo na barra de busca
2. Clique no botão "Buscar"
3. Você deve ver "Buscando..." no botão por um breve momento
4. Depois, a página carrega com os resultados

### 3. Verificar Console de Erros
Abra o DevTools (F12) e verifique se há erros no console ao fazer uma busca.

## 📋 Checklist de Verificação

- [ ] Backend retorna resultados ao chamar `/projects/search?q=termo`
- [ ] Frontend carrega a página Explore com resultados
- [ ] Botão "Buscar" funciona ao clicar
- [ ] Busca funciona ao pressionar Enter
- [ ] Botão fica desabilitado quando input está vazio
- [ ] Feedback visual aparece durante a busca
- [ ] Nenhum erro no console do navegador
- [ ] Resultados aparecem nas duas abas (Projetos e Usuários)
- [ ] URLs corretas são geradas: `/explore?search=termo`

## 🐛 Se Algo Não Funcionar

### Problema: "Nenhum projeto encontrado"
- Verifique se existem projetos no banco de dados
- Teste a rota `/projects/search?q=` diretamente no navegador
- Verifique o console do servidor para erros

### Problema: Botão não responde ao clique
- Verifique se há erros no console do navegador (F12)
- Certifique-se de que o JavaScript está habilitado
- Tente recarregar a página (Ctrl+R ou Cmd+R)

### Problema: Busca com Enter não funciona
- Verifique se o input está focado (cursor visível)
- Tente clicar no botão em vez disso
- Verifique o console para erros

## 📱 Responsividade

A barra de busca deve funcionar em:
- ✅ Desktop (tela grande)
- ✅ Tablet (tela média)
- ✅ Mobile (tela pequena)

Em telas pequenas, a barra de busca se expande para a linha de baixo.

---

**Data de Implementação**: 24 de abril de 2026
**Status**: ✅ Pronto para Teste
