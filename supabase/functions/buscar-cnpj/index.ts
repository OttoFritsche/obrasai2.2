import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  ddd_telefone_1: string;
  status?: string;
}

interface SimplifiedCNPJData {
  razao_social: string;
  nome_fantasia: string;
  telefone_principal?: string;
  situacao_ativa: boolean;
  endereco?: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    municipio: string;
    uf: string;
  };
}

// Validação de CNPJ
function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
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

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido. Use POST.' }),
        { status: 405, headers: corsHeaders }
      );
    }

    const { cnpj } = await req.json();

    if (!cnpj) {
      return new Response(
        JSON.stringify({ error: 'CNPJ é obrigatório' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const cleaned = cnpj.replace(/\D/g, '');

    // Validar CNPJ
    if (!validateCNPJ(cleaned)) {
      return new Response(
        JSON.stringify({ error: 'CNPJ inválido' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔍 Buscando CNPJ: ${cleaned}`);

    // Buscar na API da ReceitaWS
    try {
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cleaned}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Pharma.AI-EdgeFunction/1.0.0',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Muitas requisições. Tente novamente em alguns minutos.' }),
            { status: 429, headers: corsHeaders }
          );
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const cnpjData: CNPJResponse = await response.json();

      if (cnpjData.status === 'ERROR') {
        return new Response(
          JSON.stringify({ error: 'CNPJ não encontrado nos registros da Receita Federal' }),
          { status: 404, headers: corsHeaders }
        );
      }

      // Formatar resposta
      const isActive = cnpjData.situacao_cadastral === 2;
      const telefone = cnpjData.ddd_telefone_1 
        ? `(${cnpjData.ddd_telefone_1.substring(0, 2)}) ${cnpjData.ddd_telefone_1.substring(2)}`
        : undefined;

      const simplifiedData: SimplifiedCNPJData = {
        razao_social: cnpjData.razao_social || '',
        nome_fantasia: cnpjData.nome_fantasia || '',
        telefone_principal: telefone,
        situacao_ativa: isActive,
        endereco: {
          logradouro: cnpjData.logradouro || '',
          numero: cnpjData.numero || '',
          complemento: cnpjData.complemento || '',
          bairro: cnpjData.bairro || '',
          cep: cnpjData.cep || '',
          municipio: cnpjData.municipio || '',
          uf: cnpjData.uf || '',
        }
      };

      console.log(`✅ CNPJ encontrado via API: ${cleaned} - ${simplifiedData.razao_social}`);

      return new Response(
        JSON.stringify(simplifiedData),
        { headers: corsHeaders }
      );

    } catch (apiError) {
      console.error('Erro na API da ReceitaWS:', apiError);
      return new Response(
        JSON.stringify({ error: 'Serviço de consulta de CNPJ indisponível. Tente novamente mais tarde.' }),
        { status: 503, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}); 