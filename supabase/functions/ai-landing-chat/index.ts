import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// 🤖 Configuração da API DeepSeek
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ✅ Headers de segurança
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// ✅ Rate limiting para visitantes
const rateLimiter = new Map<string, number[]>();

interface LandingChatRequest {
  message: string;
  visitor_id?: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * ✅ Implementa rate limiting para visitantes
 */
const checkRateLimit = (visitorId: string): boolean => {
  const now = Date.now();
  const requests = rateLimiter.get(visitorId) || [];
  
  // Remove requests mais antigos que 5 minutos
  const recentRequests = requests.filter(time => now - time < 300000);
  
  // Limite: 5 requests por 5 minutos para visitantes
  if (recentRequests.length >= 5) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(visitorId, recentRequests);
  
  // Cleanup periódico
  if (rateLimiter.size > 500) {
    const oldEntries = Array.from(rateLimiter.entries())
      .filter(([_, times]) => times.every(time => now - time > 600000));
    oldEntries.forEach(([key]) => rateLimiter.delete(key));
  }
  
  return true;
};

/**
 * 📋 Contexto completo do PRD - ObrasAI 2.2
 */
const PRD_CONTEXT = `
# 📋 ObrasAI - Plataforma Inteligente para Gestão de Obras

## 🎯 VISÃO GERAL
O ObrasAI é uma plataforma web completa para gestão de obras na construção civil, centralizando informações, automatizando processos e oferecendo inteligência artificial especializada.

## ✅ FUNCIONALIDADES 100% IMPLEMENTADAS E FUNCIONAIS:

### 🏗️ M01 - CADASTROS ESSENCIAIS
- ✅ **OBRAS:** CRUD completo com validação de datas, orçamento, endereços
- ✅ **FORNECEDORES PJ:** CRUD com validação de CNPJ, razão social, dados completos
- ✅ **FORNECEDORES PF:** CRUD com validação de CPF, RG, dados pessoais
- ✅ **DESPESAS:** CRUD com categorização por 21 etapas e 150+ insumos
- ✅ **NOTAS FISCAIS:** CRUD com upload de arquivos, Supabase Storage

### 🤖 M02 - INTELIGÊNCIA ARTIFICIAL
- ✅ **CHAT CONTEXTUAL:** IA com acesso aos dados reais das obras
- ✅ **ANÁLISE FINANCEIRA:** Orçamento vs gastos reais
- ✅ **SUGESTÕES INTELIGENTES:** Baseadas em dados da obra
- ✅ **CONHECIMENTO TÉCNICO:** Especializado em construção civil brasileira
- ✅ **RATE LIMITING:** 10 requests/minuto, segurança robusta

### 💰 M03 - ORÇAMENTO PARAMÉTRICO COM IA
- ✅ **CÁLCULO AUTOMÁTICO:** IA analisa parâmetros e gera orçamentos
- ✅ **BASE SINAPI:** Integração com preços oficiais
- ✅ **COBERTURA NACIONAL:** Dados regionais atualizados
- ✅ **PARÂMETROS PERSONALIZÁVEIS:** Por tipo de obra
- ✅ **RELATÓRIOS DETALHADOS:** Histórico e análises

### 🔍 M04 - SISTEMA SINAPI
- ✅ **CONSULTA INTELIGENTE:** Busca semântica de códigos
- ✅ **PREÇOS ATUALIZADOS:** Base oficial SINAPI
- ✅ **HISTÓRICO DE CONSULTAS:** Por usuário
- ✅ **INTEGRAÇÃO:** Com sistema de orçamento

### 💳 M05 - SISTEMA DE ASSINATURAS
- ✅ **STRIPE INTEGRADO:** 3 planos funcionais
- ✅ **BÁSICO:** R$ 97/mês - 5 obras, 1 usuário, 100 IA requests
- ✅ **PROFISSIONAL:** R$ 197/mês - 20 obras, 5 usuários, 500 IA requests  
- ✅ **EMPRESARIAL:** R$ 497/mês - Ilimitado + suporte prioritário

### 📊 M06 - RELATÓRIOS E DASHBOARDS
- ✅ **DASHBOARD PRINCIPAL:** Métricas consolidadas
- ✅ **LISTAGENS AVANÇADAS:** Filtros e busca
- ✅ **RELATÓRIOS BÁSICOS:** Obras, despesas, notas fiscais
- ✅ **EXPORTAÇÃO:** Dados estruturados

## 🚀 TECNOLOGIAS IMPLEMENTADAS:

### Frontend
- **React 18.3.1** com TypeScript 5.6.2
- **Vite 5.4.2** para build otimizado
- **Tailwind CSS + Shadcn/UI** interface moderna
- **React Router DOM** roteamento protegido
- **TanStack Query** gerenciamento de estado
- **React Hook Form + Zod** formulários e validação

### Backend & IA
- **Supabase** PostgreSQL + Auth + 19 Edge Functions
- **DeepSeek API** integração funcional para IA
- **Row Level Security (RLS)** multi-tenant
- **19 Edge Functions** em Deno/TypeScript

### Segurança
- **Multi-tenant** isolamento completo de dados
- **Sanitização de inputs** DOMPurify
- **Rate limiting** implementado
- **Validação em múltiplas camadas**

## 🔄 PRÓXIMAS MELHORIAS (Q1 2025):
- 🔄 Análise preditiva de custos com Machine Learning
- 🔄 Reconhecimento de imagens de obras
- 🔄 App mobile (React Native)
- 🔄 Relatórios automáticos avançados
- 🔄 Integração com ERP externos

## 💼 DIFERENCIAIS COMPETITIVOS:
1. **IA Contextual:** Chat que acessa dados reais das obras
2. **Orçamento Inteligente:** Cálculo paramétrico com IA
3. **SINAPI Integrado:** Busca semântica de preços oficiais
4. **Multi-tenant Seguro:** RLS nativo do PostgreSQL
5. **Interface Moderna:** React + TypeScript + Shadcn/UI
6. **Arquitetura Escalável:** Edge Functions + Supabase

## 🎯 PÚBLICO-ALVO:
- Construtores e empreiteiros
- Engenheiros civis e arquitetos
- Gerentes de obras
- Empresas de construção civil
- Profissionais autônomos da construção

## 🏆 BENEFÍCIOS PRINCIPAIS:
- **Redução de custos** até 20% com orçamento IA
- **Controle financeiro** completo e em tempo real
- **Decisões baseadas em dados** reais
- **Conformidade** com normas ABNT e legislação
- **Produtividade** aumentada com automação
- **Integração** completa de processos
`;

/**
 * 🤖 Processa mensagem com DeepSeek + contexto PRD
 */
async function processarComDeepSeek(message: string): Promise<string> {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('API Key do DeepSeek não configurada');
    }

    const prompt = `Você é o assistente de IA do ObrasAI, uma plataforma inovadora para gestão de obras na construção civil.

CONTEXTO DO SISTEMA:
${PRD_CONTEXT}

INSTRUÇÕES IMPORTANTES:
- Responda SEMPRE em português brasileiro
- Seja especialista em construção civil brasileira
- Use APENAS o contexto do PRD para responder sobre funcionalidades
- NUNCA invente números de usuários, clientes ou estatísticas de uso
- Se perguntarem sobre quantos usuários, diga que é um sistema novo e em crescimento
- Seja entusiasta mas PRECISO sobre o que está implementado
- Se perguntarem sobre algo não implementado, mencione que está no roadmap
- Foque nos benefícios técnicos e funcionais para construtores e engenheiros
- Use emojis adequadamente mas com moderação
- Seja conversacional mas profissional
- Destaque os diferenciais técnicos quando relevante
- SEMPRE seja honesto sobre o status atual do sistema

PROIBIÇÕES ABSOLUTAS:
- NÃO invente estatísticas ou números de usuários
- NÃO mencione "mais de X profissionais" a menos que seja verdade
- NÃO exagere benefícios não comprovados
- NÃO prometa funcionalidades ainda não implementadas como se já existissem

PERGUNTA DO VISITANTE: "${message}"

Responda de forma completa, útil e honesta, destacando como o ObrasAI pode resolver os problemas específicos mencionados baseado apenas nas funcionalidades realmente implementadas.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em construção civil e o sistema ObrasAI. Seja helpful, preciso e entusiasta.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API DeepSeek:', response.status, errorText);
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inválida da API');
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Erro ao processar com DeepSeek:', error);
    
    // Fallback mais elaborado com base na mensagem
    const fallbackResponses = {
      orcamento: "🏗️ O ObrasAI possui um sistema de **Orçamento Paramétrico com IA** que calcula automaticamente custos baseados nos seus parâmetros de obra, integrado com a base SINAPI oficial! Essa funcionalidade permite previsões mais precisas de custos para seus projetos.",
      
      ia: "🤖 Nossa **IA contextual** é um diferencial técnico importante! Ela acessa dados reais das suas obras e fornece insights baseados em informações financeiras, fornecedores e despesas reais. É como ter um assistente especialista disponível 24/7.",
      
      sinapi: "📊 Temos integração completa com o **Sistema SINAPI** com busca semântica inteligente. Consulte preços oficiais de forma rápida e integre diretamente nos seus orçamentos com nossa tecnologia de busca avançada.",
      
      funcionalidades: "🛠️ O **ObrasAI** tem funcionalidades completas: CRUD de obras, gestão de fornecedores PJ/PF, controle de despesas por 21 etapas, notas fiscais com upload, orçamento paramétrico com IA, sistema SINAPI e muito mais. Qual área específica te interessa?",
      
      default: "🏗️ O **ObrasAI** é uma plataforma completa para gestão de obras com IA integrada! Temos controle financeiro, orçamento inteligente, gestão de fornecedores, sistema SINAPI e interface moderna. Que funcionalidade específica te interessa mais? 😊"
    };

    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('orçamento') || lowerMessage.includes('custo')) return fallbackResponses.orcamento;
    if (lowerMessage.includes('ia') || lowerMessage.includes('inteligência')) return fallbackResponses.ia;
    if (lowerMessage.includes('sinapi') || lowerMessage.includes('preço')) return fallbackResponses.sinapi;
    if (lowerMessage.includes('funcionalidade') || lowerMessage.includes('recurso')) return fallbackResponses.funcionalidades;
    
    return fallbackResponses.default;
  }
}

/**
 * 🚀 Handler principal
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Método não permitido. Use POST.');
    }

    const body = await req.json();
    const { message, visitor_id } = body as LandingChatRequest;

    // Validações básicas
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Mensagem é obrigatória');
    }

    if (message.length > 500) {
      throw new Error('Mensagem muito longa (máximo 500 caracteres)');
    }

    // Rate limiting
    const clientId = visitor_id || req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return new Response(
        JSON.stringify({ 
          error: 'Muitas mensagens. Aguarde 5 minutos para continuar.',
          type: 'rate_limit'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Processar com IA
    const resposta = await processarComDeepSeek(message.trim());

    return new Response(
      JSON.stringify({ 
        response: resposta,
        success: true
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro no AI Landing Chat:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        success: false
      }),
      { 
        status: error instanceof Error && error.message.includes('rate_limit') ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 