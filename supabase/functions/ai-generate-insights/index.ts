import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { obra_id, insight_types = ['RISK_PREDICTION', 'COST_OPTIMIZATION'] } = await req.json();

    // Verificar se o ID da obra foi fornecido
    if (!obra_id) {
      return new Response(
        JSON.stringify({ error: 'ID da obra é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados da obra para gerar insights
    const { data: obraData, error: obraError } = await supabase
      .from('obras')
      .select('*')
      .eq('id', obra_id)
      .single();

    if (obraError) throw obraError;

    // Buscar despesas relacionadas à obra
    const { data: despesasData, error: despesasError } = await supabase
      .from('despesas')
      .select('*')
      .eq('obra_id', obra_id);

    if (despesasError) throw despesasError;

    // Buscar notas fiscais relacionadas à obra
    const { data: notasData, error: notasError } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('obra_id', obra_id);

    if (notasError) throw notasError;

    // Gerar insights baseados em dados reais
    const insights = [];
    
    if (insight_types.includes('RISK_PREDICTION')) {
      // Análise de risco baseada em dados reais
      const totalDespesas = despesasData?.reduce((sum, d) => sum + (d.custo || 0), 0) || 0;
      const orcamento = obraData.orcamento || 0;
      const percentualGasto = orcamento > 0 ? (totalDespesas / orcamento) * 100 : 0;
      
      // Calcular dias desde o início
      const diasDecorridos = obraData.data_inicio 
        ? Math.floor((Date.now() - new Date(obraData.data_inicio).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      // Calcular dias até o prazo
      const diasRestantes = obraData.data_prevista_termino
        ? Math.floor((new Date(obraData.data_prevista_termino).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      
      let riscoNivel = 'baixo';
      let detalhe = 'A obra está dentro dos parâmetros normais.';
      let recomendacao = 'Continue monitorando o progresso regularmente.';
      
      // Análise de risco baseada em percentual gasto vs tempo decorrido
      if (percentualGasto > 80) {
        riscoNivel = 'alto';
        detalhe = `Já foram gastos ${percentualGasto.toFixed(1)}% do orçamento total.`;
        recomendacao = 'Revise urgentemente os custos e considere renegociar contratos.';
      } else if (percentualGasto > 60) {
        riscoNivel = 'médio';
        detalhe = `${percentualGasto.toFixed(1)}% do orçamento já foi utilizado.`;
        recomendacao = 'Monitore de perto os próximos gastos e otimize onde possível.';
      }
      
      // Análise de prazo
      if (diasRestantes !== null && diasRestantes < 30 && percentualGasto < 70) {
        riscoNivel = 'alto';
        detalhe += ` Restam apenas ${diasRestantes} dias para conclusão.`;
        recomendacao = 'Acelere o cronograma e considere recursos adicionais.';
      }
      
      insights.push({
        obra_id,
        insight_type: 'RISK_PREDICTION',
        insight_data: {
          risco_nivel: riscoNivel,
          percentual_gasto: percentualGasto,
          dias_decorridos: diasDecorridos,
          dias_restantes: diasRestantes,
          detalhe,
          recomendacao
        },
        summary_ptbr: `Risco ${riscoNivel} identificado - ${percentualGasto.toFixed(1)}% do orçamento utilizado.`,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
    
    if (insight_types.includes('COST_OPTIMIZATION')) {
      // Análise de otimização de custos baseada em dados reais
      const totalDespesas = despesasData?.reduce((sum, d) => sum + (d.custo || 0), 0) || 0;
      const despesasPorCategoria = {};
      
      // Agrupar despesas por categoria
      despesasData?.forEach(despesa => {
        const categoria = despesa.categoria || 'OUTROS';
        if (!despesasPorCategoria[categoria]) {
          despesasPorCategoria[categoria] = { total: 0, count: 0 };
        }
        despesasPorCategoria[categoria].total += despesa.custo || 0;
        despesasPorCategoria[categoria].count += 1;
      });
      
      // Encontrar categoria com maior gasto
      let categoriaMaiorGasto = null;
      let maiorGasto = 0;
      
      Object.entries(despesasPorCategoria).forEach(([categoria, dados]) => {
        if (dados.total > maiorGasto) {
          maiorGasto = dados.total;
          categoriaMaiorGasto = categoria;
        }
      });
      
      // Calcular economia potencial (5% do total de despesas)
      const economiaPotencial = totalDespesas * 0.05;
      
      let detalhe = 'Análise de despesas concluída.';
      let recomendacao = 'Continue monitorando os gastos.';
      
      if (categoriaMaiorGasto && maiorGasto > 0) {
        const percentualCategoria = (maiorGasto / totalDespesas) * 100;
        detalhe = `A categoria "${categoriaMaiorGasto}" representa ${percentualCategoria.toFixed(1)}% dos gastos (R$ ${maiorGasto.toLocaleString('pt-BR')}).`;
        recomendacao = `Foque na otimização da categoria "${categoriaMaiorGasto}". Considere negociar melhores preços ou buscar fornecedores alternativos.`;
      }
      
      insights.push({
        obra_id,
        insight_type: 'COST_OPTIMIZATION',
        insight_data: {
          economia_potencial: economiaPotencial,
          categoria_maior_gasto: categoriaMaiorGasto,
          valor_maior_categoria: maiorGasto,
          total_despesas: totalDespesas,
          categorias_analisadas: Object.keys(despesasPorCategoria).length,
          detalhe,
          recomendacao
        },
        summary_ptbr: `Economia potencial de R$ ${economiaPotencial.toLocaleString('pt-BR')} identificada.`,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    // Inserir os insights no banco de dados
    const { data: insertedInsights, error: insertError } = await supabase
      .from('ai_insights')
      .insert(insights)
      .select('*');

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ results: insertedInsights }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
