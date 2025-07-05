import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Configuração do Supabase usando as variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas.');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarDespesas() {
  try {
    console.log('🔍 Conectando ao banco de dados ObrasAI...');
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE DESPESAS E STATUS DE PAGAMENTO');
    console.log('='.repeat(80));

    // Consultar todas as despesas com informações das obras
    const { data: despesas, error } = await supabase
      .from('despesas')
      .select(`
        id,
        descricao,
        valor,
        data_despesa,
        categoria,
        etapa,
        fornecedor,
        tipo_despesa,
        created_at,
        obras!inner(
          id,
          nome
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao consultar despesas:', error.message);
      return;
    }

    if (!despesas || despesas.length === 0) {
      console.log('📝 Nenhuma despesa encontrada no banco de dados.');
      return;
    }

    console.log(`\n📈 Total de despesas encontradas: ${despesas.length}`);
    
    // Análise dos dados
    const totalValor = despesas.reduce((sum, despesa) => sum + (despesa.valor || 0), 0);
    const despesasPorCategoria = {};
    const despesasPorObra = {};
    const despesasPorTipo = {};

    despesas.forEach(despesa => {
      // Por categoria
      if (despesa.categoria) {
        despesasPorCategoria[despesa.categoria] = (despesasPorCategoria[despesa.categoria] || 0) + 1;
      }
      
      // Por obra
      const nomeObra = despesa.obras?.nome || 'Sem obra';
      if (!despesasPorObra[nomeObra]) {
        despesasPorObra[nomeObra] = { count: 0, valor: 0 };
      }
      despesasPorObra[nomeObra].count++;
      despesasPorObra[nomeObra].valor += (despesa.valor || 0);
      
      // Por tipo
      if (despesa.tipo_despesa) {
        despesasPorTipo[despesa.tipo_despesa] = (despesasPorTipo[despesa.tipo_despesa] || 0) + 1;
      }
    });

    // Exibir resumo financeiro
    console.log('\n💰 RESUMO FINANCEIRO:');
    console.log('-'.repeat(50));
    console.log(`💵 Valor total das despesas: R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`📊 Valor médio por despesa: R$ ${(totalValor / despesas.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    // Exibir despesas por obra
    console.log('\n🏗️ DESPESAS POR OBRA:');
    console.log('-'.repeat(50));
    Object.entries(despesasPorObra)
      .sort(([,a], [,b]) => b.valor - a.valor)
      .forEach(([obra, dados]) => {
        console.log(`📋 ${obra}: ${dados.count} despesas - R$ ${dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      });

    // Exibir despesas por categoria
    console.log('\n📂 DESPESAS POR CATEGORIA:');
    console.log('-'.repeat(50));
    Object.entries(despesasPorCategoria)
      .sort(([,a], [,b]) => b - a)
      .forEach(([categoria, count]) => {
        console.log(`📁 ${categoria}: ${count} despesas`);
      });

    // Exibir despesas por tipo
    if (Object.keys(despesasPorTipo).length > 0) {
      console.log('\n🏷️ DESPESAS POR TIPO:');
      console.log('-'.repeat(50));
      Object.entries(despesasPorTipo)
        .sort(([,a], [,b]) => b - a)
        .forEach(([tipo, count]) => {
          console.log(`🏷️ ${tipo}: ${count} despesas`);
        });
    }

    // Verificar se existem campos relacionados a pagamento
    console.log('\n💳 ANÁLISE DE CAMPOS DE PAGAMENTO:');
    console.log('-'.repeat(50));
    
    const primeirasDespesas = despesas.slice(0, 5);
    console.log('📋 Estrutura dos campos (primeiras 5 despesas):');
    
    primeirasDespesas.forEach((despesa, index) => {
      console.log(`\n${index + 1}. Despesa ID: ${despesa.id}`);
      console.log(`   📝 Descrição: ${despesa.descricao || 'N/A'}`);
      console.log(`   💰 Valor: R$ ${(despesa.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`   📅 Data: ${despesa.data_despesa || 'N/A'}`);
      console.log(`   📂 Categoria: ${despesa.categoria || 'N/A'}`);
      console.log(`   🏗️ Obra: ${despesa.obras?.nome || 'N/A'}`);
      console.log(`   🏷️ Tipo: ${despesa.tipo_despesa || 'N/A'}`);
      console.log(`   👤 Fornecedor: ${despesa.fornecedor || 'N/A'}`);
      
      // Verificar todos os campos disponíveis
      const camposDisponiveis = Object.keys(despesa).filter(key => key !== 'obras');
      console.log(`   🔍 Campos disponíveis: ${camposDisponiveis.join(', ')}`);
    });

    // Verificar se há campos de pagamento na estrutura
    const camposPagamento = ['pago', 'status_pagamento', 'forma_pagamento', 'data_pagamento'];
    const camposEncontrados = [];
    
    if (despesas.length > 0) {
      const primeiraDespesa = despesas[0];
      camposPagamento.forEach(campo => {
        if (primeiraDespesa.hasOwnProperty(campo)) {
          camposEncontrados.push(campo);
        }
      });
    }

    console.log('\n🔍 CAMPOS DE PAGAMENTO DETECTADOS:');
    console.log('-'.repeat(50));
    if (camposEncontrados.length > 0) {
      console.log(`✅ Campos encontrados: ${camposEncontrados.join(', ')}`);
      
      // Analisar status de pagamento se existir
      if (camposEncontrados.includes('pago')) {
        const despesasPagas = despesas.filter(d => d.pago === true).length;
        const despesasPendentes = despesas.filter(d => d.pago === false || d.pago === null).length;
        
        console.log(`\n💳 STATUS DE PAGAMENTO:`);
        console.log(`✅ Despesas pagas: ${despesasPagas}`);
        console.log(`⏳ Despesas pendentes: ${despesasPendentes}`);
        
        const valorPago = despesas
          .filter(d => d.pago === true)
          .reduce((sum, d) => sum + (d.valor || 0), 0);
        const valorPendente = despesas
          .filter(d => d.pago === false || d.pago === null)
          .reduce((sum, d) => sum + (d.valor || 0), 0);
          
        console.log(`💰 Valor pago: R$ ${valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        console.log(`⏳ Valor pendente: R$ ${valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }
    } else {
      console.log('❌ Nenhum campo de pagamento encontrado na estrutura atual.');
      console.log('💡 Recomendação: Adicionar campos como "pago", "data_pagamento", "forma_pagamento" à tabela despesas.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Consulta concluída com sucesso!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Erro durante a consulta:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executar a consulta
consultarDespesas();