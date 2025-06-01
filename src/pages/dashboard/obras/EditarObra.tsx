import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Building, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign,
  Save,
  Info,
  Loader2,
  AlertTriangle
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
import { Spinner } from "@/components/ui/spinner";
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

const EditarObra = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
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

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ObraFormValues) => obrasApi.update(id as string, values),
    onSuccess: () => {
      toast.success("Obra atualizada com sucesso!");
      navigate("/dashboard/obras");
    },
    onError: (error) => {
      console.error("Error updating obra:", error);
      toast.error("Erro ao atualizar obra. Tente novamente.");
    },
  });

  const onSubmit = (values: ObraFormValues) => {
    mutate(values);
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
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
            <p className="text-muted-foreground">Não foi possível encontrar os dados da obra solicitada.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/obras")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
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
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Editar Obra</h1>
              <p className="text-sm text-muted-foreground">
                Atualize as informações da obra: {obra.nome}
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
              Você está editando uma obra existente. 
              Todas as alterações serão salvas automaticamente após confirmar.
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

                  {/* Seção: Localização */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </h3>
                    
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

                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="00000-000"
                                {...field}
                                className="bg-background/50 focus:bg-background transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                        "min-w-[140px]",
                        "bg-gradient-to-r from-purple-500 to-purple-600",
                        "hover:from-purple-600 hover:to-purple-700",
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
                          Salvar Alterações
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

export default EditarObra;
