# 🏗️ Contexto Técnico - ObrasAI 2.2

## 📋 VISÃO GERAL DO SISTEMA

O **ObrasAI** é uma plataforma web completa para gestão de obras na construção
civil, desenvolvida com tecnologias modernas e inteligência artificial
especializada. O sistema oferece controle total de projetos, custos,
fornecedores, contratos, despesas, notas fiscais, leads e recursos, com
automação de processos, integrações robustas e insights inteligentes.

## 🛠️ ARQUITETURA IMPLEMENTADA

### Frontend (React + TypeScript)

```bash
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Sistema de design (Shadcn/UI)
│   ├── dashboard/      # Componentes do dashboard (KPIs, relatórios, contratos, plantas, etc)
│   ├── landing/        # Landing page + Chatbot IA
│   ├── ai/             # Componentes de IA (chat, sugestões, insights)
│   ├── construction/   # Componentes de obras
│   ├── orcamento/      # Orçamento paramétrico
│   ├── sinapi/         # Consulta SINAPI
│   ├── settings/       # Configurações
│   ├── layouts/        # Layouts e wrappers
│   ├── auth/           # Autenticação
├── pages/              # Páginas principais
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Login.tsx       # Autenticação
│   ├── admin/          # Páginas administrativas (analytics, sinapi, obras)
│   └── dashboard/      # Módulos do dashboard (obras, contratos, fornecedores, despesas, notas, orçamentos, ai, etc)
├── hooks/              # Custom hooks (contratos, IA, obras, fornecedores, despesas, sinapi, etc)
├── services/           # Serviços e APIs (Supabase, IA, Stripe, analytics, orçamentos, sinapi)
├── lib/                # Utilitários
├── assets/             # Imagens e ícones
├── config/             # Configurações globais
├── providers/          # Providers de contexto
├── integrations/       # Integrações externas (Google Sheets, n8n, etc)
├── contexts/           # Contextos globais
```

### Backend (Supabase + Edge Functions)

```bash
supabase/
├── functions/          # 27+ Edge Functions
│   ├── ai-chat/        # IA para chat interno
│   ├── ai-landing-chat/# IA para chatbot landing
│   ├── contrato-ai-assistant/ # IA contratos inteligentes
│   ├── gerar-contrato-pdf/    # Geração de PDF
│   ├── enviar-contrato-assinatura/ # Assinatura digital
│   ├── ai-calculate-budget/   # Orçamento paramétrico
│   ├── sinapi-semantic-search/# Busca semântica SINAPI
│   ├── stripe-webhook/        # Webhooks Stripe
│   ├── create-lead/           # Processamento de leads
│   ├── ...                    # Outras funções especializadas
└── migrations/         # Migrações do banco
    ├── 20241226_create_leads_table.sql
    ├── 20250128_create_contratos_system.sql
    ├── 20250129_create_ia_contratos_table.sql
    ├── ...
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

-- Tabela de Contratos
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  obra_id UUID REFERENCES obras(id),
  template_id UUID REFERENCES templates_contratos(id),
  numero_contrato VARCHAR(50) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  contratante_nome VARCHAR(255) NOT NULL,
  contratante_documento VARCHAR(20) NOT NULL,
  contratante_endereco TEXT,
  contratante_email VARCHAR(255),
  contratante_telefone VARCHAR(20),
  contratado_nome VARCHAR(255) NOT NULL,
  contratado_documento VARCHAR(20) NOT NULL,
  contratado_endereco TEXT,
  contratado_email VARCHAR(255),
  contratado_telefone VARCHAR(20),
  valor_total DECIMAL(12,2) NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL,
  prazo_execucao INTEGER NOT NULL,
  data_inicio DATE,
  data_fim_prevista DATE,
  descricao_servicos TEXT,
  clausulas_especiais TEXT,
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'RASCUNHO',
  progresso_execucao INTEGER DEFAULT 0,
  hash_documento VARCHAR(255),
  url_documento TEXT,
  data_assinatura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Interações IA Contratos
CREATE TABLE ia_contratos_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  contrato_id UUID REFERENCES contratos(id),
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  contexto_contrato JSONB DEFAULT '{}'::jsonb,
  sugestoes_geradas JSONB DEFAULT '[]'::jsonb,
  qualidade_resposta INTEGER CHECK (1-5),
  feedback_usuario INTEGER CHECK (1-5),
  tempo_resposta_ms INTEGER DEFAULT 0,
  modelo_ia VARCHAR(50) DEFAULT 'deepseek-chat',
  confianca_resposta DECIMAL(3,2) DEFAULT 0.0,
  fontes_referencia JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Embeddings de Conhecimento
CREATE TABLE embeddings_conhecimento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID,
  tipo_conteudo TEXT NOT NULL,
  referencia_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  conteudo_resumido TEXT,
  embedding VECTOR(1536),
  titulo_embedding VECTOR(1536),
  metadata JSONB,
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
- templates_contratos
- assinaturas_contratos
- historico_contratos
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
- ✅ Backup automático em Google Sheets e Supabase

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
- ✅ Logging e analytics de uso

### IA Landing Page

**Edge Function**: `supabase/functions/ai-landing-chat/index.ts`

**Recursos:**

- ✅ Conhecimento especializado em construção civil
- ✅ Contexto PRD completo
- ✅ Rate limiting para visitantes (5 requests/5min)
- ✅ Resposta em português brasileiro

### IA Contratos Inteligentes

**Edge Function**: `supabase/functions/contrato-ai-assistant/index.ts`

**Recursos:**

- ✅ Prompt técnico especializado (NBR, legislação, segurança, práticas do
  setor)
- ✅ Geração de sugestões inteligentes contextuais
- ✅ Aplicação instantânea de sugestões ao formulário
- ✅ Logging completo na tabela `ia_contratos_interacoes`
- ✅ Score de confiança, referências normativas, feedback
- ✅ Integração com templates, obras, fornecedores
- ✅ Analytics de uso, rating, performance

### Embeddings de Documentação Técnica

**Edge Function**: `supabase/functions/gerar-embeddings-documentacao/index.ts`

**Recursos:**

- ✅ Processamento de documentos Markdown e PDF através do script
  `enviar_chunks_embeddings.py` (chunking automático)
- ✅ Geração de embeddings com modelo `text-embedding-ada-002` (OpenAI)
- ✅ Armazenamento vetorial na tabela `embeddings_conhecimento` (`pgvector`)
- ✅ Índices `ivfflat` para busca semântica rápida
- ✅ Integração futura com chat contextual e help desk IA

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
- ✅ Edge Functions para checkout, customer portal, webhooks

### Supabase Storage

- ✅ Upload de documentos (notas fiscais, contratos, PDFs)
- ✅ CDN global
- ✅ Integração com geração de PDF e assinatura digital

### Gmail SMTP

- ✅ Envio automático de notificações e contratos para assinatura
- ✅ Design responsivo de email
- ✅ Registro de IP, expiração de token, auditoria

## 🔒 SEGURANÇA E PERFORMANCE

### Medidas de Segurança

- ✅ **RLS**: Row Level Security nativo PostgreSQL
- ✅ **Validação**: Frontend (Zod) + Backend
- ✅ **Sanitização**: DOMPurify para inputs
- ✅ **Rate Limiting**: IA e APIs protegidas
- ✅ **CORS**: Headers de segurança configurados
- ✅ **Hash SHA-256**: Integridade de documentos
- ✅ **Auditoria**: Logging completo de ações

### Performance

- ✅ **Bundle Splitting**: Vite otimizado
- ✅ **Lazy Loading**: Componentes sob demanda
- ✅ **Cache**: TanStack Query
- ✅ **CDN**: Supabase Storage
- ✅ **Edge Functions**: Latência reduzida
- ✅ **Analytics**: Métricas de uso e performance

## 📱 INTERFACE RESPONSIVA

### Design System

- **Framework**: Tailwind CSS 3.4
- **Componentes**: Shadcn/UI
- **Ícones**: Lucide React
- **Animações**: Framer Motion
- **Tema**: Dark/Light mode
- **Mobile-first**: 100% das telas adaptadas

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
- ✅ **Contratos Inteligentes**: IA, PDF, assinatura digital
- ✅ **Admin**: Analytics, manutenção SINAPI, gestão de obras

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
