import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

import { useContrato, useContratos, useTemplatesContratos } from '@/hooks/useContratos';
import { useObras } from '@/hooks/useObras';
import { orcamentosParametricosApi } from '@/services/orcamentoApi';

// ✅ Schema movido para arquivo dedicado
const contratoSchema = z.object({
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  obra_id: z.string().min(1, "Selecione uma obra"),
  template_id: z.string().min(1, "Selecione um template"),
  
  // Dados do contratante
  contratante_nome: z.string().min(3, "Nome do contratante é obrigatório"),
  contratante_documento: z.string().min(11, "Documento do contratante é obrigatório"),
  contratante_endereco: z.string().default(""),
  contratante_email: z.string().default(""),
  contratante_telefone: z.string().default(""),
  
  // Dados do contratado
  contratado_nome: z.string().min(3, "Nome do contratado é obrigatório"),
  contratado_documento: z.string().min(11, "Documento do contratado é obrigatório"),
  contratado_endereco: z.string().default(""),
  contratado_email: z.string().default(""),
  contratado_telefone: z.string().default(""),
  
  // Dados financeiros e técnicos
  valor_total: z.number().positive("Valor deve ser positivo"),
  forma_pagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  prazo_execucao: z.number().positive("Prazo deve ser positivo"),
  data_inicio: z.string().default(""),
  descricao_servicos: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  clausulas_especiais: z.string().default(""),
  observacoes: z.string().default(""),
});

export type ContratoFormData = z.infer<typeof contratoSchema>;

interface UseContratoFormReturn {
  // Form
  form: ReturnType<typeof useForm<ContratoFormData>>;
  
  // Data
  obra: any;
  orcamentos: any[];
  templates: any[];
  
  // Loading states
  isCarregandoObra: boolean;
  isCarregandoOrcamentos: boolean;
  isCarregandoTemplates: boolean;
  
  // Actions
  handleSubmit: (data: ContratoFormData) => Promise<void>;
  preencherDadosOrcamento: (obraId: string) => Promise<void>;
  
  // Navigation
  voltarParaLista: () => void;
}

export const useContratoForm = (): UseContratoFormReturn => {
  const navigate = useNavigate();
  const { id: contratoId } = useParams();
  
  const { obras } = useObras();
  const { templates, isLoading: isCarregandoTemplates } = useTemplatesContratos();
  const { contrato } = useContrato(contratoId);
  const { criarContrato, atualizarContrato } = useContratos();

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      titulo: "",
      obra_id: "",
      template_id: "",
      contratante_nome: "",
      contratante_documento: "",
      contratante_endereco: "",
      contratante_email: "",
      contratante_telefone: "",
      contratado_nome: "",
      contratado_documento: "",
      contratado_endereco: "",
      contratado_email: "",
      contratado_telefone: "",
      valor_total: 0,
      forma_pagamento: "",
      prazo_execucao: 30,
      data_inicio: "",
      descricao_servicos: "",
      clausulas_especiais: "",
      observacoes: "",
    }
  });

  const obraId = form.watch('obra_id');
  const obra = obras?.find(o => o.id === obraId);
  
  // Carregar orçamentos da obra selecionada
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [isCarregandoOrcamentos, setIsCarregandoOrcamentos] = useState(false);

  const carregarOrcamentos = async (obraId: string) => {
    if (!obraId) {
      setOrcamentos([]);
      return;
    }

    setIsCarregandoOrcamentos(true);
    try {
      const response = await orcamentosParametricosApi.listar({ obra_id: obraId });
      setOrcamentos(response || []);
    } catch (_error) {
      console.error("Erro ao carregar orçamentos:", error);
      setOrcamentos([]);
    } finally {
      setIsCarregandoOrcamentos(false);
    }
  };

  // Efeito para carregar orçamentos quando obra muda
  useEffect(() => {
    carregarOrcamentos(obraId);
  }, [obraId]);

  // Preencher formulário com dados do contrato existente
  useEffect(() => {
    if (contrato) {
      form.reset({
        titulo: contrato.titulo || "",
        obra_id: contrato.obra_id || "",
        template_id: contrato.template_id || "",
        contratante_nome: contrato.contratante_nome || "",
        contratante_documento: contrato.contratante_documento || "",
        contratante_endereco: contrato.contratante_endereco || "",
        contratante_email: contrato.contratante_email || "",
        contratante_telefone: contrato.contratante_telefone || "",
        contratado_nome: contrato.contratado_nome || "",
        contratado_documento: contrato.contratado_documento || "",
        contratado_endereco: contrato.contratado_endereco || "",
        contratado_email: contrato.contratado_email || "",
        contratado_telefone: contrato.contratado_telefone || "",
        valor_total: contrato.valor_total || 0,
        forma_pagamento: contrato.forma_pagamento || "",
        prazo_execucao: contrato.prazo_execucao || 30,
        data_inicio: contrato.data_inicio || "",
        descricao_servicos: contrato.descricao_servicos || "",
        clausulas_especiais: contrato.clausulas_especiais || "",
        observacoes: contrato.observacoes || "",
      });
    }
  }, [contrato, form]);

  const preencherDadosOrcamento = async (obraId: string) => {
    if (!obraId) return;

    try {
      await carregarOrcamentos(obraId);
      
      // Buscar o orçamento mais recente
      const orcamentosObra = await orcamentosParametricosApi.listar({ obra_id: obraId });
      const orcamentoRecente = orcamentosObra?.[0];

      if (orcamentoRecente && obra) {
        // Preencher campos baseados no orçamento
        form.setValue('titulo', `Contrato - ${obra.nome}`);
        form.setValue('valor_total', orcamentoRecente.valor_total || 0);
        form.setValue('descricao_servicos', 
          `Execução de obra ${orcamentoRecente.tipo_obra} com área de ${orcamentoRecente.area_total}m²`
        );

        toast.success("Dados preenchidos automaticamente com base no orçamento!");
      }
    } catch (_error) {
      console.error("Erro ao preencher dados do orçamento:", error);
      toast.error("Erro ao carregar dados do orçamento");
    }
  };

  const handleSubmit = async (data: ContratoFormData) => {
    try {
      if (contratoId) {
        await atualizarContrato(contratoId, data);
        toast.success("Contrato atualizado com sucesso!");
      } else {
        await criarContrato(data);
        toast.success("Contrato criado com sucesso!");
      }
      navigate('/dashboard/contratos');
    } catch (_error) {
      console.error("Erro ao salvar contrato:", error);
      toast.error("Erro ao salvar contrato");
    }
  };

  const voltarParaLista = () => {
    navigate('/dashboard/contratos');
  };

  return {
    // Form
    form,
    
    // Data
    obra,
    orcamentos,
    templates: templates || [],
    
    // Loading states
    isCarregandoObra: false,
    isCarregandoOrcamentos,
    isCarregandoTemplates,
    
    // Actions
    handleSubmit,
    preencherDadosOrcamento,
    
    // Navigation
    voltarParaLista
  };
};