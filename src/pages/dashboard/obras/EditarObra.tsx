import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Building, 
  ArrowLeft, 
  MapPin, 
  DollarSign,
  Save,
  Info,
  Loader2,
  AlertTriangle,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Novos padrões implementados
import { FormProvider, useFormContext } from '@/contexts/FormContext';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

import type { ObraFormValues } from "@/lib/validations/obra";
import { obraSchema } from "@/lib/validations/obra";
import { obrasApi } from "@/services/api";
import { brazilianStates } from "@/lib/i18n";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
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
import { toast } from "sonner";
import { useCEP } from "@/hooks/useCEP";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

// Componente interno que usa FormContext
const EditarObraForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { buscarCEP, formatarCEP, isLoading: isLoadingCEP, error: cepError } = useCEP();
  const { user } = useAuth();
  const { form } = useFormContext<ObraFormValues>();
  const tenantId = user?.profile?.tenant_id;
  const [construtoras, setConstrutoras] = useState<{ id: string; tipo: string; nome_razao_social: string; nome_fantasia?: string; documento: string }[]>([]);
  const [loadingConstrutoras, setLoadingConstrutoras] = useState(true);
  
  // Operação assíncrona para atualização da obra
  const { executeAsync, isLoading: isUpdating } = useAsyncOperation();

  const { data: obra, isLoading, isError } = useQuery({
    queryKey: ["obra", id],
    queryFn: () => obrasApi.getById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (obra) {
      form.reset({
        nome: obra.nome,
        endereco: obra.endereco,
        cidade: obra.cidade,
        estado: obra.estado,
        cep: obra.cep,
        orcamento: obra.orcamento,
        data_inicio: obra.data_inicio ? new Date(obra.data_inicio) : null,
        data_prevista_termino: obra.data_prevista_termino ? new Date(obra.data_prevista_termino) : null,
      });
    }
  }, [obra, form]);

  useEffect(() => {
    if (!tenantId) return;
    setLoadingConstrutoras(true);
    supabase
      .from("construtoras")
      .select("id, tipo, nome_razao_social, nome_fantasia, documento")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao buscar construtoras:", error);
          toast.error("Erro ao carregar construtoras");
        }
        setConstrutoras(data || []);
        setLoadingConstrutoras(false);
      });
  }, [tenantId]);

  const onSubmit = async (values: ObraFormValues) => {
    if (!id) {
      throw new Error('ID da obra não encontrado');
    }

    await executeAsync(
      () => obrasApi.update(id, values),
      {
        loadingKey: 'update-obra',
        successMessage: 'Obra atualizada com sucesso!',
        errorMessage: 'Erro ao atualizar obra. Tente novamente.',
        onSuccess: () => {
          // ✅ Invalidar cache da obra específica E todas as obras
          queryClient.invalidateQueries({ queryKey: ["obra", id] });
          queryClient.invalidateQueries({ queryKey: ["obras"] });
          
          console.log("Cache invalidado após atualização da obra");
          // ✅ Voltar para a página de detalhes da obra ao invés da lista
          navigate(`/dashboard/obras/${id}`);
        }
      }
    );
  };

  // Função para buscar endereço automaticamente quando CEP for preenchido
  const handleCEPChange = async (cep: string) => {
    // Formatar CEP enquanto digita
    const cepFormatado = formatarCEP(cep);
    form.setValue('cep', cepFormatado);

    // Buscar endereço quando CEP estiver completo (8 dígitos)
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      const dadosCEP = await buscarCEP(cep);
      
      if (dadosCEP) {
        // Preencher automaticamente os campos de endereço
        form.setValue('endereco', dadosCEP.logradouro || '');
        form.setValue('cidade', dadosCEP.localidade || '');
        form.setValue('estado', dadosCEP.uf || '');
        
        toast.success("Endereço atualizado automaticamente!");
      } else if (cepError) {
        // Usar toast do FormContext se disponível
        console.error('Erro CEP:', cepError);
      }
    }
  };

  const isFormLoading = isLoading || isUpdating || loadingConstrutoras;

  if (isLoading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-muted-foreground">Carregando dados da obra...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (isError || !obra) {
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
            <h3 className="text-lg font-semibold">Erro ao carregar obra</h3>
            <p className="text-muted-foreground">Não foi possível carregar os dados da obra.</p>
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
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Editar Obra</h1>
              <p className="text-sm text-muted-foreground">
                Atualize as informações da obra
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
              onClick={() => navigate(`/dashboard/obras/${id}`)}
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voltar
            </Button>
          </motion.div>
        </div>

        {/* Alert informativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Alert className="border-info/50 bg-info/10">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-sm">
              <strong>Dica:</strong> Altere o CEP para atualizar automaticamente o endereço, cidade e estado.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informações da Obra</CardTitle>
              <CardDescription>
                Atualize os dados da obra conforme necessário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Seção: Localização (CEP primeiro) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </h3>
                    
                    {/* CEP como primeiro campo */}
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            CEP
                            {isLoadingCEP && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="00000-000"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleCEPChange(e.target.value);
                                }}
                                className="bg-background/50 focus:bg-background transition-colors pr-10"
                                maxLength={9}
                              />
                              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Altere o CEP para atualização automática do endereço
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Rua, número, complemento"
                                {...field}
                                className="bg-background/50 focus:bg-background transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nome da cidade"
                                {...field}
                                className="bg-background/50 focus:bg-background transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  {brazilianStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.value} - {state.label}
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
                  </div>

                  {/* Seção: Identificação */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      Identificação
                      <div className="h-px flex-1 bg-border" />
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Obra</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Edifício Residencial Aurora"
                              {...field}
                              className="bg-background/50 focus:bg-background transition-colors"
                            />
                          </FormControl>
                          <FormDescription>
                            Nome que identificará a obra no sistema
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="construtora_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Construtora / Autônomo Responsável</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={loadingConstrutoras}
                            >
                              <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                <SelectValue placeholder={loadingConstrutoras ? "Carregando..." : "Selecione a construtora/autônomo"} />
                              </SelectTrigger>
                              <SelectContent>
                                {construtoras.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.tipo === "pj"
                                      ? `${c.nome_fantasia || c.nome_razao_social} (CNPJ: ${c.documento})`
                                      : `${c.nome_razao_social} (CPF: ${c.documento})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Selecione a construtora ou autônomo responsável pela obra
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Seção: Financeiro e Prazos */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financeiro e Prazos
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="orcamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orçamento</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="0,00"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    // ✅ Evitar NaN: se for NaN, usar 0
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }}
                                  className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Valor total do orçamento da obra
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="data_inicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value || undefined}
                                onSelect={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Previsão de início
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="data_prevista_termino"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Término</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value || undefined}
                                onSelect={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Previsão de conclusão
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/obras/${id}`)}
                      disabled={isFormLoading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className={cn(
                        "min-w-[120px]",
                                      "bg-gradient-to-r from-blue-500 to-blue-600",
              "hover:from-blue-600 hover:to-blue-700",
                        "text-white shadow-lg",
                        "transition-all duration-300"
                      )}
                    >
                      {isFormLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Atualizar Obra
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

// Componente principal com FormProvider
const EditarObra: React.FC = () => {
  return (
    <FormProvider
      schema={obraSchema}
      defaultValues={{
        nome: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        orcamento: 0,
        data_inicio: null,
        data_prevista_termino: null,
      }}
      onSubmit={() => Promise.resolve()} // Será sobrescrito pelo componente interno
    >
      <EditarObraForm />
    </FormProvider>
  );
};

export default EditarObra;
