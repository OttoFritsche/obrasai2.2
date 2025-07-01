import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Receipt, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  Plus,
  Loader2,
  AlertTriangle,
  Search,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Constants } from "@/integrations/supabase/types";
import { despesaSchema, DespesaFormValues, formasPagamento } from "@/lib/validations/despesa";
import { despesasApi, obrasApi, fornecedoresPJApi, fornecedoresPFApi } from "@/services/api";
import { useAuth } from "@/contexts/auth";
import { useSinapiDespesas, SinapiItem } from "@/hooks/useSinapiDespesas";
import { SinapiSelectorDespesas } from "@/components/SinapiSelectorDespesas";
import { VariacaoSinapiIndicator } from "@/components/VariacaoSinapiIndicator";
import { InsumoAnalysisCard } from "@/components/InsumoAnalysisCard";
import { formatDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const NovaDespesa = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Obter parâmetros da URL
  const obraIdFromUrl = searchParams.get('obra_id');
  const retornarPara = searchParams.get('return');
  
  // Obter tenant_id corretamente
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;
  
  const form = useForm<DespesaFormValues>({
    resolver: zodResolver(despesaSchema),
    defaultValues: {
      obra_id: obraIdFromUrl || "",  // ✅ Pré-popular obra da URL
      descricao: "",
      data_despesa: new Date(),
      quantidade: 1,
      valor_unitario: 0,
      pago: false,
      data_pagamento: null,
      forma_pagamento: null,
    },
  });

  // Estado para dados SINAPI
  const [sinapiSelecionado, setSinapiSelecionado] = useState<SinapiItem | null>(null);
  // Estado para controlar o tipo de insumo (SINAPI ou manual)
  const [tipoInsumo, setTipoInsumo] = useState<'sinapi' | 'manual'>('sinapi');
  const { calcularVariacao } = useSinapiDespesas();

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

  const { mutate, isPending } = useMutation({
    mutationFn: (despesa: DespesaFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return despesasApi.create(despesa, validTenantId);
    },
    onSuccess: (data, variables) => {
      if (variables.pago && variables.data_pagamento && variables.forma_pagamento) {
        toast.success(
          `Despesa registrada como paga em ${formatDate(variables.data_pagamento)} via ${variables.forma_pagamento}`
        );
      } else {
        toast.success("Despesa criada com sucesso!");
      }
      
      // ✅ Redirecionar para página de retorno ou lista de despesas
      const redirectTo = retornarPara || "/dashboard/despesas";
      navigate(redirectTo);
    },
    onError: (error) => {
      console.error("Error creating despesa:", error);
      toast.error("Erro ao criar despesa");
    },
  });

  const onSubmit = (values: DespesaFormValues) => {
    // ✅ Criar cópia limpa dos dados - apenas campos essenciais primeiro
    const submissionData: any = {
      obra_id: values.obra_id,
      descricao: values.descricao,
      data_despesa: values.data_despesa,
      quantidade: values.quantidade,
      valor_unitario: values.valor_unitario,
      pago: values.pago || false,
    };

    // ✅ Adicionar campos opcionais apenas se não forem null/undefined
    if (values.categoria) {
      submissionData.categoria = values.categoria;
    }
    
    if (values.etapa) {
      submissionData.etapa = values.etapa;
    }
    
    if (values.unidade) {
      submissionData.unidade = values.unidade;
    }
    
    if (values.numero_nf) {
      submissionData.numero_nf = values.numero_nf;
    }
    
    if (values.observacoes) {
      submissionData.observacoes = values.observacoes;
    }

    // ✅ Adicionar fornecedores apenas se válidos
    if (values.fornecedor_pj_id && values.fornecedor_pj_id !== '__NONE__') {
      submissionData.fornecedor_pj_id = values.fornecedor_pj_id;
    }
    
    if (values.fornecedor_pf_id && values.fornecedor_pf_id !== '__NONE__') {
      submissionData.fornecedor_pf_id = values.fornecedor_pf_id;
    }

    // ✅ Tratar campos de pagamento
    if (submissionData.pago) {
      if (values.data_pagamento) {
        submissionData.data_pagamento = values.data_pagamento;
      }
      if (values.forma_pagamento) {
        submissionData.forma_pagamento = values.forma_pagamento;
      }
    }

    // ✅ Tratar insumos baseado no tipo selecionado
    if (tipoInsumo === 'sinapi') {
      // Para insumos SINAPI
      if (values.insumo) {
        submissionData.insumo = values.insumo;
      }
      
      // Adicionar dados SINAPI se selecionado
      if (sinapiSelecionado) {
        const valorReal = values.valor_unitario;
        const valorSinapi = sinapiSelecionado.preco_unitario;
        const variacao = calcularVariacao(valorReal, valorSinapi);

        submissionData.codigo_sinapi = sinapiSelecionado.codigo;
        submissionData.valor_referencia_sinapi = valorSinapi;
        submissionData.variacao_sinapi = variacao;
        submissionData.fonte_sinapi = sinapiSelecionado.fonte;
        submissionData.estado_referencia = sinapiSelecionado.estado || 'SP';
      }
    } else {
      // Para insumos manuais
      if (values.insumo_customizado) {
        submissionData.insumo_customizado = values.insumo_customizado;
      }
    }

    // ✅ Debug: log dos dados que serão enviados
    // console.log('🚀 Dados finais para API:', {
    //   submissionData,
    //   tipoInsumo,
    //   sinapiSelecionado: sinapiSelecionado ? sinapiSelecionado.codigo : null,
    //   originalValues: values
    // });
    
    mutate(submissionData);
  };

  // Handler para seleção de item SINAPI
  const handleSinapiSelect = (item: SinapiItem) => {
    setSinapiSelecionado(item);
    
    // Preencher campos do formulário com dados do SINAPI
    form.setValue('descricao', item.descricao);
    form.setValue('unidade', item.unidade);
    
    // Sugerir valor unitário (usuário pode alterar)
    if (item.preco_unitario > 0) {
      form.setValue('valor_unitario', item.preco_unitario);
    }
  };

  const isLoading = isLoadingObras || isLoadingPJ || isLoadingPF;

  // ✅ Função helper para converter enum em label legível
  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      "MATERIAL_CONSTRUCAO": "Material de Construção",
      "MAO_DE_OBRA": "Mão de Obra",
      "ALUGUEL_EQUIPAMENTOS": "Aluguel de Equipamentos",
      "TRANSPORTE_FRETE": "Transporte/Frete",
      "TAXAS_LICENCAS": "Taxas e Licenças",
      "SERVICOS_TERCEIRIZADOS": "Serviços Terceirizados",
      "ADMINISTRATIVO": "Administrativo",
      "IMPREVISTOS": "Imprevistos",
      "OUTROS": "Outros",
      "DEMOLICAO_REMOCAO": "Demolição/Remoção",
      "PROTECAO_ESTRUTURAL": "Proteção Estrutural",
      "AQUISICAO_TERRENO_AREA": "Aquisição Terreno/Área",
      "AQUISICAO_IMOVEL_REFORMA_LEILAO": "Aquisição Imóvel/Reforma/Leilão"
    };
    return labels[categoria] || categoria.replace(/_/g, ' ');
  };

  const getEtapaLabel = (etapa: string) => {
    const labels: Record<string, string> = {
      "FUNDACAO": "Fundação",
      "ESTRUTURA": "Estrutura", 
      "ALVENARIA": "Alvenaria",
      "COBERTURA": "Cobertura",
      "INSTALACOES": "Instalações",
      "ACABAMENTO": "Acabamento",
      "OUTROS": "Outros"
    };
    return labels[etapa] || etapa.replace(/_/g, ' ');
  };

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
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
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
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Adicionar Despesa</h1>
              <p className="text-sm text-muted-foreground">
                {obraIdFromUrl ? (
                  <>
                    Registre uma compra ou gasto na obra selecionada
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      ✓ Obra pré-selecionada
                    </span>
                  </>
                ) : (
                  "Registre uma compra ou gasto da sua obra"
                )}
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              onClick={() => navigate(retornarPara || "/dashboard/despesas")}
              className="border-border/50 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-green-500" />
                Dados da Compra/Gasto
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha as informações básicas da sua despesa
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Seção Básica */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      O que você comprou/gastou?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="obra_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Obra</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Selecione uma obra" />
                                </SelectTrigger>
                                <SelectContent>
                                  {obras?.map((obra) => (
                                    <SelectItem key={obra.id} value={obra.id}>
                                      {obra.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Descrição da despesa"
                                {...field} 
                                className="bg-background/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="data_despesa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data da Despesa</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value}
                                onSelect={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ''}
                                onValueChange={(value) => field.onChange(value === '' ? null : value)}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Constants.public.Enums.categoria_enum.map((categoria) => (
                                    <SelectItem key={categoria} value={categoria}>
                                      {getCategoriaLabel(categoria)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Campo único para insumo - simples e direto */}
                      <FormField
                        control={form.control}
                        name="insumo_customizado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Insumo/Material
                              <span className="text-xs text-muted-foreground ml-2">
                                (ex: Cimento CP-II, Areia lavada, Tijolo cerâmico...)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite o nome do insumo ou material"
                                {...field}
                                value={field.value ?? ''}
                                className="bg-background/50"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  // Limpar dados SINAPI anteriores se estiver editando
                                  form.setValue('insumo', null);
                                  form.setValue('sinapi_codigo', null);
                                  form.setValue('sinapi_referencia_id', null);
                                  setSinapiSelecionado(null);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Botão opcional para buscar referência SINAPI */}
                      {form.watch('insumo_customizado') && form.watch('insumo_customizado')!.length > 3 && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                💡 Quer comparar com o preço de referência?
                              </h4>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                O SINAPI é a tabela nacional de preços. Isso ajuda a saber se você está pagando um bom preço.
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setTipoInsumo(tipoInsumo === 'sinapi' ? 'manual' : 'sinapi')}
                              className="ml-3 text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
                            >
                              {tipoInsumo === 'sinapi' ? 'Não comparar' : 'Buscar SINAPI'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Área de busca SINAPI (apenas quando solicitado) */}
                      {tipoInsumo === 'sinapi' && form.watch('insumo_customizado') && (
                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Buscar referência SINAPI
                          </h4>
                          <SinapiSelectorDespesas
                            onSelect={(item) => {
                              setSinapiSelecionado(item);
                              // Opcional: sugerir ajustar o valor para o SINAPI
                              if (item.preco_unitario > 0 && !form.getValues('valor_unitario')) {
                                form.setValue('valor_unitario', item.preco_unitario);
                              }
                              if (item.unidade && !form.getValues('unidade')) {
                                form.setValue('unidade', item.unidade);
                              }
                            }}
                            placeholder={`Buscar "${form.watch('insumo_customizado')}" no SINAPI...`}
                            className="w-full"
                          />
                          
                          {sinapiSelecionado && (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                  ✓ Referência encontrada
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSinapiSelecionado(null)}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  Remover
                                </button>
                              </div>
                              <p className="text-sm font-medium">{sinapiSelecionado.descricao}</p>
                              <p className="text-xs text-muted-foreground">
                                <strong>Código:</strong> {sinapiSelecionado.codigo} | 
                                <strong> Preço ref.:</strong> R$ {sinapiSelecionado.preco_unitario.toFixed(2)}/{sinapiSelecionado.unidade}
                              </p>
                              
                              {form.watch('valor_unitario') > 0 && (
                                <VariacaoSinapiIndicator
                                  valorReal={form.watch('valor_unitario')}
                                  valorSinapi={sinapiSelecionado.preco_unitario}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="etapa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Etapa</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ''}
                                onValueChange={(value) => field.onChange(value === '' ? null : value)}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Selecione uma etapa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Constants.public.Enums.etapa_enum.map((etapa) => (
                                    <SelectItem key={etapa} value={etapa}>
                                      {getEtapaLabel(etapa)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                placeholder="ex: m², kg, unid" 
                                {...field}
                                value={field.value ?? ''}
                                className="bg-background/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção Financeira - Mais Intuitiva */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                      <DollarSign className="h-4 w-4" />
                      Valores da Compra
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="quantidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Quantidade
                              <span className="text-xs text-muted-foreground ml-1">(ex: 5)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="5.00"
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
                            <FormLabel>
                              Unidade
                              <span className="text-xs text-muted-foreground ml-1">(m², kg, un...)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ex: m², kg, un, sc"
                                {...field}
                                value={field.value ?? ''}
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
                            <FormLabel>
                              Preço Unitário
                              <span className="text-xs text-muted-foreground ml-1">(por unidade)</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="25.50"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  className="bg-background/50 pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Calculadora Visual */}
                    {form.watch("valor_unitario") > 0 && form.watch("quantidade") > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">📊 Cálculo:</span>
                          <span className="text-muted-foreground">
                            {form.watch("quantidade")} {form.watch("unidade") || "unidades"} × R$ {form.watch("valor_unitario").toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                            Valor Total:
                          </span>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            R$ {(form.watch("valor_unitario") * form.watch("quantidade")).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seção Fornecedores - Simplificada */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                      <User className="h-4 w-4" />
                      🏢 Fornecedor da Compra
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Dica:</strong> Selecione apenas um tipo de fornecedor (empresa ou pessoa física)
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fornecedor_pj_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                🏢 Empresa/Loja (CNPJ)
                                <span className="text-xs text-muted-foreground ml-2">(ex: Material de Construção XYZ)</span>
                              </FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value || ''}
                                  onValueChange={(value) => {
                                    field.onChange(value === '__NONE__' ? null : value);
                                    if (value && value !== '__NONE__') {
                                      form.setValue("fornecedor_pf_id", null, { shouldValidate: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Escolher empresa/loja" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__NONE__">Não é empresa</SelectItem>
                                    {fornecedoresPJ?.map((fornecedor) => (
                                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                        {fornecedor.razao_social} ({fornecedor.cnpj})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fornecedor_pf_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                👤 Pessoa Física (CPF)
                                <span className="text-xs text-muted-foreground ml-2">(ex: Pedreiro, marceneiro...)</span>
                              </FormLabel>
                              <FormControl>
                                <Select
                                   value={field.value || ''}
                                   onValueChange={(value) => {
                                     field.onChange(value === '__NONE__' ? null : value);
                                    if (value && value !== '__NONE__') {
                                      form.setValue("fornecedor_pj_id", null, { shouldValidate: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Escolher pessoa física" />
                                  </SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="__NONE__">Não é pessoa física</SelectItem>
                                    {fornecedoresPF?.map((fornecedor) => (
                                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                        {fornecedor.nome} ({fornecedor.cpf})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                            <FormLabel>
                              📄 Número da Nota Fiscal
                              <span className="text-xs text-muted-foreground ml-2">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="ex: 000123 (se tiver nota fiscal)" 
                                {...field} 
                                value={field.value ?? ''}
                                className="bg-background/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção Observações */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                      <FileText className="h-4 w-4" />
                      Observações (opcional)
                    </h3>
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Alguma observação sobre esta compra?
                            <span className="text-xs text-muted-foreground ml-2">(ex: desconto obtido, qualidade do material...)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="ex: Material de boa qualidade, consegui 10% de desconto à vista"
                              {...field}
                              value={field.value ?? ''}
                              className="bg-background/50 min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Seção Pagamento */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                      
                      💳 Pagamento
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="pago"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4 bg-background/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (!checked) {
                                    form.setValue('data_pagamento', null);
                                    form.setValue('forma_pagamento', null);
                                  } else {
                                    if (!form.getValues('data_pagamento')) {
                                      form.setValue('data_pagamento', new Date());
                                    }
                                  }
                                }}
                                className="border-border data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">
                                Marcar como pago
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                A despesa já foi paga
                              </p>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('pago') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormField
                          control={form.control}
                          name="data_pagamento"
                          render={({ field }) => (
                            <FormItem> 
                              <FormLabel>Data do Pagamento</FormLabel>
                              <FormControl>
                                <DatePicker
                                  date={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={!form.watch('pago')}
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
                              <FormControl>
                                <Select
                                  value={field.value || ''}
                                  onValueChange={field.onChange}
                                  disabled={!form.watch('pago')}
                                >
                                  <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Selecione a forma de pagamento" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {formasPagamento.map((forma) => (
                                      <SelectItem key={forma} value={forma}>
                                        {forma}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => navigate("/dashboard/despesas")}
                      className="border-border/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancelar e Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      size="lg"
                      className={cn(
                        "bg-gradient-to-r from-green-500 to-green-600",
                        "hover:from-green-600 hover:to-green-700",
                        "text-white shadow-lg font-semibold",
                        "transition-all duration-300 transform hover:scale-[1.02]",
                        "px-8 py-3"
                      )}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          💾 Salvando despesa...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Adicionar Despesa
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default NovaDespesa;