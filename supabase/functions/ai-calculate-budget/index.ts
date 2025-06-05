    /**
     * 🧮 Edge Function: AI Calculate Budget v5.0.0 - DADOS CENTRALIZADOS
     * 
     * Versão otimizada que utiliza a tabela centralizada sinapi_dados_oficiais
     * para cálculos de orçamento mais rápidos e consistentes.
     * 
     * @author ObrasAI Team
     * @version 5.0.0 - DADOS CENTRALIZADOS
     */

    declare global {
      const Deno: {
        env: {
          get(key: string): string | undefined;
        };
      };
    }

    // @ts-ignore - Deno module resolution
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
    // @ts-ignore - Deno module resolution
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

    // ====================================
    // 🎯 TIPOS E INTERFACES
    // ====================================

    interface CalculoBudgetRequest {
      orcamento_id: string;
      forcar_recalculo?: boolean;
    }

    interface CalculoBudgetResponse {
      success: boolean;
      orcamento?: any;
      error?: string;
      debug_info?: any;
    }

    // ====================================
    // 🌐 CORS HEADERS - CONFIGURAÇÃO CORRETA
    // ====================================

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 
        'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
    };

    // ====================================
    // 🚀 FUNÇÃO PRINCIPAL
    // ====================================

    serve(async (req: Request) => {
      // Handle CORS preflight requests
      if (req.method === 'OPTIONS') {
        return new Response('ok', {
          headers: corsHeaders
        });
      }

      try {
        console.log('🎯 Edge Function v5.0.0 iniciada - DADOS CENTRALIZADOS');
        
        // Verificar método HTTP
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Método não permitido. Use POST.' 
            }),
            {
              status: 405,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Parse do body da requisição
        const body = await req.json();
        const { orcamento_id, forcar_recalculo = false } = body as CalculoBudgetRequest;

        if (!orcamento_id) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'orcamento_id é obrigatório' 
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        // Inicializar cliente Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log(`📋 Processando orçamento: ${orcamento_id}`);

        // Buscar dados do orçamento
        const { data: orcamento, error: orcamentoError } = await supabase
          .from('orcamentos_parametricos')
          .select(`
            *,
            obras!inner(*)
          `)
          .eq('id', orcamento_id)
          .single();

        if (orcamentoError || !orcamento) {
          console.error('❌ Orçamento não encontrado:', orcamentoError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Orçamento não encontrado' 
            }),
            {
              status: 404,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }

        console.log('✅ Orçamento encontrado:', orcamento.nome_orcamento);

        // ====================================
        // 🎯 USAR DADOS CENTRALIZADOS
        // ====================================\
        
        console.log('🔍 Consultando tabela centralizada sinapi_dados_oficiais...');
        
        // Buscar dados SINAPI centralizados para o estado da obra
        const { data: dadosSinapi, error: sinapiError } = await supabase
          .from('sinapi_dados_oficiais')
          .select('*')
          .eq('estado', orcamento.estado)
          .eq('ativo', true)
          .limit(1000); // Limitar para evitar sobrecarga

        if (sinapiError) {
          console.error('❌ Erro ao buscar dados SINAPI:', sinapiError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Erro ao buscar dados SINAPI centralizados' 
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

        console.log(`✅ ${dadosSinapi?.length || 0} itens SINAPI encontrados para ${orcamento.estado}`);

        // ====================================
        // 🧮 CÁLCULO COM INSERÇÃO DE ITENS
        // ====================================
        
        console.log('📋 Gerando itens do orçamento...');
        
        // Limpar itens existentes se forçar recálculo
        if (forcar_recalculo) {
          const { error: deleteError } = await supabase
            .from('itens_orcamento')
            .delete()
            .eq('orcamento_id', orcamento_id);
            
          if (deleteError) {
            console.warn('⚠️ Aviso ao limpar itens existentes:', deleteError);
          }
        }

        // Verificar se já existem itens
        const { data: itensExistentes, error: checkError } = await supabase
          .from('itens_orcamento')
          .select('id')
          .eq('orcamento_id', orcamento_id)
          .limit(1);

        if (checkError) {
          console.error('❌ Erro ao verificar itens existentes:', checkError);
        }

        let custoEstimado = 0;
        let itensInseridos = 0;

        if (!itensExistentes?.length || forcar_recalculo) {
          // Calcular coeficientes técnicos por área
          const area = parseFloat(orcamento.area_total) || 100;
          
          const coeficientes = {
            // Estrutura
            concreto: area * 0.12, // m³
            aco: area * 7.5, // kg
            forma: area * 0.8, // m²
            
            // Alvenaria
            bloco: area * 22, // un
            argamassa: area * 0.05, // m³
            
            // Revestimentos  
            ceramica: area * 1.05, // m²
            massa_corrida: area * 2.1, // m²
            tinta: area * 0.3, // l
            
            // Cobertura
            telha: area * 1.15, // m²
            madeira: area * 0.08, // m³
            
            // Instalações
            tubo_pvc: area * 0.5, // m
            fio_eletrico: area * 15, // m
            
            // Esquadrias
            porta: Math.ceil(area / 15), // un
            janela: Math.ceil(area / 20) // un
          };

          const itensParaInserir = [];

          // Processar dados SINAPI encontrados
          for (const dado of dadosSinapi?.slice(0, 50) || []) {
            try {
              const descricao = dado.descricao_insumo?.toLowerCase() || '';
              let quantidade = 0;
              let categoria = 'MATERIAL';
              let etapa = 'ESTRUTURA';

              // Mapear quantidade baseado na descrição
              if (descricao.includes('concreto') || descricao.includes('concrete')) {
                quantidade = coeficientes.concreto;
                categoria = 'MATERIAL';
                etapa = 'ESTRUTURA';
              } else if (descricao.includes('aço') || descricao.includes('ferro') || descricao.includes('ca-50')) {
                quantidade = coeficientes.aco;
                categoria = 'MATERIAL';
                etapa = 'ESTRUTURA';
              } else if (descricao.includes('bloco') || descricao.includes('tijolo')) {
                quantidade = coeficientes.bloco;
                categoria = 'MATERIAL';
                etapa = 'ALVENARIA';
              } else if (descricao.includes('telha') || descricao.includes('cobertura')) {
                quantidade = coeficientes.telha;
                categoria = 'MATERIAL';
                etapa = 'COBERTURA';
              } else if (descricao.includes('cerâmica') || descricao.includes('ceramica') || descricao.includes('piso')) {
                quantidade = coeficientes.ceramica;
                categoria = 'MATERIAL';
                etapa = 'ACABAMENTO';
              } else if (descricao.includes('tinta') || descricao.includes('pintura')) {
                quantidade = coeficientes.tinta;
                categoria = 'MATERIAL';
                etapa = 'ACABAMENTO';
              } else if (descricao.includes('tubo') || descricao.includes('pvc')) {
                quantidade = coeficientes.tubo_pvc;
                categoria = 'MATERIAL';
                etapa = 'INSTALACOES';
              } else if (descricao.includes('fio') || descricao.includes('cabo') || descricao.includes('elétrico')) {
                quantidade = coeficientes.fio_eletrico;
                categoria = 'MATERIAL';
                etapa = 'INSTALACOES';
              } else if (descricao.includes('porta')) {
                quantidade = coeficientes.porta;
                categoria = 'MATERIAL';
                etapa = 'ESQUADRIAS';
              } else if (descricao.includes('janela')) {
                quantidade = coeficientes.janela;
                categoria = 'MATERIAL';
                etapa = 'ESQUADRIAS';
              } else if (descricao.includes('pedreiro') || descricao.includes('servente') || descricao.includes('mão')) {
                quantidade = area * 0.5; // horas
                categoria = 'MAO_OBRA';
                etapa = 'EXECUCAO';
              } else {
                // Item genérico
                quantidade = area * 0.02;
                categoria = 'MATERIAL';
                etapa = 'DIVERSOS';
              }

              if (quantidade > 0 && dado.preco_unitario > 0) {
                const valorTotal = quantidade * dado.preco_unitario;
                custoEstimado += valorTotal;

                const item = {
                  orcamento_id: orcamento_id,
                  categoria: categoria,
                  etapa: etapa,
                  insumo: dado.descricao_insumo.substring(0, 200),
                  quantidade_estimada: Math.round(quantidade * 100) / 100,
                  unidade_medida: dado.unidade_medida || 'UN',
                  valor_unitario_base: dado.preco_unitario,
                  valor_total_estimado: Math.round(valorTotal * 100) / 100,
                  fonte_preco: 'SINAPI_DADOS_OFICIAIS',
                  codigo_sinapi: dado.codigo_sinapi,
                  estado_referencia_preco: orcamento.estado,
                  usa_preco_sinapi: true,
                  observacoes: `v5.0.0 - ${dado.tipo_insumo} - ${dado.categoria}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };

                itensParaInserir.push(item);
              }
            } catch (itemError) {
              console.warn('⚠️ Erro ao processar item:', itemError, dado.codigo_sinapi);
            }
          }

          // Inserir itens no banco
          if (itensParaInserir.length > 0) {
            console.log(`💾 Inserindo ${itensParaInserir.length} itens...`);
            
            const { data: itensInseridosData, error: insertError } = await supabase
              .from('itens_orcamento')
              .insert(itensParaInserir)
              .select('id');

            if (insertError) {
              console.error('❌ Erro ao inserir itens:', insertError);
              // Não falhar completamente, usar cálculo básico
              custoEstimado = orcamento.area_total * 1200;
            } else {
              itensInseridos = itensInseridosData?.length || 0;
              console.log(`✅ ${itensInseridos} itens inseridos com sucesso`);
            }
          } else {
            console.warn('⚠️ Nenhum item válido para inserir, usando cálculo básico');
            custoEstimado = orcamento.area_total * 1200;
          }
        } else {
          // Recalcular custo dos itens existentes
          const { data: itensSomados, error: sumError } = await supabase
            .from('itens_orcamento')
            .select('valor_total_estimado')
            .eq('orcamento_id', orcamento_id);

          if (!sumError && itensSomados) {
            custoEstimado = itensSomados.reduce((total: number, item: { valor_total_estimado?: number }) => total + (item.valor_total_estimado || 0), 0);
            itensInseridos = itensSomados.length;
            console.log(`✅ Custo recalculado de ${itensInseridos} itens existentes: R$ ${custoEstimado}`);
          }
        }

        const custoM2 = custoEstimado / (orcamento.area_total || 1);
        
        console.log(`💰 Cálculo final: R$ ${custoEstimado} (R$ ${custoM2}/m²) com ${itensInseridos} itens`);

        // Atualizar orçamento no banco
        const { error: updateError } = await supabase
          .from('orcamentos_parametricos')
          .update({
            custo_estimado: custoEstimado,
            custo_m2: custoM2,
            data_calculo: new Date().toISOString(),
            status: 'CONCLUIDO',
            updated_at: new Date().toISOString()
          })
          .eq('id', orcamento_id);

        if (updateError) {
          console.error('❌ Erro ao atualizar orçamento:', updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Erro ao salvar orçamento calculado' 
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

        console.log('✅ Orçamento atualizado com sucesso!');

        // ====================================
        // 📤 RESPOSTA DE SUCESSO
        // ====================================
        
        const response: CalculoBudgetResponse = {
          success: true,
          orcamento: {
            id: orcamento_id,
            custo_estimado: custoEstimado,
            custo_m2: custoM2,
            area_total: orcamento.area_total,
            estado: orcamento.estado,
            dados_sinapi_utilizados: dadosSinapi?.length || 0,
            itens_inseridos: itensInseridos
          },
          debug_info: {
            version: '5.0.0',
            fonte_dados: 'sinapi_dados_oficiais',
            timestamp: new Date().toISOString(),
            itens_processados: itensInseridos
          }
        };

        return new Response(
          JSON.stringify(response),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );

      } catch (error) {
        console.error('❌ Erro interno na Edge Function v5.0.0:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: errorMessage,
            debug_info: {
              version: '5.0.0',
              timestamp: new Date().toISOString()
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