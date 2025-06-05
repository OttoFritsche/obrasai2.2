import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// Interfaces para os dados dos relatórios
interface Obra {
  id: string;
  nome: string;
  orcamento: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

interface Despesa {
  id: string;
  descricao: string;
  custo: number;
  data_despesa: string;
  categoria: string;
  status: string;
  obras?: { nome: string };
  [key: string]: unknown;
}

interface NotaFiscal {
  id: string;
  numero: string;
  valor_total: number;
  data_emissao: string;
  arquivo_url?: string;
  [key: string]: unknown;
}

interface Fornecedor {
  id: string;
  nome: string;
  tipo: string;
  [key: string]: unknown;
}

interface FiltrosRelatorio {
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  obra_id?: string;
  categoria?: string;
  [key: string]: unknown;
}

interface RelatorioData {
  titulo: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  estatisticas: Record<string, number | string>;
  [key: string]: unknown;
}

interface PDFDocument {
  text: (text: string, x?: number, y?: number) => PDFDocument;
  fontSize: (size: number) => PDFDocument;
  font: (font: string) => PDFDocument;
  addPage: () => PDFDocument;
  save: () => Uint8Array;
  [key: string]: unknown;
}

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
    const { 
      tipo_relatorio, 
      filtros, 
      formato = 'pdf' 
    } = await req.json();

    // Obter o usuário autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Obter dados do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter perfil do usuário para tenant_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar perfil do usuário' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar relatório baseado no tipo
    let relatorioData;
    switch (tipo_relatorio) {
      case 'obras_resumo':
        relatorioData = await gerarRelatorioObras(supabase, profile.tenant_id, filtros);
        break;
      case 'despesas_detalhado':
        relatorioData = await gerarRelatorioDespesas(supabase, profile.tenant_id, filtros);
        break;
      case 'notas_fiscais':
        relatorioData = await gerarRelatorioNotasFiscais(supabase, profile.tenant_id, filtros);
        break;
      case 'fornecedores':
        relatorioData = await gerarRelatorioFornecedores(supabase, profile.tenant_id, filtros);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Tipo de relatório não suportado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (formato === 'json') {
      return new Response(
        JSON.stringify({ data: relatorioData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar PDF
    const pdfBuffer = await gerarPDF(relatorioData, tipo_relatorio);

    return new Response(
      pdfBuffer,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${tipo_relatorio}_${new Date().toISOString().slice(0, 10)}.pdf"`,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Função para gerar relatório de obras
async function gerarRelatorioObras(supabase: SupabaseClient, tenantId: string, filtros: FiltrosRelatorio): Promise<RelatorioData> {
  let query = supabase
    .from('obras')
    .select('*')
    .eq('tenant_id', tenantId);

  // Aplicar filtros
  if (filtros?.data_inicio) {
    query = query.gte('created_at', filtros.data_inicio);
  }
  if (filtros?.data_fim) {
    query = query.lte('created_at', filtros.data_fim);
  }
  if (filtros?.status) {
    query = query.eq('status', filtros.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  // Calcular estatísticas
  const totalObras = data?.length || 0;
  const orcamentoTotal = data?.reduce((sum: number, obra: Obra) => sum + (obra.orcamento || 0), 0) || 0;
  const obrasConcluidas = data?.filter((obra: Obra) => obra.status === 'concluida').length || 0;

  return {
    titulo: 'Relatório de Obras',
    periodo: {
      inicio: filtros?.data_inicio || 'Início',
      fim: filtros?.data_fim || 'Atual'
    },
    estatisticas: {
      total_obras: totalObras,
      orcamento_total: orcamentoTotal,
      obras_concluidas: obrasConcluidas,
      taxa_conclusao: totalObras > 0 ? (obrasConcluidas / totalObras * 100).toFixed(1) : '0'
    },
    obras: data || []
  };
}

// Função para gerar relatório de despesas
async function gerarRelatorioDespesas(supabase: SupabaseClient, tenantId: string, filtros: FiltrosRelatorio): Promise<RelatorioData> {
  let query = supabase
    .from('despesas')
    .select(`
      *,
      obras(nome)
    `)
    .eq('tenant_id', tenantId);

  // Aplicar filtros
  if (filtros?.obra_id) {
    query = query.eq('obra_id', filtros.obra_id);
  }
  if (filtros?.categoria) {
    query = query.eq('categoria', filtros.categoria);
  }
  if (filtros?.data_inicio) {
    query = query.gte('data_despesa', filtros.data_inicio);
  }
  if (filtros?.data_fim) {
    query = query.lte('data_despesa', filtros.data_fim);
  }

  const { data, error } = await query.order('data_despesa', { ascending: false });

  if (error) throw error;

  // Calcular estatísticas
  const totalDespesas = data?.length || 0;
  const valorTotal = data?.reduce((sum: number, despesa: Despesa) => sum + (despesa.custo || 0), 0) || 0;
  const despesasPagas = data?.filter((despesa: Despesa) => despesa.status === 'pago').length || 0;

  return {
    titulo: 'Relatório de Despesas',
    periodo: {
      inicio: filtros?.data_inicio || 'Início',
      fim: filtros?.data_fim || 'Atual'
    },
    estatisticas: {
      total_despesas: totalDespesas,
      valor_total: valorTotal,
      despesas_pagas: despesasPagas,
      percentual_pago: totalDespesas > 0 ? (despesasPagas / totalDespesas * 100).toFixed(1) : '0'
    },
    despesas: data || []
  };
}

// Função para gerar relatório de notas fiscais
async function gerarRelatorioNotasFiscais(supabase: SupabaseClient, tenantId: string, filtros: FiltrosRelatorio): Promise<RelatorioData> {
  let query = supabase
    .from('notas_fiscais')
    .select(`
      *,
      obras(nome)
    `)
    .eq('tenant_id', tenantId);

  // Aplicar filtros
  if (filtros?.obra_id) {
    query = query.eq('obra_id', filtros.obra_id);
  }
  if (filtros?.data_inicio) {
    query = query.gte('data_emissao', filtros.data_inicio);
  }
  if (filtros?.data_fim) {
    query = query.lte('data_emissao', filtros.data_fim);
  }

  const { data, error } = await query.order('data_emissao', { ascending: false });

  if (error) throw error;

  // Calcular estatísticas
  const totalNotas = data?.length || 0;
  const valorTotal = data?.reduce((sum: number, nota: NotaFiscal) => sum + (nota.valor_total || 0), 0) || 0;
  const notasComArquivo = data?.filter((nota: NotaFiscal) => nota.arquivo_url).length || 0;

  return {
    titulo: 'Relatório de Notas Fiscais',
    periodo: {
      inicio: filtros?.data_inicio || 'Início',
      fim: filtros?.data_fim || 'Atual'
    },
    estatisticas: {
      total_notas: totalNotas,
      valor_total: valorTotal,
      notas_com_arquivo: notasComArquivo,
      taxa_arquivo: totalNotas > 0 ? (notasComArquivo / totalNotas * 100).toFixed(1) : '0'
    },
    notas: data || []
  };
}

// Função para gerar relatório de fornecedores
async function gerarRelatorioFornecedores(supabase: SupabaseClient, tenantId: string, filtros: FiltrosRelatorio): Promise<RelatorioData> {
  // Buscar fornecedores PJ
  const { data: fornecedoresPJ, error: errorPJ } = await supabase
    .from('fornecedores_pj')
    .select('*')
    .eq('tenant_id', tenantId);

  // Buscar fornecedores PF
  const { data: fornecedoresPF, error: errorPF } = await supabase
    .from('fornecedores_pf')
    .select('*')
    .eq('tenant_id', tenantId);

  if (errorPJ || errorPF) {
    throw new Error('Erro ao buscar fornecedores');
  }

  const totalPJ = fornecedoresPJ?.length || 0;
  const totalPF = fornecedoresPF?.length || 0;

  return {
    titulo: 'Relatório de Fornecedores',
    estatisticas: {
      total_pj: totalPJ,
      total_pf: totalPF,
      total_geral: totalPJ + totalPF
    },
    fornecedores_pj: fornecedoresPJ || [],
    fornecedores_pf: fornecedoresPF || []
  };
}

// Função principal para gerar PDF
async function gerarPDF(data: RelatorioData, tipo: string): Promise<Uint8Array> {
  // Import jsPDF dinamicamente
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
  
  const doc = new jsPDF();
  
  // Configurações do PDF
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  
  // Título
  doc.text(data.titulo, 20, 20);
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
  
  let yPosition = 50;
  
  // Estatísticas
  if (data.estatisticas) {
    doc.setFontSize(12);
    doc.text('Estatísticas:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    Object.entries(data.estatisticas).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').toUpperCase();
      doc.text(`${label}: ${value}`, 25, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
  }
  
  // Dados específicos por tipo
  switch (tipo) {
    case 'obras_resumo':
      yPosition = adicionarTabelaObras(doc, data.obras, yPosition);
      break;
    case 'despesas_detalhado':
      yPosition = adicionarTabelaDespesas(doc, data.despesas, yPosition);
      break;
    // Adicionar outros tipos conforme necessário
  }
  
  return doc.output('arraybuffer');
}

// Função auxiliar para adicionar tabela de obras
function adicionarTabelaObras(doc: PDFDocument, obras: Obra[], yPosition: number): number {
  doc.setFontSize(12);
  doc.text('Lista de Obras:', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(8);
  
  // Cabeçalho da tabela
  doc.text('Nome', 20, yPosition);
  doc.text('Orçamento', 80, yPosition);
  doc.text('Data Início', 130, yPosition);
  doc.text('Status', 170, yPosition);
  yPosition += 8;
  
  // Linha separadora
  doc.line(20, yPosition - 2, 190, yPosition - 2);
  
  // Dados das obras
  obras.forEach((obra, index) => {
    if (yPosition > 270) { // Nova página se necessário
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(obra.nome || '', 20, yPosition);
    doc.text(`R$ ${(obra.orcamento || 0).toLocaleString('pt-BR')}`, 80, yPosition);
    doc.text(obra.created_at ? new Date(obra.created_at).toLocaleDateString('pt-BR') : '-', 130, yPosition);
    doc.text(obra.status || 'Em andamento', 170, yPosition);
    yPosition += 8;
  });
  
  return yPosition;
}

// Função auxiliar para adicionar tabela de despesas
function adicionarTabelaDespesas(doc: PDFDocument, despesas: Despesa[], yPosition: number): number {
  doc.setFontSize(12);
  doc.text('Lista de Despesas:', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(8);
  
  // Cabeçalho da tabela
  doc.text('Descrição', 20, yPosition);
  doc.text('Categoria', 80, yPosition);
  doc.text('Valor', 120, yPosition);
  doc.text('Data', 150, yPosition);
  doc.text('Status', 180, yPosition);
  yPosition += 8;
  
  // Linha separadora
  doc.line(20, yPosition - 2, 190, yPosition - 2);
  
  // Dados das despesas
  despesas.forEach((despesa, index) => {
    if (yPosition > 270) { // Nova página se necessário
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(despesa.descricao || '', 20, yPosition);
    doc.text(despesa.categoria || '', 80, yPosition);
    doc.text(`R$ ${(despesa.custo || 0).toLocaleString('pt-BR')}`, 120, yPosition);
    doc.text(despesa.data_despesa ? new Date(despesa.data_despesa).toLocaleDateString('pt-BR') : '-', 150, yPosition);
    doc.text(despesa.status || 'Pendente', 180, yPosition);
    yPosition += 8;
  });
  
  return yPosition;
} 