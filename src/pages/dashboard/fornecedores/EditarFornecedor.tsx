import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Users, 
  User, 
  ArrowLeft, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  FileText,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { 
  fornecedorPJSchema, 
  fornecedorPFSchema,
  FornecedorPJFormValues,
  FornecedorPFFormValues,
  FornecedorType
} from "@/lib/validations/fornecedor";
import { fornecedoresPJApi, fornecedoresPFApi } from "@/services/api";
import { useAuth } from "@/contexts/auth";
import { t, brazilianStates } from "@/lib/i18n";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const EditarFornecedor = () => {
  const navigate = useNavigate();
  const { tipo, id } = useParams<{ tipo: "pj" | "pf"; id: string }>();
  const { user } = useAuth();
  
  // Fallback para detectar tipo da URL se useParams falhar
  const currentPath = window.location.pathname;
  const tipoDetectado = tipo || (currentPath.includes('/pj/') ? 'pj' : currentPath.includes('/pf/') ? 'pf' : 'pj');
  
  const [fornecedorType, setFornecedorType] = useState<FornecedorType>(tipoDetectado as FornecedorType);
  
  // Debug: Log dos parâmetros capturados
  useEffect(() => {
    console.log("📊 EditarFornecedor - Debug dos parâmetros:");
    console.log("- tipo:", tipo);
    console.log("- tipo (typeof):", typeof tipo);
    console.log("- tipo === 'pj':", tipo === "pj");
    console.log("- tipo === 'pf':", tipo === "pf");
    console.log("- tipoDetectado:", tipoDetectado);
    console.log("- id:", id);
    console.log("- URL atual:", window.location.href);
    console.log("- user?.profile?.tenant_id:", user?.profile?.tenant_id);
    
    // Verificar se a URL contém 'pj' ou 'pf'
    const currentPath = window.location.pathname;
    console.log("- currentPath:", currentPath);
    console.log("- currentPath contains '/pj/':", currentPath.includes('/pj/'));
    console.log("- currentPath contains '/pf/':", currentPath.includes('/pf/'));
  }, [tipo, id, user, tipoDetectado]);
  
  // Obter tenant_id corretamente
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;
  
  const pjForm = useForm<FornecedorPJFormValues>({
    resolver: zodResolver(fornecedorPJSchema),
    defaultValues: {
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      email: "",
      telefone_principal: "",
    },
  });

  const pfForm = useForm<FornecedorPFFormValues>({
    resolver: zodResolver(fornecedorPFSchema),
    defaultValues: {
      cpf: "",
      nome: "",
      email: "",
      telefone_principal: "",
      data_nascimento: null,
    },
  });

  // Query para carregar dados do fornecedor PJ
  const { data: fornecedorPJ, isLoading: isLoadingPJ, isError: isErrorPJ } = useQuery({
    queryKey: ["fornecedor_pj", id],
    queryFn: () => {
      console.log("🔍 Executando query PJ para ID:", id, "tenant:", validTenantId);
      if (!validTenantId || !id) throw new Error('Dados inválidos');
      return fornecedoresPJApi.getById(id, validTenantId);
    },
    enabled: !!validTenantId && !!id && tipoDetectado === "pj",
  });

  // Query para carregar dados do fornecedor PF
  const { data: fornecedorPF, isLoading: isLoadingPF, isError: isErrorPF } = useQuery({
    queryKey: ["fornecedor_pf", id],
    queryFn: () => {
      console.log("🔍 Executando query PF para ID:", id, "tenant:", validTenantId);
      if (!validTenantId || !id) throw new Error('Dados inválidos');
      return fornecedoresPFApi.getById(id, validTenantId);
    },
    enabled: !!validTenantId && !!id && tipoDetectado === "pf",
  });

  // Debug adicional das queries
  useEffect(() => {
    console.log("📊 Status das queries:");
    console.log("- PJ enabled:", !!validTenantId && !!id && tipoDetectado === "pj");
    console.log("- PF enabled:", !!validTenantId && !!id && tipoDetectado === "pf");
    console.log("- fornecedorPJ:", fornecedorPJ);
    console.log("- fornecedorPF:", fornecedorPF);
    console.log("- isLoadingPJ:", isLoadingPJ);
    console.log("- isLoadingPF:", isLoadingPF);
    console.log("- isErrorPJ:", isErrorPJ);
    console.log("- isErrorPF:", isErrorPF);
  }, [fornecedorPJ, fornecedorPF, isLoadingPJ, isLoadingPF, isErrorPJ, isErrorPF, validTenantId, id, tipoDetectado]);

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (fornecedorPJ && tipoDetectado === "pj") {
      console.log("🔄 Preenchendo formulário PJ com dados:", fornecedorPJ);
      pjForm.reset({
        cnpj: fornecedorPJ.cnpj,
        razao_social: fornecedorPJ.razao_social,
        nome_fantasia: fornecedorPJ.nome_fantasia || "",
        inscricao_estadual: fornecedorPJ.inscricao_estadual || "",
        email: fornecedorPJ.email || "",
        telefone_principal: fornecedorPJ.telefone_principal || "",
      });
    }
  }, [fornecedorPJ, pjForm, tipoDetectado]);

  useEffect(() => {
    if (fornecedorPF && tipoDetectado === "pf") {
      console.log("🔄 Preenchendo formulário PF com dados:", fornecedorPF);
      pfForm.reset({
        cpf: fornecedorPF.cpf,
        nome: fornecedorPF.nome,
        email: fornecedorPF.email || "",
        telefone_principal: fornecedorPF.telefone_principal || "",
        data_nascimento: fornecedorPF.data_nascimento ? new Date(fornecedorPF.data_nascimento) : null,
      });
    }
  }, [fornecedorPF, pfForm, tipoDetectado]);

  const pjMutation = useMutation({
    mutationFn: (values: FornecedorPJFormValues) => {
      if (!id) throw new Error('ID não encontrado');
      return fornecedoresPJApi.update(id, values);
    },
    onSuccess: () => {
      toast.success("Fornecedor PJ atualizado com sucesso!");
      navigate("/dashboard/fornecedores/pj");
    },
    onError: (error) => {
      console.error("Error updating fornecedor PJ:", error);
      toast.error("Erro ao atualizar fornecedor PJ. Tente novamente.");
    },
  });

  const pfMutation = useMutation({
    mutationFn: (values: FornecedorPFFormValues) => {
      if (!id) throw new Error('ID não encontrado');
      return fornecedoresPFApi.update(id, values);
    },
    onSuccess: () => {
      toast.success("Fornecedor PF atualizado com sucesso!");
      navigate("/dashboard/fornecedores/pf");
    },
    onError: (error) => {
      console.error("Error updating fornecedor PF:", error);
      toast.error("Erro ao atualizar fornecedor PF. Tente novamente.");
    },
  });

  const onSubmitPJ = (values: FornecedorPJFormValues) => {
    pjMutation.mutate(values);
  };

  const onSubmitPF = (values: FornecedorPFFormValues) => {
    pfMutation.mutate(values);
  };

  const isLoading = isLoadingPJ || isLoadingPF;
  const isError = isErrorPJ || isErrorPF;

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
            <p className="text-muted-foreground">Carregando dados do fornecedor...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  if (isError) {
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
            <h3 className="text-lg font-semibold">Erro ao carregar fornecedor</h3>
            <p className="text-muted-foreground">Não foi possível carregar os dados do fornecedor.</p>
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
              {tipoDetectado === "pj" ? (
                <Building2 className="h-6 w-6 text-green-500 dark:text-green-400" />
              ) : (
                <User className="h-6 w-6 text-green-500 dark:text-green-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {tipoDetectado === "pj" 
                  ? "Editar Fornecedor PJ" 
                  : "Editar Fornecedor PF"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Atualize as informações do fornecedor
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
              onClick={() => navigate(
                tipoDetectado === "pj" 
                  ? "/dashboard/fornecedores/pj" 
                  : "/dashboard/fornecedores/pf"
              )}
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voltar
            </Button>
          </motion.div>
        </div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {tipoDetectado === "pj" ? (
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  Dados da Pessoa Jurídica
                </CardTitle>
                <CardDescription>
                  Atualize os dados do fornecedor pessoa jurídica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...pjForm}>
                  <form onSubmit={pjForm.handleSubmit(onSubmitPJ)} className="space-y-6">
                    {/* Seção: Dados Principais */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Dados Principais
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={pjForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="00.000.000/0000-00" 
                                  {...field} 
                                  className="bg-background/50 focus:bg-background transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pjForm.control}
                          name="razao_social"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Razão Social</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Razão Social da empresa" 
                                  {...field} 
                                  className="bg-background/50 focus:bg-background transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pjForm.control}
                          name="nome_fantasia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Fantasia</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nome fantasia (opcional)" 
                                  {...field} 
                                  className="bg-background/50 focus:bg-background transition-colors"
                                />
                              </FormControl>
                              <FormDescription>
                                Nome comercial da empresa
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pjForm.control}
                          name="inscricao_estadual"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inscrição Estadual</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Inscrição estadual (opcional)" 
                                  {...field} 
                                  value={field.value ?? ''} 
                                  className="bg-background/50 focus:bg-background transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Seção: Contato */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                        <Mail className="h-4 w-4" />
                        Informações de Contato
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={pjForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="email" 
                                    placeholder="email@empresa.com" 
                                    {...field} 
                                    value={field.value ?? ''} 
                                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pjForm.control}
                          name="telefone_principal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone Principal</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="(00) 00000-0000" 
                                    {...field} 
                                    value={field.value ?? ''} 
                                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                  />
                                </div>
                              </FormControl>
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
                        onClick={() => navigate("/dashboard/fornecedores/pj")}
                        disabled={pjMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={pjMutation.isPending}
                        className={cn(
                          "min-w-[140px]",
                          "bg-gradient-to-r from-green-500 to-green-600",
                          "hover:from-green-600 hover:to-green-700",
                          "text-white shadow-lg",
                          "transition-all duration-300"
                        )}
                      >
                        {pjMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Atualizar Fornecedor
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-500" />
                  Dados da Pessoa Física
                </CardTitle>
                <CardDescription>
                  Atualize os dados do fornecedor pessoa física
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...pfForm}>
                  <form onSubmit={pfForm.handleSubmit(onSubmitPF)} className="space-y-6">
                    {/* Seção: Dados Pessoais */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Dados Pessoais
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={pfForm.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nome completo da pessoa" 
                                  {...field} 
                                  className="bg-background/50 focus:bg-background transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pfForm.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="000.000.000-00" 
                                  {...field} 
                                  className="bg-background/50 focus:bg-background transition-colors"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pfForm.control}
                          name="data_nascimento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Nascimento</FormLabel>
                              <FormControl>
                                <DatePicker
                                  date={field.value || undefined}
                                  onSelect={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>
                                Data de nascimento (opcional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Seção: Contato */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-t pt-4">
                        <Mail className="h-4 w-4" />
                        Informações de Contato
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={pfForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="email" 
                                    placeholder="email@dominio.com" 
                                    {...field} 
                                    value={field.value ?? ''} 
                                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pfForm.control}
                          name="telefone_principal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone Principal</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="(00) 00000-0000" 
                                    {...field} 
                                    value={field.value ?? ''} 
                                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                  />
                                </div>
                              </FormControl>
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
                        onClick={() => navigate("/dashboard/fornecedores/pf")}
                        disabled={pfMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={pfMutation.isPending}
                        className={cn(
                          "min-w-[140px]",
                          "bg-gradient-to-r from-green-500 to-green-600",
                          "hover:from-green-600 hover:to-green-700",
                          "text-white shadow-lg",
                          "transition-all duration-300"
                        )}
                      >
                        {pfMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Atualizar Fornecedor
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default EditarFornecedor; 