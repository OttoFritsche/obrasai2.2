import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCEP } from '@/hooks/useCEP';
import { useObras } from '@/hooks/useObras';
import {
  type WizardCompleto,
  WizardCompletoSchema,
  WizardEtapa1Schema,
  WizardEtapa2Schema,
  WizardEtapa3Schema,
  WizardEtapa4Schema} from '@/lib/validations/orcamento';
import { calculoOrcamentoApi,orcamentosParametricosApi } from '@/services/orcamentoApi';

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

  // ✅ Buscar obras para encontrar a obra selecionada
  const { obras } = useObras();

  const form = useForm<WizardCompleto>({
    resolver: zodResolver(WizardCompletoSchema),
    defaultValues: {
      // Etapa 1 - Informações Básicas
      nome_orcamento: "",
      descricao: "",
      tipo_obra: "R1_UNIFAMILIAR",
      padrao_obra: "POPULAR",
      
      // Etapa 2 - Localização
      cep: "",
      estado: "",
      cidade: "",
      
      // Etapa 3 - Dimensões
      area_total: undefined,
      area_construida: undefined,
      area_detalhada: undefined,
      
      // Etapa 4 - Especificações
      especificacoes: "Piso em porcelanato 60x60cm, paredes em textura acrílica, forro em gesso com sanca, esquadrias em alumínio branco",
      parametros_entrada: "Obra em condomínio fechado, terreno plano, instalação de ar condicionado split nos quartos"
    },
    mode: 'onChange'
  });
  
  // ✅ Buscar dados da obra se obraId estiver presente
  const obraSelecionada = obraId && obras ? obras.find(obra => obra.id === obraId) : null;

  // Log para verificar valores iniciais
  console.log('🔍 Valores iniciais do formulário:', form.getValues());
  console.log('🔍 ObraId recebido:', obraId);
  console.log('🔍 Obra encontrada:', obraSelecionada?.nome || 'Nenhuma');

  const cepData = useCEP();

  // ✅ Auto-preencher formulário com dados da obra
  useEffect(() => {
    if (obraSelecionada && !form.getValues().nome_orcamento) {
      // Gerar nome inteligente do orçamento baseado na obra
      const nomeOrcamento = `Orçamento - ${obraSelecionada.nome}`;
      
      form.setValue('nome_orcamento', nomeOrcamento);
      form.setValue('descricao', `Orçamento paramétrico para a obra: ${obraSelecionada.nome}`);
      
      // Se a obra tem localização, preencher também
      if (obraSelecionada.cidade && obraSelecionada.estado) {
        form.setValue('cidade', obraSelecionada.cidade);
        form.setValue('estado', obraSelecionada.estado);
      }
      
      // Se a obra tem CEP, preencher
      if (obraSelecionada.cep) {
        form.setValue('cep', obraSelecionada.cep);
      }

      console.log('🏗️ Dados da obra preenchidos automaticamente:', {
        obra: obraSelecionada.nome,
        orcamento: nomeOrcamento,
        cidade: obraSelecionada.cidade,
        estado: obraSelecionada.estado
      });
    }
  }, [obraSelecionada, form]);

  const validarEtapaAtual = useCallback(async (): Promise<boolean> => {
    const schema = getSchemaByEtapa(etapaAtual);
    const currentValues = form.getValues();
    
    console.log('🔍 Valores atuais do formulário:', currentValues);
    console.log('🔍 Tipo de especificacoes:', typeof currentValues.especificacoes, currentValues.especificacoes);
    console.log('🔍 Tipo de parametros_entrada:', typeof currentValues.parametros_entrada, currentValues.parametros_entrada);
    
    // Garantir que especificacoes e parametros_entrada tenham valores padrão
    const valuesWithDefaults = {
      ...currentValues,
      especificacoes: currentValues.especificacoes || {},
      parametros_entrada: currentValues.parametros_entrada || {}
    };
    
    console.log('🔍 Valores com defaults:', valuesWithDefaults);
    
    try {
      schema.parse(valuesWithDefaults);
      form.clearErrors();
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Erro de validação detalhado:', {
          errors: error.errors,
          currentValues: valuesWithDefaults,
          etapa: etapaAtual
        });
        error.errors.forEach((err) => {
          console.error('Campo com erro:', {
            path: err.path,
            message: err.message,
            code: err.code,
            received: err.received,
            expected: err.expected
          });
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

  const calcularOrcamentoComIA = async (orcamentoId: string) => {
    setCalculandoIA(true);
    
    try {
      const resultado = await calculoOrcamentoApi.calcular({
        orcamento_id: orcamentoId,
        forcar_recalculo: false
      });

      if (resultado?.success && resultado?.orcamento?.custo_estimado) {
        const custoEstimado = resultado.orcamento.custo_estimado;

        if (custoEstimado > 0) {
          toast.success(
            `✨ Orçamento calculado! Valor estimado: ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(custoEstimado)}`
          );
        } else {
          toast.success("✨ Orçamento calculado com sucesso!");
        }
      } else {
        toast.success("✨ Orçamento calculado com sucesso!");
        console.warn("Custo estimado não disponível na resposta:", resultado);
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
        nome_orcamento: dadosCompletos.nome_orcamento,
        descricao: dadosCompletos.descricao || "",
        obra_id: obraId || null,
        tipo_obra: dadosCompletos.tipo_obra,
        area_total: dadosCompletos.area_total,
        area_construida: dadosCompletos.area_construida,
        area_detalhada: dadosCompletos.area_detalhada,
        padrao_obra: dadosCompletos.padrao_obra,
        cep: dadosCompletos.cep,
        estado: dadosCompletos.estado,
        cidade: dadosCompletos.cidade,
        especificacoes: dadosCompletos.especificacoes,
        parametros_entrada: dadosCompletos.parametros_entrada
      };

      const response = await orcamentosParametricosApi.create(orcamentoData);
      
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
      
      // Garantir que especificacoes e parametros_entrada tenham valores padrão
      const dadosComDefaults = {
        ...dadosCompletos,
        especificacoes: dadosCompletos.especificacoes || {},
        parametros_entrada: dadosCompletos.parametros_entrada || {}
      };
      
      // Validação final completa
      const resultadoValidacao = WizardCompletoSchema.safeParse(dadosComDefaults);
      if (!resultadoValidacao.success) {
        toast.error("Dados incompletos. Verifique todas as etapas.");
        return;
      }

      // Criar orçamento
      const orcamento = await criarOrcamento(dadosComDefaults);
      
      // Calcular com IA em paralelo (não bloqueia)
      if (orcamento?.id) {
        calcularOrcamentoComIA(orcamento.id);
      }

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