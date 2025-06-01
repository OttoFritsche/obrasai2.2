# Resumo da Análise do Projeto ObrasAI

## 1. Propósito Principal

O projeto "ObrasAI" (nome inferido de discussões anteriores e do contexto, o nome no package.json é "vite_react_shadcn_ts") parece ser uma aplicação web full-stack destinada à **gestão de obras na construção civil**. O objetivo é fornecer uma plataforma centralizada para gerenciar informações sobre Obras, Despesas, Fornecedores (Pessoa Jurídica e Física) e Notas Fiscais. Um diferencial chave parece ser a **integração de funcionalidades de Inteligência Artificial (IA)**, evidenciada pelas Supabase Functions (`ai-generate-insights`, `ai-chat-handler`) e rotas como `/dashboard/chat`, para fornecer insights, automação ou suporte à decisão. O projeto visa resolver a complexidade da gestão de obras, centralizando dados e adicionando uma camada de inteligência.

## 2. Tecnologias

*   **Frontend:**
    *   Framework/Lib: React v18.3.1
    *   Linguagem: TypeScript v5.5.3
    *   Build Tool: Vite v5.4.1
    *   Estilização: Tailwind CSS v3.4.11 (+ PostCSS, Autoprefixer, tailwindcss-animate)
    *   Componentes UI: Shadcn/UI (usando Radix UI primitives e Lucide Icons)
    *   Roteamento: React Router DOM v6.26.2
    *   Gerenciamento de Estado (Server): TanStack Query (React Query) v5.56.2
    *   Gerenciamento de Estado (Client): React Context (inferido de `AuthProvider`) + `next-themes` v0.3.0 (para tema)
    *   Formulários: React Hook Form v7.53.0
    *   Validação: Zod v3.23.8 (com `@hookform/resolvers`)
    *   Visualização de Dados: Recharts v2.12.7
    *   Notificações: Sonner v1.5.0
    *   Utilitários: `date-fns`, `clsx`, `tailwind-merge`, `@tanstack/react-table` v8.21.3
*   **Backend & Banco de Dados:**
    *   Plataforma: Supabase (PaaS)
        *   Banco de Dados: PostgreSQL (implícito pelo Supabase)
        *   Autenticação: Supabase Auth (inferido de `AuthProvider` e `ProtectedRoute`)
        *   Serverless Functions: Supabase Edge Functions (Deno/TypeScript, inferido pela pasta `supabase/functions`)
    *   SDK: `@supabase/supabase-js` v2.49.4
*   **Desenvolvimento & Linting:**
    *   Node.js (implícito pelo `package.json`)
    *   ESLint v9.9.0 (+ plugins TypeScript, React)
    *   Package Manager: npm (indicado por `package-lock.json`) ou Bun (indicado por `bun.lockb`)

## 3. Arquitetura

O projeto segue uma **arquitetura monolítica no frontend** com uma separação clara de responsabilidades baseada em funcionalidades e tipos de componentes, comum em aplicações React modernas.

*   **Camada de Apresentação (UI):** Gerenciada pelo React, utilizando componentes reutilizáveis de `src/components` (construídos com Shadcn/UI) e páginas definidas em `src/pages`. O Tailwind CSS é usado para estilização.
*   **Camada de Roteamento:** Controlada pelo React Router (`src/App.tsx`), definindo rotas públicas e protegidas.
*   **Camada de Gerenciamento de Estado:**
    *   **Estado do Servidor:** Gerenciado pelo TanStack Query, que lida com fetching, caching e atualização de dados vindos do Supabase.
    *   **Estado Global do Cliente:** Gerenciado via React Context (ex: `AuthProvider` para autenticação, `ThemeProvider` inferido de `next-themes`).
    *   **Estado Local:** Gerenciado internamente nos componentes React com `useState`/`useReducer`.
*   **Camada de Lógica de Negócios/Serviços:** Funções para interagir com o backend Supabase estão encapsuladas em `src/services` e a configuração da integração está em `src/integrations/supabase`. A lógica de validação está em `src/lib/validations` (usando Zod).
*   **Camada de Backend (Serverless):** O Supabase fornece o banco de dados PostgreSQL, autenticação, e hospeda Edge Functions (`supabase/functions`) para lógica de backend específica (ex: processamento de IA).

A interação principal ocorre entre os componentes React (páginas/componentes) que usam hooks (TanStack Query, hooks customizados em `src/hooks`) para chamar funções em `src/services`, que por sua vez interagem com a API do Supabase (ou diretamente com as Edge Functions). O `AuthProvider` gerencia o estado de login e `ProtectedRoute` controla o acesso às rotas.

## 4. Funcionalidades Chave (Implementadas/Estruturadas)

Com base na estrutura de rotas (`src/App.tsx`) e pastas (`src/pages/dashboard`), as seguintes funcionalidades parecem estar implementadas ou, pelo menos, estruturadas:

*   **Autenticação:** Login (`/login`), Registro (`/register`), Proteção de Rotas (`ProtectedRoute`, `AuthProvider`).
*   **Landing Page:** Página inicial pública (`/`).
*   **Dashboard Geral:** Visão geral após o login (`/dashboard`).
*   **Gestão de Obras:** Listar (`/dashboard/obras`), Adicionar (`/dashboard/obras/nova`), Detalhar (`/dashboard/obras/:id`), Editar (`/dashboard/obras/:id/editar`).
*   **Gestão de Despesas:** Listar (`/dashboard/despesas`), Adicionar (`/dashboard/despesas/nova`).
*   **Gestão de Fornecedores:** Listar PJ (`/dashboard/fornecedores/pj`), Listar PF (`/dashboard/fornecedores/pf`), Adicionar (`/dashboard/fornecedores/novo`).
*   **Gestão de Notas Fiscais:** Listar (`/dashboard/notas`), Enviar/Upload (`/dashboard/notas/enviar`).
*   **Funcionalidade de IA:** Chat com IA (`/dashboard/chat`), Geração de Insights (inferido de `ai-generate-insights`), Manipulador de Chat (inferido de `ai-chat-handler`).
*   **Configurações:** Página de configurações do usuário (`/settings`).
*   **Assinatura:** Página de gerenciamento de assinatura (`/subscription`) (provavelmente para integração futura com Stripe).
*   **Tratamento de Erros:** Página 404 (`NotFound`), Notificações (`Toaster`).

## 5. Pontos de Entrada e Configuração

*   **Ponto de Entrada Principal (Frontend):** `src/main.tsx` - Inicializa o React e renderiza o componente `App`.
*   **Componente Raiz (Frontend):** `src/App.tsx` - Define a estrutura geral, provedores e rotas da aplicação.
*   **Ponto de Entrada HTML:** `index.html` - Arquivo HTML base servido pelo Vite.
*   **Arquivos de Configuração Importantes:**
    *   `package.json`: Define metadados do projeto, scripts (dev, build, lint), dependências e devDependencies.
    *   `vite.config.ts`: Configuração do build tool Vite (plugins, modo de build).
    *   `tailwind.config.ts`: Configuração do Tailwind CSS (tema, plugins, caminhos de conteúdo).
    *   `tsconfig.json` (e variantes): Configuração do compilador TypeScript.
    *   `components.json`: Configuração específica do Shadcn/UI (gerenciamento de componentes).
    *   `eslint.config.js`: Configuração das regras de linting do ESLint.
    *   `.env` / `.env.example` (não listado, mas esperado): Contém variáveis de ambiente, como chaves de API do Supabase (URL, Anon Key). A segurança depende da configuração correta destes.
    *   `supabase/config.toml`: Configuração do Supabase CLI para interagir com o projeto Supabase (ex: deploy de functions).

## 6. Dependências Externas Principais

*   **React & Ecossistema:** `react`, `react-dom`, `react-router-dom` (Base da UI e Roteamento).
*   **Supabase:** `@supabase/supabase-js` (Interação com o backend e banco de dados Supabase).
*   **TanStack Query:** `@tanstack/react-query` (Gerenciamento de estado do servidor, data fetching/caching).
*   **Shadcn/UI & Primitivas:** `@radix-ui/*`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge` (Construção da Interface do Usuário).
*   **React Hook Form & Zod:** `react-hook-form`, `zod`, `@hookform/resolvers` (Gerenciamento e validação de formulários).
*   **Tailwind CSS:** `tailwindcss` (Framework de estilização CSS utility-first).
*   **Vite:** `vite` (Build tool e servidor de desenvolvimento rápido).
*   **TypeScript:** `typescript` (Superset do JavaScript com tipagem estática).
*   **Outras UI/Utilitários:** `recharts` (Gráficos), `sonner` (Toasts), `date-fns` (Datas), `@tanstack/react-table` (Tabelas).

## 7. Estrutura de Dados

Não há arquivos de migração SQL explícitos ou definições de schema (como um `schema.prisma` ou arquivos ORM) visíveis na estrutura de pastas analisada. A estrutura de dados do banco de dados Supabase (PostgreSQL) é inferida a partir de:

*   **Tipos TypeScript:** Provavelmente existem tipos definidos em `src/lib/types` ou similar (precisaria de análise mais profunda) que espelham as tabelas do banco de dados.
*   **Chamadas de Serviço:** As funções em `src/services` que interagem com o Supabase (`supabase.from('nome_tabela').select()`, `.insert()`, etc.) revelam os nomes das tabelas e colunas utilizadas.
*   **Esquemas Zod:** Os esquemas de validação em `src/lib/validations` definem a forma esperada dos dados para formulários, que geralmente correspondem às colunas das tabelas.
*   **Interface Supabase:** O schema pode ter sido criado e gerenciado diretamente através da interface gráfica do Supabase.

Espera-se encontrar tabelas como `obras`, `despesas`, `fornecedores_pj`, `fornecedores_pf`, `notas_fiscais`, `perfis_usuarios` (ou similar), com relacionamentos entre elas (ex: despesa pertence a uma obra).

## 8. Próximos Passos (Inferência)

Com base na estrutura e funcionalidades delineadas, os próximos passos lógicos parecem ser:

*   **Implementação Detalhada das Funcionalidades:** Preencher a lógica dentro dos componentes de página e serviços para as operações CRUD (Create, Read, Update, Delete) que ainda não estão completas.
*   **Desenvolvimento das Funcionalidades de IA:** Implementar a lógica nas Supabase Functions (`ai-generate-insights`, `ai-chat-handler`) e integrá-las com o frontend (`ChatAIPage`, etc.). Isso pode envolver chamadas para APIs de IA externas ou modelos próprios.
*   **Integração de Pagamentos:** Implementar a lógica de assinatura (`/subscription`) usando Stripe ou outro provedor.
*   **Refinamento da UI/UX:** Melhorar a interface do usuário, adicionar feedback visual, tratamento de erros mais robusto e otimizações de performance.
*   **Testes:** Implementar testes unitários, de integração e end-to-end.
*   **Definição de Schema/Migrações:** Formalizar o schema do banco de dados usando as migrações do Supabase CLI para melhor controle de versão e colaboração.
*   **Configuração de Ambientes:** Garantir que as configurações para `dev`, `test` e `prod` estejam corretamente separadas (especialmente variáveis de ambiente).
*   **Políticas de Segurança (RLS):** Definir Row Level Security (RLS) no Supabase para garantir que os usuários só possam acessar seus próprios dados. 