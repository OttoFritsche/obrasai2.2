# 🧠 Contexto e Regras do Projeto ObrasAI

Este documento centraliza as informações, regras e convenções para o
desenvolvimento do projeto ObrasAI.

**Regra Essencial:** Sempre me comunicar em **português brasileiro**.

---

## 🎯 Visão Geral do Projeto

- **Produto:** ObrasAI é uma plataforma SaaS completa para gestão de obras na
  construção civil, com foco em automação, controle de custos e inteligência
  artificial especializada.
- **Status Atual:** O sistema principal (v2.2) está **100% implementado e
  funcional**, incluindo módulos de gestão, IA contextual, captura de leads,
  orçamento paramétrico, sistema SINAPI, assinaturas e contratos inteligentes.
- **Missão:** Revolucionar a gestão de obras no Brasil com tecnologia, IA e
  automação.

---

## 🛠️ Stack Tecnológica Principal

- **Frontend:** React 18+ com TypeScript, Vite, Tailwind CSS e shadcn/ui.
- **Gerenciamento de Estado:** TanStack Query (React Query).
- **Formulários:** React Hook Form com Zod para validação.
- **Backend & Infra:** Supabase (PostgreSQL, Auth, Storage, Edge Functions em
  Deno/TypeScript).
- **Automação:** n8n Cloud para workflows (ex: captura de leads).
- **APIs de IA:** DeepSeek API.
- **Pagamentos:** Stripe.
- **Tipagem:** Sistema robusto de tipos TypeScript com arquivos centralizados e
  ESLint configurado.

## 🚨 Regra Crítica de Arquitetura

- **Limite de Tamanho de Arquivos:** Arquivos não devem exceder **400-500 linhas
  de código**. Arquivos maiores devem ser **obrigatoriamente refatorados** em
  módulos menores para facilitar manutenção, legibilidade e evitar complexidade
  excessiva. Aplicar princípio da responsabilidade única.

---

## 🏗️ Arquitetura e Estrutura

### Frontend (`src/`)

- `components/`: Componentes reutilizáveis (UI, AI, Dashboard, etc.).
- `pages/`: Páginas principais da aplicação.
- `hooks/`: Custom hooks para lógica de negócios (`useObras`, `useContratoAI`,
  etc.).
- `services/`: Comunicação com APIs externas (Supabase, IA, etc.).
- `lib/`: Utilitários, validações e configurações.
- `contexts/`: Contextos globais da aplicação.
- `types/`: **Sistema centralizado de tipos TypeScript** (`forms.ts`, `api.ts`,
  `alerts.ts`, `supabase.ts`, `index.ts`).

### Backend (`supabase/`)

- `functions/`: Mais de 27 Edge Functions para lógicas específicas (ex:
  `ai-chat`, `contrato-ai-assistant`, `gerar-contrato-pdf`).
- `migrations/`: Migrações do banco de dados PostgreSQL.

### Banco de Dados (Tabelas Principais)

- `leads`: Captura de leads do chatbot.
- `obras`: Gerenciamento das obras.
- `contratos`: Contratos inteligentes com histórico e status.
- `ia_contratos_interacoes`: Log e analytics de todas as interações com a IA de
  contratos.
- `embeddings_conhecimento`: Vetores de embeddings para busca semântica
  (documentação, etc.).
- Outras: `fornecedores_pj`, `fornecedores_pf`, `despesas`, `notas_fiscais`,
  etc.

---

## ⚙️ Comandos Essenciais

- **Instalar dependências:** `npm install`
- **Rodar ambiente de desenvolvimento:** `npm run dev`
- **Build para produção:** `npm run build`
- **Verificar qualidade do código:** `npm run lint`
- **Verificar tipagem TypeScript:** `npm run type-check`
- **Corrigir problemas automaticamente:** `npm run lint -- --fix`
- **Criar uma nova migração Supabase:**
  `supabase migration new <nome_da_migracao>`
- **Aplicar migrações no banco local:** `supabase db push`
- **Deploy de uma Edge Function:** `supabase functions deploy <nome_da_funcao>`

---

## 🔄 Processo de Desenvolvimento e Git

- **Branches:** Seguir o padrão `feature/`, `fix/`, `hotfix/`.
- **Commits:** Usar commits semânticos (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Pull Requests (PRs):** Revisão de código é obrigatória antes do merge.
- **Simplicidade:** Priorizar soluções simples e diretas (KISS). Evitar
  complexidade desnecessária, especialmente em fluxos n8n.

---

## 🛡️ Regras de Segurança (Crítico)

- **Row Level Security (RLS):** RLS é **obrigatório** em todas as tabelas para
  garantir o isolamento de dados (multi-tenant).
- **Validação de Dados:** Realizar validação dupla: no frontend (para UX) e no
  backend (para segurança).
- **Gerenciamento de Segredos:** **Nunca** fazer commit de chaves de API, tokens
  ou segredos. Utilizar variáveis de ambiente do Supabase.
- **LGPD:** A coleta de dados (leads) deve ser compatível com a LGPD, informando
  a finalidade e garantindo o consentimento.

---

## 🤖 Diretrizes para a IA (Gemini)

1. **Analisar Antes de Agir:** Sempre analisar o código existente na base para
   entender a estrutura e as convenções antes de propor uma solução.
2. **Priorizar o Existente:** Antes de sugerir novas bibliotecas ou tecnologias,
   verificar se a funcionalidade pode ser implementada com a stack atual (React,
   Supabase, n8n).
3. **Explicar o "Porquê":** Não apenas mostrar o código, mas justificar as
   decisões técnicas, especialmente em relação à arquitetura e segurança.
4. **Foco na Simplicidade e Manutenibilidade:** Propor soluções claras,
   eficientes e fáceis de manter, alinhadas com os princípios do projeto.
5. **Segurança em Primeiro Lugar:** Ser proativo na identificação e
   implementação de práticas de segurança, especialmente RLS e validação de
   dados.
6. **Testes:** Para novas funcionalidades, sempre sugerir uma estratégia de
   teste prática, mesmo que manual, para validar o fluxo completo (ex: testar a
   captura de um lead desde o chatbot até o recebimento do email).

---

## 📝 Convenções de Tipagem TypeScript

### **Estrutura de Tipos:**

- **`src/types/forms.ts`**: Tipos para formulários, props e validação
- **`src/types/api.ts`**: Tipos para APIs, responses e requests
- **`src/types/alerts.ts`**: Sistema completo de alertas avançados
- **`src/types/supabase.ts`**: Tipos específicos do Supabase e realtime
- **`src/types/index.ts`**: Exportação central e utility types

### **Padrões de Nomenclatura:**

- **Interface para props:** `interface ComponentProps { ... }`
- **Interface para objetos:** `interface UserData { ... }`
- **Type para unions:** `type Status = 'pending' | 'completed' | 'error'`
- **Type para aliases:** `type WithId<T> = T & { id: string }`

### **Regras Essenciais:**

- **Proibido uso de `any`** - sempre usar tipos específicos
- **Preferir `interface`** para definições de objetos
- **Usar `type`** para union types e aliases
- **Importar tipos** com `import type` quando possível
- **FormWrapper genérico** com `<T = Record<string, unknown>>`

### **ESLint Configurado:**

```javascript
"@typescript-eslint/no-explicit-any": "error"
"@typescript-eslint/consistent-type-definitions": ["error", "interface"]
"@typescript-eslint/consistent-type-imports": "error"
```

### **Utility Types Disponíveis:**

- `WithId<T>`: Adiciona campo id
- `WithTimestamps<T>`: Adiciona created_at/updated_at
- `WithUser<T>`: Adiciona usuario_id/tenant_id
- `DatabaseEntity<T>`: Combinação completa para entidades do banco
- `CreateInput<T>`: Remove campos auto-gerados para criação
- `UpdateInput<T>`: Campos opcionais para atualização

### **Exemplos de Uso:**

```typescript
// ✅ Correto - Interface para props
interface ObraFormProps {
  onSubmit: (data: ObraFormData) => void;
  initialData?: Partial<ObraFormData>;
  isLoading?: boolean;
}

// ✅ Correto - FormWrapper genérico
<FormWrapper<ObraFormData>
  form={form}
  onSubmit={handleSubmit}
  title="Nova Obra"
>
  {/* campos do formulário */}
</FormWrapper>;

// ✅ Correto - Utility types
type NovaObra = CreateInput<ObraFormData>;
type AtualizarObra = UpdateInput<ObraFormData>;

// ❌ Incorreto - uso de any
// const handleSubmit = (data: any) => { ... }
```

---

## ✅ Checklist de Boas Práticas de Código

1. **Evitar Duplicação de Código (DRY):** Utilizar componentes, hooks e funções
   reutilizáveis para evitar a repetição de lógica.
2. **Eliminar Código Não Utilizado (Dead Code):** Remover componentes, funções,
   imports e variáveis de estado que não são usados.
3. **Uso Consistente de TypeScript:** Proibir o uso de `any`, tipar todas as
   props e usar `interface` para objetos e `type` para uniões/aliases.
4. **Componentes Bem Estruturados:** Manter componentes pequenos e focados
   (máximo de 250 linhas), seguindo o princípio da responsabilidade única.
5. **Gerenciamento de Estado Eficiente:** Usar `TanStack Query` para estado do
   servidor e `Context API` de forma modular para estado global. Evitar "prop
   drilling".
6. **Uso Correto de React Hooks:** Seguir as regras dos hooks, gerenciar
   dependências (`useEffect`, `useCallback`) e criar custom hooks para lógicas
   complexas.
7. **Separação de Lógica e Apresentação:** Isolar a lógica de negócio em hooks e
   serviços, mantendo os componentes focados na UI.
8. **Tratamento de Erros Robusto:** Usar `try/catch` em chamadas de API,
   implementar `Error Boundaries` e fornecer feedback claro ao usuário.
9. **Performance e Otimizações:** Utilizar `React.memo`, `useCallback`,
   `useMemo` quando necessário, virtualizar listas longas e otimizar imagens.
10. **Estrutura e Organização do Projeto:** Seguir a estrutura de arquivos e
    pastas definida, evitando dependências circulares e arquivos muito grandes.
11. **Acessibilidade (a11y):** Garantir que a aplicação seja acessível, com
    labels, `alt` text para imagens, semântica HTML correta e navegação por
    teclado.
12. **Testes Adequados (ver seção de testes).**

---

## 🛡️ Checklist de Segurança (Crítico)

1. **Proteger Chaves e Dados Sensíveis:** **Nunca** fazer commit de segredos.
   Usar variáveis de ambiente (`.env`) e garantir que `.gitignore` as exclua.
2. **Não Expor APIs no Frontend:** Toda a lógica sensível e chamadas de API com
   chaves devem ser feitas no backend (Edge Functions).
3. **Validação de Dados de Entrada:** Validar **TODOS** os inputs no frontend
   (Zod) e no backend para prevenir injeção de dados maliciosos.
4. **Autenticação e Autorização (RLS):** **RLS é obrigatório em todas as
   tabelas**. Verificar permissões em todas as rotas e queries sensíveis.
5. **Proteção Contra Ataques Comuns:** Usar ORM do Supabase para prevenir SQL
   Injection. Validar e sanitizar dados para prevenir XSS.
6. **Logging Adequado:** Manter logs de eventos críticos (logins, erros), mas
   **NUNCA** registrar senhas, tokens ou dados pessoais nos logs.
7. **Política de Senhas Fortes:** Exigir senhas fortes via validação Zod e usar
   o hash seguro do Supabase Auth.
8. **Backup e Recuperação de Dados:** Utilizar os backups automáticos do
   Supabase e ter um plano de recuperação.
9. **Análise de Dependências:** Manter as dependências atualizadas e
   periodicamente rodar `npm audit` para encontrar vulnerabilidades.
10. **Comunicação Segura (HTTPS):** Forçar HTTPS em toda a aplicação.

---

## 🧪 Estratégia de Testes

- **Foco em Testes de Integração:** Priorizar testes que simulam o comportamento
  real do usuário nos componentes React, utilizando a `React Testing Library`.
- **Mocking de API com MSW:** Padronizar o uso do **Mock Service Worker (MSW)**
  para interceptar chamadas de API (`fetch`), tornando os testes realistas e
  independentes do backend.
- **Testes Unitários para Lógica Pura:** Cobrir com testes unitários (Vitest)
  toda a lógica de negócio isolada, especialmente validadores (Zod) e funções
  utilitárias (`/lib/utils`).
- **Verificação da UI:** Os testes de integração devem sempre verificar o
  resultado final na interface do usuário (ex: um toast de sucesso aparece, uma
  navegação ocorre), em vez de apenas verificar se uma função mockada foi
  chamada.
- **Cobertura de Fluxos Críticos:** Garantir testes de integração para os fluxos
  mais importantes: registro, login, criação de obras, lançamento de despesas,
  etc.

---

## 🤖 Diretrizes para a IA (Gemini)

1. **Analisar Antes de Agir:** Sempre analisar o código existente e as regras
   deste documento antes de propor uma solução.
2. **Priorizar o Existente:** Verificar se a funcionalidade pode ser
   implementada com a stack atual (React, Supabase, n8n) antes de sugerir novas
   tecnologias.
3. **Explicar o "Porquê":** Justificar as decisões técnicas, especialmente em
   relação à arquitetura, segurança e boas práticas.
4. **Foco na Simplicidade e Manutenibilidade:** Propor soluções claras e
   eficientes.
5. **Segurança e Boas Práticas Como Prioridade:** Ser proativo na aplicação de
   **TODOS** os pontos dos checklists de segurança e boas práticas.
6. **Testes:** Para novas funcionalidades, sempre incluir um teste (unitário ou
   de integração) seguindo a estratégia definida.
