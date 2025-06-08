# 🏗️ Contexto Técnico - ObrasAI 2.2

## 📋 VISÃO GERAL DO SISTEMA

O **ObrasAI** é uma plataforma web completa para gestão de obras na construção
civil, desenvolvida com tecnologias modernas e inteligência artificial
especializada. O sistema oferece controle total de projetos, custos,
fornecedores e recursos, com automação de processos e insights inteligentes.

## 🛠️ ARQUITETURA IMPLEMENTADA

### Frontend (React + TypeScript)

```bash
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Sistema de design (Shadcn/UI)
│   ├── dashboard/      # Componentes do dashboard
│   └── landing/        # Landing page + Chatbot IA
├── pages/              # Páginas principais
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Login.tsx       # Autenticação
│   ├── admin/          # Páginas administrativas
│   └── dashboard/      # Módulos do dashboard
├── hooks/              # Custom hooks
├── services/           # Serviços e APIs
└── lib/                # Utilitários
```

### Backend (Supabase + Edge Functions)

```bash
supabase/
├── functions/          # 19 Edge Functions
│   ├── ai-chat/        # IA para chat interno
│   ├── ai-landing-chat/# IA para chatbot landing
│   ├── create-lead/    # Processamento de leads
│   └── ...             # Outras funções especializadas
└── migrations/         # Migrações do banco
    └── 20241226_create_leads_table.sql
```

### Automação (n8n Cloud)

```json
// obrasai-simples.json - Workflow de Leads
{
    "nodes": [
        "🤖 Webhook", // Captura dados do chatbot
        "📋 Preparar Dados", // Validação e formatação
        "📊 Google Sheets", // Planilha de leads
        "🗄️ Supabase", // Banco de dados
        "📧 Gmail" // Notificação por email
    ]
}
```

## 📊 ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais

```sql
-- Tabela de Leads (Implementada)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nome TEXT,
  telefone TEXT,
  empresa TEXT,
  cargo TEXT,
  interesse_nivel TEXT,
  origem TEXT DEFAULT 'chatbot',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Outras tabelas do sistema principal
- obras
- fornecedores_pj
- fornecedores_pf
- despesas
- notas_fiscais
- usuarios
- subscriptions
```

### Row Level Security (RLS)

- **Multi-tenant**: Isolamento completo por usuário
- **Policies**: Controle granular de acesso
- **Segurança**: Zero dados cruzados entre contas

## 🤖 SISTEMA DE INTELIGÊNCIA ARTIFICIAL

### Chatbot Landing Page

**Arquivo**: `src/components/landing/LeadChatbot.tsx`

**Funcionalidades:**

- ✅ Interface conversacional moderna (React + Framer Motion)
- ✅ Fluxo estruturado de captura: Nome → Email → Telefone → Empresa → Cargo →
  Interesse
- ✅ Validação em tempo real (email, campos obrigatórios)
- ✅ IA pós-captura para perguntas sobre o produto
- ✅ Integração com webhook n8n
- ✅ Design responsivo mobile-first

**Fluxo de Dados:**

```typescript
interface LeadData {
    nome?: string;
    email?: string;
    telefone?: string;
    empresa?: string;
    cargo?: string;
    interesse?: string;
}

// Webhook n8n
const webhookUrl = "https://ottodevsystem.app.n8n.cloud/webhook-test/obrasai";
```

### IA Contextual (Dashboard)

**Edge Function**: `supabase/functions/ai-chat/index.ts`

**Recursos:**

- ✅ Acesso aos dados reais das obras do usuário
- ✅ Análise financeira (orçamento vs gastos)
- ✅ Sugestões baseadas em dados históricos
- ✅ Rate limiting (10 requests/minuto)
- ✅ DeepSeek API integrada

### IA Landing Page

**Edge Function**: `supabase/functions/ai-landing-chat/index.ts`

**Recursos:**

- ✅ Conhecimento especializado em construção civil
- ✅ Contexto PRD completo
- ✅ Rate limiting para visitantes (5 requests/5min)
- ✅ Resposta em português brasileiro

## 🔗 INTEGRAÇÕES IMPLEMENTADAS

### n8n Cloud Automation

**URL**: `https://ottodevsystem.app.n8n.cloud/`

**Workflow Ativo**: `obrasai-simples.json`

1. **Webhook**: Recebe dados do chatbot
2. **Preparar Dados**: Valida e formata campos
3. **Google Sheets**: Salva na planilha de leads
4. **Supabase**: Insert na tabela `leads`
5. **Gmail**: Notifica por email

### Google Sheets

- **Planilha ID**: `1r8x182-OCOCVRdC5X6ugche6Ju18KWULMHU7FXpCLLE`
- **Aba**: `leads`
- **Campos**: Email, Nome, Telefone, Empresa, Cargo, Interesse, Origem,
  Data/Hora

### Stripe Payments

- ✅ 3 planos configurados
- ✅ Webhooks ativos
- ✅ Controle de limites por assinatura

## 🔒 SEGURANÇA E PERFORMANCE

### Medidas de Segurança

- ✅ **RLS**: Row Level Security nativo PostgreSQL
- ✅ **Validação**: Frontend (Zod) + Backend
- ✅ **Sanitização**: DOMPurify para inputs
- ✅ **Rate Limiting**: IA e APIs protegidas
- ✅ **CORS**: Headers de segurança configurados

### Performance

- ✅ **Bundle Splitting**: Vite otimizado
- ✅ **Lazy Loading**: Componentes sob demanda
- ✅ **Cache**: TanStack Query
- ✅ **CDN**: Supabase Storage
- ✅ **Edge Functions**: Latência reduzida

## 📱 INTERFACE RESPONSIVA

### Design System

- **Framework**: Tailwind CSS 3.4
- **Componentes**: Shadcn/UI
- **Ícones**: Lucide React
- **Animações**: Framer Motion
- **Tema**: Dark/Light mode

### Páginas Implementadas

- ✅ **Landing Page**: Com chatbot IA integrado
- ✅ **Dashboard**: Métricas em tempo real
- ✅ **Obras**: CRUD completo
- ✅ **Fornecedores**: PJ e PF
- ✅ **Despesas**: Categorização avançada
- ✅ **Notas Fiscais**: Upload e gestão
- ✅ **Orçamento IA**: Sistema paramétrico
- ✅ **SINAPI**: Consulta inteligente
- ✅ **Assinaturas**: Gestão de planos

## 🚀 DEPLOYMENT E INFRAESTRUTURA

### Frontend

- **Hospedagem**: Lovable (deploy automático)
- **Build**: Vite production optimized
- **CDN**: Global distribution

### Backend

- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions
- **Auth**: Supabase Auth

### Monitoramento

- **Logs**: Supabase Dashboard
- **Métricas**: Built-in monitoring
- **Alerts**: Error tracking configurado

## 📈 FLUXO DE CAPTURA DE LEADS

### 1. Landing Page

```typescript
// src/components/landing/LeadChatbot.tsx
const leadFlow = {
    nome: { nextStep: "email", validation: (v) => v.length >= 2 },
    email: { nextStep: "telefone", validation: (v) => /email-regex/.test(v) },
    telefone: { nextStep: "empresa", validation: () => true }, // opcional
    empresa: { nextStep: "cargo", validation: (v) => v.length >= 2 },
    cargo: { nextStep: "interesse", validation: (v) => v.length >= 2 },
    interesse: { nextStep: "completed", validation: (v) => v.length >= 2 },
};
```

### 2. Envio para n8n

```typescript
const webhookData = {
    nome: leadData.nome,
    email: leadData.email,
    telefone: leadData.telefone || "Não informado",
    empresa: leadData.empresa,
    cargo: leadData.cargo,
    interesse: leadData.interesse,
    origem: "chatbot_landing_page",
    timestamp: new Date().toISOString(),
    plataforma: "ObrasAI",
};
```

### 3. Processamento n8n

- ✅ Validação de dados
- ✅ Formatação padrão brasileira
- ✅ Insert em Google Sheets
- ✅ Insert em Supabase
- ✅ Notificação por Gmail

## 🎯 MÉTRICAS E KPIs

### Técnicas

- **Uptime**: 99.9% (Supabase SLA)
- **Performance**: <2s carregamento inicial
- **Segurança**: Zero vulnerabilidades
- **Escalabilidade**: Multi-tenant PostgreSQL

### Negócio

- **Conversão**: Chatbot → Lead capturado
- **Retenção**: Usuários ativos mensais
- **Satisfação**: NPS > 70 (meta)
- **Crescimento**: Leads qualificados

## 🔧 COMANDOS DE DESENVOLVIMENTO

### Setup Local

```bash
# Clone e install
git clone <repo>
cd obrasai2.2
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build
```

### Supabase

```bash
# Migrations
supabase migration new <name>
supabase db push

# Functions
supabase functions deploy <function-name>
```

---

**Última Atualização**: Janeiro 2025\
**Versão**: 2.2\
**Status**: Produção - Sistema Completo e Funcional
