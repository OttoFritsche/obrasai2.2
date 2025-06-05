import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Receipt, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  Save,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Constants } from "@/integrations/supabase/types";
import { despesaSchema, DespesaFormValues, formasPagamento } from "@/lib/validations/despesa";
import { despesasApi, obrasApi, fornecedoresPJApi, fornecedoresPFApi } from "@/services/api";
import { useAuth } from "@/contexts/auth";
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

const EditarDespesa = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Obter tenant_id corretamente
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;
  
  const form = useForm<DespesaFormValues>({
    resolver: zodResolver(despesaSchema),
    defaultValues: {
      descricao: "",
      data_despesa: new Date(),
      quantidade: 1,
      valor_unitario: 0,
      pago: false,
      data_pagamento: null,
      forma_pagamento: null,
    },
  });

  // Query para carregar dados da despesa
  const { data: despesa, isLoading, isError } = useQuery({
    queryKey: ["despesa", id],
    queryFn: () => {
      if (!validTenantId || !id) throw new Error('Dados inválidos');
      return despesasApi.getById(id, validTenantId);
    },
    enabled: !!validTenantId && !!id,
  });

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

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (despesa) {
      form.reset({
        obra_id: despesa.obra_id,
        descricao: despesa.descricao,
        categoria: despesa.categoria,
        insumo: despesa.insumo,
        etapa: despesa.etapa,
        unidade: despesa.unidade || "",
        data_despesa: despesa.data_despesa ? new Date(despesa.data_despesa) : new Date(),
        quantidade: despesa.quantidade,
        valor_unitario: despesa.valor_unitario,
        fornecedor_pj_id: despesa.fornecedor_pj_id || null,
        fornecedor_pf_id: despesa.fornecedor_pf_id || null,
        numero_nf: despesa.numero_nf || "",
        observacoes: despesa.observacoes || "",
        pago: despesa.pago,
        data_pagamento: despesa.data_pagamento ? new Date(despesa.data_pagamento) : null,
        forma_pagamento: despesa.forma_pagamento || null,
      });
    }
  }, [despesa, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: DespesaFormValues) => {
      if (!id) throw new Error('ID não encontrado');
      return despesasApi.update(id, values);
    },
    onSuccess: (data, variables) => {
      if (variables.pago && variables.data_pagamento && variables.forma_pagamento) {
        toast.success(
          `Despesa atualizada como paga em ${formatDate(variables.data_pagamento)} via ${variables.forma_pagamento}`
        );
      } else {
        toast.success("Despesa atualizada com sucesso!");
      }
      navigate("/dashboard/despesas");
    },
    onError: (error) => {
      console.error("Error updating despesa:", error);
      toast.error("Erro ao atualizar despesa");
    },
  });

  const onSubmit = (values: DespesaFormValues) => {
    const submissionData = { ...values };

    if (!submissionData.pago) {
      submissionData.data_pagamento = null;
      submissionData.forma_pagamento = null;
    }
    
    mutate(submissionData);
  };

  const isLoadingData = isLoading || isLoadingObras || isLoadingPJ || isLoadingPF;

  if (isLoadingData) {
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

  if (isError || !despesa) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 space-y-4"
        >
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Erro ao carregar despesa</h3>
            <p className="text-muted-foreground">Não foi possível carregar os dados da despesa.</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
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
              <h1 className="text-2xl font-bold">Editar Despesa</h1>
              <p className="text-sm text-muted-foreground">
                Atualize as informações da despesa
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
              onClick={() => navigate("/dashboard/despesas")}
              className="border-border/50 hover:bg-accent group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
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
                <Save className="h-5 w-5 text-green-500" />
                Informações da Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Seção Básica */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Informações Básicas
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
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Constants.public.Enums.categoria_enum.map((categoria) => (
                                    <SelectItem key={categoria} value={categoria}>
                                      {categoria.replace(/_/g, ' ')}
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
                        name="insumo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insumo</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Selecione um insumo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Constants.public.Enums.insumo_enum.map((insumo) => (
                                    <SelectItem key={insumo} value={insumo}>
                                      {insumo.replace(/_/g, ' ')}
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
                        name="etapa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Etapa</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Selecione uma etapa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Constants.public.Enums.etapa_enum.map((etapa) => (
                                    <SelectItem key={etapa} value={etapa}>
                                      {etapa.replace(/_/g, ' ')}
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

                  {/* Seção Financeira */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                      <DollarSign className="h-4 w-4" />
                      Informações Financeiras
                    </h3>
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
                        name="valor_unitario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Unitário (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-background/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("valor_unitario") > 0 && form.watch("quantidade") > 0 && (
                        <div className="flex items-end">
                          <div className="w-full">
                            <FormLabel>Valor Total</FormLabel>
                            <div className="h-10 flex items-center px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-md">
                              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                                R$ {(form.watch("valor_unitario") * form.watch("quantidade")).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seção Fornecedores */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                      <User className="h-4 w-4" />
                      Fornecedor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fornecedor_pj_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor (Pessoa Jurídica)</FormLabel>
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
                                  <SelectValue placeholder="Selecione um fornecedor PJ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__NONE__">Nenhum</SelectItem>
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
                            <FormLabel>Fornecedor (Pessoa Física)</FormLabel>
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
                                  <SelectValue placeholder="Selecione um fornecedor PF" />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="__NONE__">Nenhum</SelectItem>
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

                      <FormField
                        control={form.control}
                        name="numero_nf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Nota Fiscal</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="000123" 
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
                      Informações Adicionais
                    </h3>
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais sobre a despesa..."
                              {...field}
                              value={field.value ?? ''}
                              className="bg-background/50 min-h-[100px]"
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
                      <Calendar className="h-4 w-4" />
                      Status de Pagamento
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
                  <div className="flex justify-end gap-3 pt-6 border-t">
                     <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => navigate("/dashboard/despesas")}
                      className="border-border/50"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className={cn(
                        "bg-gradient-to-r from-green-500 to-green-600",
                        "hover:from-green-600 hover:to-green-700",
                        "text-white shadow-lg",
                        "transition-all duration-300"
                      )}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Atualizar Despesa
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

export default EditarDespesa; 