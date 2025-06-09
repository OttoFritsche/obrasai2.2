import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Função para gerar a composição detalhada do orçamento
function gerarComposicaoDetalhada(orcamentoId, area, estado) {
  const agora = new Date().toISOString();
  const itens = [];
  // Função helper para criar item com a interface correta
  const criarItem = (categoria, etapa, insumo, qtd, unidade, valorUnit, obs, usaSinapi = false, codSinapi)=>({
      orcamento_id: orcamentoId,
      categoria,
      etapa,
      insumo,
      quantidade_estimada: qtd,
      unidade_medida: unidade,
      valor_unitario_base: valorUnit,
      // valor_total será calculado no DB ou após inserção se necessário aqui
      fonte_preco: usaSinapi && codSinapi ? 'SINAPI' : 'IA',
      codigo_sinapi: codSinapi,
      estado_referencia_preco: estado,
      usa_preco_sinapi: usaSinapi,
      observacoes: `v9.0.1 - ${obs}`,
      created_at: agora,
      updated_at: agora
    });
  // DOCUMENTAÇÃO E PROJETOS
  itens.push(criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_ARQUITETONICO_COMPLETO', 1, 'UN', area * 45.00, 'Projeto arquitetônico completo e detalhado'), criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_ESTRUTURAL_DETALHADO', 1, 'UN', area * 35.00, 'Projeto estrutural detalhado conforme normas'), criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_HIDROSSANITARIO', 1, 'UN', area * 25.00, 'Projeto hidrossanitário completo'), criarItem('SERVICOS_TERCEIRIZADOS', 'DOCUMENTACAO', 'PROJETO_ELETRICO_TELEFONICO', 1, 'UN', area * 25.00, 'Projeto elétrico e de telecomunicações'), criarItem('SERVICOS_TERCEIRIZADOS', 'OUTROS', 'SONDAGEM_SOLO_SPT', 4, 'PONTO', 450.00, 'Sondagem SPT para fundação (até 4 pontos)'));
  // FUNDAÇÃO (Exemplo: Sapatas)
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'FUNDACAO', 'CONCRETO_MAGRO_LASTRO', area * 0.08, 'M3', 280.00, 'Concreto magro para lastro de fundação'), criarItem('MATERIAL_CONSTRUCAO', 'FUNDACAO', 'CONCRETO_USINADO_FCK25_SAPATAS', area * 0.25, 'M3', 420.00, 'Concreto estrutural FCK 25MPa para sapatas'), criarItem('MATERIAL_CONSTRUCAO', 'FUNDACAO', 'ACO_CA50_ARMACAO_FUNDACAO', area * 12, 'KG', 8.75, 'Aço CA-50 para armação de sapatas e blocos'), criarItem('MAO_DE_OBRA', 'FUNDACAO', 'AJUDANTE_ESCAVACAO_MANUAL', area * 1.2, 'H', 28.00, 'Escavação manual e preparo de formas'), criarItem('MAO_DE_OBRA', 'FUNDACAO', 'PEDREIRO_ARMADOR_FUNDACAO', area * 0.8, 'H', 32.50, 'Montagem de formas e armação para fundação'));
  // ESTRUTURA (Pilares, Vigas, Laje)
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'ESTRUTURA', 'CONCRETO_USINADO_FCK25_ESTRUTURA', area * 0.15, 'M3', 450.00, 'Concreto FCK 25MPa para pilares, vigas e laje'), criarItem('MATERIAL_CONSTRUCAO', 'ESTRUTURA', 'ACO_CA50_ARMACAO_ESTRUTURA', area * 15, 'KG', 8.75, 'Aço CA-50 para armação de pilares, vigas e laje'), criarItem('MATERIAL_CONSTRUCAO', 'ESTRUTURA', 'FORMA_MADEIRA_PINUS_ESTRUTURA', area * 2.5, 'M2', 45.00, 'Forma de madeira (pinus) para concretagem'), criarItem('MAO_DE_OBRA', 'ESTRUTURA', 'CARPINTEIRO_FORMAS_ESTRUTURA', area * 1.8, 'H', 35.00, 'Carpinteiro para montagem de formas'), criarItem('MAO_DE_OBRA', 'ESTRUTURA', 'PEDREIRO_CONCRETAGEM_ESTRUTURA', area * 0.6, 'H', 45.00, 'Pedreiro para concretagem (inclui bomba se necessário)'));
  // ALVENARIA DE VEDAÇÃO
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'ALVENARIA', 'BLOCO_CERAMICO_9X19X19', area * 35, 'UN', 1.20, 'Bloco cerâmico vedação 9x19x19cm'), criarItem('MATERIAL_CONSTRUCAO', 'ALVENARIA', 'ARGAMASSA_ASSENTAMENTO_ALVENARIA', area * 0.18, 'M3', 320.00, 'Argamassa industrializada para assentamento, traço 1:4'), criarItem('MAO_DE_OBRA', 'ALVENARIA', 'PEDREIRO_ALVENARIA', area * 2.5, 'H', 28.00, 'Pedreiro para execução de alvenaria'), criarItem('MAO_DE_OBRA', 'ALVENARIA', 'SERVENTE_ALVENARIA', area * 1.8, 'H', 20.00, 'Servente para auxílio na alvenaria'));
  // COBERTURA (Exemplo: Telhado Cerâmico)
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'COBERTURA', 'MADEIRAMENTO_TELHADO_PEROBA', area * 0.08, 'M3', 2800.00, 'Madeira de lei (Peroba Rosa ou similar) para estrutura do telhado'), criarItem('MATERIAL_CONSTRUCAO', 'COBERTURA', 'TELHA_CERAMICA_PORTUGUESA', area * 1.2, 'M2', 28.00, 'Telha cerâmica tipo Portuguesa ou similar'), criarItem('MATERIAL_CONSTRUCAO', 'COBERTURA', 'RUFO_CALHA_GALVANIZADA', area * 0.4, 'M', 85.00, 'Rufos e calhas em chapa galvanizada nº24, desenvolvimento 200mm'), criarItem('MAO_DE_OBRA', 'COBERTURA', 'CARPINTEIRO_TELHADISTA', area * 1.5, 'H', 38.00, 'Carpinteiro especializado em telhados'));
  // INSTALAÇÕES ELÉTRICAS
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_ELETRICAS', 'FIO_CABO_FLEXIVEL_2_5MM', area * 8, 'M', 4.50, 'Cabo flexível antichama 2,5mm² (cores diversas)'), criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_ELETRICAS', 'ELETRODUTO_PVC_RIGIDO_25MM', area * 6, 'M', 8.50, 'Eletroduto PVC rígido roscável 25mm (3/4")'), criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_ELETRICAS', 'QUADRO_DISTRIBUICAO_EMBUTIR_12_DISJ', 1, 'UN', 450.00, 'Quadro de distribuição de embutir para 12 disjuntores DIN'), criarItem('MAO_DE_OBRA', 'INSTALACOES_ELETRICAS', 'ELETRICISTA_PREDIAL', area * 1.2, 'H', 42.00, 'Eletricista predial qualificado'));
  // INSTALAÇÕES HIDRÁULICAS
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_HIDRAULICAS', 'TUBO_PVC_SOLDAVEL_AGUA_FRIA_25MM', area * 4, 'M', 12.50, 'Tubo PVC soldável para água fria 25mm'), criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_HIDRAULICAS', 'TUBO_PVC_ESGOTO_PRIMARIO_100MM', area * 2.5, 'M', 18.00, 'Tubo PVC para esgoto primário 100mm'), criarItem('MATERIAL_CONSTRUCAO', 'INSTALACOES_HIDRAULICAS', 'CAIXA_DAGUA_POLIETILENO_1000L', 1, 'UN', 680.00, 'Caixa d\'água de polietileno 1000L com tampa'), criarItem('MAO_DE_OBRA', 'INSTALACOES_HIDRAULICAS', 'ENCANADOR_BOMBEIRO_HIDRAULICO', area * 0.8, 'H', 38.00, 'Encanador (bombeiro hidráulico) qualificado'));
  // REVESTIMENTOS INTERNOS (Paredes e Pisos)
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'REVESTIMENTOS_INTERNOS', 'AZULEJO_BRANCO_20X20_COZINHA_BANHEIRO', area * 0.4, 'M2', 45.00, 'Azulejo branco brilhante 20x20cm para áreas molhadas'), criarItem('MATERIAL_CONSTRUCAO', 'REVESTIMENTOS_INTERNOS', 'PISO_CERAMICO_PEI4_45X45', area * 0.85, 'M2', 52.00, 'Piso cerâmico PEI-4, dimensões 45x45cm ou similar'), criarItem('MATERIAL_CONSTRUCAO', 'REVESTIMENTOS_INTERNOS', 'ARGAMASSA_COLANTE_ACII', area * 0.03, 'M3', 850.00, 'Argamassa colante AC-II para assentamento de cerâmica'), criarItem('MAO_DE_OBRA', 'REVESTIMENTOS_INTERNOS', 'PEDREIRO_AZULEJISTA', area * 1.8, 'H', 32.00, 'Pedreiro azulejista especializado'));
  // PINTURA INTERNA E EXTERNA
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'PINTURA', 'MASSA_CORRIDA_PVA_INTERNA', area * 1.8, 'M2', 8.50, 'Massa corrida PVA para paredes internas'), criarItem('MATERIAL_CONSTRUCAO', 'PINTURA', 'TINTA_LATEX_PVA_BRANCA_INTERNA', Math.ceil(area / 60), 'LATA_18L', 185.00, 'Tinta látex PVA branca para interior (lata 18L)'), criarItem('MATERIAL_CONSTRUCAO', 'PINTURA', 'TINTA_ACRILICA_EXTERNA', Math.ceil(area * 0.5 / 50), 'LATA_18L', 280.00, 'Tinta acrílica para exterior (lata 18L)'), criarItem('MAO_DE_OBRA', 'PINTURA', 'PINTOR_PREDIAL', area * 0.8, 'H', 25.00, 'Pintor para áreas internas e externas'));
  // ESQUADRIAS (Portas e Janelas)
  itens.push(criarItem('MATERIAL_CONSTRUCAO', 'ACABAMENTOS', 'PORTA_MADEIRA_INTERNA_COMPLETA_80X210', Math.ceil(area / 25), 'UN', 380.00, 'Porta interna de madeira semi-oca, completa com batente e ferragens, 80x210cm'), criarItem('MATERIAL_CONSTRUCAO', 'ACABAMENTOS', 'JANELA_ALUMINIO_BRANCO_CORRER_2FL_120X100', Math.ceil(area / 30), 'UN', 520.00, 'Janela de alumínio branco, modelo de correr 2 folhas, com vidro, 120x100cm'), criarItem('MATERIAL_CONSTRUCAO', 'ACABAMENTOS', 'RODAPE_CERAMICO_10CM', area * 4, 'M', 12.00, 'Rodapé cerâmico 10cm altura, coordenado com piso'), criarItem('MAO_DE_OBRA', 'ACABAMENTOS', 'CARPINTEIRO_INSTALADOR_ESQUADRIAS', area * 0.3, 'H', 42.00, 'Carpinteiro/Marceneiro para instalação de portas e alizares'));
  // LIMPEZA FINAL E ENTREGA
  itens.push(criarItem('SERVICOS_TERCEIRIZADOS', 'OUTROS', 'LIMPEZA_POS_OBRA_COMPLETA', area, 'M2', 8.50, 'Limpeza geral pós-obra, incluindo remoção de entulho fino'), criarItem('ADMINISTRATIVO', 'DOCUMENTACAO', 'VISTORIA_TECNICA_ENTREGA_CHAVES', 1, 'UN', 1200.00, 'Vistoria técnica final e processo de entrega das chaves'));
  return itens;
}
serve(async (req)=>{
  // Tratar requisição OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    console.log('🚀 AI-Calculate-Budget v9.0.1 - INTERFACE CORRIGIDA INICIADA');
    // Inicializar Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Extrair dados da requisição
    const { orcamento_id, forcar_recalculo } = await req.json();
    if (!orcamento_id) {
      throw new Error('O parâmetro orcamento_id é obrigatório.');
    }
    // Buscar dados do orçamento paramétrico
    const { data: orcamento, error: orcamentoError } = await supabase.from('orcamentos_parametricos').select('id, nome_orcamento, area_construida, area_total, estado, status') // Selecionar campos necessários
    .eq('id', orcamento_id).single();
    if (orcamentoError || !orcamento) {
      console.error(`Erro ao buscar orçamento ${orcamento_id}:`, orcamentoError);
      throw new Error(`Orçamento com ID ${orcamento_id} não encontrado ou erro na busca.`);
    }
    console.log(`✅ Orçamento encontrado: ${orcamento.nome_orcamento} (ID: ${orcamento.id})`);
    // Limpar itens existentes se forcar_recalculo for true
    if (forcar_recalculo) {
      console.log(`🗑️ Removendo itens existentes para o orçamento ${orcamento_id} devido a forcar_recalculo=true...`);
      const { error: deleteError } = await supabase.from('itens_orcamento').delete().eq('orcamento_id', orcamento_id);
      if (deleteError) {
        console.error(`Erro ao remover itens existentes para ${orcamento_id}:`, deleteError);
      // Considerar se deve parar ou continuar mesmo com erro na limpeza
      }
    }
    // Gerar composição detalhada com a interface CORRIGIDA
    const areaCalculada = parseFloat(orcamento.area_construida) || parseFloat(orcamento.area_total) || 100; // Fallback para 100m² se não houver área
    const estadoOrcamento = orcamento.estado || 'SP'; // Fallback para SP se não houver estado
    const itensDetalhados = gerarComposicaoDetalhada(orcamento_id, areaCalculada, estadoOrcamento);
    console.log(`📋 Gerados ${itensDetalhados.length} itens com a interface CORRIGIDA para o orçamento ${orcamento_id}.`);
    // Calcular custo total e custo por m²
    const custoTotal = itensDetalhados.reduce((total, item)=>total + item.quantidade_estimada * item.valor_unitario_base, 0);
    const custoM2 = areaCalculada > 0 ? custoTotal / areaCalculada : 0;
    // Inserir itens no banco de dados com a interface CORRIGIDA
    let itensInseridos = 0;
    let insertError = null;
    if (itensDetalhados.length > 0) {
      console.log(`💾 Inserindo ${itensDetalhados.length} itens com a interface CORRIGIDA para o orçamento ${orcamento_id}...`);
      // O Supabase JS v2 retorna { data, error } e não um array direto ou count
      const { data: itensInseridosData, error: insertErr } = await supabase.from('itens_orcamento').insert(itensDetalhados).select('id'); // Selecionar 'id' para contagem e confirmação
      if (insertErr) {
        console.error(`❌ Erro ao inserir itens para o orçamento ${orcamento_id}:`, insertErr);
        insertError = insertErr.message; // Armazenar a mensagem de erro
      } else {
        itensInseridos = itensInseridosData?.length || 0; // Contar os itens inseridos com base no retorno
        console.log(`✅ ${itensInseridos} itens inseridos com SUCESSO para o orçamento ${orcamento_id}!`);
      }
    }
    // Atualizar o orçamento paramétrico com os novos totais e status
    console.log(`🔄 Atualizando orçamento paramétrico ${orcamento_id} com custo total e status...`);
    const { error: updateError } = await supabase.from('orcamentos_parametricos').update({
      custo_estimado: custoTotal,
      custo_m2: custoM2,
      status: 'CONCLUIDO',
      data_calculo: new Date().toISOString() // Registrar data do cálculo
    }).eq('id', orcamento_id);
    if (updateError) {
      console.error(`❌ Erro ao atualizar orçamento paramétrico ${orcamento_id}:`, updateError);
    // Considerar como tratar este erro (ex: log, mas continuar)
    }
    // Gerar resumos por categoria para a resposta
    const composicaoPorCategoria = itensDetalhados.reduce((acc, item)=>{
      if (!acc[item.categoria]) acc[item.categoria] = {
        total: 0,
        itens: 0
      };
      acc[item.categoria].total += item.quantidade_estimada * item.valor_unitario_base;
      acc[item.categoria].itens += 1;
      return acc;
    }, {});
    const resumoCategorias = Object.entries(composicaoPorCategoria).map(([categoria, dados])=>({
        categoria,
        valor_total: dados.total,
        percentual: custoTotal > 0 ? Math.round(dados.total / custoTotal * 100 * 10) / 10 : 0,
        quantidade_itens: dados.itens
      })).sort((a, b)=>b.valor_total - a.valor_total);
    // Construir a resposta de sucesso
    return new Response(JSON.stringify({
      success: true,
      message: `Orçamento ${orcamento.nome_orcamento} (ID: ${orcamento_id}) calculado com sucesso usando a interface CORRIGIDA v9.0.1.`,
      custo_estimado: custoTotal,
      custo_m2: custoM2,
      itens_inseridos: itensInseridos,
      orcamento_id: orcamento_id,
      composicao_detalhada: {
        resumo_categorias: resumoCategorias,
        total_itens_gerados: itensDetalhados.length,
        percentual_mao_obra: custoTotal > 0 ? Math.round((resumoCategorias.find((c)=>c.categoria === 'MAO_DE_OBRA')?.valor_total || 0) / custoTotal * 100 * 10) / 10 : 0,
        percentual_material: custoTotal > 0 ? Math.round((resumoCategorias.find((c)=>c.categoria === 'MATERIAL_CONSTRUCAO')?.valor_total || 0) / custoTotal * 100 * 10) / 10 : 0
      },
      debug: {
        versao: '9.0.1 - Interface CORRIGIDA',
        area_calculada: areaCalculada,
        estado_utilizado: estadoOrcamento,
        itens_gerados_contagem: itensDetalhados.length,
        itens_inseridos_contagem: itensInseridos,
        erro_insercao_itens: insertError,
        interface_corrigida_status: true
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('💥 Erro crítico na Edge Function ai-calculate-budget v9.0.1:', error);
    // Construir a resposta de erro
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Ocorreu um erro interno no servidor ao processar o orçamento.',
      debug: {
        versao: '9.0.1 - Interface CORRIGIDA',
        stack_trace: error?.stack // Incluir stack trace para debugging (cuidado em produção)
      }
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
