// Bibliotecas externas
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building, DollarSign, Info, Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Componentes de layout
import DashboardLayout from "@/components/layouts/DashboardLayout";
// Componentes UI
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormWrapper } from "@/components/ui/FormWrapper";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// Contextos
import { useAuth } from "@/contexts/auth";
// Hooks
import { useCEP } from "@/hooks/useCEP";
// Integrações
import { supabase } from "@/integrations/supabase/client";
// Utilitários e validações
import { brazilianStates } from "@/lib/i18n";
import type { ObraFormValues } from "@/lib/validations/obra";
import { obraSchema } from "@/lib/validations/obra";
// Serviços
import { obrasApi } from "@/services/api";

const NovaObraRefactored = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { buscarCEP, formatarCEP, isLoading: isLoadingCEP, error: cepError } = useCEP();
  const { user } = useAuth();
  const tenantId = user?.profile?.tenant_id;
  const [construtoras, setConstrutoras] = useState<Array<{
    id: string;
    tipo: string;
    nome_razao_social: string;
    nome_fantasia?: string | null;
    documento: string;
  }>>([]);
  const [loadingConstrutoras, setLoadingConstrutoras] = useState(true);
  
  const form = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      nome: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      orcamento: 0,
      construtora_id: "",
      data_inicio: null,
      data_prevista_termino: null,
    },
  });

  // Usando mutação direta
  const { mutate, isPending } = useMutation({
    mutationFn: obrasApi.create,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["obras"] });
      await queryClient.invalidateQueries({ queryKey: ["orcamentos-parametricos"] });
      await queryClient.invalidateQueries({ queryKey: ["orcamentos-com-itens"] });
      toast.success("Obra criada com sucesso!", {
        description: `A obra "${form.getValues('nome')}" foi registrada.`,
      });
      navigate("/dashboard/obras");
    },
    onError: (error) => {
      console.error("Error creating obra:", error);
      toast.error("Erro ao criar obra. Tente novamente.");
    },
  });

  const onSubmit = (values: ObraFormValues) => {
    mutate(values);
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
        
        toast.success("Endereço preenchido automaticamente!");
      } else if (cepError) {
        toast.error(cepError);
      }
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    setLoadingConstrutoras(true);
    supabase
      .from("construtoras")
      .select("id, tipo, nome_razao_social, nome_fantasia, documento")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setConstrutoras(data || []);
        setLoadingConstrutoras(false);
      });
  }, [tenantId]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header usando o componente refatorado */}
        <PageHeader
          icon={<Building className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
          title="Nova Obra"
          description="Cadastre uma nova obra no sistema"
          backTo="/dashboard/obras"
          backLabel="Voltar"
        />

        {/* Alert informativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Alert className="border-info/50 bg-info/10">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-sm">
              <strong>Dica:</strong> Comece preenchendo o CEP para que o endereço seja preenchido automaticamente. 
              Você poderá editar esses dados posteriormente se necessário.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Formulário usando o componente refatorado */}
        <FormWrapper
          form={form}
          onSubmit={onSubmit}
          title="Informações da Obra"
          description="Preencha os dados básicos da obra que será cadastrada"
          isLoading={isPending}
          submitLabel="Salvar Obra"
        >
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
                      Digite o CEP para preenchimento automático do endereço
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
                                ? `${c.nome_razao_social} (CNPJ: ${c.documento})`
                                : `${c.nome_fantasia || c.nome_razao_social} (CPF/CNPJ: ${c.documento})`}
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
        </FormWrapper>
      </motion.div>
    </DashboardLayout>
  );
};

export default NovaObraRefactored;