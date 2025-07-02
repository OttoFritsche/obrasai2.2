/**
 * 🧙‍♂️ Wizard Inteligente para Orçamento Paramétrico
 * 
 * Componente multi-etapas para criação de orçamentos com IA,
 * baseado no padrão da Softplan GO Gestor Obras.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ChevronLeft, ChevronRight, Calculator, Building, MapPin, Ruler, Settings, Sparkles, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import type {
  WizardCompleto} from "@/lib/validations/orcamento";
import {
  WizardEtapa1Schema,
  WizardEtapa2Schema, 
  WizardEtapa3Schema,
  WizardEtapa4Schema,
  WizardCompletoSchema,
  TIPO_OBRA_LABELS,
  PADRAO_OBRA_LABELS,
  ESTADOS_BRASILEIROS
} from "@/lib/validations/orcamento";

import { orcamentosParametricosApi, calculoOrcamentoApi } from "@/services/orcamentoApi";
import { useCEP } from "@/hooks/useCEP";
import { obrasApi } from "@/services/api";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface WizardOrcamentoProps {
  /**
   * Callback quando orçamento é criado com sucesso
   */
  onOrcamentoCriado?: (orcamentoId: string) => void;
  
  /**
   * ID da obra para vincular orçamento (opcional)
   */
  obraId?: string;
  
  /**
   * Modo do wizard: 'novo' | 'edicao'
   */
  modo?: 'novo' | 'edicao';
  
  /**
   * Dados iniciais para edição
   */
  dadosIniciais?: Partial<WizardCompleto>;
}

interface EtapaInfo {
  numero: number;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  schema: z.ZodSchema;
}

// ====================================
// 📋 CONFIGURAÇÃO DAS ETAPAS
// ====================================

const ETAPAS: EtapaInfo[] = [
  {
    numero: 1,
    titulo: "Dados Básicos",
    descricao: "Informações fundamentais da obra",
    icone: <Building className="h-5 w-5" />,
    schema: WizardEtapa1Schema
  },
  {
    numero: 2,
    titulo: "Localização",
    descricao: "Localidade e endereço da obra",
    icone: <MapPin className="h-5 w-5" />,
    schema: WizardEtapa2Schema
  },
  {
    numero: 3,
    titulo: "Áreas e Metragens",
    descricao: "Dimensões e especificações",
    icone: <Ruler className="h-5 w-5" />,
    schema: WizardEtapa3Schema
  },
  {
    numero: 4,
    titulo: "Especificações",
    descricao: "Detalhes técnicos e acabamentos",
    icone: <Settings className="h-5 w-5" />,
    schema: WizardEtapa4Schema
  }
];

// ====================================
// 🧙‍♂️ COMPONENTE PRINCIPAL
// ====================================

export const WizardOrcamento: React.FC<WizardOrcamentoProps> = ({
  onOrcamentoCriado,
  obraId,
  modo = 'novo',
  dadosIniciais
}) => {
  // Estados do wizard
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [calculandoIA, setCalculandoIA] = useState(false);
  const [dadosObra, setDadosObra] = useState<WizardCompleto | null>(null);
  const [carregandoObra, setCarregandoObra] = useState(false);

  // Hook do CEP
  const { buscarCEP, isLoading: cepLoading } = useCEP();

  // Form principal
  const form = useForm<WizardCompleto>({
    resolver: zodResolver(WizardCompletoSchema),
    defaultValues: {
      nome_orcamento: dadosIniciais?.nome_orcamento || "",
      descricao: dadosIniciais?.descricao || "",
      tipo_obra: dadosIniciais?.tipo_obra || undefined,
      padrao_obra: dadosIniciais?.padrao_obra || undefined,
      estado: dadosIniciais?.estado || undefined,
      cidade: dadosIniciais?.cidade || "",
      cep: dadosIniciais?.cep || "",
      area_total: dadosIniciais?.area_total || "",
      area_construida: dadosIniciais?.area_construida || "",
      area_detalhada: dadosIniciais?.area_detalhada || {},
      especificacoes: dadosIniciais?.especificacoes || {},
      parametros_entrada: dadosIniciais?.parametros_entrada || {},
      obra_id: obraId || dadosIniciais?.obra_id
    }
  });

  // ====================================
  // 🎯 BUSCAR DADOS DA OBRA (NOVO)
  // ====================================

  /**
   * Busca dados da obra para pré-popular o formulário
   */
  const buscarDadosObra = useCallback(async () => {
    if (!obraId) return;

    try {
      setCarregandoObra(true);
      
      const obra = await obrasApi.getById(obraId);
      
      if (obra) {
        setDadosObra(obra);
        
        // Pré-popular formulário com dados da obra
        form.setValue('nome_orcamento', `Orçamento - ${obra.nome}`);
        form.setValue('cidade', obra.cidade);
        form.setValue('estado', obra.estado);
        form.setValue('cep', obra.cep);
        form.setValue('descricao', `Orçamento paramétrico para a obra ${obra.nome}, localizada em ${obra.endereco}, ${obra.cidade}/${obra.estado}.`);
        
        toast.success(`✅ Dados da obra "${obra.nome}" carregados!`);
      }
    } catch (error) {
      console.error('Erro ao buscar dados da obra:', error);
      toast.error('❌ Erro ao carregar dados da obra');
    } finally {
      setCarregandoObra(false);
    }
  }, [obraId, form]);

  // Effect para buscar dados da obra quando component montar
  useEffect(() => {
    if (obraId && modo === 'novo') {
      buscarDadosObra();
    }
  }, [obraId, modo, buscarDadosObra]);

  // ====================================
  // 🎯 FUNÇÃO DE BUSCA AUTOMÁTICA DE CEP
  // ====================================

  /**
   * Busca dados de endereço pelo CEP e preenche automaticamente
   */
  const handleBuscarCEP = useCallback(async (cepValue: string) => {
    // Remover formatação e verificar se tem 8 dígitos
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    try {
      const dadosCEP = await buscarCEP(cepValue);
      
      if (dadosCEP) {
        // Preencher automaticamente cidade e estado
        form.setValue('cidade', dadosCEP.localidade);
        form.setValue('estado', dadosCEP.uf);
        
        toast.success(`✅ Endereço encontrado: ${dadosCEP.localidade}/${dadosCEP.uf}`);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      // Não mostrar erro aqui, o hook já gerencia
    }
  }, [buscarCEP, form]);

  // ====================================
  // 🎯 FUNÇÕES DE NAVEGAÇÃO
  // ====================================

  /**
   * Avança para próxima etapa com validação
   */
  const proximaEtapa = useCallback(async () => {
    const etapaSchema = ETAPAS[etapaAtual - 1].schema;
    const dadosEtapa = form.getValues();
    
    // Validar etapa atual
    const resultadoValidacao = etapaSchema.safeParse(dadosEtapa);
    
    if (!resultadoValidacao.success) {
      // Mostrar erros de validação específicos
      resultadoValidacao.error.errors.forEach(erro => {
        toast.error(`${erro.path.join('.')}: ${erro.message}`);
      });
      return;
    }

    // Avançar para próxima etapa
    if (etapaAtual < ETAPAS.length) {
      setEtapaAtual(prev => prev + 1);
      toast.success(`✅ Etapa ${etapaAtual} concluída!`);
    }
  }, [etapaAtual, form]);

  /**
   * Volta para etapa anterior
   */
  const etapaAnterior = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual(prev => prev - 1);
    }
  }, [etapaAtual]);

  /**
   * Finaliza wizard e cria orçamento
   */
  const finalizarWizard = useCallback(async () => {
    try {
      setCarregando(true);

      // Validação final completa
      const dadosCompletos = form.getValues();
      
      const resultadoFinal = WizardCompletoSchema.safeParse(dadosCompletos);

      if (!resultadoFinal.success) {
        toast.error("❌ Dados incompletos ou inválidos!");
        console.error("Erros de validação:", resultadoFinal.error);
        return;
      }



      // Criar orçamento
      const novoOrcamento = await orcamentosParametricosApi.create(resultadoFinal.data);
      
      toast.success("🎉 Orçamento criado com sucesso!");

      // Iniciar cálculo automático com IA
      await calcularOrcamentoComIA(novoOrcamento.id);

      // Callback de sucesso
      onOrcamentoCriado?.(novoOrcamento.id);

    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("❌ Erro ao criar orçamento. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [form, onOrcamentoCriado]);

  /**
   * Calcula orçamento usando IA
   */
  const calcularOrcamentoComIA = useCallback(async (orcamentoId: string) => {
    try {
      setCalculandoIA(true);
      toast.info("🤖 Calculando orçamento com IA...");

      const resultado = await calculoOrcamentoApi.calcular({
        orcamento_id: orcamentoId,
        forcar_recalculo: false
      });

      if (resultado.success) {
        // Verificar se temos o custo estimado disponível
        const custoEstimado = resultado.orcamento?.custo_estimado || 0;
        
        if (custoEstimado > 0) {
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
  }, []);

  // ====================================
  // 🎨 COMPONENTES DE ETAPAS
  // ====================================

  /**
   * Etapa 1: Dados Básicos com visual moderno
   */
  const renderEtapa1 = () => (
    <div className="space-y-8">
      {/* Header da Etapa com Visual Moderno */}
      <div className="text-center relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
          <Building className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dados Básicos da Obra</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Vamos começar com as informações fundamentais do seu projeto
        </p>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>

      {/* Formulário em Cards */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
          <FormField
            control={form.control}
            name="nome_orcamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100">Nome do Orçamento *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Casa Residencial - João Silva"
                    className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-gray-600 dark:text-gray-400">
                  Escolha um nome que facilite a identificação do projeto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
            <FormField
              control={form.control}
              name="tipo_obra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tipo de Obra *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(TIPO_OBRA_LABELS).map(([valor, label]) => (
                        <SelectItem key={valor} value={valor}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
            <FormField
              control={form.control}
              name="padrao_obra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100">Padrão Construtivo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg">
                        <SelectValue placeholder="Selecione o padrão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PADRAO_OBRA_LABELS).map(([valor, label]) => (
                        <SelectItem key={valor} value={valor}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100">Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva detalhes importantes do projeto..."
                    className="min-h-[120px] text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-gray-600 dark:text-gray-400">
                  Informações adicionais que possam ajudar no cálculo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  /**
   * Etapa 2: Localização com busca automática de CEP
   */
  const renderEtapa2 = () => (
    <div className="space-y-8">
      {/* Header da Etapa */}
      <div className="text-center relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
          <MapPin className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Localização da Obra</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Digite o CEP para preenchimento automático dos dados de localização
        </p>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      </div>

      <div className="space-y-6">
        {/* Campo CEP em destaque */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  CEP *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="00000-000"
                      maxLength={9}
                      className="h-14 text-lg font-mono border-2 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg pl-4 pr-12"
                      {...field}
                      onChange={(e) => {
                        // Aplicar máscara de CEP
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 5) {
                          value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
                        }
                        field.onChange(value);
                        
                        // Buscar dados se CEP estiver completo
                        if (value.replace(/\D/g, '').length === 8) {
                          handleBuscarCEP(value);
                        }
                      }}
                    />
                    {cepLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription className="text-blue-700 dark:text-blue-300 font-medium">
                  ✨ Digite o CEP e veja a mágica: cidade e estado serão preenchidos automaticamente!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campos Estado e Cidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg">
                        <SelectValue placeholder="Preenchido automaticamente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map(estado => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.nome} ({estado.sigla})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-600 dark:text-gray-400">
                    Preenchido automaticamente pelo CEP
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cidade *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Preenchida automaticamente"
                      className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-600 dark:text-gray-400">
                    Preenchida automaticamente pelo CEP
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Etapa 3: Áreas e Metragens
   */
  const renderEtapa3 = () => (
    <div className="space-y-8">
      {/* Header da Etapa */}
      <div className="text-center relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-4">
          <Ruler className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Áreas e Metragens</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Defina as dimensões do projeto para cálculos precisos
        </p>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
      </div>

      <div className="space-y-6">
        {/* Área Total */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
          <FormField
            control={form.control}
            name="area_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  Área Total (m²) *
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Ex: 120.5"
                    step="0.01"
                    min="0.01"
                    className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseFloat(value) || "");
                    }}
                  />
                </FormControl>
                <FormDescription className="text-gray-600 dark:text-gray-400">
                  Área total do terreno em metros quadrados
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Área Construída */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
          <FormField
            control={form.control}
            name="area_construida"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  Área Construída (m²) *
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Ex: 85.0"
                    step="0.01"
                    min="0.01"
                    className="h-12 text-base border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseFloat(value) || "");
                    }}
                  />
                </FormControl>
                <FormDescription className="text-blue-700 dark:text-blue-300 font-medium">
                  🎯 Área efetivamente construída - base principal para o cálculo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Card informativo moderno */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Ruler className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              📐 Precisão de Metragem
            </span>
          </div>
          <div className="space-y-3 text-orange-800 dark:text-orange-200">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Quanto mais precisa a metragem, mais exato será o orçamento
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Nossa IA calcula com base em coeficientes técnicos por m²
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Área construída é a base principal para o cálculo de custos
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Etapa 4: Especificações
   */
  const renderEtapa4 = () => (
    <div className="space-y-8">
      {/* Header da Etapa */}
      <div className="text-center relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Finalização</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Tudo pronto para gerar seu orçamento inteligente
        </p>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      </div>

      <div className="space-y-6">
        {/* Card de conclusão */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-green-900 dark:text-green-100">
              🚀 Quase pronto!
            </span>
          </div>
          <p className="text-green-800 dark:text-green-200">
            Nossa IA está pronta para processar todos os dados e gerar
            um orçamento detalhado com estimativas precisas.
          </p>
        </div>

        {/* Central visual com ícone grande */}
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-lg mb-6">
            <div className="text-4xl">🎯</div>
          </div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Tudo Pronto para o Cálculo!
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Com base nos dados fornecidos, nossa IA irá processar e gerar
            um orçamento completo e preciso
          </p>
          
          {/* Grid de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Calcular custos regionais</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Baseado na localização</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Aplicar coeficientes técnicos</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Por tipo e padrão de obra</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Gerar orçamento paramétrico</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Por categoria e etapa</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Fornecer sugestões IA</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Otimizações e alertas</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================

  const porcentagemProgresso = (etapaAtual / ETAPAS.length) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-8">
      {/* Header do Wizard com Visual Moderno */}
      <div className="text-center mb-8 lg:mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4 lg:mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Calculator className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Orçamento Paramétrico com IA
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Crie orçamentos precisos em 5 etapas simples
              </p>
              {/* Indicador de obra vinculada */}
              {carregandoObra && (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
                  Carregando obra...
                </Badge>
              )}
              {dadosObra && (
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                  <Building className="h-3 w-3 mr-1" />
                  Vinculado: {dadosObra.nome}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Barra de Progresso Moderna */}
        <div className="max-w-4xl mx-auto mb-6 lg:mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300">
              Etapa {etapaAtual} de {ETAPAS.length}
            </span>
            <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              {Math.round(porcentagemProgresso)}% concluído
            </span>
          </div>
          
          {/* Barra de progresso com gradiente suave */}
          <div className="relative h-2 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${porcentagemProgresso}%` }}
            >
              {/* Efeito de brilho na barra */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Indicadores de Etapas com Sombreamento Progressivo */}
        <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
          {ETAPAS.map((etapa) => {
            const isAtual = etapa.numero === etapaAtual;
            const isConcluida = etapa.numero < etapaAtual;
            const isPendente = etapa.numero > etapaAtual;
            
            return (
              <div 
                key={etapa.numero}
                className={`
                  relative flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 transform hover:scale-105
                  ${isAtual 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30'
                    : isConcluida
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600 shadow-md shadow-green-200/40 dark:shadow-green-900/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                {/* Ícone com animação para etapa atual */}
                <div className={`${isAtual ? 'animate-pulse' : ''}`}>
                  {isConcluida ? (
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <div className="h-4 w-4 lg:h-5 lg:w-5">
                      {etapa.icone}
                    </div>
                  )}
                </div>
                
                {/* Título responsivo */}
                <span className="hidden md:inline">{etapa.titulo}</span>
                <span className="md:hidden">{etapa.numero}</span>
                
                {/* Indicador de conclusão com animação */}
                {isConcluida && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-bounce shadow-lg" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Container Principal com Sombra Suave */}
      <Card className="shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/30 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-4 lg:p-8 xl:p-12">
          <Form {...form}>
            <form className="space-y-6 lg:space-y-8">
              {/* Conteúdo da etapa atual - REMOVIDO POSICIONAMENTO ABSOLUTO */}
              <div className="min-h-[500px] lg:min-h-[600px] w-full">
                {etapaAtual === 1 && renderEtapa1()}
                {etapaAtual === 2 && renderEtapa2()}
                {etapaAtual === 3 && renderEtapa3()}
                {etapaAtual === 4 && renderEtapa4()}
              </div>

              {/* Separador com gradiente */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-gray-300 dark:via-gray-600 to-transparent" />
                </div>
              </div>

              {/* Botões de Navegação Modernos */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 pt-4 lg:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={etapaAnterior}
                  disabled={etapaAtual === 1 || carregando}
                  className="group flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span>Anterior</span>
                </Button>

                {etapaAtual < ETAPAS.length ? (
                  <Button
                    type="button"
                    onClick={proximaEtapa}
                    disabled={carregando}
                    className="group flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={finalizarWizard}
                    disabled={carregando || calculandoIA}
                    className="group flex items-center space-x-2 px-6 lg:px-8 py-2 lg:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
                  >
                    {carregando || calculandoIA ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        <span>
                          {carregando ? 'Criando...' : 'Calculando IA...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>Criar Orçamento</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Footer com dicas */}
      <div className="text-center mt-6 lg:mt-8 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
        💡 Dica: Você pode navegar entre as etapas a qualquer momento
      </div>
    </div>
  );
};