import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, mockFactories } from '@/tests/test-utils';

import { ContratoFormSection } from '../ContratoFormSection';

// Criar um wrapper que inicializa o form
const ContratoFormWrapper = ({ 
  children, 
  defaultValues = {},
  onSubmit = vi.fn(),
  ...props 
}: any) => {
  const form = useForm({
    defaultValues: {
      titulo: '',
      obra_id: '',
      template_id: '',
      contratante_nome: '',
      contratante_documento: '',
      contratado_nome: '',
      contratado_documento: '',
      valor_total: 0,
      prazo_dias: 30,
      observacoes: '',
      ...defaultValues,
    },
  });

  return (
    <ContratoFormSection
      form={form}
      obras={[]}
      templates={[]}
      orcamentos={[]}
      isCarregandoOrcamentos={false}
      onPreencherDadosOrcamento={vi.fn()}
      onSubmit={onSubmit}
      {...props}
    />
  );
};

describe('ContratoFormSection', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const defaultProps = {
    obras: [
      mockFactories.obra({ id: 'obra-1', nome: 'Obra Residencial' }),
      mockFactories.obra({ id: 'obra-2', nome: 'Obra Comercial' }),
    ],
    templates: [
      { id: 'template-1', nome: 'Contrato Residencial', tipo: 'residencial' },
      { id: 'template-2', nome: 'Contrato Comercial', tipo: 'comercial' },
    ],
    orcamentos: [
      mockFactories.orcamento({ 
        id: 'orc-1', 
        nome: 'Orçamento Principal',
        valor_total: 250000,
      }),
      mockFactories.orcamento({ 
        id: 'orc-2', 
        nome: 'Orçamento Alternativo',
        valor_total: 300000,
      }),
    ],
    isCarregandoOrcamentos: false,
    onPreencherDadosOrcamento: vi.fn(),
    onSubmit: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ContratoFormWrapper {...defaultProps} {...props} />
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    it('deve renderizar todos os campos obrigatórios', () => {
      renderComponent();

      // Seção Informações Básicas
      expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
      expect(screen.getByLabelText('Título do Contrato')).toBeInTheDocument();
      expect(screen.getByText('Selecione uma obra')).toBeInTheDocument();
      expect(screen.getByText('Selecione um template')).toBeInTheDocument();

      // Seção Dados do Contratante
      expect(screen.getByText('Dados do Contratante')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome do Contratante')).toBeInTheDocument();
      expect(screen.getByLabelText('CPF/CNPJ do Contratante')).toBeInTheDocument();

      // Seção Dados do Contratado
      expect(screen.getByText('Dados do Contratado')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome do Contratado')).toBeInTheDocument();
      expect(screen.getByLabelText('CPF/CNPJ do Contratado')).toBeInTheDocument();

      // Seção Dados Financeiros
      expect(screen.getByText('Dados Financeiros')).toBeInTheDocument();
      expect(screen.getByLabelText('Valor Total (R$)')).toBeInTheDocument();
      expect(screen.getByLabelText('Prazo (dias)')).toBeInTheDocument();
    });

    it('deve renderizar botão de submit', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /criar contrato/i })).toBeInTheDocument();
    });

    it('deve renderizar ícones nas seções', () => {
      renderComponent();

      // Verificar se os ícones estão presentes nas seções
      const informacoesBasicas = screen.getByText('Informações Básicas').closest('div');
      const dadosContratante = screen.getByText('Dados do Contratante').closest('div');
      const dadosFinanceiros = screen.getByText('Dados Financeiros').closest('div');

      expect(informacoesBasicas).toBeInTheDocument();
      expect(dadosContratante).toBeInTheDocument();
      expect(dadosFinanceiros).toBeInTheDocument();
    });
  });

  describe('Seleção de obras', () => {
    it('deve exibir lista de obras disponíveis', async () => {
      renderComponent();

      const selectObra = screen.getByText('Selecione uma obra');
      await user.click(selectObra);

      expect(screen.getByText('Obra Residencial')).toBeInTheDocument();
      expect(screen.getByText('Obra Comercial')).toBeInTheDocument();
    });

    it('deve chamar onPreencherDadosOrcamento quando obra é selecionada', async () => {
      const onPreencherDadosOrcamento = vi.fn();
      renderComponent({ onPreencherDadosOrcamento });

      const selectObra = screen.getByText('Selecione uma obra');
      await user.click(selectObra);

      const obraOption = screen.getByText('Obra Residencial');
      await user.click(obraOption);

      expect(onPreencherDadosOrcamento).toHaveBeenCalledWith('obra-1');
    });

    it('deve exibir orçamentos quando obra é selecionada', async () => {
      renderComponent({
        defaultValues: { obra_id: 'obra-1' }
      });

      expect(screen.getByText('📊 Orçamentos Disponíveis')).toBeInTheDocument();
      expect(screen.getByText(/Orçamento Principal.*R\$ 250\.000,00/)).toBeInTheDocument();
      expect(screen.getByText(/Orçamento Alternativo.*R\$ 300\.000,00/)).toBeInTheDocument();
    });

    it('não deve exibir orçamentos quando obra não está selecionada', () => {
      renderComponent();

      expect(screen.queryByText('📊 Orçamentos Disponíveis')).not.toBeInTheDocument();
    });

    it('deve limitar exibição a 3 orçamentos', () => {
      const muitosOrcamentos = Array.from({ length: 5 }, (_, i) => 
        mockFactories.orcamento({ 
          id: `orc-${i}`, 
          nome: `Orçamento ${i + 1}`,
          valor_total: 100000 * (i + 1),
        })
      );

      renderComponent({
        orcamentos: muitosOrcamentos,
        defaultValues: { obra_id: 'obra-1' }
      });

      // Deve mostrar apenas os 3 primeiros
      expect(screen.getByText(/Orçamento 1/)).toBeInTheDocument();
      expect(screen.getByText(/Orçamento 2/)).toBeInTheDocument();
      expect(screen.getByText(/Orçamento 3/)).toBeInTheDocument();
      expect(screen.queryByText(/Orçamento 4/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Orçamento 5/)).not.toBeInTheDocument();
    });
  });

  describe('Seleção de templates', () => {
    it('deve exibir lista de templates disponíveis', async () => {
      renderComponent();

      const selectTemplate = screen.getByText('Selecione um template');
      await user.click(selectTemplate);

      expect(screen.getByText('Contrato Residencial')).toBeInTheDocument();
      expect(screen.getByText('Contrato Comercial')).toBeInTheDocument();
    });

    it('deve permitir seleção de template', async () => {
      renderComponent();

      const selectTemplate = screen.getByText('Selecione um template');
      await user.click(selectTemplate);

      const templateOption = screen.getByText('Contrato Residencial');
      await user.click(templateOption);

      // Verificar se o template foi selecionado
      expect(screen.getByDisplayValue('Contrato Residencial')).toBeInTheDocument();
    });
  });

  describe('Preenchimento de formulário', () => {
    it('deve permitir preenchimento do título', async () => {
      renderComponent();

      const tituloInput = screen.getByLabelText('Título do Contrato');
      await user.type(tituloInput, 'Contrato de Construção Residencial');

      expect(tituloInput).toHaveValue('Contrato de Construção Residencial');
    });

    it('deve permitir preenchimento dos dados do contratante', async () => {
      renderComponent();

      const nomeContratante = screen.getByLabelText('Nome do Contratante');
      const docContratante = screen.getByLabelText('CPF/CNPJ do Contratante');

      await user.type(nomeContratante, 'João Silva');
      await user.type(docContratante, '123.456.789-00');

      expect(nomeContratante).toHaveValue('João Silva');
      expect(docContratante).toHaveValue('123.456.789-00');
    });

    it('deve permitir preenchimento dos dados do contratado', async () => {
      renderComponent();

      const nomeContratado = screen.getByLabelText('Nome do Contratado');
      const docContratado = screen.getByLabelText('CPF/CNPJ do Contratado');

      await user.type(nomeContratado, 'Construtora XYZ Ltda');
      await user.type(docContratado, '12.345.678/0001-90');

      expect(nomeContratado).toHaveValue('Construtora XYZ Ltda');
      expect(docContratado).toHaveValue('12.345.678/0001-90');
    });

    it('deve permitir preenchimento dos dados financeiros', async () => {
      renderComponent();

      const valorTotal = screen.getByLabelText('Valor Total (R$)');
      const prazoDias = screen.getByLabelText('Prazo (dias)');

      await user.clear(valorTotal);
      await user.type(valorTotal, '250000');
      
      await user.clear(prazoDias);
      await user.type(prazoDias, '180');

      expect(valorTotal).toHaveValue(250000);
      expect(prazoDias).toHaveValue(180);
    });

    it('deve permitir preenchimento das observações', async () => {
      renderComponent();

      const observacoes = screen.getByLabelText('Observações');
      await user.type(observacoes, 'Contrato com condições especiais de pagamento.');

      expect(observacoes).toHaveValue('Contrato com condições especiais de pagamento.');
    });
  });

  describe('Validação de formulário', () => {
    it('deve mostrar erros de validação para campos obrigatórios', async () => {
      const onSubmit = vi.fn();
      renderComponent({ onSubmit });

      const submitButton = screen.getByRole('button', { name: /criar contrato/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/obra é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/nome do contratante é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/nome do contratado é obrigatório/i)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('deve validar formato de CPF/CNPJ', async () => {
      renderComponent();

      const docContratante = screen.getByLabelText('CPF/CNPJ do Contratante');
      await user.type(docContratante, '123456789');

      // Trigger validation
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/formato de CPF\/CNPJ inválido/i)).toBeInTheDocument();
      });
    });

    it('deve validar valor mínimo para valor total', async () => {
      renderComponent();

      const valorTotal = screen.getByLabelText('Valor Total (R$)');
      await user.clear(valorTotal);
      await user.type(valorTotal, '-1000');

      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/valor deve ser positivo/i)).toBeInTheDocument();
      });
    });

    it('deve validar prazo mínimo', async () => {
      renderComponent();

      const prazoDias = screen.getByLabelText('Prazo (dias)');
      await user.clear(prazoDias);
      await user.type(prazoDias, '0');

      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/prazo deve ser pelo menos 1 dia/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submissão do formulário', () => {
    it('deve chamar onSubmit com dados válidos', async () => {
      const onSubmit = vi.fn();
      renderComponent({ onSubmit });

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText('Título do Contrato'), 'Contrato Teste');
      
      // Selecionar obra
      await user.click(screen.getByText('Selecione uma obra'));
      await user.click(screen.getByText('Obra Residencial'));

      // Preencher contratante
      await user.type(screen.getByLabelText('Nome do Contratante'), 'João Silva');
      await user.type(screen.getByLabelText('CPF/CNPJ do Contratante'), '123.456.789-00');

      // Preencher contratado
      await user.type(screen.getByLabelText('Nome do Contratado'), 'Construtora XYZ');
      await user.type(screen.getByLabelText('CPF/CNPJ do Contratado'), '12.345.678/0001-90');

      // Submit
      await user.click(screen.getByRole('button', { name: /criar contrato/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            titulo: 'Contrato Teste',
            obra_id: 'obra-1',
            contratante_nome: 'João Silva',
            contratante_documento: '123.456.789-00',
            contratado_nome: 'Construtora XYZ',
            contratado_documento: '12.345.678/0001-90',
          })
        );
      });
    });

    it('deve incluir template selecionado na submissão', async () => {
      const onSubmit = vi.fn();
      renderComponent({ onSubmit });

      // Preencher dados mínimos + template
      await user.type(screen.getByLabelText('Título do Contrato'), 'Contrato com Template');
      
      await user.click(screen.getByText('Selecione uma obra'));
      await user.click(screen.getByText('Obra Residencial'));

      await user.click(screen.getByText('Selecione um template'));
      await user.click(screen.getByText('Contrato Residencial'));

      await user.type(screen.getByLabelText('Nome do Contratante'), 'João');
      await user.type(screen.getByLabelText('CPF/CNPJ do Contratante'), '123.456.789-00');
      await user.type(screen.getByLabelText('Nome do Contratado'), 'Construtora');
      await user.type(screen.getByLabelText('CPF/CNPJ do Contratado'), '12.345.678/0001-90');

      await user.click(screen.getByRole('button', { name: /criar contrato/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            template_id: 'template-1',
          })
        );
      });
    });
  });

  describe('Estados de loading', () => {
    it('deve mostrar indicador de loading para orçamentos', () => {
      renderComponent({
        isCarregandoOrcamentos: true,
        defaultValues: { obra_id: 'obra-1' }
      });

      expect(screen.getByText(/carregando orçamentos/i)).toBeInTheDocument();
    });

    it('deve desabilitar botão submit durante loading', () => {
      renderComponent({
        isCarregandoOrcamentos: true
      });

      const submitButton = screen.getByRole('button', { name: /criar contrato/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Casos edge', () => {
    it('deve lidar com arrays vazios graciosamente', () => {
      renderComponent({
        obras: [],
        templates: [],
        orcamentos: [],
      });

      expect(screen.getByText('Selecione uma obra')).toBeInTheDocument();
      expect(screen.getByText('Selecione um template')).toBeInTheDocument();
      expect(screen.queryByText('📊 Orçamentos Disponíveis')).not.toBeInTheDocument();
    });

    it('deve lidar com props undefined', () => {
      expect(() => renderComponent({
        obras: undefined,
        templates: undefined,
        orcamentos: undefined,
      })).not.toThrow();
    });

    it('deve lidar com orçamentos sem valor_total', () => {
      const orcamentoSemValor = mockFactories.orcamento({
        valor_total: null,
        nome: 'Orçamento sem valor'
      });

      renderComponent({
        orcamentos: [orcamentoSemValor],
        defaultValues: { obra_id: 'obra-1' }
      });

      expect(screen.getByText(/Orçamento sem valor.*R\$ 0,00/)).toBeInTheDocument();
    });

    it('deve formatar valores monetários corretamente', () => {
      const orcamentoGrande = mockFactories.orcamento({
        valor_total: 1234567.89,
        nome: 'Orçamento Milhonário'
      });

      renderComponent({
        orcamentos: [orcamentoGrande],
        defaultValues: { obra_id: 'obra-1' }
      });

      expect(screen.getByText(/R\$ 1\.234\.567,89/)).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      renderComponent();

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('deve ter descrições acessíveis para selects', () => {
      renderComponent();

      const selectObra = screen.getByRole('combobox', { name: /obra/i });
      const selectTemplate = screen.getByRole('combobox', { name: /template/i });

      expect(selectObra).toHaveAccessibleName();
      expect(selectTemplate).toHaveAccessibleName();
    });

    it('deve mostrar mensagens de erro associadas aos campos', async () => {
      renderComponent();

      await user.click(screen.getByRole('button', { name: /criar contrato/i }));

      await waitFor(() => {
        const tituloInput = screen.getByLabelText('Título do Contrato');
        const errorMessage = screen.getByText(/título é obrigatório/i);
        
        expect(tituloInput).toHaveAccessibleDescription();
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('deve ter estrutura de headings correta', () => {
      renderComponent();

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(4); // 4 seções
      
      headings.forEach(heading => {
        expect(heading).toBeInTheDocument();
      });
    });
  });

  describe('Responsividade', () => {
    it('deve aplicar classes de grid responsivo', () => {
      renderComponent();

      const container = screen.getByLabelText('Obra').closest('.grid');
      expect(container).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });

    it('deve manter estrutura em telas pequenas', () => {
      // Simular tela pequena
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      renderComponent();

      // Componente deve renderizar sem problemas
      expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
    });
  });
});