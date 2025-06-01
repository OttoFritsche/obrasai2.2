
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

    // TODO: Integrar com serviço de análise AI (Python API ou outro) para gerar insights
    // Aqui é onde você faria a chamada para o serviço de IA

    // Por enquanto, vamos gerar insights mock
    const mockInsights = [];
    
    if (insight_types.includes('RISK_PREDICTION')) {
      mockInsights.push({
        obra_id,
        insight_type: 'RISK_PREDICTION',
        insight_data: {
          risco_nivel: 'médio',
          detalhe: 'Baseado na análise do cronograma, identificamos que há 30% de chance de atraso.',
          recomendacao: 'Recomendamos revisar o cronograma e alocar recursos adicionais para tarefas críticas.'
        },
        summary_ptbr: 'Possível risco de atraso no cronograma desta obra.',
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
    
    if (insight_types.includes('COST_OPTIMIZATION')) {
      mockInsights.push({
        obra_id,
        insight_type: 'COST_OPTIMIZATION',
        insight_data: {
          economia_potencial: despesasData && despesasData.length > 0 ? despesasData.reduce((sum, d) => sum + (d.custo || 0), 0) * 0.05 : 1000,
          detalhe: 'Análise de despesas identificou possibilidade de otimização na compra de materiais.',
          recomendacao: 'Considere negociar com outros fornecedores ou comprar materiais em maior quantidade.'
        },
        summary_ptbr: 'Oportunidade de economia em compras de materiais identificada.',
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    // Inserir os insights no banco de dados
    const { data: insertedInsights, error: insertError } = await supabase
      .from('ai_insights')
      .insert(mockInsights)
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
