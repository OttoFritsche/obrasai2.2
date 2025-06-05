/**
 * 🔔 Edge Function: Sistema de Notificações SINAPI
 * 
 * Gerencia notificações automáticas sobre alterações
 * na base SINAPI e códigos utilizados em orçamentos.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 * @endpoint POST /functions/v1/sinapi-notifications
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface NotificacaoRequest {
  tipo: 'webhook' | 'verificar_impactos' | 'configurar_preferencias' | 'listar_notificacoes';
  dados?: {
    codigos_alterados?: number[];
    usuario_id?: string;
    preferencias?: {
      email_ativo: boolean;
      notif_desktop: boolean;
      codigos_favoritos: number[];
      tipos_alteracao: string[];
    };
    filtros?: {
      data_inicio?: string;
      data_fim?: string;
      apenas_nao_lidas?: boolean;
    };
  };
}

interface ImpactoOrcamento {
  orcamento_id: string;
  nome_orcamento: string;
  codigos_impactados: number[];
  tipo_impacto: 'desativacao' | 'alteracao' | 'preco';
  urgencia: 'baixa' | 'media' | 'alta';
}

interface NotificacaoResponse {
  sucesso: boolean;
  tipo_resposta: string;
  dados?: {
    impactos_encontrados?: ImpactoOrcamento[];
    notificacoes_enviadas?: number;
    preferencias_salvas?: boolean;
    notificacoes?: any[];
  };
  mensagem?: string;
}

// ====================================
// 🔐 CONFIGURAÇÃO
// ====================================

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ====================================
    // 🛡️ AUTENTICAÇÃO E SETUP
    // ====================================
    
    const authHeader = req.headers.get('Authorization');
    const body: NotificacaoRequest = await req.json();

    // Cliente com autenticação do usuário
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } },
    });

    // Cliente com privilégios administrativos para notificações
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let user = null;
    if (authHeader) {
      const { data: { user: authUser } } = await supabaseUser.auth.getUser();
      user = authUser;
    }

    // ====================================
    // 🔀 ROTEAMENTO POR TIPO DE OPERAÇÃO
    // ====================================

    switch (body.tipo) {
      case 'webhook':
        return await processarWebhook(body, supabaseAdmin, corsHeaders);
        
      case 'verificar_impactos':
        if (!user) throw new Error('Autenticação necessária para verificar impactos');
        return await verificarImpactos(body, user, supabaseUser, corsHeaders);
        
      case 'configurar_preferencias':
        if (!user) throw new Error('Autenticação necessária para configurar preferências');
        return await configurarPreferencias(body, user, supabaseUser, corsHeaders);
        
      case 'listar_notificacoes':
        if (!user) throw new Error('Autenticação necessária para listar notificações');
        return await listarNotificacoes(body, user, supabaseUser, corsHeaders);
        
      default:
        throw new Error('Tipo de operação inválido');
    }

  } catch (error) {
    console.error('Erro na função de notificações:', error);
    
    return new Response(
      JSON.stringify({ 
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// ====================================
// 🔄 PROCESSAMENTO DE WEBHOOK
// ====================================

async function processarWebhook(
  body: NotificacaoRequest,
  supabase: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  console.log('Processando webhook de alterações SINAPI');
  
  const codigosAlterados = body.dados?.codigos_alterados || [];
  if (codigosAlterados.length === 0) {
    return new Response(
      JSON.stringify({ sucesso: true, mensagem: 'Nenhum código alterado' }),
      { headers: corsHeaders }
    );
  }

  // Buscar orçamentos que utilizam os códigos alterados
  const { data: orcamentosImpactados } = await supabase
    .from('orcamentos')
    .select(`
      id,
      nome,
      parametros_entrada,
      usuario_id,
      usuarios!inner(email, nome)
    `)
    .not('parametros_entrada', 'is', null);

  const impactos: ImpactoOrcamento[] = [];
  const notificacoesParaEnviar: any[] = [];

  for (const orcamento of orcamentosImpactados || []) {
    const parametros = orcamento.parametros_entrada || {};
    const codigosSinapi = parametros.codigos_sinapi || [];
    
    const codigosImpactados = codigosSinapi
      .map((c: any) => c.codigo)
      .filter((codigo: number) => codigosAlterados.includes(codigo));

    if (codigosImpactados.length > 0) {
      const impacto: ImpactoOrcamento = {
        orcamento_id: orcamento.id,
        nome_orcamento: orcamento.nome,
        codigos_impactados: codigosImpactados,
        tipo_impacto: 'alteracao',
        urgencia: codigosImpactados.length > 5 ? 'alta' : 'media'
      };
      
      impactos.push(impacto);

      // Criar notificação para o usuário
      notificacoesParaEnviar.push({
        usuario_id: orcamento.usuario_id,
        tipo: 'sinapi_alteracao',
        titulo: `Códigos SINAPI alterados no orçamento "${orcamento.nome}"`,
        mensagem: `${codigosImpactados.length} código(s) SINAPI foram alterados`,
        dados: {
          orcamento_id: orcamento.id,
          codigos_impactados: codigosImpactados
        },
        lida: false,
        created_at: new Date().toISOString()
      });
    }
  }

  // Salvar notificações no banco
  if (notificacoesParaEnviar.length > 0) {
    await supabase
      .from('notificacoes')
      .insert(notificacoesParaEnviar);
  }

  // Log da operação
  await supabase
    .from('logs_api')
    .insert({
      acao: 'sinapi-webhook-processed',
      codigos_alterados: codigosAlterados.length,
      orcamentos_impactados: impactos.length,
      notificacoes_criadas: notificacoesParaEnviar.length,
      timestamp: new Date().toISOString()
    });

  const response: NotificacaoResponse = {
    sucesso: true,
    tipo_resposta: 'webhook_processado',
    dados: {
      impactos_encontrados: impactos,
      notificacoes_enviadas: notificacoesParaEnviar.length
    }
  };

  return new Response(
    JSON.stringify(response),
    { headers: corsHeaders }
  );
}

// ====================================
// 🔍 VERIFICAÇÃO DE IMPACTOS
// ====================================

async function verificarImpactos(
  body: NotificacaoRequest,
  user: any,
  supabase: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Buscar orçamentos do usuário
  const { data: orcamentos } = await supabase
    .from('orcamentos')
    .select('id, nome, parametros_entrada')
    .eq('usuario_id', user.id);

  const impactosUsuario: ImpactoOrcamento[] = [];

  // Buscar códigos SINAPI alterados nos últimos 7 dias
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const { data: codigosAlterados } = await supabase
    .from('sinapi_manutencoes')
    .select('codigo_sinapi, tipo_manutencao, data_alteracao')
    .gte('data_alteracao', seteDiasAtras.toISOString())
    .neq('tipo_manutencao', 'Normal');

  const codigosAlteradosIds = codigosAlterados?.map(c => c.codigo_sinapi) || [];

  for (const orcamento of orcamentos || []) {
    const parametros = orcamento.parametros_entrada || {};
    const codigosSinapi = parametros.codigos_sinapi || [];
    
    const codigosImpactados = codigosSinapi
      .map((c: any) => c.codigo)
      .filter((codigo: number) => codigosAlteradosIds.includes(codigo));

    if (codigosImpactados.length > 0) {
      impactosUsuario.push({
        orcamento_id: orcamento.id,
        nome_orcamento: orcamento.nome,
        codigos_impactados: codigosImpactados,
        tipo_impacto: 'alteracao',
        urgencia: codigosImpactados.length > 3 ? 'alta' : 'media'
      });
    }
  }

  const response: NotificacaoResponse = {
    sucesso: true,
    tipo_resposta: 'impactos_verificados',
    dados: {
      impactos_encontrados: impactosUsuario
    }
  };

  return new Response(
    JSON.stringify(response),
    { headers: corsHeaders }
  );
}

// ====================================
// ⚙️ CONFIGURAÇÃO DE PREFERÊNCIAS
// ====================================

async function configurarPreferencias(
  body: NotificacaoRequest,
  user: any,
  supabase: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const preferencias = body.dados?.preferencias;
  
  if (!preferencias) {
    throw new Error('Dados de preferências não fornecidos');
  }

  // Salvar ou atualizar preferências
  const { error } = await supabase
    .from('usuarios_preferencias_notificacao')
    .upsert({
      usuario_id: user.id,
      email_ativo: preferencias.email_ativo,
      notif_desktop: preferencias.notif_desktop,
      codigos_favoritos: preferencias.codigos_favoritos,
      tipos_alteracao: preferencias.tipos_alteracao,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error('Erro ao salvar preferências');
  }

  const response: NotificacaoResponse = {
    sucesso: true,
    tipo_resposta: 'preferencias_configuradas',
    dados: {
      preferencias_salvas: true
    }
  };

  return new Response(
    JSON.stringify(response),
    { headers: corsHeaders }
  );
}

// ====================================
// 📜 LISTAGEM DE NOTIFICAÇÕES
// ====================================

async function listarNotificacoes(
  body: NotificacaoRequest,
  user: any,
  supabase: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const filtros = body.dados?.filtros || {};
  
  let query = supabase
    .from('notificacoes')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false });

  if (filtros.apenas_nao_lidas) {
    query = query.eq('lida', false);
  }

  if (filtros.data_inicio) {
    query = query.gte('created_at', filtros.data_inicio);
  }

  if (filtros.data_fim) {
    query = query.lte('created_at', filtros.data_fim);
  }

  const { data: notificacoes, error } = await query.limit(50);

  if (error) {
    throw new Error('Erro ao buscar notificações');
  }

  const response: NotificacaoResponse = {
    sucesso: true,
    tipo_resposta: 'notificacoes_listadas',
    dados: {
      notificacoes: notificacoes || []
    }
  };

  return new Response(
    JSON.stringify(response),
    { headers: corsHeaders }
  );
} 