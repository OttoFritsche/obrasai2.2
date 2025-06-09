import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItemOrcamento {
  orcamento_id: string;
  categoria: string;
  etapa: string;
  insumo: string;
  quantidade_estimada: number;
  unidade_medida: string;
  valor_unitario_base: number;
  valor_total: number;
  valor_total_estimado?: number;
  fonte_preco: string;
  codigo_sinapi?: string;
  estado_referencia_preco: string;
  usa_preco_sinapi: boolean;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

function gerarComposicaoDetalhada(orcamentoId: string, area: number, estado: string): ItemOrcamento[] {
  const agora = new Date().toISOString();
  const itens: ItemOrcamento[] = [];

  // Função helper para criar item
  const criarItem = (categoria: string, etapa: string, insumo: string, qtd: number, unidade: string, valorUnit: number, obs: string) => ({
    orcamento_id: orcamentoId,
    categoria,
    etapa,
    insumo,
    quantidade_estimada: qtd,
    unidade_medida: unidade,
    valor_unitario_base: valorUnit,
    valor_total: qtd * valorUnit, // Campo obrigatório que estava faltando
    fonte_preco: 'IA',
    codigo_sinapi: null,
    estado_referencia_preco: estado,
    usa_preco_sinapi: false,
    observacoes: `v9.0.1 - ${obs}`,
    created_at: agora,
    updated_at: agora
  });

  // DOCUMENTAÇÃO E PROJETOS
  itens.push(
    criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_ARQUITETONICO', 1, 'UN', area * 45.00, 'Projeto arquitetônico completo e detalhado'),
    criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_ESTRUTURAL', 1, 'UN', area * 35.00, 'Projeto estrutural detalhado conforme normas'),
    criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_HIDRAULICO', 1, 'UN', area * 25.00, 'Projeto hidrossanitário completo'),
    criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_ELETRICO', 1, 'UN', area * 25.00, 'Projeto elétrico e de telecomunicações'),
    criarItem('SERVICOS_TERCEIRIZADOS', 'OUTROS', 'CONSULTORIA_ESPECIALIZADA', 4, 'PONTO', 450.00, 'Sondagem SPT para fundação (até 4 pontos)')
  );

  // FUNDAÇÃO
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'FUNDACAO', 'CONCRETO_MAGRO', area * 0.08, 'M3', 280.00, 'Concreto magro para lastro'),
    criarItem('MATERIAL_CONSTRUCAO', 'FUNDACAO', 'CONCRETO_USINADO', area * 0.25, 'M3', 420.00, 'Concreto estrutural para sapatas'),
    criarItem('MATERIAL_CONSTRUCAO', 'FUNDACAO', 'ACO_CA50', area * 12, 'KG', 8.75, 'Aço CA-50 para armação fundação'),
    criarItem('MAO_DE_OBRA', 'FUNDACAO', 'AJUDANTE_GERAL', area * 1.2, 'H', 28.00, 'Escavação manual e mecânica'),
    criarItem('MAO_DE_OBRA', 'FUNDACAO', 'PEDREIRO', area * 0.8, 'H', 32.50, 'Armador especializado')
  );

  // ESTRUTURA
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'ESTRUTURA', 'CONCRETO_USINADO', area * 0.15, 'M3', 450.00, 'Concreto estrutural pilares/vigas/laje'),
    criarItem('MATERIAL_CONSTRUCAO', 'ESTRUTURA', 'ACO_CA50', area * 15, 'KG', 8.75, 'Aço CA-50 para estrutura principal'),
    criarItem('MATERIAL_CONSTRUCAO', 'ESTRUTURA', 'FORMA_MADEIRA', area * 2.5, 'M2', 45.00, 'Forma de madeira para concretagem'),
    criarItem('MAO_DE_OBRA', 'ESTRUTURA', 'CARPINTEIRO', area * 1.8, 'H', 35.00, 'Carpinteiro para formas'),
    criarItem('MAO_DE_OBRA', 'ESTRUTURA', 'PEDREIRO', area * 0.6, 'H', 45.00, 'Concretagem com bomba')
  );

  // ALVENARIA
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'ALVENARIA', 'TIJOLO_CERAMICO', area * 35, 'UN', 1.20, 'Bloco cerâmico 9x19x19'),
    criarItem('MATERIAL_CONSTRUCAO', 'ALVENARIA', 'ARGAMASSA_ASSENTAMENTO', area * 0.18, 'M3', 320.00, 'Argamassa traço 1:4'),
    criarItem('MAO_DE_OBRA', 'ALVENARIA', 'PEDREIRO', area * 2.5, 'H', 28.00, 'Pedreiro para alvenaria'),
    criarItem('MAO_DE_OBRA', 'ALVENARIA', 'SERVENTE', area * 1.8, 'H', 20.00, 'Servente para alvenaria')
  );

  // COBERTURA
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'COBERTURA', 'MADEIRAMENTO_TELHADO', area * 0.08, 'M3', 2800.00, 'Madeira peroba rosa para telhado'),
    criarItem('MATERIAL_CONSTRUCAO', 'COBERTURA', 'TELHA_CERAMICA', area * 1.2, 'M2', 28.00, 'Telha cerâmica portuguesa'),
    criarItem('MATERIAL_CONSTRUCAO', 'COBERTURA', 'RUFO_CALHA', area * 0.4, 'M', 85.00, 'Calha galvanizada 200mm'),
    criarItem('MAO_DE_OBRA', 'COBERTURA', 'CARPINTEIRO', area * 1.5, 'H', 38.00, 'Carpinteiro especializado em telhados')
  );

  // INSTALAÇÕES ELÉTRICAS
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_ELETRICAS', 'FIO_CABO_ELETRICO', area * 8, 'M', 4.50, 'Cabo flexível 2,5mm²'),
    criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_ELETRICAS', 'ELETRODUTO', area * 6, 'M', 8.50, 'Eletroduto PVC rígido 25mm'),
    criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_ELETRICAS', 'QUADRO_DISTRIBUICAO', 1, 'UN', 450.00, 'Quadro elétrico completo'),
    criarItem('MAO_DE_OBRA', 'INSTALACOES_ELETRICAS', 'ELETRICISTA', area * 1.2, 'H', 42.00, 'Eletricista especializado')
  );

  // INSTALAÇÕES HIDRÁULICAS
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_HIDRAULICAS', 'TUBO_PVC_AGUA_FRIA', area * 4, 'M', 12.50, 'Tubo PVC soldável 25mm água fria'),
    criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_HIDRAULICAS', 'TUBO_PVC_ESGOTO', area * 2.5, 'M', 18.00, 'Tubo PVC esgoto 100mm'),
    criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_HIDRAULICAS', 'CAIXA_DAGUA', 1, 'UN', 680.00, 'Caixa d\'água 1000L'),
    criarItem('MAO_DE_OBRA', 'INSTALACOES_HIDRAULICAS', 'ENCANADOR', area * 0.8, 'H', 38.00, 'Encanador especializado')
  );

  // REVESTIMENTOS INTERNOS
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'REVESTIMENTOS_INTERNOS', 'AZULEJO', area * 0.4, 'M2', 45.00, 'Azulejo 20x20 branco'),
    criarItem('MATERIAL_CONSTRUCAO', 'REVESTIMENTOS_INTERNOS', 'PISO_CERAMICO', area * 0.85, 'M2', 52.00, 'Piso cerâmico 45x45'),
    criarItem('MATERIAL_CONSTRUCAO', 'REVESTIMENTOS_INTERNOS', 'ARGAMASSA_ASSENTAMENTO', area * 0.03, 'M3', 850.00, 'Argamassa colante AC-II'),
    criarItem('MAO_DE_OBRA', 'REVESTIMENTOS_INTERNOS', 'PEDREIRO', area * 1.8, 'H', 32.00, 'Azulejista especializado')
  );

  // PINTURA
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'PINTURA', 'MASSA_CORRIDA_PVA', area * 1.8, 'M2', 8.50, 'Massa corrida PVA para interno'),
    criarItem('MATERIAL_CONSTRUCAO', 'PINTURA', 'TINTA_LATEX_PVA', Math.ceil(area / 60), 'UN', 185.00, 'Tinta látex PVA branca 18L'),
    criarItem('MAO_DE_OBRA', 'PINTURA', 'PINTOR', area * 0.8, 'H', 25.00, 'Pintor para área interna')
  );

  // ACABAMENTOS
  itens.push(
    criarItem('MATERIAL_CONSTRUCAO', 'ACABAMENTOS', 'PORTA_MADEIRA', Math.ceil(area / 25), 'UN', 380.00, 'Porta interna madeira 80x210'),
    criarItem('MATERIAL_CONSTRUCAO', 'ACABAMENTOS', 'JANELA_ALUMINIO', Math.ceil(area / 30), 'UN', 520.00, 'Janela alumínio branco 120x100'),
    criarItem('MATERIAL_CONSTRUCAO', 'ACABAMENTOS', 'RODAPE', area * 4, 'M', 12.00, 'Rodapé cerâmico 10cm'),
    criarItem('MAO_DE_OBRA', 'ACABAMENTOS', 'CARPINTEIRO', area * 0.3, 'H', 42.00, 'Marceneiro para instalações')
  );

  // LIMPEZA E ENTREGA
  itens.push(
    criarItem('SERVICOS_TERCEIRIZADOS', 'OUTROS', 'LIMPEZA_OBRA', area, 'M2', 8.50, 'Limpeza geral pós-obra'),
    criarItem('ADMINISTRATIVO', 'DOCUMENTACAO', 'CONSULTORIA_ESPECIALIZADA', 1, 'UN', 1200.00, 'Vistoria técnica e entrega')
  );

  return itens;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI-Calculate-Budget v9.0.1 - INTERFACE CORRIGIDA');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orcamento_id, forcar_recalculo } = await req.json();

    if (!orcamento_id) {
      throw new Error('orcamento_id é obrigatório');
    }

    // Buscar dados do orçamento
    const { data: orcamento, error: orcamentoError } = await supabase
      .from('orcamentos_parametricos')
      .select('*')
      .eq('id', orcamento_id)
      .single();

    if (orcamentoError || !orcamento) {
      throw new Error(`Orçamento não encontrado: ${orcamento_id}`);
    }

    console.log(`✅ Orçamento encontrado: ${orcamento.nome_orcamento}`);

    // Limpar itens existentes se necessário
    if (forcar_recalculo) {
      console.log('🗑️ Removendo itens existentes...');
      await supabase
        .from('itens_orcamento')
        .delete()
        .eq('orcamento_id', orcamento_id);
    }

    // Gerar composição detalhada com interface CORRIGIDA
    const areaCalculada = parseFloat(orcamento.area_construida) || parseFloat(orcamento.area_total) || 100;
    const itensDetalhados = gerarComposicaoDetalhada(orcamento_id, areaCalculada, orcamento.estado);
    
    console.log(`📋 Gerados ${itensDetalhados.length} itens com interface CORRIGIDA`);

    // Calcular custo total
    const custoTotal = itensDetalhados.reduce((total, item) => total + (item.quantidade_estimada * item.valor_unitario_base), 0);
    const custoM2 = areaCalculada > 0 ? custoTotal / areaCalculada : 0;

    // Inserir itens no banco com interface CORRIGIDA
    let itensInseridos = 0;
    let insertError = null;

    if (itensDetalhados.length > 0) {
      console.log('💾 Inserindo itens com interface CORRIGIDA...');
      
      const { data: itensInseridosData, error: insertErr } = await supabase
        .from('itens_orcamento')
        .insert(itensDetalhados)
        .select('id');

      if (insertErr) {
        console.error('❌ Erro ao inserir itens:', insertErr);
        insertError = insertErr.message;
      } else {
        itensInseridos = itensInseridosData?.length || 0;
        console.log(`✅ ${itensInseridos} itens inseridos com SUCESSO!`);
      }
    }

    // Atualizar orçamento
    await supabase
      .from('orcamentos_parametricos')
      .update({
        custo_estimado: custoTotal,
        custo_m2: custoM2,
        status: 'CONCLUIDO',
        data_calculo: new Date().toISOString()
      })
      .eq('id', orcamento_id);

    // Gerar resumos
    const composicaoPorCategoria = itensDetalhados.reduce((acc, item) => {
      if (!acc[item.categoria]) acc[item.categoria] = { total: 0, itens: 0 };
      acc[item.categoria].total += (item.quantidade_estimada * item.valor_unitario_base);
      acc[item.categoria].itens += 1;
      return acc;
    }, {} as Record<string, { total: number; itens: number }>);

    const resumoCategorias = Object.entries(composicaoPorCategoria).map(([categoria, dados]) => ({
      categoria,
      valor_total: dados.total,
      percentual: Math.round((dados.total / custoTotal) * 100 * 10) / 10,
      quantidade_itens: dados.itens
    })).sort((a, b) => b.valor_total - a.valor_total);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Orçamento calculado com interface CORRIGIDA v9.0.1',
        custo_estimado: custoTotal,
        custo_m2: custoM2,
        itens_inseridos: itensInseridos,
        orcamento_id: orcamento_id,
        composicao_detalhada: {
          resumo_categorias: resumoCategorias,
          total_itens: itensDetalhados.length,
          percentual_mao_obra: Math.round((resumoCategorias.find(c => c.categoria === 'MAO_DE_OBRA')?.valor_total || 0) / custoTotal * 100 * 10) / 10,
          percentual_material: Math.round((resumoCategorias.find(c => c.categoria === 'MATERIAL_CONSTRUCAO')?.valor_total || 0) / custoTotal * 100 * 10) / 10
        },
        debug: {
          versao: '9.0.1 - Interface CORRIGIDA',
          area_calculada: areaCalculada,
          itens_gerados: itensDetalhados.length,
          itens_inseridos_sucesso: itensInseridos,
          insert_error: insertError,
          interface_corrigida: true
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: unknown) {
    console.error('💥 Erro na Edge Function v9.0.1:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Erro interno do servidor',
        debug: {
          versao: '9.0.1 - Interface CORRIGIDA',
          stack: error?.stack
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});