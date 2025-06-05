import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Interface para resposta da API de CNPJ
interface CNPJResponse {
  status?: string;
  message?: string;
  nome?: string;
  fantasia?: string;
  situacao_cadastral?: number;
  situacao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  ddd_telefone_1?: string;
  telefone?: string;
  email?: string;
}

// Interface para resposta padronizada
interface StandardizedCNPJData {
  razao_social: string;
  nome_fantasia: string;
  email?: string;
  telefone_principal?: string;
  situacao_ativa: boolean;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
}

// Headers CORS corretos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Cache simples para evitar requisições repetidas
const cache = new Map<string, StandardizedCNPJData>();
const rateLimiter = new Map<string, number>();

// Função para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }
  
  // Algoritmo de validação do CNPJ
  let sum = 0;
  let weight = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleaned[12]) !== digit1) return false;
  
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cleaned[13]) === digit2;
}

// Função para verificar rate limiting
function checkRateLimit(cnpj: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimiter.get(cnpj);
  
  // Limite de 1 requisição por CNPJ a cada 10 segundos
  if (lastRequest && now - lastRequest < 10000) {
    return false;
  }
  
  rateLimiter.set(cnpj, now);
  return true;
}

// Função para buscar CNPJ na API externa
async function fetchCNPJData(cnpj: string): Promise<StandardizedCNPJData> {
  const apiUrl = `https://receitaws.com.br/v1/cnpj/${cnpj}`;
  
  console.log(`🔍 Buscando CNPJ: ${cnpj}`);
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ObrasAI-EdgeFunction/1.0',
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit excedido. Tente novamente em alguns minutos.');
    }
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  const data: CNPJResponse = await response.json();

  if (data.status === 'ERROR') {
    throw new Error(data.message || 'CNPJ não encontrado nos registros da Receita Federal');
  }

  // Verificar se a empresa está ativa
  const isActive = data.situacao_cadastral === 2 || 
                  data.situacao === 'ATIVA' || 
                  data.status === 'OK';

  // Formatar telefone se disponível
  const telefone = data.ddd_telefone_1 
    ? `(${data.ddd_telefone_1.substring(0, 2)}) ${data.ddd_telefone_1.substring(2)}`
    : data.telefone || undefined;

  // Padronizar dados
  const standardizedData: StandardizedCNPJData = {
    razao_social: data.nome || '',
    nome_fantasia: data.fantasia || '',
    email: data.email || undefined,
    telefone_principal: telefone,
    situacao_ativa: isActive,
    endereco: {
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cep: data.cep || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
    }
  };

  // Salvar no cache
  cache.set(cnpj, standardizedData);
  
  return standardizedData;
}

serve(async (req) => {
  // ✅ Tratar requisições OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Verificar método HTTP
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      { 
        status: 405, 
        headers: corsHeaders
      }
    )
  }

  try {
    console.log('🔍 Iniciando consulta CNPJ...');

    // Obter CNPJ do body da requisição
    const { cnpj } = await req.json()

    if (!cnpj) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'CNPJ é obrigatório' 
        }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      )
    }

    // Limpar CNPJ (remover formatação)
    const cleanedCNPJ = cnpj.replace(/\D/g, '')

    // Validar CNPJ
    if (!isValidCNPJ(cleanedCNPJ)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'CNPJ inválido' 
        }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      )
    }

    // Verificar cache primeiro
    if (cache.has(cleanedCNPJ)) {
      console.log(`✅ CNPJ encontrado no cache: ${cleanedCNPJ}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: cache.get(cleanedCNPJ),
          source: 'cache'
        }),
        { 
          status: 200,
          headers: corsHeaders
        }
      )
    }

    // Verificar rate limiting
    if (!checkRateLimit(cleanedCNPJ)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Muitas requisições para este CNPJ. Aguarde 10 segundos.' 
        }),
        { 
          status: 429, 
          headers: corsHeaders
        }
      )
    }

    // Buscar dados do CNPJ
    const cnpjData = await fetchCNPJData(cleanedCNPJ)

    console.log(`✅ CNPJ consultado com sucesso: ${cleanedCNPJ}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: cnpjData,
        source: 'api'
      }),
      { 
        status: 200,
        headers: corsHeaders
      }
    )

  } catch (error) {
    console.error('❌ Erro na consulta CNPJ:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: corsHeaders
      }
    )
  }
}) 