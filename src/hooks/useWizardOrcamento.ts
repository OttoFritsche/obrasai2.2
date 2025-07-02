import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  WizardEtapa1Schema,
  WizardEtapa2Schema,
  WizardEtapa3Schema,
  WizardEtapa4Schema,
  WizardCompletoSchema,
  type WizardCompleto
} from '@/lib/validations/orcamento';

import { orcamentosParametricosApi, calculoOrcamentoApi } from '@/services/orcamentoApi';
import { useCEP } from '@/hooks/useCEP';
import { obrasApi } from '@/services/api';

export interface UseWizardOrcamentoProps {
  onOrcamentoCriado?: (orcamento: any) => void;
  obraId?: string;
}

export interface UseWizardOrcamentoReturn {
  // Estados
  etapaAtual: number;
  isCalculando: boolean;
  calculandoIA: boolean;
  isSubmitindo: boolean;
  
  // Form
  form: ReturnType<typeof useForm<WizardCompleto>>;
  
  // Navegação
  proximaEtapa: () => void;
  etapaAnterior: () => void;
  irParaEtapa: (etapa: number) => void;
  
  // Submit
  handleSubmit: () => Promise<void>;
  
  // Dados CEP
  cepData: ReturnType<typeof useCEP>;
  
  // Estados computados
  podeAvancar: boolean;
  podeVoltar: boolean;
  isUltimaEtapa: boolean;
  isFormValido: boolean;
}

const TOTAL_ETAPAS = 4;

const getSchemaByEtapa = (etapa: number) => {
  switch (etapa) {
    case 1: return WizardEtapa1Schema;
    case 2: return WizardEtapa2Schema;
    case 3: return WizardEtapa3Schema;
    case 4: return WizardEtapa4Schema;
    default: return WizardEtapa1Schema;
  }
};

export const useWizardOrcamento = ({ 
  onOrcamentoCriado, 
  obraId 
}: UseWizardOrcamentoProps = {}): UseWizardOrcamentoReturn => {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [isCalculando, setIsCalculando] = useState(false);
  const [calculandoIA, setCalculandoIA] = useState(false);
  const [isSubmitindo, setIsSubmitindo] = useState(false);

  const form = useForm<WizardCompleto>({
    resolver: zodResolver(WizardCompletoSchema),
    defaultValues: {
      // Etapa 1 - Informações Básicas
      nome_obra: "",
      descricao: "",
      tipo_obra: "casa_popular",
      
      // Etapa 2 - Localização
      cep: "",
      estado: "",
      cidade: "",
      endereco: "",
      
      // Etapa 3 - Dimensões
      area_total: 0,
      quartos: 1,
      banheiros: 1,
      pavimentos: 1,
      
      // Etapa 4 - Padrão
      padrao_obra: "popular",
      incluir_terreno: false,
      incluir_projeto: true,
      incluir_fundacao: true,
      observacoes: ""
    }
  });

  const cepData = useCEP();

  const validarEtapaAtual = useCallback(async (): Promise<boolean> => {
    const schema = getSchemaByEtapa(etapaAtual);
    const currentValues = form.getValues();
    
    try {
      schema.parse(currentValues);
      form.clearErrors();
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const fieldName = err.path[0] as keyof WizardCompleto;
          form.setError(fieldName, {
            type: 'validation',
            message: err.message
          });
        });
      }
      return false;
    }
  }, [etapaAtual, form]);

  const proximaEtapa = useCallback(async () => {
    const isValida = await validarEtapaAtual();
    
    if (!isValida) {
      toast.error("Por favor, corrija os erros antes de continuar");
      return;
    }

    if (etapaAtual < TOTAL_ETAPAS) {
      setEtapaAtual(prev => prev + 1);
    }
  }, [etapaAtual, validarEtapaAtual]);

  const etapaAnterior = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual(prev => prev - 1);
    }
  }, [etapaAtual]);

  const irParaEtapa = useCallback((etapa: number) => {
    if (etapa >= 1 && etapa <= TOTAL_ETAPAS) {
      setEtapaAtual(etapa);
    }
  }, []);

  const calcularOrcamentoComIA = async (dadosCompletos: WizardCompleto) => {
    setCalculandoIA(true);
    
    try {
      const resultado = await calculoOrcamentoApi.calcularComIA({
        nome_obra: dadosCompletos.nome_obra,
        tipo_obra: dadosCompletos.tipo_obra,
        area_total: dadosCompletos.area_total,
        quartos: dadosCompletos.quartos,
        banheiros: dadosCompletos.banheiros,
        pavimentos: dadosCompletos.pavimentos,
        padrao_obra: dadosCompletos.padrao_obra,
        estado: dadosCompletos.estado,
        cidade: dadosCompletos.cidade,
        incluir_terreno: dadosCompletos.incluir_terreno,
        incluir_projeto: dadosCompletos.incluir_projeto,
        incluir_fundacao: dadosCompletos.incluir_fundacao
      });

      if (resultado?.custo_estimado) {
        const custoEstimado = typeof resultado.custo_estimado === 'string' 
          ? parseFloat(resultado.custo_estimado.replace(/[^\d.,]/g, '').replace(',', '.'))
          : resultado.custo_estimado;

        if (!isNaN(custoEstimado) && custoEstimado > 0) {
          toast.success(
            `✨ Orçamento calculado! Valor estimado: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(custoEstimado)}`
          );
        } else {
          toast.success("✨ Orçamento calculado com sucesso!");
          console.warn("Custo estimado não disponível na resposta:", resultado);
        }
      }

    } catch (error) {
      console.error("Erro no cálculo da IA:", error);
      toast.warning("⚠️ Orçamento criado, mas cálculo da IA falhou.");
    } finally {
      setCalculandoIA(false);
    }
  };

  const criarOrcamento = async (dadosCompletos: WizardCompleto) => {
    setIsCalculando(true);

    try {
      const orcamentoData = {
        nome: dadosCompletos.nome_obra,
        descricao: dadosCompletos.descricao || "",
        obra_id: obraId || null,
        tipo_obra: dadosCompletos.tipo_obra,
        area_total: dadosCompletos.area_total,
        quartos: dadosCompletos.quartos,
        banheiros: dadosCompletos.banheiros,
        pavimentos: dadosCompletos.pavimentos,
        padrao_obra: dadosCompletos.padrao_obra,
        cep: dadosCompletos.cep,
        estado: dadosCompletos.estado,
        cidade: dadosCompletos.cidade,
        endereco: dadosCompletos.endereco || "",
        incluir_terreno: dadosCompletos.incluir_terreno,
        incluir_projeto: dadosCompletos.incluir_projeto,
        incluir_fundacao: dadosCompletos.incluir_fundacao,
        observacoes: dadosCompletos.observacoes || "",
        status: 'rascunho' as const
      };

      const response = await orcamentosParametricosApi.criar(orcamentoData);
      
      toast.success("🎉 Orçamento criado com sucesso!");
      onOrcamentoCriado?.(response);

      return response;
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Erro ao criar orçamento. Tente novamente.");
      throw error;
    } finally {
      setIsCalculando(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitindo(true);
      
      const isValida = await validarEtapaAtual();
      if (!isValida) {
        toast.error("Por favor, corrija os erros antes de finalizar");
        return;
      }

      const dadosCompletos = form.getValues();
      
      // Validação final completa
      const resultadoValidacao = WizardCompletoSchema.safeParse(dadosCompletos);
      if (!resultadoValidacao.success) {
        toast.error("Dados incompletos. Verifique todas as etapas.");
        return;
      }

      // Criar orçamento
      const orcamento = await criarOrcamento(dadosCompletos);
      
      // Calcular com IA em paralelo (não bloqueia)
      calcularOrcamentoComIA(dadosCompletos);

    } catch (error) {
      console.error("Erro no submit:", error);
    } finally {
      setIsSubmitindo(false);
    }
  }, [validarEtapaAtual, form, onOrcamentoCriado, obraId]);

  // Estados computados
  const podeAvancar = etapaAtual < TOTAL_ETAPAS;
  const podeVoltar = etapaAtual > 1;
  const isUltimaEtapa = etapaAtual === TOTAL_ETAPAS;
  const isFormValido = form.formState.isValid;

  return {
    // Estados
    etapaAtual,
    isCalculando,
    calculandoIA,
    isSubmitindo,
    
    // Form
    form,
    
    // Navegação
    proximaEtapa,
    etapaAnterior,
    irParaEtapa,
    
    // Submit
    handleSubmit,
    
    // Dados CEP
    cepData,
    
    // Estados computados
    podeAvancar,
    podeVoltar,
    isUltimaEtapa,
    isFormValido
  };
};