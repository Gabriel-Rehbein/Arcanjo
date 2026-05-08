# RELATÓRIO DE ESTRUTURA — ARQUITETURA EM CAMADAS DO PROJETO ARCANJO

---

# 📌 IDENTIFICAÇÃO

## Projeto
**Arcanjo**

## Desenvolvedor
**Gabriel Menezes Rehbein**

## Tipo de Arquitetura
Arquitetura em Camadas (Layered Architecture)

## Modelo Utilizado
MVC Adaptado para API REST

---

# 📖 INTRODUÇÃO

O projeto Arcanjo foi estruturado utilizando arquitetura em camadas com o objetivo de:

- Melhorar organização do código
- Facilitar manutenção
- Separar responsabilidades
- Tornar o sistema escalável
- Facilitar reutilização de código
- Melhorar legibilidade do projeto

A arquitetura divide o sistema em múltiplas camadas, onde cada pasta possui uma responsabilidade específica dentro da aplicação.

---

# 🏗️ ESTRUTURA GERAL DO PROJETO

```txt
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── entities/
│   ├── middlewares/
│   ├── config/
│   ├── database/
│   ├── utils/
│   ├── uploads/
│   ├── app.js
│   └── data-source.js
```

---

# 📂 CONTROLLERS

## Pasta

```txt
controllers/
```

---

# 📖 Função da Pasta

A pasta Controllers é responsável por controlar as requisições recebidas pela API.

Os controllers fazem a comunicação entre:

- Rotas
- Serviços
- Respostas HTTP

---

# ⚙️ Responsabilidades

- Receber requisições
- Validar dados básicos
- Chamar services
- Retornar respostas
- Controlar status HTTP

---

# 📌 Exemplos

```txt
auth-controller.js
project-controller.js
user-controller.js
notification-controller.js
```

---

# 🧠 Exemplo de Fluxo

```txt
Usuário envia login
↓
Route chama Controller
↓
Controller recebe dados
↓
Controller chama Service
↓
Service processa
↓
Controller retorna resposta
```

---

# 📂 ROUTES

## Pasta

```txt
routes/
```

---

# 📖 Função da Pasta

A pasta Routes define os endpoints da aplicação.

Ela é responsável por mapear URLs para controllers.

---

# ⚙️ Responsabilidades

- Criar endpoints
- Organizar rotas
- Separar módulos
- Aplicar middlewares

---

# 📌 Exemplos

```txt
auth.routes.js
project.routes.js
user.routes.js
notification.routes.js
```

---

# 🌐 Exemplo de Endpoint

```txt
POST /auth/login
GET /projects/feed
POST /projects/create
```

---

# 📂 SERVICES

## Pasta

```txt
services/
```

---

# 📖 Função da Pasta

A pasta Services é responsável pelas regras de negócio do sistema.

Essa camada contém toda lógica principal da aplicação.

---

# ⚙️ Responsabilidades

- Processamento de dados
- Regras de negócio
- Validações avançadas
- Integração entre módulos
- Manipulação de informações

---

# 📌 Exemplos

```txt
auth-service.js
project-service.js
notification-service.js
```

---

# 🧠 Exemplos de Regras

- Validar login
- Criar token JWT
- Verificar permissões
- Criar projetos
- Processar notificações

---

# 📂 REPOSITORIES

## Pasta

```txt
repositories/
```

---

# 📖 Função da Pasta

A pasta Repositories é responsável pela comunicação direta com banco de dados.

Ela centraliza consultas e manipulação de dados.

---

# ⚙️ Responsabilidades

- Buscar dados
- Inserir registros
- Atualizar informações
- Deletar registros
- Executar queries

---

# 📌 Exemplos

```txt
user-repository.js
project-repository.js
notification-repository.js
```

---

# 🗄️ Operações Realizadas

- SELECT
- INSERT
- UPDATE
- DELETE

---

# 📂 ENTITIES

## Pasta

```txt
entities/
```

---

# 📖 Função da Pasta

A pasta Entities contém os modelos das tabelas do banco de dados.

As entidades representam os dados do sistema.

---

# ⚙️ Responsabilidades

- Definir tabelas
- Criar colunas
- Relacionamentos
- Estrutura do banco

---

# 📌 Exemplos

```txt
User.js
Project.js
Notification.js
Comment.js
```

---

# 🧩 Relacionamentos

Exemplos:

- Usuário possui projetos
- Projeto possui comentários
- Usuário possui notificações

---

# 📂 MIDDLEWARES

## Pasta

```txt
middlewares/
```

---

# 📖 Função da Pasta

Middlewares são executados antes da requisição chegar ao controller.

São utilizados para controle da aplicação.

---

# ⚙️ Responsabilidades

- Autenticação
- Segurança
- Validação
- Tratamento de erros
- Controle de acesso

---

# 📌 Exemplos

```txt
auth.middleware.js
error.middleware.js
optionalAuth.middleware.js
```

---

# 🔐 Exemplos de Funções

- Verificar token JWT
- Validar usuário
- Capturar erros
- Bloquear acesso sem login

---

# 📂 CONFIG

## Pasta

```txt
config/
```

---

# 📖 Função da Pasta

A pasta Config contém configurações gerais do sistema.

---

# ⚙️ Responsabilidades

- Configuração JWT
- Configuração ambiente
- Configurações globais
- Parâmetros do sistema

---

# 📌 Exemplos

```txt
jwt.js
database.js
env.js
```

---

# 📂 DATABASE

## Pasta

```txt
database/
```

---

# 📖 Função da Pasta

Responsável pela conexão com banco de dados.

---

# ⚙️ Responsabilidades

- Inicializar banco
- Configurar PostgreSQL
- Gerenciar conexões
- Integrar TypeORM

---

# 📌 Exemplos

```txt
data-source.js
connection.js
```

---

# 📂 UTILS

## Pasta

```txt
utils/
```

---

# 📖 Função da Pasta

Contém funções auxiliares reutilizáveis no sistema.

---

# ⚙️ Responsabilidades

- Funções genéricas
- Helpers
- Utilidades
- Conversões
- Tratamentos auxiliares

---

# 📌 Exemplos

```txt
token.js
cache.js
formatters.js
```

---

# 📂 UPLOADS

## Pasta

```txt
uploads/
```

---

# 📖 Função da Pasta

Armazenamento de arquivos enviados pelos usuários.

---

# ⚙️ Responsabilidades

- Fotos de perfil
- Imagens de projetos
- Arquivos da plataforma

---

# 📌 Exemplos

```txt
/uploads/profile/
/uploads/projects/
```

---

# 📄 APP.JS

## Arquivo

```txt
app.js
```

---

# 📖 Função do Arquivo

Arquivo principal responsável por iniciar a aplicação backend.

---

# ⚙️ Responsabilidades

- Inicializar Express
- Configurar middlewares
- Configurar rotas
- Iniciar servidor
- Definir portas

---

# 📌 Principais Configurações

- express.json()
- cors()
- rotas da API
- servidor HTTP

---

# 📄 DATA-SOURCE.JS

## Arquivo

```txt
data-source.js
```

---

# 📖 Função do Arquivo

Responsável pela configuração do TypeORM e conexão com PostgreSQL.

---

# ⚙️ Responsabilidades

- Configurar banco
- Definir entidades
- Criar conexão
- Inicializar ORM

---

# 📌 Informações Configuradas

- Host
- Porta
- Usuário
- Senha
- Banco de dados
- Entidades

---

# 🔄 FLUXO COMPLETO DA APLICAÇÃO

```txt
Usuário
↓
Routes
↓
Middlewares
↓
Controllers
↓
Services
↓
Repositories
↓
Banco de Dados
↓
Resposta para usuário
```

---

# 🎯 BENEFÍCIOS DA ARQUITETURA UTILIZADA

---

# 🧠 Organização

Cada camada possui responsabilidade separada.

---

# 🔧 Manutenção

Facilidade para corrigir erros e adicionar funcionalidades.

---

# 🚀 Escalabilidade

Permite crescimento do sistema sem desorganização.

---

# 🔄 Reutilização

Funções podem ser reutilizadas em diferentes partes do sistema.

---

# 🔐 Segurança

Melhor controle das requisições e autenticação.

---

# 📈 Performance

Estrutura mais eficiente e organizada.

---

# 📱 FACILIDADE DE EXPANSÃO

A arquitetura permite futura implementação de:

- Inteligência Artificial
- Chat em tempo real
- Notificações avançadas
- Sistema de seguidores
- Feed inteligente
- Microserviços

---

# 📌 CONCLUSÃO

A arquitetura em camadas utilizada no projeto Arcanjo permite uma estrutura moderna, organizada e escalável.

A separação das responsabilidades melhora manutenção, segurança, performance e desenvolvimento contínuo do sistema.

Essa organização facilita crescimento futuro da plataforma e implementação de novas funcionalidades.

---

# 👨‍💻 AUTOR

## Gabriel Menezes Rehbein

Desenvolvedor focado em inovação, organização arquitetural e experiência do usuário.

---