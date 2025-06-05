/**
 * 🔍 Edge Function: Validação em Lote de Códigos SINAPI
 * 
 * Valida múltiplos códigos SINAPI de forma otimizada,
 * retornando status, alterações e alternativas.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 * @endpoint POST /functions/v1/validate-sinapi-batch
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface ValidacaoRequest {
  codigos: number[];
  incluir_alternativas?: boolean;
  incluir_historico?: boolean;
}

interface CodigoValidacao {
  codigo: number;
  status: 'ativo' | 'desativado' | 'alterado' | 'nao_encontrado';
  descricao?: string;
  alteracoes_recentes: boolean;
  data_ultima_alteracao?: string;
  alternativas?: number[];
  detalhes?: {
    tipo_manutencao?: string;
    historico_alteracoes?: any[];
  };
}

interface ValidacaoResponse {
  resultados: CodigoValidacao[];
  resumo: {
    total: number;
    ativos: number;
    desativados: number;
    alterados: number;
    nao_encontrados: number;
  };
  processado_em: string;
}

// ====================================
// 🔐 CONFIGURAÇÃO E AUTENTICAÇÃO
// ====================================

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ====================================
    // 🛡️ AUTENTICAÇÃO
    // ====================================
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // ====================================
    // 📥 VALIDAÇÃO DOS DADOS DE ENTRADA
    // ====================================

    const body: ValidacaoRequest = await req.json();
    
    if (!body.codigos || !Array.isArray(body.codigos)) {
      return new Response(
        JSON.stringify({ error: 'Array de códigos é obrigatório' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (body.codigos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pelo menos um código deve ser fornecido' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (body.codigos.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Máximo de 100 códigos por requisição' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ====================================
    // 🔍 PROCESSAMENTO DA VALIDAÇÃO
    // ====================================

    const inicioProcessamento = new Date();
    const resultados: CodigoValidacao[] = [];

    // Query otimizada para buscar todos os códigos de uma vez
    const { data: codigosExistentes, error: queryError } = await supabase
      .from('sinapi_manutencoes')
      .select(`
        codigo_sinapi,
        descricao_item,
        status_atual,
        tipo_manutencao,
        data_alteracao,
        created_at,
        updated_at
      `)
      .in('codigo_sinapi', body.codigos)
      .order('data_alteracao', { ascending: false });

    if (queryError) {
      console.error('Erro na consulta:', queryError);
      return new Response(
        JSON.stringify({ error: 'Erro interno na consulta dos dados' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // ====================================
    // 📊 PROCESSAMENTO DOS RESULTADOS
    // ====================================

    for (const codigo of body.codigos) {
      const codigoData = codigosExistentes?.find(c => c.codigo_sinapi === codigo);
      
      if (!codigoData) {
        // Código não encontrado
        resultados.push({
          codigo,
          status: 'nao_encontrado',
          alteracoes_recentes: false,
        });
        continue;
      }

      // Verificar se teve alterações recentes (últimos 30 dias)
      const dataAlteracao = new Date(codigoData.data_alteracao || codigoData.updated_at);
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      const alteracoesRecentes = dataAlteracao > trintaDiasAtras;

      // Determinar status baseado nos dados
      let status: 'ativo' | 'desativado' | 'alterado' = 'ativo';
      if (codigoData.status_atual === 'Desativado') {
        status = 'desativado';
      } else if (alteracoesRecentes || codigoData.tipo_manutencao !== 'Normal') {
        status = 'alterado';
      }

      const resultado: CodigoValidacao = {
        codigo,
        status,
        descricao: codigoData.descricao_item,
        alteracoes_recentes: alteracoesRecentes,
        data_ultima_alteracao: codigoData.data_alteracao,
      };

      // Incluir detalhes se solicitado
      if (body.incluir_historico) {
        resultado.detalhes = {
          tipo_manutencao: codigoData.tipo_manutencao,
        };
      }

      // Buscar alternativas para códigos desativados se solicitado
      if (body.incluir_alternativas && status === 'desativado') {
        const { data: alternativas } = await supabase
          .from('sinapi_manutencoes')
          .select('codigo_sinapi')
          .ilike('descricao_item', `%${codigoData.descricao_item.split(' ').slice(0, 3).join(' ')}%`)
          .eq('status_atual', 'Ativo')
          .neq('codigo_sinapi', codigo)
          .limit(3);

        if (alternativas?.length) {
          resultado.alternativas = alternativas.map(a => a.codigo_sinapi);
        }
      }

      resultados.push(resultado);
    }

    // ====================================
    // 📈 GERAÇÃO DO RESUMO
    // ====================================

    const resumo = {
      total: resultados.length,
      ativos: resultados.filter(r => r.status === 'ativo').length,
      desativados: resultados.filter(r => r.status === 'desativado').length,
      alterados: resultados.filter(r => r.status === 'alterado').length,
      nao_encontrados: resultados.filter(r => r.status === 'nao_encontrado').length,
    };

    const fimProcessamento = new Date();
    const tempoProcessamento = fimProcessamento.getTime() - inicioProcessamento.getTime();

    // ====================================
    // 📝 LOG DE AUDITORIA
    // ====================================

    const logData = {
      usuario_id: user.id,
      acao: 'validate-sinapi-batch',
      codigos_solicitados: body.codigos.length,
      tempo_processamento_ms: tempoProcessamento,
      resultados_resumo: resumo,
      timestamp: new Date().toISOString()
    };

    // Log não deve impedir a resposta
    supabase
      .from('logs_api')
      .insert(logData)
      .then()
      .catch(error => console.error('Erro no log:', error));

    // ====================================
    // 📤 RESPOSTA FINAL
    // ====================================

    const response: ValidacaoResponse = {
      resultados,
      resumo,
      processado_em: `${tempoProcessamento}ms`
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'X-Processing-Time': `${tempoProcessamento}ms`,
          'X-Total-Codes': body.codigos.length.toString(),
        }
      }
    );

  } catch (error) {
    console.error('Erro na validação em lote:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno no servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}); 