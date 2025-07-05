import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calculator,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    DollarSign,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    Package,
    Receipt,
    Save,
    Search,
    Settings,
    Truck,
    User,
    Wrench
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SinapiSelectorDespesas } from "@/components/sinapi/SinapiSelectorDespesas";
import { VariacaoSinapiIndicator } from "@/components/sinapi/VariacaoSinapiIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useDespesas } from "@/hooks/useDespesas";
import { useSinapiDespesas, type SinapiItem } from "@/hooks/useSinapiDespesas";
import { cn, formatDate } from "@/lib/utils";
import type { DespesaFormValues } from "@/lib/validations/despesa";
import { despesaSchema, formasPagamento } from "@/lib/validations/despesa";
import { fornecedoresPFApi, fornecedoresPJApi, obrasApi } from "@/services/api";

const EditarDespesa = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { useDespesa, updateDespesa } = useDespesas();
  
  // Estados para controlar expansão das seções
  const [sectionsExpanded, setSectionsExpanded] = useState({
    basicInfo: true,
    classification: true,
    financial: true,
    payment: false,
    supplier: false,
    additional: false
  });
  
  const [showPreview, setShowPreview] = useState(false);
  
  // Estados para controlar o tipo de insumo e seleção SINAPI
  const [tipoInsumo, setTipoInsumo] = useState<'sinapi' | 'manual'>('manual');
  const [sinapiSelecionado, setSinapiSelecionado] = useState<SinapiItem | null>(null);
  const [insumoOriginal, setInsumoOriginal] = useState<{
    tipo: 'sinapi' | 'manual';
    codigo?: string;
    descricao?: string;
  } | null>(null);
  
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;
  
  // Hook para funcionalidades SINAPI
  const sinapiHook = useSinapiDespesas();

  const { data: despesa, isLoading: isLoadingDespesa, error: despesaError } = useDespesa(id || '');

  const form = useForm<DespesaFormValues>({
    resolver: zodResolver(despesaSchema),
    defaultValues: {
      obra_id: "",
      descricao: "",
      data_despesa: new Date(),
      categoria: "",
      etapa: "",
      insumo: "",
      insumo_customizado: "",
      sinapi_codigo: "",
      sinapi_referencia_id: "",
      unidade: "",
      quantidade: 1,
      valor_unitario: 0,
      fornecedor_pj_id: "",
      fornecedor_pf_id: "",
      numero_nf: "",
      observacoes: "",
      pago: false,
      data_pagamento: undefined,
      forma_pagamento: "",
    },
  });

  // Carregar dados auxiliares
  const { data: obras, isLoading: isLoadingObras } = useQuery({
    queryKey: ["obras"],
    queryFn: obrasApi.getAll,
  });

  const { data: fornecedoresPJ, isLoading: isLoadingPJ } = useQuery({
    queryKey: ["fornecedores_pj", validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPJApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
  });

  const { data: fornecedoresPF, isLoading: isLoadingPF } = useQuery({
    queryKey: ["fornecedores_pf", validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPFApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
  });

  useEffect(() => {
    if (despesa) {
      const parseDate = (dateValue: string | Date | null | undefined): Date | null => {
        if (!dateValue) return null;
        
        if (dateValue instanceof Date) {
          return dateValue;
        }
        
        if (typeof dateValue === 'string') {
          const parsedDate = new Date(dateValue);
          return isNaN(parsedDate.getTime()) ? null : parsedDate;
        }
        
        return null;
      };

      // Determinar o tipo de insumo baseado nos dados existentes
      let tipoInsumoDetectado: 'sinapi' | 'manual' = 'manual';
      
      if (despesa.sinapi_codigo && despesa.sinapi_referencia_id) {
        tipoInsumoDetectado = 'sinapi';
        setInsumoOriginal({
          tipo: 'sinapi',
          codigo: despesa.sinapi_codigo,
          descricao: despesa.descricao
        });
      } else if (despesa.insumo_customizado) {
        tipoInsumoDetectado = 'manual';
        setInsumoOriginal({
          tipo: 'manual',
          descricao: despesa.insumo_customizado
        });
      } else if (despesa.insumo) {
        tipoInsumoDetectado = 'manual';
        setInsumoOriginal({
          tipo: 'manual',
          descricao: despesa.insumo
        });
      }
      
      setTipoInsumo(tipoInsumoDetectado);

      form.reset({
        obra_id: despesa.obra_id || "",
        descricao: despesa.descricao || "",
        data_despesa: parseDate(despesa.data_despesa) || new Date(),
        categoria: despesa.categoria || "",
        etapa: despesa.etapa || "",
        insumo: despesa.insumo || "",
        insumo_customizado: despesa.insumo_customizado || "",
        sinapi_codigo: despesa.sinapi_codigo || "",
        sinapi_referencia_id: despesa.sinapi_referencia_id || "",
        unidade: despesa.unidade || "",
        quantidade: despesa.quantidade || 1,
        valor_unitario: despesa.valor_unitario || 0,
        fornecedor_pj_id: despesa.fornecedor_pj_id || "",
        fornecedor_pf_id: despesa.fornecedor_pf_id || "",
        numero_nf: despesa.numero_nf || "",
        observacoes: despesa.observacoes || "",
        pago: despesa.pago || false,
        data_pagamento: parseDate(despesa.data_pagamento) || undefined,
        forma_pagamento: despesa.forma_pagamento || "",
      });
    }
  }, [despesa, form]);

  // Função para alternar expansão das seções
  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calcular valor total em tempo real
  const quantidade = form.watch('quantidade') || 1;
  const valorUnitario = form.watch('valor_unitario') || 0;
  const valorTotal = quantidade * valorUnitario;
  
  // Verificar se o pagamento está marcado
  const isPago = form.watch('pago');
  
  // Função para validar se pode expandir seção de pagamento
  const canExpandPayment = () => {
    const basicFields = form.watch(['descricao', 'valor_unitario', 'obra_id']);
    return basicFields.every(field => field && field !== '');
  };

  // Função para lidar com seleção SINAPI
  const handleSinapiSelect = (item: SinapiItem) => {
    setSinapiSelecionado(item);
    
    // Atualizar campos do formulário com dados SINAPI
    form.setValue('sinapi_codigo', item.codigo);
    form.setValue('sinapi_referencia_id', item.codigo); // Usar código como referência
    form.setValue('descricao', item.descricao);
    form.setValue('valor_unitario', item.preco_unitario);
    form.setValue('unidade', item.unidade);
    
    // Limpar campos manuais
    form.setValue('insumo', '');
    form.setValue('insumo_customizado', '');
  };

  // Função para alternar tipo de insumo
  const handleTipoInsumoChange = (tipo: 'sinapi' | 'manual') => {
    setTipoInsumo(tipo);
    
    if (tipo === 'manual') {
      // Limpar dados SINAPI
      setSinapiSelecionado(null);
      form.setValue('sinapi_codigo', '');
      form.setValue('sinapi_referencia_id', '');
    } else {
      // Limpar campos manuais
      form.setValue('insumo', '');
      form.setValue('insumo_customizado', '');
    }
  };

  const onSubmit = (values: DespesaFormValues) => {
    if (!id) {
      toast.error("ID da despesa não encontrado");
      return;
    }

    const updateData: any = {
      obra_id: values.obra_id,
      descricao: values.descricao,
      data_despesa: values.data_despesa,
      quantidade: values.quantidade,
      valor_unitario: values.valor_unitario,
      pago: values.pago || false,
    };

    if (values.categoria) updateData.categoria = values.categoria;
    if (values.etapa) updateData.etapa = values.etapa;
    if (values.unidade) updateData.unidade = values.unidade;
    if (values.numero_nf) updateData.numero_nf = values.numero_nf;
    if (values.observacoes) updateData.observacoes = values.observacoes;
    // Tratar insumos baseado no tipo selecionado
    if (tipoInsumo === 'sinapi') {
      // Para insumos SINAPI
      if (values.sinapi_codigo) updateData.sinapi_codigo = values.sinapi_codigo;
      if (values.sinapi_referencia_id) updateData.sinapi_referencia_id = values.sinapi_referencia_id;
      
      // Adicionar dados SINAPI se selecionado
      if (sinapiSelecionado) {
        const valorReal = values.valor_unitario;
        const valorSinapi = sinapiSelecionado.preco_unitario;
        const variacao = sinapiHook.calcularVariacao(valorReal, valorSinapi);
        
        updateData.sinapi_variacao_percentual = variacao;
        updateData.sinapi_valor_referencia = valorSinapi;
      }
      
      // Limpar campos manuais
      updateData.insumo = null;
      updateData.insumo_customizado = null;
    } else {
      // Para insumos manuais
      if (values.insumo) updateData.insumo = values.insumo;
      if (values.insumo_customizado) updateData.insumo_customizado = values.insumo_customizado;
      
      // Limpar campos SINAPI
      updateData.sinapi_codigo = null;
      updateData.sinapi_referencia_id = null;
      updateData.sinapi_variacao_percentual = null;
      updateData.sinapi_valor_referencia = null;
    }

    if (values.fornecedor_pj_id && values.fornecedor_pj_id !== '__NONE__') {
      updateData.fornecedor_pj_id = values.fornecedor_pj_id;
    }
    
    if (values.fornecedor_pf_id && values.fornecedor_pf_id !== '__NONE__') {
      updateData.fornecedor_pf_id = values.fornecedor_pf_id;
    }

    if (updateData.pago) {
      if (values.data_pagamento) {
        updateData.data_pagamento = values.data_pagamento;
      }
      if (values.forma_pagamento) {
        updateData.forma_pagamento = values.forma_pagamento;
      }
    } else {
      updateData.data_pagamento = null;
      updateData.forma_pagamento = null;
    }

    updateDespesa.mutate({ 
      id, 
      data: updateData 
    }, {
      onSuccess: () => {
        if (updateData.pago && updateData.data_pagamento && updateData.forma_pagamento) {
          toast.success(
            `Despesa atualizada como paga em ${formatDate(updateData.data_pagamento)} via ${updateData.forma_pagamento}`
          );
        } else {
          toast.success("Despesa atualizada com sucesso!");
        }
        navigate("/dashboard/despesas");
      },
      onError: (error) => {
        toast.error("Erro ao atualizar despesa");
      }
    });
  };

  const isLoading = isLoadingDespesa || isLoadingObras || isLoadingPJ || isLoadingPF;

  if (isLoading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
            <p className="text-muted-foreground">Carregando dados da despesa...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (despesaError) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 space-y-4"
        >
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Erro ao carregar despesa</h3>
            <p className="text-muted-foreground">Não foi possível carregar os dados da despesa.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/despesas")} variant="outline">
            Voltar para a lista
          </Button>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (!despesa) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 space-y-4"
        >
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Despesa não encontrada</h3>
            <p className="text-muted-foreground">A despesa solicitada não foi encontrada.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/despesas")} variant="outline">
            Voltar para a lista
          </Button>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 overflow-visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center shadow-xl">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Editar Despesa</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Atualize as informações da despesa</span>
                {despesa && (
                  <Badge variant="outline" className="ml-2">
                    ID: {despesa.id?.slice(0, 8)}...
                  </Badge>
                )}
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="border-border/50 hover:bg-accent"
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Ocultar' : 'Visualizar'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard/despesas")}
              className="border-border/50 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </motion.div>
        </div>

        {/* Preview Card */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Calculator className="h-5 w-5" />
                    Prévia da Despesa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Valor Unitário</p>
                      <p className="text-xl font-bold text-emerald-600">R$ {valorUnitario.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Quantidade</p>
                      <p className="text-xl font-bold text-blue-600">{quantidade}</p>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-green-600">R$ {valorTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção 1: Informações Básicas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-visible">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('basicInfo')}>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Informações Básicas
                      <Badge variant="outline" className="ml-2">
                        Obrigatório
                      </Badge>
                    </div>
                    {sectionsExpanded.basicInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {sectionsExpanded.basicInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4 overflow-visible">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="obra_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Obra
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/50">
                                      <SelectValue placeholder="Selecione uma obra" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {obras?.map((obra) => (
                                      <SelectItem key={obra.id} value={obra.id}>
                                        {obra.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="data_despesa"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Data da Despesa
                                </FormLabel>
                                <FormControl>
                                  <DatePicker
                                    date={field.value}
                                    onDateChange={field.onChange}
                                    className="bg-background/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descreva a despesa detalhadamente..."
                                  {...field} 
                                  className="bg-background/50 min-h-20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Seção 2: Classificação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-visible">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('classification')}>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-500" />
                      Classificação
                      <Badge variant="secondary" className="ml-2">
                        Opcional
                      </Badge>
                    </div>
                    {sectionsExpanded.classification ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {sectionsExpanded.classification && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4 overflow-visible">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="categoria"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Categoria
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/50">
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MATERIAL_CONSTRUCAO">Material de Construção</SelectItem>
                                    <SelectItem value="MAO_DE_OBRA">Mão de Obra</SelectItem>
                                    <SelectItem value="ALUGUEL_EQUIPAMENTOS">Aluguel de Equipamentos</SelectItem>
                                    <SelectItem value="SERVICOS_TERCEIROS">Serviços de Terceiros</SelectItem>
                                    <SelectItem value="OUTROS">Outros</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="etapa"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4" />
                                  Etapa
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/50">
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="FUNDACAO">Fundação</SelectItem>
                                    <SelectItem value="ESTRUTURA">Estrutura</SelectItem>
                                    <SelectItem value="ALVENARIA">Alvenaria</SelectItem>
                                    <SelectItem value="COBERTURA">Cobertura</SelectItem>
                                    <SelectItem value="INSTALACOES">Instalações</SelectItem>
                                    <SelectItem value="ACABAMENTO">Acabamento</SelectItem>
                                    <SelectItem value="PAISAGISMO">Paisagismo</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="md:col-span-3">
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Tipo de Insumo
                              </FormLabel>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  type="button"
                                  variant={tipoInsumo === 'sinapi' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleTipoInsumoChange('sinapi')}
                                  className="flex items-center gap-2"
                                >
                                  <Search className="h-4 w-4" />
                                  SINAPI
                                </Button>
                                <Button
                                  type="button"
                                  variant={tipoInsumo === 'manual' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleTipoInsumoChange('manual')}
                                  className="flex items-center gap-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  Manual
                                </Button>
                              </div>
                            </FormItem>
                          </div>
                        </div>
                        
                        {/* Seção de Insumos */}
                        <div className="border-t pt-4 mt-4">
                          <AnimatePresence mode="wait">
                            {tipoInsumo === 'sinapi' ? (
                              <motion.div
                                key="sinapi"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 overflow-visible"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <Search className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium">Buscar Insumo SINAPI</span>
                                  {insumoOriginal?.tipo === 'sinapi' && insumoOriginal.codigo && (
                                    <Badge variant="outline" className="text-xs">
                                      Original: {insumoOriginal.codigo}
                                    </Badge>
                                  )}
                                </div>
                                
                                <SinapiSelectorDespesas
                                  onSelect={handleSinapiSelect}
                                  selectedItem={sinapiSelecionado}
                                  placeholder="Buscar insumo SINAPI (ex: cimento, areia, tijolo...)"
                                  className="w-full"
                                />
                                
                                {sinapiSelecionado && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                        {sinapiSelecionado.codigo}
                                      </Badge>
                                      <span className="text-sm font-medium">{sinapiSelecionado.descricao}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Preço SINAPI: R$ {sinapiSelecionado.preco_unitario.toFixed(2)} / {sinapiSelecionado.unidade}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Indicador de Variação */}
                                {sinapiSelecionado && (
                                  <VariacaoSinapiIndicator
                                    valorReal={form.watch('valor_unitario') || 0}
                                    valorSinapi={sinapiSelecionado.preco_unitario}
                                    className="mt-2"
                                  />
                                )}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="manual"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium">Insumo Manual</span>
                                  {insumoOriginal?.tipo === 'manual' && insumoOriginal.descricao && (
                                    <Badge variant="outline" className="text-xs">
                                      Original: {insumoOriginal.descricao}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="insumo"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Tipo de Insumo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                          <FormControl>
                                            <SelectTrigger className="bg-background/50">
                                              <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="CIMENTO">Cimento</SelectItem>
                                            <SelectItem value="AREIA">Areia</SelectItem>
                                            <SelectItem value="BRITA">Brita</SelectItem>
                                            <SelectItem value="FERRO">Ferro</SelectItem>
                                            <SelectItem value="MADEIRA">Madeira</SelectItem>
                                            <SelectItem value="TIJOLO">Tijolo</SelectItem>
                                            <SelectItem value="CONCRETO">Concreto</SelectItem>
                                            <SelectItem value="CERAMICA">Cerâmica</SelectItem>
                                            <SelectItem value="TINTA">Tinta</SelectItem>
                                            <SelectItem value="ELETRICO">Material Elétrico</SelectItem>
                                            <SelectItem value="HIDRAULICO">Material Hidráulico</SelectItem>
                                            <SelectItem value="OUTROS">Outros</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="insumo_customizado"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Descrição Personalizada</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Ex: Cimento CP II-Z-32 50kg"
                                            {...field}
                                            className="bg-background/50"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Seção 3: Valores Financeiros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('financial')}>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Valores Financeiros
                      <Badge variant="outline" className="ml-2">
                        Obrigatório
                      </Badge>
                    </div>
                    {sectionsExpanded.financial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {sectionsExpanded.financial && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="quantidade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="1.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                                    className="bg-background/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="valor_unitario"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor Unitário (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="25.50"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className="bg-background/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="unidade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unidade</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="ex: m², kg, un"
                                    {...field}
                                    className="bg-background/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Valor Total Calculado:</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              R$ {valorTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Seção 4: Fornecedor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('supplier')}>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-orange-500" />
                      Fornecedor
                      <Badge variant="secondary" className="ml-2">
                        Opcional
                      </Badge>
                    </div>
                    {sectionsExpanded.supplier ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {sectionsExpanded.supplier && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fornecedor_pj_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Fornecedor PJ
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/50">
                                      <SelectValue placeholder="Selecione um fornecedor PJ" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="__NONE__">Nenhum</SelectItem>
                                    {fornecedoresPJ?.map((fornecedor) => (
                                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                        {fornecedor.razao_social}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="fornecedor_pf_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Fornecedor PF
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger className="bg-background/50">
                                      <SelectValue placeholder="Selecione um fornecedor PF" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="__NONE__">Nenhum</SelectItem>
                                    {fornecedoresPF?.map((fornecedor) => (
                                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                        {fornecedor.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="numero_nf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Número da Nota Fiscal
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 123456"
                                  {...field}
                                  className="bg-background/50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Seção 5: Pagamento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className={cn(
                "border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300",
                isPago && "border-green-200 bg-green-50/50 dark:bg-green-900/10"
              )}>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('payment')}>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className={cn("h-5 w-5", isPago ? "text-green-500" : "text-yellow-500")} />
                      Informações de Pagamento
                      <Badge variant={isPago ? "default" : "secondary"} className="ml-2">
                        {isPago ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    {sectionsExpanded.payment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {sectionsExpanded.payment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="pago"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  {field.value ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                  Despesa foi paga
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <AnimatePresence>
                          {isPago && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-green-200"
                            >
                              <FormField
                                control={form.control}
                                name="data_pagamento"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Data do Pagamento
                                    </FormLabel>
                                    <FormControl>
                                      <DatePicker
                                        date={field.value}
                                        onDateChange={field.onChange}
                                        className="bg-background/50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="forma_pagamento"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Forma de Pagamento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                      <FormControl>
                                        <SelectTrigger className="bg-background/50">
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {formasPagamento.map((forma) => (
                                          <SelectItem key={forma} value={forma}>
                                            {forma}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Seção 6: Informações Adicionais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('additional')}>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      Informações Adicionais
                      <Badge variant="secondary" className="ml-2">
                        Opcional
                      </Badge>
                    </div>
                    {sectionsExpanded.additional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {sectionsExpanded.additional && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="observacoes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Adicione observações, comentários ou informações adicionais..."
                                  {...field}
                                  className="bg-background/50 min-h-24"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Botões de Ação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row justify-end gap-3 pt-6"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={updateDespesa.isPending}
                onClick={() => navigate("/dashboard/despesas")}
                className="border-border/50 hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="lg"
                disabled={updateDespesa.isPending}
                className={cn(
                  "bg-gradient-to-r from-emerald-500 to-green-500",
                  "hover:from-emerald-600 hover:to-green-600",
                  "text-white shadow-lg font-semibold min-w-[140px]"
                )}
              >
                {updateDespesa.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </DashboardLayout>
  );
};

export default EditarDespesa;