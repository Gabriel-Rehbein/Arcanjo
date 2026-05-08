# RELATÓRIO TÉCNICO — TECNOLOGIAS UTILIZADAS NO PROJETO ARCANJO

---

# 📌 IDENTIFICAÇÃO DO PROJETO

## Nome do Projeto
**Arcanjo**

## Desenvolvedor
**Gabriel Menezes Rehbein**

## Categoria
Plataforma Social para Compartilhamento de Projetos e Portfólios

## Tipo de Sistema
Aplicação Web Full Stack

---

# 📖 INTRODUÇÃO

O projeto Arcanjo foi desenvolvido utilizando tecnologias modernas voltadas para desenvolvimento web full stack, experiência do usuário, autenticação segura, integração entre sistemas e organização arquitetural.

A aplicação foi construída com foco em:

- Escalabilidade
- Organização estrutural
- Segurança
- Performance
- Responsividade
- Experiência visual moderna
- Facilidade de manutenção
- Separação de responsabilidades

---

# 🖥️ BACKEND

O backend do Arcanjo é responsável pelo processamento das informações, gerenciamento das regras da aplicação, autenticação dos usuários e comunicação com o banco de dados.

---

# 🟩 NODE.JS

## Descrição
Runtime JavaScript utilizado para execução do servidor backend.

---

## Funções no Projeto

- Execução do servidor
- Processamento das requisições
- Comunicação com banco de dados
- Gerenciamento da aplicação

---

## Benefícios

- Alta performance
- Desenvolvimento moderno
- Escalabilidade
- Integração eficiente com JavaScript

---

# 🚂 EXPRESS.JS

## Descrição
Framework web minimalista utilizado para criação da API da aplicação.

---

## Responsabilidades

- Gerenciamento de rotas
- Controle de requisições HTTP
- Estruturação da API
- Organização do backend
- Tratamento de respostas

---

## Benefícios

- Código organizado
- Estrutura escalável
- Desenvolvimento rápido
- Fácil manutenção

---

# 🐘 POSTGRESQL

## Descrição
Banco de dados relacional utilizado para armazenamento das informações da plataforma.

---

## Dados Armazenados

- Usuários
- Projetos
- Comentários
- Curtidas
- Informações de autenticação
- Dados da aplicação

---

## Benefícios

- Segurança
- Robustez
- Escalabilidade
- Performance
- Confiabilidade

---

# 🔷 TYPEORM

## Descrição
ORM utilizado para integração entre aplicação e banco de dados PostgreSQL.

---

## Responsabilidades

- Criação de tabelas
- Relacionamentos entre entidades
- Manipulação de dados
- Mapeamento objeto-relacional
- Gerenciamento estrutural do banco

---

## Benefícios

- Código mais organizado
- Facilidade de manutenção
- Estrutura profissional
- Melhor gerenciamento do banco de dados

---

# 🔐 BCRYPT

## Descrição
Biblioteca utilizada para criptografia e proteção de senhas.

---

## Objetivos

- Segurança das contas
- Proteção dos usuários
- Armazenamento seguro de senhas

---

# 🔑 JSONWEBTOKEN (JWT)

## Descrição
Sistema de autenticação baseado em tokens.

---

## Funções no Projeto

- Login autenticado
- Proteção de rotas
- Controle de sessão
- Segurança de acesso

---

# 🌐 CORS

## Descrição
Middleware utilizado para permitir comunicação segura entre frontend e backend.

---

## Objetivos

- Comunicação entre portas diferentes
- Segurança nas requisições
- Controle de acesso da API

---

# ⚙️ DOTENV

## Descrição
Biblioteca utilizada para gerenciamento de variáveis de ambiente.

---

## Aplicações

- Credenciais do banco
- Chaves JWT
- Configurações do servidor
- Informações sensíveis

---

# 🌍 OPEN

## Descrição
Biblioteca utilizada para abrir automaticamente o navegador durante a execução do sistema.

---

## Objetivo

- Melhor experiência durante desenvolvimento
- Inicialização automática do projeto

---

# 🎨 FRONTEND

O frontend do Arcanjo é responsável pela interface visual e experiência do usuário.

O foco principal foi criar uma interface moderna, dinâmica e responsiva.

---

# ⚛️ REACT

## Descrição
Biblioteca JavaScript utilizada para construção da interface da aplicação.

---

## Aplicações

- Componentização
- Interface dinâmica
- Atualizações em tempo real
- Navegação moderna

---

## Benefícios

- Reutilização de componentes
- Melhor organização
- Interface interativa
- Alta performance

---

# ▲ NEXT.JS

## Descrição
Framework React utilizado para estruturação moderna da aplicação frontend.

---

## Recursos Utilizados

- Estrutura de páginas
- Otimização de carregamento
- Organização de componentes
- Melhor gerenciamento da aplicação

---

## Benefícios

- Melhor performance
- Estrutura profissional
- Escalabilidade
- Navegação otimizada

---

# 🌐 HTML5

## Descrição
Linguagem de marcação utilizada para estruturar as páginas da aplicação.

---

## Aplicações

- Estrutura visual
- Organização semântica
- Formulários
- Componentes visuais

---

# 🎨 CSS3

## Descrição
Tecnologia utilizada para estilização completa da interface.

---

## Recursos Aplicados

- Responsividade
- Flexbox
- Grid Layout
- Animações
- Transições
- Estilização personalizada

---

## Objetivos

- Interface moderna
- Visual tecnológico
- Melhor experiência visual
- Navegação agradável

---

# ⚡ JAVASCRIPT (ES6+)

## Descrição
Linguagem principal utilizada no frontend e backend da aplicação.

---

## Aplicações

- Manipulação da interface
- Interatividade
- Comunicação com API
- Atualizações dinâmicas
- Controle de funcionalidades

---

# 🗄️ BANCO DE DADOS

---

# 🐘 POSTGRESQL

## Estrutura Utilizada

O banco de dados foi utilizado para armazenar:

- Usuários
- Projetos
- Comentários
- Curtidas
- Dados de autenticação
- Informações da plataforma

---

# 🔄 POOL DE CONEXÕES

## Descrição
Sistema utilizado para gerenciamento eficiente das conexões com banco de dados.

---

## Benefícios

- Melhor performance
- Otimização de conexões
- Redução de sobrecarga
- Maior estabilidade

---

# 🏗️ INFRAESTRUTURA

---

# 📦 NPM

## Descrição
Gerenciador de pacotes utilizado no projeto.

---

## Responsabilidades

- Instalação de dependências
- Gerenciamento de bibliotecas
- Execução de scripts
- Controle de ambiente

---

# 🌐 PORTAS UTILIZADAS

## Backend
- Porta 3000

## Frontend
- Porta 3001

---

# 🔒 COMUNICAÇÃO SEGURA

O projeto utiliza CORS para permitir comunicação segura entre frontend e backend em diferentes portas.

---

# 🧠 ARQUITETURA UTILIZADA

O Arcanjo foi estruturado utilizando arquitetura organizada em camadas inspirada no padrão MVC.

---

# 🏗️ ESTRUTURA DO BACKEND

## 📂 Controllers

Responsáveis pela lógica das requisições e respostas da aplicação.

---

## 🛣️ Routes

Responsáveis pela definição dos endpoints da API.

---

## ⚙️ Services

Responsáveis pelas regras de negócio e processos reutilizáveis.

---

## 🗄️ Repositories

Responsáveis pelo acesso e manipulação do banco de dados.

---

## 🧩 Entities

Responsáveis pela modelagem das tabelas e entidades do sistema.

---

## 🛡️ Middlewares

Responsáveis pelo tratamento de requisições, autenticação e controle da aplicação.

---

# 📱 RESPONSIVIDADE

A aplicação foi desenvolvida para funcionar corretamente em:

- Smartphones
- Tablets
- Computadores

O sistema foi planejado para manter qualidade visual em diferentes tamanhos de tela.

---

# 🎨 EXPERIÊNCIA VISUAL

O Arcanjo possui foco em experiência moderna e interativa.

Entre os principais objetivos visuais estão:

- Interface tecnológica
- Navegação intuitiva
- Layout moderno
- Interações dinâmicas
- Experiência fluida

---

# 🚀 ESCALABILIDADE

As tecnologias escolhidas permitem futura expansão da plataforma com:

- Inteligência Artificial
- Sistemas em tempo real
- Feed inteligente
- Recursos avançados de interação
- Novos módulos da aplicação

---

# 📌 CONCLUSÃO

O projeto Arcanjo utiliza tecnologias modernas e robustas voltadas para desenvolvimento web profissional.

A combinação entre frontend moderno, backend estruturado e banco de dados relacional permite criar uma plataforma escalável, segura, organizada e preparada para crescimento futuro.

A arquitetura utilizada facilita manutenção, expansão e desenvolvimento contínuo da aplicação.

---

# 👨‍💻 AUTOR

## Gabriel Menezes Rehbein

Desenvolvedor focado em inovação, tecnologia e experiência do usuário.

---