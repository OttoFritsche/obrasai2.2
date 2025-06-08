import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  Search,
  CheckCircle,
  AlertCircle,
  Globe
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
import { useCNPJLookup } from "@/hooks/useCNPJLookup";
import { formatCNPJ, formatCPF, formatPhone, formatCEP, unformat, isComplete } from "@/lib/utils/formatters";
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

const NovoFornecedor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fornecedorType, setFornecedorType] = useState<FornecedorType>("pj");
  const { lookupCNPJ, isLoading: isLoadingCNPJ, data: cnpjData, reset: resetCNPJ } = useCNPJLookup();
  
  // Flag para controlar se o preenchimento automático já foi feito
  const filledFromCNPJRef = useRef<string | null>(null);
  
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
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
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

  // Watch do campo CNPJ para busca automática
  const cnpjValue = pjForm.watch("cnpj");

  // Effect para buscar CNPJ automaticamente quando o campo for preenchido
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Verificar se o CNPJ está completo e se ainda não foi preenchido
      if (cnpjValue && isComplete(cnpjValue, 'cnpj') && filledFromCNPJRef.current !== cnpjValue) {
        const data = await lookupCNPJ(cnpjValue);
        
        if (data) {
          // Marcar que este CNPJ já foi processado
          filledFromCNPJRef.current = cnpjValue;
          
          // Preencher automaticamente TODOS os campos disponíveis
          pjForm.setValue("razao_social", data.razao_social);
          pjForm.setValue("nome_fantasia", data.nome_fantasia || "");
          
          if (data.email) {
            pjForm.setValue("email", data.email);
          }
          
          if (data.telefone_principal) {
            pjForm.setValue("telefone_principal", data.telefone_principal);
          }
          
          // Preencher dados de endereço se disponíveis
          if (data.endereco) {
            if (data.endereco.logradouro) {
              pjForm.setValue("endereco", data.endereco.logradouro);
            }
            if (data.endereco.numero) {
              pjForm.setValue("numero", data.endereco.numero);
            }
            if (data.endereco.complemento) {
              pjForm.setValue("complemento", data.endereco.complemento);
            }
            if (data.endereco.bairro) {
              pjForm.setValue("bairro", data.endereco.bairro);
            }
            if (data.endereco.municipio) {
              pjForm.setValue("cidade", data.endereco.municipio);
            }
            if (data.endereco.uf) {
              pjForm.setValue("estado", data.endereco.uf);
            }
            if (data.endereco.cep) {
              pjForm.setValue("cep", formatCEP(data.endereco.cep));
            }
          }
          
          // Mostrar feedback sobre o preenchimento automático
          const fieldsCount = [
            data.razao_social,
            data.nome_fantasia,
            data.telefone_principal,
            data.endereco?.logradouro,
            data.endereco?.bairro,
            data.endereco?.municipio,
            data.endereco?.uf,
            data.endereco?.cep
          ].filter(Boolean).length;
          
          if (fieldsCount > 3) {
            toast.success(`${fieldsCount} campos preenchidos automaticamente!`);
          }
        }
      }
    }, 1000); // Delay de 1 segundo para evitar muitas requisições

    return () => clearTimeout(timer);
  }, [cnpjValue, lookupCNPJ, pjForm]); // Adicionado pjForm nas dependências

  // Resetar dados do CNPJ quando mudar de aba
  useEffect(() => {
    resetCNPJ();
    // Resetar a flag também
    filledFromCNPJRef.current = null;
  }, [fornecedorType, resetCNPJ]);

  // Resetar flag quando o CNPJ for alterado manualmente
  useEffect(() => {
    if (!cnpjValue || !isComplete(cnpjValue, 'cnpj')) {
      filledFromCNPJRef.current = null;
    }
  }, [cnpjValue]);

  const pjMutation = useMutation({
    mutationFn: (values: FornecedorPJFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return fornecedoresPJApi.create(values, validTenantId);
    },
    onSuccess: () => {
      toast.success("Fornecedor PJ criado com sucesso!");
      navigate("/dashboard/fornecedores/pj");
    },
    onError: (error) => {
      console.error("Error creating fornecedor PJ:", error);
      toast.error("Erro ao criar fornecedor PJ. Tente novamente.");
    },
  });

  const pfMutation = useMutation({
    mutationFn: (values: FornecedorPFFormValues) => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado');
      }
      return fornecedoresPFApi.create(values, validTenantId);
    },
    onSuccess: () => {
      toast.success("Fornecedor PF criado com sucesso!");
      navigate("/dashboard/fornecedores/pf");
    },
    onError: (error) => {
      console.error("Error creating fornecedor PF:", error);
      toast.error("Erro ao criar fornecedor PF. Tente novamente.");
    },
  });

  const onSubmitPJ = (values: FornecedorPJFormValues) => {
    pjMutation.mutate(values);
  };

  const onSubmitPF = (values: FornecedorPFFormValues) => {
    pfMutation.mutate(values);
  };

  // Função para buscar CNPJ manualmente
  const handleManualCNPJLookup = async () => {
    const cnpjValue = pjForm.getValues("cnpj");
    if (cnpjValue) {
      const data = await lookupCNPJ(cnpjValue);
      
      if (data) {
        // Marcar que este CNPJ já foi processado para evitar duplicação
        filledFromCNPJRef.current = cnpjValue;
        
        // Mesmo preenchimento automático da função principal
        pjForm.setValue("razao_social", data.razao_social);
        pjForm.setValue("nome_fantasia", data.nome_fantasia || "");
        
        if (data.email) {
          pjForm.setValue("email", data.email);
        }
        
        if (data.telefone_principal) {
          pjForm.setValue("telefone_principal", data.telefone_principal);
        }
        
        if (data.endereco) {
          if (data.endereco.logradouro) pjForm.setValue("endereco", data.endereco.logradouro);
          if (data.endereco.numero) pjForm.setValue("numero", data.endereco.numero);
          if (data.endereco.complemento) pjForm.setValue("complemento", data.endereco.complemento);
          if (data.endereco.bairro) pjForm.setValue("bairro", data.endereco.bairro);
          if (data.endereco.municipio) pjForm.setValue("cidade", data.endereco.municipio);
          if (data.endereco.uf) pjForm.setValue("estado", data.endereco.uf);
          if (data.endereco.cep) pjForm.setValue("cep", formatCEP(data.endereco.cep));
        }
        
        // Mostrar feedback sobre o preenchimento manual
        const fieldsCount = [
          data.razao_social,
          data.nome_fantasia,
          data.telefone_principal,
          data.endereco?.logradouro,
          data.endereco?.bairro,
          data.endereco?.municipio,
          data.endereco?.uf,
          data.endereco?.cep
        ].filter(Boolean).length;
        
        if (fieldsCount > 3) {
          toast.success(`${fieldsCount} campos preenchidos manualmente!`);
        }
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
            <div className="h-10 w-10 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center">
              {fornecedorType === "pj" ? (
                <Building2 className="h-6 w-6 text-green-500 dark:text-green-400" />
              ) : (
                <User className="h-6 w-6 text-green-500 dark:text-green-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {fornecedorType === "pj" 
                  ? "Novo Fornecedor PJ" 
                  : "Novo Fornecedor PF"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Cadastre um novo fornecedor no sistema
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
                fornecedorType === "pj" 
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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs 
            defaultValue="pj" 
            onValueChange={(value) => setFornecedorType(value as FornecedorType)}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pj" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Pessoa Jurídica
              </TabsTrigger>
              <TabsTrigger value="pf" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Pessoa Física
              </TabsTrigger>
            </TabsList>

            {/* Formulário PJ */}
            <TabsContent value="pj">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-500" />
                      Dados da Pessoa Jurídica
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados do fornecedor pessoa jurídica. Os campos serão preenchidos automaticamente após digitar o CNPJ.
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
                                    <div className="relative">
                                      <Input 
                                        placeholder="00.000.000/0000-00" 
                                        {...field} 
                                        value={formatCNPJ(field.value || '')}
                                        onChange={(e) => {
                                          const formatted = formatCNPJ(e.target.value);
                                          field.onChange(formatted);
                                        }}
                                        className={cn(
                                          "bg-background/50 focus:bg-background transition-colors pr-10",
                                          isLoadingCNPJ && "pr-16"
                                        )}
                                      />
                                      {/* Indicadores visuais do estado da busca */}
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {isLoadingCNPJ && (
                                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                        {cnpjData && cnpjData.situacao_ativa && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        {cnpjData && !cnpjData.situacao_ativa && (
                                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        )}
                                        {/* Botão para busca manual */}
                                        {field.value && isComplete(field.value, 'cnpj') && !isLoadingCNPJ && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleManualCNPJLookup}
                                            className="h-6 w-6 p-0 hover:bg-green-50 dark:hover:bg-green-950"
                                          >
                                            <Search className="h-3 w-3 text-green-500" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    {isLoadingCNPJ && "Buscando dados do CNPJ..."}
                                    {cnpjData && cnpjData.situacao_ativa && "✓ Empresa ativa encontrada"}
                                    {cnpjData && !cnpjData.situacao_ativa && "⚠ Empresa encontrada mas inativa"}
                                    {!isLoadingCNPJ && !cnpjData && "Digite o CNPJ para busca automática"}
                                  </FormDescription>
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
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
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
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
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
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
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
                                        value={formatPhone(field.value || '')}
                                        onChange={(e) => {
                                          const formatted = formatPhone(e.target.value);
                                          field.onChange(formatted);
                                        }}
                                        className={cn(
                                          "pl-9 bg-background/50 focus:bg-background transition-colors",
                                          cnpjData && cnpjData.telefone_principal && "border-green-200 dark:border-green-800"
                                        )}
                                        disabled={isLoadingCNPJ}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="https://www.empresa.com" 
                                        {...field} 
                                        value={field.value ?? ''} 
                                        className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Site da empresa (opcional)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Seção: Endereço */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Endereço
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                              control={pjForm.control}
                              name="cep"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CEP</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="00000-000" 
                                      {...field} 
                                      value={formatCEP(field.value || '')}
                                      onChange={(e) => {
                                        const formatted = formatCEP(e.target.value);
                                        field.onChange(formatted);
                                      }}
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && cnpjData.endereco?.cep && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="endereco"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Logradouro</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Rua, Avenida, etc." 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && cnpjData.endereco?.logradouro && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="numero"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="123" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && cnpjData.endereco?.numero && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="complemento"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Complemento</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Sala, Andar, etc." 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && cnpjData.endereco?.complemento && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="bairro"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Nome do bairro" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && cnpjData.endereco?.bairro && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="cidade"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Nome da cidade" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && cnpjData.endereco?.municipio && "border-green-200 dark:border-green-800"
                                      )}
                                      disabled={isLoadingCNPJ}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pjForm.control}
                              name="estado"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estado</FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value ?? ''} 
                                      onValueChange={field.onChange}
                                      disabled={isLoadingCNPJ}
                                    >
                                      <SelectTrigger 
                                        className={cn(
                                          "bg-background/50 focus:bg-background transition-colors",
                                          cnpjData && cnpjData.endereco?.uf && "border-green-200 dark:border-green-800"
                                        )}
                                      >
                                        <SelectValue placeholder="Selecione o estado" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {brazilianStates.map((state) => (
                                          <SelectItem key={state.value} value={state.value}>
                                            {state.label}
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

                        {/* Seção: Observações */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Informações Adicionais
                          </h3>
                          
                          <FormField
                            control={pjForm.control}
                            name="observacoes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Informações adicionais sobre o fornecedor..." 
                                    {...field} 
                                    value={field.value ?? ''} 
                                    className="bg-background/50 focus:bg-background transition-colors min-h-[80px]"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Informações extras que possam ser úteis (opcional)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                            disabled={pjMutation.isPending || isLoadingCNPJ}
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
                                Criar Fornecedor
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Formulário PF */}
            <TabsContent value="pf">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-500" />
                      Dados da Pessoa Física
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados do fornecedor pessoa física
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
                                      value={formatCPF(field.value || '')}
                                      onChange={(e) => {
                                        const formatted = formatCPF(e.target.value);
                                        field.onChange(formatted);
                                      }}
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
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
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
                                        value={formatPhone(field.value || '')}
                                        onChange={(e) => {
                                          const formatted = formatPhone(e.target.value);
                                          field.onChange(formatted);
                                        }}
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
                                Criar Fornecedor
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default NovoFornecedor;
