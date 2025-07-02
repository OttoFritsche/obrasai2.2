# 🧠 Contexto e Regras do Projeto ObrasAI

Este documento centraliza as informações, regras e convenções para o desenvolvimento do projeto ObrasAI.

**Regra Essencial:** Sempre me comunicar em **português brasileiro**.

---

## 🎯 Visão Geral do Projeto

- **Produto:** ObrasAI é uma plataforma SaaS completa para gestão de obras na construção civil, com foco em automação, controle de custos e inteligência artificial especializada.
- **Status Atual:** O sistema principal (v2.2) está **100% implementado e funcional**, incluindo módulos de gestão, IA contextual, captura de leads, orçamento paramétrico, sistema SINAPI, assinaturas e contratos inteligentes.
- **Missão:** Revolucionar a gestão de obras no Brasil com tecnologia, IA e automação.

---

## 🛠️ Stack Tecnológica Principal

- **Frontend:** React 18+ com TypeScript, Vite, Tailwind CSS e shadcn/ui.
- **Gerenciamento de Estado:** TanStack Query (React Query).
- **Formulários:** React Hook Form com Zod para validação.
- **Backend & Infra:** Supabase (PostgreSQL, Auth, Storage, Edge Functions em Deno/TypeScript).
- **Automação:** n8n Cloud para workflows (ex: captura de leads).
- **APIs de IA:** DeepSeek API.
- **Pagamentos:** Stripe.
- **Tipagem:** Sistema robusto de tipos TypeScript com arquivos centralizados e ESLint configurado.

---

## 🏗️ Arquitetura e Estrutura

### Frontend (`src/`)
- `components/`: Componentes reutilizáveis (UI, AI, Dashboard, etc.).
- `pages/`: Páginas principais da aplicação.
- `hooks/`: Custom hooks para lógica de negócios (`useObras`, `useContratoAI`, etc.).
- `services/`: Comunicação com APIs externas (Supabase, IA, etc.).
- `lib/`: Utilitários, validações e configurações.
- `contexts/`: Contextos globais da aplicação.
- `types/`: **Sistema centralizado de tipos TypeScript** (`forms.ts`, `api.ts`, `alerts.ts`, `supabase.ts`, `index.ts`).

### Backend (`supabase/`)
- `functions/`: Mais de 27 Edge Functions para lógicas específicas (ex: `ai-chat`, `contrato-ai-assistant`, `gerar-contrato-pdf`).
- `migrations/`: Migrações do banco de dados PostgreSQL.

### Banco de Dados (Tabelas Principais)
- `leads`: Captura de leads do chatbot.
- `obras`: Gerenciamento das obras.
- `contratos`: Contratos inteligentes com histórico e status.
- `ia_contratos_interacoes`: Log e analytics de todas as interações com a IA de contratos.
- `embeddings_conhecimento`: Vetores de embeddings para busca semântica (documentação, etc.).
- Outras: `fornecedores_pj`, `fornecedores_pf`, `despesas`, `notas_fiscais`, etc.

---

## ⚙️ Comandos Essenciais

- **Instalar dependências:** `npm install`
- **Rodar ambiente de desenvolvimento:** `npm run dev`
- **Build para produção:** `npm run build`
- **Verificar qualidade do código:** `npm run lint`
- **Verificar tipagem TypeScript:** `npm run type-check`
- **Corrigir problemas automaticamente:** `npm run lint -- --fix`
- **Criar uma nova migração Supabase:** `supabase migration new <nome_da_migracao>`
- **Aplicar migrações no banco local:** `supabase db push`
- **Deploy de uma Edge Function:** `supabase functions deploy <nome_da_funcao>`

---

## 🔄 Processo de Desenvolvimento e Git

- **Branches:** Seguir o padrão `feature/`, `fix/`, `hotfix/`.
- **Commits:** Usar commits semânticos (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Pull Requests (PRs):** Revisão de código é obrigatória antes do merge.
- **Simplicidade:** Priorizar soluções simples e diretas (KISS). Evitar complexidade desnecessária, especialmente em fluxos n8n.

---

## 🛡️ Regras de Segurança (Crítico)

- **Row Level Security (RLS):** RLS é **obrigatório** em todas as tabelas para garantir o isolamento de dados (multi-tenant).
- **Validação de Dados:** Realizar validação dupla: no frontend (para UX) e no backend (para segurança).
- **Gerenciamento de Segredos:** **Nunca** fazer commit de chaves de API, tokens ou segredos. Utilizar variáveis de ambiente do Supabase.
- **LGPD:** A coleta de dados (leads) deve ser compatível com a LGPD, informando a finalidade e garantindo o consentimento.

---

## 🤖 Diretrizes para a IA (Claude)

1.  **Analisar Antes de Agir:** Sempre analisar o código existente na base para entender a estrutura e as convenções antes de propor uma solução.
2.  **Priorizar o Existente:** Antes de sugerir novas bibliotecas ou tecnologias, verificar se a funcionalidade pode ser implementada com a stack atual (React, Supabase, n8n).
3.  **Explicar o "Porquê":** Não apenas mostrar o código, mas justificar as decisões técnicas, especialmente em relação à arquitetura e segurança.
4.  **Foco na Simplicidade e Manutenibilidade:** Propor soluções claras, eficientes e fáceis de manter, alinhadas com os princípios do projeto.
5.  **Segurança em Primeiro Lugar:** Ser proativo na identificação e implementação de práticas de segurança, especialmente RLS e validação de dados.
6.  **Testes:** Para novas funcionalidades, sempre sugerir uma estratégia de teste prática, mesmo que manual, para validar o fluxo completo (ex: testar a captura de um lead desde o chatbot até o recebimento do email).

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
</FormWrapper>

// ✅ Correto - Utility types
type NovaObra = CreateInput<ObraFormData>;
type AtualizarObra = UpdateInput<ObraFormData>;

// ❌ Incorreto - uso de any
// const handleSubmit = (data: any) => { ... }
```
