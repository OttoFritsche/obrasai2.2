import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign,
  Save,
  Info,
  Loader2,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { obraSchema, ObraFormValues } from "@/lib/validations/obra";
import { obrasApi } from "@/services/api";
import { t, brazilianStates } from "@/lib/i18n";
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
import { useEffect } from "react";

const NovaObra = () => {
  const navigate = useNavigate();
  const { buscarCEP, formatarCEP, isLoading: isLoadingCEP, error: cepError } = useCEP();
  
  const form = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      nome: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      orcamento: 0,
      data_inicio: null,
      data_prevista_termino: null,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: obrasApi.create,
    onSuccess: () => {
      toast.success("Obra criada com sucesso!");
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
              <h1 className="text-2xl font-bold">Nova Obra</h1>
              <p className="text-sm text-muted-foreground">
                Cadastre uma nova obra no sistema
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
              onClick={() => navigate("/dashboard/obras")}
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
              <strong>Dica:</strong> Comece preenchendo o CEP para que o endereço seja preenchido automaticamente. 
              Você poderá editar esses dados posteriormente se necessário.
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
                Preencha os dados básicos da obra que será cadastrada
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
                      onClick={() => navigate("/dashboard/obras")}
                      disabled={isPending}
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
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Obra
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

export default NovaObra;
