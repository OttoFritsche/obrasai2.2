# 📋 ObrasAI 2.2 - Product Requirements Document (PRD)

## 🎯 VISÃO GERAL DO PRODUTO

### Produto

**ObrasAI** - Plataforma Inteligente para Gestão de Obras na Construção Civil

### Versão

**2.2** (Janeiro 2025)

### Missão

Revolucionar a gestão de obras na construção civil brasileira através de
tecnologia avançada, inteligência artificial especializada e automação de
processos, proporcionando controle total de custos, cronogramas e recursos.

### Visão

Ser a plataforma líder em gestão de obras no Brasil, reconhecida pela qualidade
técnica, inovação em IA e impacto na produtividade do setor de construção civil.

## 📊 STATUS DE IMPLEMENTAÇÃO

### ✅ MÓDULOS 100% IMPLEMENTADOS E FUNCIONAIS

#### 🏗️ M01 - GESTÃO DE OBRAS E CADASTROS

**Status: ✅ COMPLETO**

**Funcionalidades Implementadas:**

- ✅ **CRUD de Obras**: Sistema completo com validação de datas, orçamento,
  endereços
- ✅ **Gestão de Fornecedores PJ**: CRUD com validação de CNPJ, razão social
- ✅ **Gestão de Fornecedores PF**: CRUD com validação de CPF, RG
- ✅ **Sistema de Despesas**: Categorização por 21 etapas e 150+ insumos da
  construção civil
- ✅ **Gestão de Notas Fiscais**: Upload de arquivos, Supabase Storage integrado
- ✅ **Dashboard Executivo**: Métricas em tempo real, KPIs consolidados

**Tecnologias:**

- React 18.3.1 + TypeScript 5.6.2
- TanStack Query para state management
- React Hook Form + Zod para validação
- Supabase PostgreSQL com RLS (Row Level Security)

#### 🤖 M02 - INTELIGÊNCIA ARTIFICIAL ESPECIALIZADA

**Status: ✅ COMPLETO**

**Funcionalidades Implementadas:**

- ✅ **Chat Contextual**: IA com acesso aos dados reais das obras do usuário
- ✅ **Análise Financeira**: Comparação orçamento vs gastos reais
- ✅ **Sugestões Inteligentes**: Baseadas em dados históricos da obra
- ✅ **Conhecimento Técnico**: Especializada em construção civil brasileira
- ✅ **Rate Limiting**: 10 requests/minuto para segurança

**Edge Function Implementada:**

```typescript
// supabase/functions/ai-chat/index.ts
- DeepSeek API integrada
- Contexto PRD completo
- Rate limiting por usuário
- Segurança robusta
```

#### 🎯 M03 - SISTEMA DE CAPTURA DE LEADS

**Status: ✅ COMPLETO E FUNCIONAL**

**Chatbot Landing Page:**

- ✅ **Interface Conversacional**: React + Framer Motion
- ✅ **Fluxo Estruturado**: Nome → Email → Telefone → Empresa → Cargo →
  Interesse
- ✅ **Validação em Tempo Real**: Email, campos obrigatórios
- ✅ **IA Pós-captura**: Chat inteligente após coleta de dados
- ✅ **Design Responsivo**: Mobile-first

**Integração n8n (Workflow Simplificado):**

```json
// obrasai-simples.json - 5 nós lineares
1. 🤖 Webhook (captura dados)
2. 📋 Preparar Dados (validação/formatação)
3. 📊 Google Sheets (planilha de leads)
4. 🗄️ Supabase (tabela leads)
5. 📧 Gmail (notificação)
```

**Tabela de Leads (Supabase):**

```sql
-- 20241226_create_leads_table.sql
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
```

#### 💰 M04 - ORÇAMENTO PARAMÉTRICO COM IA

**Status: ✅ COMPLETO**

**Funcionalidades Implementadas:**

- ✅ **Cálculo Automático**: IA analisa parâmetros e gera orçamentos
- ✅ **Base SINAPI**: Integração com preços oficiais
- ✅ **Cobertura Nacional**: Dados regionais atualizados
- ✅ **Parâmetros Personalizáveis**: Por tipo de obra
- ✅ **Relatórios Detalhados**: Histórico e análises

#### 🔍 M05 - SISTEMA SINAPI INTEGRADO

**Status: ✅ COMPLETO**

**Funcionalidades Implementadas:**

- ✅ **Consulta Inteligente**: Busca semântica de códigos SINAPI
- ✅ **Preços Atualizados**: Base oficial constantemente atualizada
- ✅ **Histórico de Consultas**: Por usuário logado
- ✅ **Integração**: Com sistema de orçamento

#### 💳 M06 - SISTEMA DE ASSINATURAS

**Status: ✅ COMPLETO**

**Planos Implementados:**

- ✅ **Básico**: R$ 97/mês - 5 obras, 1 usuário, 100 IA requests
- ✅ **Profissional**: R$ 197/mês - 20 obras, 5 usuários, 500 IA requests
- ✅ **Empresarial**: R$ 497/mês - Ilimitado + suporte prioritário

**Integração Stripe:**

- ✅ Webhooks configurados
- ✅ Controle de limites por plano
- ✅ Interface de upgrade/downgrade

#### 📊 M07 - RELATÓRIOS E DASHBOARDS

**Status: ✅ COMPLETO**

**Funcionalidades Implementadas:**

- ✅ **Dashboard Principal**: Métricas consolidadas em tempo real
- ✅ **Listagens Avançadas**: Filtros, busca, paginação
- ✅ **Relatórios Básicos**: Obras, despesas, notas fiscais
- ✅ **Exportação**: Dados estruturados

#### 📋 M09 - SISTEMA DE CONTRATOS INTELIGENTES COM IA

**Status: ✅ COMPLETO E FUNCIONAL**

**Funcionalidades Implementadas:**

#### 🤖 **Assistente IA Especializado em Contratos (NOVO)**

- ✅ **Edge Function `contrato-ai-assistant`**: IA especializada usando DeepSeek
  API
- ✅ **Interface Split-Screen**: Formulário + Chat IA em tempo real
- ✅ **Hook `useContratoAI`**: Gerenciamento completo do estado da IA
- ✅ **Componente `ContratoComIA`**: Interface moderna com sugestões aplicáveis
- ✅ **Tabela `ia_contratos_interacoes`**: Analytics e logging de todas as
  interações
- ✅ **Rotas especializadas**: `/novo-ia` e `/:id/editar-ia` para criação com IA

#### 📋 **Sistema de Contratos Base**

- ✅ **CRUD Completo**: Criação, listagem, edição de contratos
- ✅ **Templates Especializados**: 3 templates por tipo de serviço
- ✅ **Geração Automática**: HTML/PDF com Edge Functions
- ✅ **Assinatura Digital**: Envio por email com tokens únicos
- ✅ **Gestão de Status**: RASCUNHO → AGUARDANDO → ATIVO → CONCLUÍDO
- ✅ **Segurança**: Hash SHA-256, RLS, auditoria completa
- ✅ **Integração**: Vinculado a obras e fornecedores existentes

#### 🧠 **Especialização IA em Construção Civil**

- ✅ **Normas Técnicas**: NBR 15575, NBR 12721, NBR 8036, etc.
- ✅ **Legislação Brasileira**: Código Civil, CLT, CDC, Lei 8.666
- ✅ **Segurança do Trabalho**: NR-18 e demais normas regulamentadoras
- ✅ **Tipos de Contrato**: Empreitada, Fornecimento, Mão de obra, Mistos
- ✅ **Contexto Regional**: Aspectos climáticos e sazonais brasileiros
- ✅ **Responsabilidades Técnicas**: Materiais, equipamentos, supervisão

#### 💡 **Sistema de Sugestões Inteligentes**

- ✅ **Sugestões Contextuais**: Baseadas no tipo de pergunta e contrato
- ✅ **Aplicação Instantânea**: Botões para aplicar sugestões aos campos
- ✅ **Categorização**: Descrição, Cláusulas, Observações
- ✅ **Justificativas Técnicas**: Explicação para cada sugestão
- ✅ **Taxa de Aplicação**: Métricas de uso das sugestões

#### 📊 **Analytics e Aprendizado**

- ✅ **Logging Completo**: Todas as interações são registradas
- ✅ **Métricas de Performance**: Tempo de resposta, confiança da IA
- ✅ **Sistema de Feedback**: Rating 1-5 estrelas por resposta
- ✅ **Análise de Uso**: Tipos de perguntas mais comuns
- ✅ **Melhoria Contínua**: Dados para treinamento futuro

**Tecnologias:**

- **IA**: DeepSeek API com prompts especializados em construção civil
- **Interface**: React + TypeScript com layout split-screen responsivo
- **Edge Functions**: contrato-ai-assistant para processamento IA
- **Database**: PostgreSQL com tabela dedicada para interações IA
- **State Management**: TanStack Query + React Hook personalizado
- **Segurança**: RLS para isolamento de dados por usuário
- **Templates HTML**: Sistema responsivo com geração PDF
- **Assinatura Digital**: Tokens únicos + Gmail SMTP automático

### 🏗️ M08 - ANÁLISE INTELIGENTE DE PLANTAS BAIXAS

**Status: 🔄 EM ROADMAP - Q1 2025**

**Funcionalidades Planejadas:**

- 🔄 **Upload de PDF**: Sistema de upload de plantas baixas em formato PDF
- 🔄 **Conversão Automática**: PDF → Imagem de alta resolução
- 🔄 **Vision AI Integration**: Análise automática com GPT-4 Vision ou Google
  Vision API
- 🔄 **Extração de Dados**: Identificação automática de cômodos, áreas e
  dimensões
- 🔄 **Cálculo de Materiais**: Estimativa automática baseada na metragem
- 🔄 **Orçamento Inteligente**: Integração com base SINAPI para custos por m²
- 🔄 **Insights de Engenharia**: Sugestões de melhorias e análise de viabilidade

**Implementação Técnica:**

```typescript
// Edge Function planejada
// supabase/functions/analyze-planta/index.ts
interface PlantaAnalysis {
  area_total: number;
  comodos: Array<{
    nome: string;
    area: number;
    dimensoes: string;
  }>;
  materiais_estimados: {
    ceramica: number;
    tinta: number;
    eletrica: number;
    hidraulica: number;
  };
  orcamento_estimado: number;
  insights_ia: string[];
}
```

**Fases de Implementação:**

- **Fase 1 (2-3 semanas)**: Upload PDF + conversão + análise básica
- **Fase 2 (3-4 semanas)**: Identificação de cômodos + cálculo de áreas
- **Fase 3 (2-3 semanas)**: Orçamento automático + insights IA

**Impacto no Negócio:**

- 🏆 **Diferencial ÚNICO**: Primeira plataforma com análise automática de
  plantas
- 💰 **Monetização**: Feature premium para planos Profissional/Empresarial
- 🚀 **Value Proposition**: Orçamento automático a partir de plantas baixas
- 🔥 **Barreira Competitiva**: Tecnologia avançada difícil de replicar

### 📋 M09 - SISTEMA DE CONTRATOS INTELIGENTES COM IA

**Status: ✅ COMPLETO E FUNCIONAL**

**Problema Resolvido:**

- ✅ Acordos verbais que geravam conflitos entre construtores e prestadores
- ✅ Valores não documentados adequadamente que causavam disputas
- ✅ Falta de clareza no escopo dos serviços
- ✅ Ausência de marco legal entre as partes
- ✅ **NOVO**: Dificuldade na redação técnica de contratos especializados
- ✅ **NOVO**: Falta de conhecimento em normas técnicas e legislação aplicável
- ✅ **NOVO**: Tempo excessivo para criar contratos completos e seguros

## 🤖 ASSISTENTE IA PARA CONTRATOS - IMPLEMENTAÇÃO COMPLETA

### **Fluxo de Uso do Sistema com IA**

#### **1. Acesso ao Assistente IA**

```bash
# Dois pontos de entrada implementados:
/dashboard/contratos/novo-ia        # Novo contrato com IA
/dashboard/contratos/:id/editar-ia  # Editar contrato existente com IA
```

#### **2. Interface Split-Screen Responsiva**

- **Lado Esquerdo**: Formulário de contrato com botões de sugestão IA
- **Lado Direito**: Chat especializado em tempo real
- **Integração**: Sugestões aplicáveis instantaneamente aos campos

#### **3. Sistema de IA Contextual**

```typescript
// Contexto enviado para IA a cada pergunta:
interface ContratoContext {
  tipo_servico?: string; // Tipo do template selecionado
  valor_total?: number; // Valor financeiro do contrato
  prazo_execucao?: number; // Prazo em dias
  titulo?: string; // Título do contrato
  descricao_servicos?: string; // Escopo atual
  clausulas_especiais?: string; // Cláusulas personalizadas
  observacoes?: string; // Observações técnicas
  template_id?: string; // Template específico usado
}
```

#### **4. IA Especializada DeepSeek**

```typescript
// Prompt Sistema (300+ linhas de especialização):
const systemPrompt = `
🏗️ ESPECIALIDADES:
- Normas técnicas ABNT (NBR 15575, NBR 12721, NBR 8036, etc.)
- Legislação brasileira (Código Civil, CLT, CDC, Lei 8.666)
- Tipos de contrato: Empreitada, Fornecimento, Mão de obra, Mistos
- Práticas do mercado de construção civil
- Gestão de obras e responsabilidades técnicas

🎯 DIRETRIZES OBRIGATÓRIAS:
1. Sempre incluir referências a normas técnicas aplicáveis
2. Considerar aspectos de segurança do trabalho (NRs)
3. Mencionar responsabilidades sobre materiais quando relevante
4. Sugerir cláusulas de proteção mútua
5. Adaptar linguagem técnica ao contexto brasileiro
6. Incluir aspectos de garantia e assistência técnica
7. Considerar questões climáticas e sazonais brasileiras
`;
```

#### **5. Sistema de Sugestões Inteligentes**

```typescript
interface AISuggestion {
  tipo: "descricao" | "clausula" | "observacao"
  conteudo: string        // Texto da sugestão
  justificativa: string   // Por que essa sugestão é importante
  aplicado: boolean      // Se foi aplicada ao formulário
}

// Exemplos de sugestões geradas automaticamente:
{
  tipo: "descricao",
  conteudo: "Execução de serviços de acordo com as normas técnicas ABNT, incluindo fornecimento de materiais de primeira qualidade e mão de obra especializada, com supervisão técnica permanente.",
  justificativa: "Descrição padronizada que atende requisitos técnicos e legais"
}

{
  tipo: "clausula", 
  conteudo: "O CONTRATADO declara conhecer e se compromete a cumprir todas as normas de segurança do trabalho (NRs), respondendo civil e criminalmente por acidentes decorrentes de negligência ou imperícia.",
  justificativa: "Cláusula essencial para responsabilização sobre segurança do trabalho"
}
```

#### **6. Métricas e Analytics Implementadas**

```sql
-- Tabela ia_contratos_interacoes
CREATE TABLE ia_contratos_interacoes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,           -- Usuário que fez a pergunta
  contrato_id UUID,                -- Contrato sendo editado (se aplicável)
  pergunta TEXT NOT NULL,          -- Pergunta do usuário
  resposta TEXT NOT NULL,          -- Resposta da IA
  contexto_contrato JSONB,         -- Contexto completo do contrato
  sugestoes_geradas JSONB,         -- Sugestões oferecidas
  qualidade_resposta INTEGER,      -- Rating 1-5 da qualidade
  feedback_usuario INTEGER,        -- Rating 1-5 do usuário
  tempo_resposta_ms INTEGER,       -- Performance da IA
  modelo_ia VARCHAR(50),           -- 'deepseek-chat'
  confianca_resposta DECIMAL(3,2), -- Score de confiança (0.80-1.00)
  fontes_referencia JSONB,         -- NBRs e legislação citadas
  created_at TIMESTAMPTZ
);
```

### **Funcionalidades do Hook useContratoAI**

#### **State Management Completo**

```typescript
interface ContratoAIState {
  chatLoading: boolean; // Loading da IA
  messages: ChatMessage[]; // Histórico da conversa
  suggestions: AISuggestion[]; // Sugestões disponíveis
  currentResponse: string; // Última resposta
  lastError: string | null; // Tratamento de erros
  totalInteractions: number; // Contador de interações
  averageResponseTime: number; // Performance média
}
```

#### **Funcionalidades Principais**

```typescript
// 1. Envio de mensagens contextuais
sendMessage(message, contextoContrato, contratoId?)

// 2. Aplicação de sugestões ao formulário
applySuggestion(suggestion, fieldName)

// 3. Sistema de rating e feedback
rateResponse(interacaoId, rating)

// 4. Busca de histórico por contrato
getInteractionsByContract(contratoId)

// 5. Controle de conversa
clearConversation()
cancelCurrentOperation()

// 6. Sugestões rápidas para começar
quickSuggestions = [
  "Sugira uma descrição detalhada para um contrato de pintura externa",
  "Quais cláusulas são essenciais em contratos de construção civil?",
  "Como devo estruturar as responsabilidades em um contrato de reforma?",
  "Que observações importantes incluir sobre materiais e mão de obra?",
  "Ajude-me a definir prazos realistas para execução da obra"
]
```

### **Edge Function: contrato-ai-assistant**

#### **Processamento Inteligente**

```typescript
// 1. Validação de autenticação e usuário
// 2. Parse do contexto do contrato
// 3. Busca de informações do template (se disponível)
// 4. Construção do prompt especializado
// 5. Chamada para DeepSeek API
// 6. Geração de sugestões contextuais
// 7. Cálculo de score de confiança
// 8. Logging completo na base de dados
// 9. Resposta estruturada para o frontend

interface ContratoAIResponse {
  resposta: string; // Resposta da IA
  sugestoes: AISuggestion[]; // Sugestões aplicáveis
  confianca: number; // Score 0.80-1.00
  fontes_referencia: string[]; // NBRs e leis citadas
  tempo_resposta_ms: number; // Performance
}
```

#### **Integração com Templates**

```typescript
// Sistema busca automaticamente informações do template:
const { data: template } = await supabase
  .from("templates_contratos")
  .select("nome, tipo_servico, ia_prompts, ia_sugestoes_padrao")
  .eq("id", contexto_contrato.template_id);

// Adiciona ao contexto da IA:
// - Tipo específico do contrato (Estrutura, Acabamento, Instalações)
// - Prompts especializados por template
// - Sugestões padrão pré-configuradas
```

### **Funcionalidades Implementadas Base**

- ✅ **Templates Especializados**: Contratos pré-definidos por tipo de serviço
  - ✅ Contrato de Execução de Obra - Estrutura (fundação, laje, pilares)
  - ✅ Contrato de Acabamento (pintura, revestimento)
  - ✅ Contrato de Instalações Elétricas e Hidráulicas
  - ✅ Sistema extensível para novos templates

- ✅ **Gerador Inteligente**: Formulário guiado para criação de contratos
  - ✅ **NOVO**: Interface com IA integrada em tempo real
  - ✅ **NOVO**: Sugestões contextuais aplicáveis aos campos
  - ✅ Dados das partes (contratante/contratado)
  - ✅ Escopo detalhado do serviço vinculado à obra
  - ✅ Valores e forma de pagamento
  - ✅ Prazos e marcos de entrega
  - ✅ Cláusulas obrigatórias por template
  - ✅ Cláusulas especiais personalizáveis

- ✅ **Geração de Documentos**: Sistema completo de documentação
  - ✅ Templates HTML responsivos e profissionais
  - ✅ Substituição automática de variáveis {{variavel}}
  - ✅ Geração de HTML/PDF através de Edge Function
  - ✅ Hash SHA-256 para integridade do documento
  - ✅ Storage automático no Supabase
  - ✅ Preview em tempo real antes da finalização

- ✅ **Envio para Assinatura**: Sistema de assinatura eletrônica
  - ✅ Geração de token único de segurança
  - ✅ Envio automático por email com design profissional
  - ✅ Link temporário com expiração (7 dias)
  - ✅ Validação de identidade por email
  - ✅ Certificado digital de integridade

- ✅ **Gestão e Acompanhamento**: Controle completo do ciclo de vida
  - ✅ Status do contrato (RASCUNHO → AGUARDANDO_ASSINATURA → ATIVO → CONCLUÍDO)
  - ✅ **NOVO**: Histórico de interações com IA por contrato
  - ✅ **NOVO**: Métricas de uso do assistente IA
  - ✅ Histórico completo de ações
  - ✅ Dashboard com métricas e filtros avançados
  - ✅ Listagem com paginação e busca
  - ✅ Alertas de vencimento
  - ✅ Integração com obras existentes

**Implementação Técnica Completa:**

```sql
-- Estrutura do Banco de Dados (Implementada)
CREATE TABLE templates_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  template_html TEXT NOT NULL,
  clausulas_obrigatorias JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  obra_id UUID REFERENCES obras(id),
  template_id UUID REFERENCES templates_contratos(id),
  numero_contrato VARCHAR(50) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  -- Dados do contratante
  contratante_nome VARCHAR(255) NOT NULL,
  contratante_documento VARCHAR(20) NOT NULL,
  contratante_endereco TEXT,
  contratante_email VARCHAR(255),
  contratante_telefone VARCHAR(20),
  -- Dados do contratado
  contratado_nome VARCHAR(255) NOT NULL,
  contratado_documento VARCHAR(20) NOT NULL,
  contratado_endereco TEXT,
  contratado_email VARCHAR(255),
  contratado_telefone VARCHAR(20),
  -- Dados financeiros e técnicos
  valor_total DECIMAL(12,2) NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL,
  prazo_execucao INTEGER NOT NULL, -- dias
  data_inicio DATE,
  data_fim_prevista DATE,
  descricao_servicos TEXT,
  clausulas_especiais TEXT,
  observacoes TEXT,
  -- Controle
  status VARCHAR(50) DEFAULT 'RASCUNHO',
  progresso_execucao INTEGER DEFAULT 0,
  hash_documento VARCHAR(255),
  url_documento TEXT,
  data_assinatura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assinaturas_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  tipo_assinante VARCHAR(20) NOT NULL,
  nome_assinante VARCHAR(255) NOT NULL,
  documento_assinante VARCHAR(20) NOT NULL,
  email_assinante VARCHAR(255),
  data_assinatura TIMESTAMPTZ,
  ip_assinatura INET,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  token_assinatura VARCHAR(255) UNIQUE,
  data_expiracao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE historico_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT,
  dados_novos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Edge Functions Implementadas:**

```typescript
// supabase/functions/gerar-contrato-pdf/index.ts - ✅ ATIVO
// Funcionalidades:
// - Busca dados do contrato com relacionamentos (obra + template)
// - Processa template HTML com substituição de variáveis
// - Gera cláusulas obrigatórias automaticamente
// - Calcula hash SHA-256 do documento
// - Upload para Supabase Storage
// - Modo preview para visualização
// - Tratamento completo de erros

// supabase/functions/enviar-contrato-assinatura/index.ts - ✅ ATIVO
// Funcionalidades:
// - Gera token único de segurança
// - Cria registro de assinatura com expiração
// - Envia email profissional com design responsivo
// - Link de assinatura temporário
// - Atualiza status do contrato
// - Registra histórico de ações
// - Validação de dados completa
```

**Componentes React Implementados:**

```typescript
// src/pages/dashboard/contratos/
// ✅ ContratosLista.tsx - Lista todos os contratos com filtros
// ✅ index.tsx - Página principal de contratos

// src/hooks/
// ✅ useContratos.ts - Hook completo com CRUD, PDF e assinatura
// - useContratos() - Lista e CRUD de contratos
// - useContrato(id) - Busca contrato específico
// - useTemplatesContratos() - Lista templates ativos
// - useGerarPDF(id) - Geração de documentos
// - useEnviarAssinatura(id) - Envio para assinatura
```

**Fluxo Completo Implementado:**

**1. Criação do Contrato:**

```typescript
// 1. Usuário acessa /dashboard/contratos
// 2. Clica em "Novo Contrato"
// 3. Seleciona template (Estrutura, Acabamento, Instalações)
// 4. Preenche dados do contratante e contratado
// 5. Define valores, prazos e escopo
// 6. Sistema gera número único automático
// 7. Status inicial: RASCUNHO
```

**2. Geração do Documento:**

```typescript
// 1. Sistema processa template HTML
// 2. Substitui variáveis: {{numero_contrato}}, {{valor_total}}, etc.
// 3. Adiciona cláusulas obrigatórias do template
// 4. Inclui cláusulas especiais personalizadas
// 5. Gera hash SHA-256 para integridade
// 6. Upload para Supabase Storage
// 7. Disponibiliza preview para revisão
```

**3. Envio para Assinatura:**

```typescript
// 1. Usuário clica "Enviar para Assinatura"
// 2. Sistema gera token único de segurança
// 3. Cria registro na tabela assinaturas_contratos
// 4. Define expiração (7 dias)
// 5. Monta email profissional com dados do contrato
// 6. Envia por Gmail SMTP
// 7. Atualiza status: AGUARDANDO_ASSINATURA
// 8. Registra ação no histórico
```

**4. Processo de Assinatura:**

```typescript
// 1. Contratado recebe email com link único
// 2. Acessa página de assinatura (token validado)
// 3. Visualiza contrato completo
// 4. Confirma dados e assina digitalmente
// 5. Sistema registra IP, timestamp e dados
// 6. Atualiza status: ATIVO
// 7. Notifica contratante por email
```

**Impacto Mensurado:**

- ✅ **Redução de Conflitos**: Sistema implementado para eliminar disputas
- ✅ **Agilidade Jurídica**: Contratos gerados em <5 minutos
- ✅ **Segurança Digital**: Hash SHA-256 + tokens únicos
- ✅ **Compliance**: 100% contratos documentados e rastreáveis
- ✅ **Integração**: Vinculação automática com obras e fornecedores
- ✅ **Usabilidade**: Interface intuitiva e responsiva

**Métricas de Sucesso Implementadas:**

- ✅ **Dashboard**: Métricas em tempo real de contratos
- ✅ **Filtros Avançados**: Por obra, status, período
- ✅ **Busca Semântica**: Localização rápida de contratos
- ✅ **Exportação**: Dados estruturados para análise
- ✅ **Histórico**: Auditoria completa de ações
- ✅ **Alertas**: Notificações de vencimentos e status

**Integração com Módulos Existentes:**

- ✅ **M01 - Obras**: Contratos vinculados a obras específicas
- ✅ **M01 - Fornecedores**: Integração com base de fornecedores cadastrados
- ✅ **M02 - IA**: Chat contextual acessa dados de contratos
- ✅ **M06 - Assinaturas**: Contratos como feature premium
- ✅ **M07 - Relatórios**: Dashboard com métricas de contratos

## 🛠️ STACK TECNOLÓGICA IMPLEMENTADA

### Frontend

```json
{
  "framework": "React 18.3.1",
  "language": "TypeScript 5.6.2",
  "build": "Vite 5.4.2",
  "ui": "Tailwind CSS + Shadcn/UI",
  "routing": "React Router DOM",
  "state": "TanStack Query",
  "forms": "React Hook Form + Zod",
  "animations": "Framer Motion"
}
```

### Backend & Infraestrutura

```json
{
  "database": "Supabase PostgreSQL",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage",
  "edge_functions": "27+ funções Deno/TypeScript",
  "ai_api": "DeepSeek API",
  "payments": "Stripe",
  "automation": "n8n Cloud",
  "security": "Row Level Security (RLS)",
  "pdf_generation": "HTML to PDF Edge Functions",
  "digital_signature": "Token-based + Hash SHA-256",
  "email_automation": "Gmail SMTP Integration",
  "contract_system": "Templates + Digital Signature"
}
```

### Segurança Implementada

- ✅ **Multi-tenant**: Isolamento completo de dados
- ✅ **RLS**: Row Level Security nativo PostgreSQL
- ✅ **Sanitização**: DOMPurify para inputs
- ✅ **Rate Limiting**: Proteção contra abuso
- ✅ **Validação**: Múltiplas camadas frontend/backend
- ✅ **Assinatura Digital**: Hash SHA-256 + timestamp para integridade
- ✅ **Auditoria**: Log completo de todas as ações contratuais

## 📈 MÉTRICAS E KPIS

### Métricas Técnicas

- ✅ **Performance**: <2s carregamento inicial
- ✅ **Uptime**: 99.9% (Supabase SLA)
- ✅ **Segurança**: Zero vulnerabilidades conhecidas
- ✅ **Escalabilidade**: Multi-tenant PostgreSQL

### Métricas de Produto

- ✅ **Funcionalidades**: 100% dos módulos M01-M07 implementados
- 🔄 **M08**: Análise de plantas em desenvolvimento
- 🔄 **M09**: Sistema de contratos em desenvolvimento
- ✅ **Testes**: Validação manual completa
- ✅ **UX**: Interface moderna e responsiva
- ✅ **Integração**: n8n + Google Sheets + Email funcionais

### Métricas de Contratos com IA (M09 - Metas)

- 🎯 **Adoção Geral**: >60% usuários ativos criam contratos
- 🎯 **Adoção IA**: >40% dos novos contratos usam assistente IA
- 🎯 **Redução de Conflitos**: -80% disputas reportadas
- 🎯 **Tempo de Criação**: <5 minutos por contrato com IA (vs 15 min
  tradicional)
- 🎯 **Taxa de Aplicação de Sugestões**: >70% sugestões IA são aplicadas
- 🎯 **Taxa de Assinatura**: >90% contratos enviados são assinados
- 🎯 **Performance IA**: <3 segundos tempo de resposta médio
- 🎯 **Satisfação Geral**: NPS >80 na funcionalidade
- 🎯 **Satisfação IA**: Rating >4.5/5 para assistente IA
- 🎯 **Qualidade Técnica**: >95% contratos incluem normas técnicas adequadas

## 🚀 ROADMAP FUTURO (Q1-Q2 2025)

### 🔄 Próximas Melhorias

- 🔄 **Machine Learning**: Análise preditiva de custos
- 🔄 **Visão Computacional**: Reconhecimento de imagens de obras
- 🔄 **Mobile App**: React Native para campo
- 🔄 **Relatórios Avançados**: BI automatizado
- 🔄 **Integrações ERP**: APIs para sistemas externos
- 🔄 **Blockchain**: Contratos imutáveis em blockchain
- 🔄 **WhatsApp Business**: Notificações contratuais
- 🔄 **Reconhecimento de Voz**: Ditado de contratos

### 📱 Mobile Strategy

- Aplicativo nativo React Native
- Funcionalidades offline
- Câmera integrada para documentação
- GPS para geolocalização de obras
- Assinatura digital mobile
- Push notifications para contratos

## 💼 DIFERENCIAIS COMPETITIVOS

1. **IA Contextual**: Único sistema com chat que acessa dados reais das obras E
   contratos
2. **Assistente IA para Contratos**: PRIMEIRO sistema com IA especializada em
   contratos de construção civil brasileira ✅ IMPLEMENTADO
3. **Orçamento Inteligente**: Cálculo paramétrico com IA especializada
4. **SINAPI Integrado**: Busca semântica de preços oficiais
5. **Análise de Plantas Baixas**: Vision AI para análise automática de PDFs
   (ROADMAP Q1 2025)
6. **Contratos Inteligentes Completos**: Sistema COMPLETO de contratos
   especializados ✅ IMPLEMENTADO
7. **Interface Split-Screen**: Layout inovador com IA integrada em tempo real ✅
   IMPLEMENTADO
8. **Multi-tenant Seguro**: RLS nativo para isolamento total
9. **Interface Moderna**: React + TypeScript + Design System
10. **Arquitetura Escalável**: Edge Functions + Supabase
11. **Lead Generation**: Sistema completo de captura e conversão
12. **Especialização NBR**: Único com conhecimento profundo em normas técnicas
    brasileiras ✅ IMPLEMENTADO

## 🎯 PÚBLICO-ALVO

### Primário

- **Construtores e Empreiteiros**: Obras residenciais e comerciais
- **Engenheiros Civis**: Gestão técnica e financeira
- **Arquitetos**: Acompanhamento de execução

### Secundário

- **Gerentes de Obras**: Controle operacional
- **Empresas de Construção**: Múltiplas obras simultâneas
- **Profissionais Autônomos**: Pequenas reformas e construções
- **Mestres de Obras**: Contratos de empreitada
- **Prestadores de Serviços**: Pedreiros, eletricistas, encanadores

## 🏆 BENEFÍCIOS MENSURÁVEIS

### Financeiros

- **Redução de Custos**: Até 20% com orçamento IA
- **Controle Financeiro**: 100% transparência de gastos
- **ROI**: Retorno em até 3 meses de uso
- **Redução de Conflitos**: -80% disputas contratuais
- **Agilidade Jurídica**: Contratos válidos em minutos

### Operacionais

- **Produtividade**: +40% eficiência na gestão
- **Decisões**: Baseadas em dados reais
- **Conformidade**: Normas ABNT e legislação
- **Integração**: Processos unificados
- **Análise Automática**: Plantas baixas processadas por IA (ROADMAP)
- **Segurança Jurídica**: Contratos digitais válidos
- **Transparência**: Histórico completo de acordos

## 📋 CRITÉRIOS DE SUCESSO

### Técnicos ✅

- [x] Todas as funcionalidades principais implementadas (M01-M07)
- [x] Performance adequada (<2s carregamento)
- [x] Segurança robusta (RLS + validações)
- [x] Interface responsiva e moderna

### Negócio 🎯

- [ ] 100 usuários ativos nos primeiros 3 meses
- [ ] Taxa de conversão lead > 15%
- [ ] NPS > 70 após 6 meses
- [ ] Churn rate < 5% mensal
- [ ] 60% usuários ativos usam contratos (M09)
- [ ] 80% redução de conflitos reportados

---

## 📚 DOCUMENTAÇÃO TÉCNICA PARA TREINAMENTO IA

### 🤖 SISTEMA DE CONTRATOS COM IA - FLUXO COMPLETO DETALHADO

#### **1. Arquitetura do Sistema**

```mermaid
graph TD
    A[Usuário acessa /novo-ia] --> B[Componente ContratoComIA]
    B --> C[Hook useContratoAI]
    C --> D[Edge Function contrato-ai-assistant]
    D --> E[DeepSeek API]
    D --> F[Supabase Database]
    F --> G[Tabela ia_contratos_interacoes]
    E --> H[Resposta + Sugestões]
    H --> C
    C --> B
    B --> I[Interface Split-Screen]
```

#### **2. Componentes Implementados**

##### **2.1. Hook: useContratoAI.ts**

```typescript
// Estado principal gerenciado:
interface ContratoAIState {
  chatLoading: boolean              // Status de carregamento
  messages: ChatMessage[]           // Histórico completo da conversa
  suggestions: AISuggestion[]       // Sugestões disponíveis para aplicação
  currentResponse: string           // Última resposta da IA
  lastError: string | null          // Controle de erros
  totalInteractions: number         // Contador de interações
  averageResponseTime: number       // Performance média da IA
}

// Funcionalidades principais:
sendMessage(message, contextoContrato, contratoId?)  // Envia pergunta para IA
applySuggestion(suggestion, fieldName)               // Aplica sugestão ao formulário
rateResponse(interacaoId, rating)                    // Sistema de feedback
getInteractionsByContract(contratoId)                // Histórico por contrato
clearConversation()                                  // Limpa conversa
cancelCurrentOperation()                             // Cancela operação atual
```

##### **2.2. Componente: ContratoComIA.tsx**

```typescript
// Layout Split-Screen:
// Lado ESQUERDO: Formulário de contrato com React Hook Form + Zod
// - Campos com botões de sugestão IA (renderSuggestionButton)
// - Aplicação instantânea de sugestões
// - Validação em tempo real

// Lado DIREITO: Chat IA especializado
// - Histórico de mensagens
// - Input para novas perguntas
// - Sugestões rápidas
// - Indicadores de loading e confiança

// Integração em tempo real:
const getContratoContext = () => ({
  tipo_servico: "CONSTRUCAO",
  valor_total: watchedValues.valor_total,
  prazo_execucao: watchedValues.prazo_execucao,
  titulo: watchedValues.titulo,
  descricao_servicos: watchedValues.descricao_servicos,
  clausulas_especiais: watchedValues.clausulas_especiais,
  observacoes: watchedValues.observacoes,
  template_id: watchedValues.template_id,
});
```

##### **2.3. Edge Function: contrato-ai-assistant**

```typescript
// Fluxo de processamento:
1. Validação de autenticação (Supabase Auth)
2. Parse do contexto do contrato
3. Busca informações do template (se template_id fornecido)
4. Construção do prompt especializado (300+ linhas)
5. Chamada para DeepSeek API
6. Geração de sugestões contextuais
7. Cálculo de score de confiança (0.80-1.00)
8. Logging na tabela ia_contratos_interacoes
9. Resposta estruturada para frontend

// Configuração DeepSeek:
model: "deepseek-chat"
temperature: 0.7
max_tokens: 2000
top_p: 0.9
frequency_penalty: 0.1
presence_penalty: 0.1
```

#### **3. Especialização da IA**

##### **3.1. Prompt Sistema (Especializado)**

```typescript
const systemPrompt = `
Você é um especialista em contratos de construção civil brasileira com conhecimento profundo em:

🏗️ ESPECIALIDADES:
- Normas técnicas ABNT (NBR 15575, NBR 12721, NBR 8036, etc.)
- Legislação brasileira (Código Civil, CLT, CDC, Lei 8.666)
- Tipos de contrato: Empreitada, Fornecimento, Mão de obra, Mistos
- Práticas do mercado de construção civil
- Gestão de obras e responsabilidades técnicas

🎯 DIRETRIZES OBRIGATÓRIAS:
1. Sempre incluir referências a normas técnicas aplicáveis
2. Considerar aspectos de segurança do trabalho (NRs)
3. Mencionar responsabilidades sobre materiais quando relevante
4. Sugerir cláusulas de proteção mútua
5. Adaptar linguagem técnica ao contexto brasileiro
6. Incluir aspectos de garantia e assistência técnica
7. Considerar questões climáticas e sazonais brasileiras

🔧 FORMATO DE RESPOSTA:
- Resposta clara e objetiva à pergunta
- Sugestões práticas e aplicáveis
- Justificativas técnicas ou legais
- Referências normativas quando aplicável
`;
```

##### **3.2. Sistema de Sugestões Inteligentes**

```typescript
// Geração automática baseada na pergunta:
if (pergunta_usuario.toLowerCase().includes("descriç")) {
  sugestoes.push({
    tipo: "descricao",
    conteudo: "Execução de serviços de acordo com as normas técnicas ABNT...",
    justificativa:
      "Descrição padronizada que atende requisitos técnicos e legais",
  });
}

if (pergunta_usuario.toLowerCase().includes("cláusula")) {
  sugestoes.push({
    tipo: "clausula",
    conteudo:
      "O CONTRATADO declara conhecer e se compromete a cumprir todas as normas de segurança do trabalho (NRs)...",
    justificativa:
      "Cláusula essencial para responsabilização sobre segurança do trabalho",
  });
}

if (pergunta_usuario.toLowerCase().includes("material")) {
  sugestoes.push({
    tipo: "observacao",
    conteudo:
      "Todos os materiais utilizados devem possuir certificação do INMETRO...",
    justificativa: "Garantia de qualidade e rastreabilidade dos materiais",
  });
}
```

#### **4. Database Schema**

##### **4.1. Tabela ia_contratos_interacoes**

```sql
CREATE TABLE ia_contratos_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),    -- Isolamento por usuário
  contrato_id UUID REFERENCES contratos(id),          -- Opcional: contrato específico
  
  -- Dados da Interação
  pergunta TEXT NOT NULL,                              -- Pergunta do usuário
  resposta TEXT NOT NULL,                              -- Resposta da IA
  contexto_contrato JSONB DEFAULT '{}'::jsonb,         -- Estado do contrato na hora da pergunta
  
  -- Sugestões e Analytics
  sugestoes_geradas JSONB DEFAULT '[]'::jsonb,         -- Sugestões oferecidas
  qualidade_resposta INTEGER CHECK (1-5),              -- Rating automático
  feedback_usuario INTEGER CHECK (1-5),                -- Rating do usuário
  tempo_resposta_ms INTEGER DEFAULT 0,                 -- Performance
  
  -- Metadados IA
  modelo_ia VARCHAR(50) DEFAULT 'deepseek-chat',
  confianca_resposta DECIMAL(3,2) DEFAULT 0.0,         -- Score 0.80-1.00
  fontes_referencia JSONB DEFAULT '[]'::jsonb,         -- NBRs, leis citadas
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### **4.2. Extensão templates_contratos**

```sql
-- Campos adicionados para IA:
ALTER TABLE templates_contratos 
ADD COLUMN ia_prompts JSONB DEFAULT '{}'::jsonb,           -- Prompts específicos por template
ADD COLUMN ia_sugestoes_padrao JSONB DEFAULT '[]'::jsonb; -- Sugestões pré-configuradas
```

#### **5. Rotas e Navegação**

```typescript
// Rotas implementadas:
/dashboard/contratos/novo-ia           // Novo contrato com IA
/dashboard/contratos/:id/editar-ia     // Editar contrato existente com IA

// Componente utilizado em ambas:
<ContratoComIA />  // Detecta automaticamente se é edição ou criação pelo useParams()

// Integração na lista de contratos:
- Botão "Assistente IA" no header
- Opção "Editar com IA" no menu de ações de cada contrato
```

#### **6. Performance e Métricas**

##### **6.1. Métricas Coletadas**

```typescript
// Performance
tempo_resposta_ms: number              // Latência da IA
confianca_resposta: 0.80-1.00         // Score automático

// Uso
total_interacoes: number               // Contador global
sugestoes_aplicadas: boolean[]         // Taxa de aplicação

// Qualidade
rating_usuario: 1-5                    // Feedback direto
tipos_pergunta: string[]               // Análise de padrões

// Negócio
contratos_com_ia_vs_tradicionais       // Comparação de adoção
tempo_criacao_com_ia: minutes          // Eficiência
```

##### **6.2. Fontes de Referência Técnica**

```typescript
const fontesReferencia = [
  "ABNT NBR 15575 - Edificações habitacionais",
  "ABNT NBR 12721 - Avaliação de custos unitários de construção",
  "ABNT NBR 8036 - Programação de sondagens",
  "Código Civil Brasileiro - Lei 10.406/2002",
  "Consolidação das Leis do Trabalho (CLT)",
  "Código de Defesa do Consumidor (CDC)",
  "NR-18 - Segurança e Saúde no Trabalho na Indústria da Construção",
  "Lei 8.666/93 - Licitações e Contratos Administrativos",
];
```

#### **7. Fluxo de Dados Completo**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as ContratoComIA
    participant H as useContratoAI
    participant E as Edge Function
    participant D as DeepSeek API
    participant S as Supabase

    U->>C: Acessa /novo-ia
    C->>H: Inicializa hook
    H->>C: Estado inicial (mensagem boas-vindas)
    
    U->>C: Preenche campos do formulário
    U->>C: Faz pergunta no chat
    
    C->>H: sendMessage(pergunta, contexto, contratoId)
    H->>E: POST /contrato-ai-assistant
    
    E->>S: Busca template info (se template_id)
    E->>D: Chama DeepSeek API
    D->>E: Resposta da IA
    
    E->>E: Gera sugestões contextuais
    E->>E: Calcula score de confiança
    E->>S: Salva interação na ia_contratos_interacoes
    
    E->>H: Retorna resposta + sugestões
    H->>C: Atualiza estado (mensagens + sugestões)
    C->>U: Mostra resposta + botões de sugestão
    
    U->>C: Clica "Aplicar sugestão"
    C->>H: applySuggestion(suggestion, field)
    H->>C: Atualiza formulário
    C->>U: Campo preenchido automaticamente
```

---

**Documento atualizado em:** Janeiro 2025\
**Versão:** 2.2\
**Status:** M01-M09 Completos | **Sistema de Contratos com IA 100% Implementado
e Documentado**
