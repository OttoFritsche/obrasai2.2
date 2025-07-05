// Script para consultar todas as despesas e seus status de pagamento
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://anrphijuostbgbscxmzx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Chave do Supabase não encontrada. Configure VITE_SUPABASE_ANON_KEY ou SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarDespesas() {
  try {
    console.log('🔍 Consultando todas as despesas no banco de dados...');
    
    // Buscar todas as despesas com informações da obra
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
        created_at,
        obras!inner(
          nome
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao consultar despesas:', error);
      return;
    }

    if (!despesas || despesas.length === 0) {
      console.log('📋 Nenhuma despesa encontrada no banco de dados.');
      return;
    }

    console.log(`\n📊 Total de despesas encontradas: ${despesas.length}`);
    console.log('\n' + '='.repeat(80));
    console.log('📋 RELATÓRIO DE DESPESAS E STATUS DE PAGAMENTO');
    console.log('='.repeat(80));

    // Analisar campos disponíveis na primeira despesa
    const primeiraDepesa = despesas[0];
    console.log('\n🔍 Campos disponíveis na tabela despesas:');
    console.log(Object.keys(primeiraDepesa).join(', '));

    // Verificar se existem campos relacionados ao pagamento
    const camposPagamento = Object.keys(primeiraDepesa).filter(campo => 
      campo.toLowerCase().includes('pago') || 
      campo.toLowerCase().includes('pagamento') || 
      campo.toLowerCase().includes('status')
    );

    console.log('\n💰 Campos relacionados ao pagamento encontrados:');
    if (camposPagamento.length > 0) {
      console.log(camposPagamento.join(', '));
    } else {
      console.log('❌ Nenhum campo específico de status de pagamento encontrado na estrutura atual.');
    }

    // Exibir resumo das despesas
    let valorTotal = 0;
    const resumoPorObra = {};
    const resumoPorCategoria = {};

    despesas.forEach((despesa, index) => {
      const valor = despesa.valor || 0;
      valorTotal += valor;
      
      // Resumo por obra
      const nomeObra = despesa.obras?.nome || 'Obra não identificada';
      if (!resumoPorObra[nomeObra]) {
        resumoPorObra[nomeObra] = { count: 0, valor: 0 };
      }
      resumoPorObra[nomeObra].count++;
      resumoPorObra[nomeObra].valor += valor;
      
      // Resumo por categoria
      const categoria = despesa.categoria || 'Sem categoria';
      if (!resumoPorCategoria[categoria]) {
        resumoPorCategoria[categoria] = { count: 0, valor: 0 };
      }
      resumoPorCategoria[categoria].count++;
      resumoPorCategoria[categoria].valor += valor;

      // Exibir primeiras 10 despesas como exemplo
      if (index < 10) {
        console.log(`\n📄 Despesa ${index + 1}:`);
        console.log(`   ID: ${despesa.id}`);
        console.log(`   Descrição: ${despesa.descricao || 'N/A'}`);
        console.log(`   Valor: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        console.log(`   Data: ${new Date(despesa.data_despesa).toLocaleDateString('pt-BR')}`);
        console.log(`   Obra: ${nomeObra}`);
        console.log(`   Categoria: ${categoria}`);
        console.log(`   Etapa: ${despesa.etapa || 'N/A'}`);
        console.log(`   Fornecedor: ${despesa.fornecedor || 'N/A'}`);
        
        // Verificar campos de pagamento se existirem
        camposPagamento.forEach(campo => {
          console.log(`   ${campo}: ${despesa[campo] || 'N/A'}`);
        });
      }
    });

    if (despesas.length > 10) {
      console.log(`\n... e mais ${despesas.length - 10} despesas.`);
    }

    // Exibir resumos
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO FINANCEIRO');
    console.log('='.repeat(50));
    console.log(`💰 Valor total de todas as despesas: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    console.log('\n📋 Resumo por Obra:');
    Object.entries(resumoPorObra).forEach(([obra, dados]) => {
      console.log(`   ${obra}: ${dados.count} despesas - R$ ${dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    });

    console.log('\n🏷️ Resumo por Categoria:');
    Object.entries(resumoPorCategoria).forEach(([categoria, dados]) => {
      console.log(`   ${categoria}: ${dados.count} despesas - R$ ${dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    });

    // Observação sobre status de pagamento
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  OBSERVAÇÃO SOBRE STATUS DE PAGAMENTO');
    console.log('='.repeat(80));
    
    if (camposPagamento.length === 0) {
      console.log('❌ A estrutura atual da tabela "despesas" não possui campos específicos');
      console.log('   para controle de status de pagamento (como "pago", "data_pagamento", etc.).');
      console.log('\n💡 Recomendações:');
      console.log('   1. Adicionar campo "pago" (boolean) para indicar se foi paga');
      console.log('   2. Adicionar campo "data_pagamento" (date) para registrar quando foi paga');
      console.log('   3. Adicionar campo "forma_pagamento" (enum) para o método de pagamento');
      console.log('   4. Considerar campo "status_pagamento" (enum) para estados como PENDENTE/PAGO/CANCELADO');
    } else {
      console.log('✅ Campos de pagamento encontrados na estrutura da tabela.');
      console.log('   Verifique os valores exibidos acima para cada despesa.');
    }

  } catch (error) {
    console.error('❌ Erro durante a consulta:', error);
  }
}

// Executar a consulta
consultarDespesas();