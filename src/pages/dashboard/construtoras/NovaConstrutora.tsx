import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import {
  construtoraPJSchema,
  construtoraPFSchema,
  ConstrutoraPJFormValues,
  ConstrutoraPFFormValues,
  ConstrutoraType,
} from "@/lib/validations/construtora";
import { useCNPJLookup } from "@/hooks/useCNPJLookup";
import { formatCNPJ, formatCPF, formatPhone, formatCEP, isComplete } from "@/lib/utils/formatters";
import { brazilianStates } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

const NovaConstrutora = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [construtoraType, setConstrutoraType] = useState<ConstrutoraType>("pj");
  const { lookupCNPJ, isLoading: isLoadingCNPJ, data: cnpjData, reset: resetCNPJ } = useCNPJLookup();
  const filledFromCNPJRef = useRef<string | null>(null);
  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  const pjForm = useForm<ConstrutoraPJFormValues>({
    resolver: zodResolver(construtoraPJSchema),
    defaultValues: {
      documento: "",
      nome_razao_social: "",
      nome_fantasia: "",
      inscricao_estadual: "",
      email: "",
      telefone: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      responsavel_tecnico: "",
      documento_responsavel: "",
    },
  });

  const pfForm = useForm<ConstrutoraPFFormValues>({
    resolver: zodResolver(construtoraPFSchema),
    defaultValues: {
      cpf: "",
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      responsavel_tecnico: "",
      documento_responsavel: "",
    },
  });

  // Watch do campo CNPJ para busca automática
  const documentoValue = pjForm.watch("documento");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (documentoValue && isComplete(documentoValue, 'cnpj') && filledFromCNPJRef.current !== documentoValue) {
        const data = await lookupCNPJ(documentoValue);
        if (data) {
          filledFromCNPJRef.current = documentoValue;
          pjForm.setValue("nome_razao_social", data.razao_social);
          pjForm.setValue("nome_fantasia", data.nome_fantasia || "");
          if (data.email) pjForm.setValue("email", data.email);
          if (data.telefone_principal) pjForm.setValue("telefone", data.telefone_principal);
          if (data.endereco) {
            if (data.endereco.logradouro) pjForm.setValue("endereco", data.endereco.logradouro);
            if (data.endereco.numero) pjForm.setValue("numero", data.endereco.numero);
            if (data.endereco.complemento) pjForm.setValue("complemento", data.endereco.complemento);
            if (data.endereco.bairro) pjForm.setValue("bairro", data.endereco.bairro);
            if (data.endereco.municipio) pjForm.setValue("cidade", data.endereco.municipio);
            if (data.endereco.uf) pjForm.setValue("estado", data.endereco.uf);
            if (data.endereco.cep) pjForm.setValue("cep", formatCEP(data.endereco.cep));
          }
          toast.success("Campos preenchidos automaticamente pelo CNPJ!");
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [documentoValue, lookupCNPJ, pjForm]);

  useEffect(() => {
    resetCNPJ();
    filledFromCNPJRef.current = null;
  }, [construtoraType, resetCNPJ]);

  useEffect(() => {
    if (!documentoValue || !isComplete(documentoValue, 'cnpj')) {
      filledFromCNPJRef.current = null;
    }
  }, [documentoValue]);

  const pjMutation = useMutation({
    mutationFn: async (values: ConstrutoraPJFormValues) => {
      if (!validTenantId) throw new Error('Tenant ID não encontrado');
      const { error } = await supabase.from("construtoras").insert([
        { ...values, tipo: "pj", tenant_id: validTenantId }
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Construtora criada com sucesso!");
      navigate("/dashboard/construtoras");
    },
    onError: (error) => {
      console.error("Erro ao criar construtora PJ:", error);
      toast.error("Erro ao criar construtora. Tente novamente.");
    },
  });

  const pfMutation = useMutation({
    mutationFn: async (values: ConstrutoraPFFormValues) => {
      if (!validTenantId) throw new Error('Tenant ID não encontrado');
      const { error } = await supabase.from("construtoras").insert([
        { ...values, tipo: "pf", tenant_id: validTenantId }
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Construtor(a) autônomo criado com sucesso!");
      navigate("/dashboard/construtoras");
    },
    onError: (error) => {
      console.error("Erro ao criar construtor PF:", error);
      toast.error("Erro ao criar construtor. Tente novamente.");
    },
  });

  const onSubmitPJ = (values: ConstrutoraPJFormValues) => {
    pjMutation.mutate(values);
  };

  const onSubmitPF = (values: ConstrutoraPFFormValues) => {
    pfMutation.mutate(values);
  };

  const handleManualCNPJLookup = async () => {
    const documentoValue = pjForm.getValues("documento");
    if (documentoValue) {
      const data = await lookupCNPJ(documentoValue);
      if (data) {
        filledFromCNPJRef.current = documentoValue;
        pjForm.setValue("nome_razao_social", data.razao_social);
        pjForm.setValue("nome_fantasia", data.nome_fantasia || "");
        if (data.email) pjForm.setValue("email", data.email);
        if (data.telefone_principal) pjForm.setValue("telefone", data.telefone_principal);
        if (data.endereco) {
          if (data.endereco.logradouro) pjForm.setValue("endereco", data.endereco.logradouro);
          if (data.endereco.numero) pjForm.setValue("numero", data.endereco.numero);
          if (data.endereco.complemento) pjForm.setValue("complemento", data.endereco.complemento);
          if (data.endereco.bairro) pjForm.setValue("bairro", data.endereco.bairro);
          if (data.endereco.municipio) pjForm.setValue("cidade", data.endereco.municipio);
          if (data.endereco.uf) pjForm.setValue("estado", data.endereco.uf);
          if (data.endereco.cep) pjForm.setValue("cep", formatCEP(data.endereco.cep));
        }
        toast.success("Campos preenchidos manualmente pelo CNPJ!");
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
              {construtoraType === "pj" ? (
                <Building2 className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              ) : (
                <User className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {construtoraType === "pj"
                  ? "Nova Construtora (PJ)"
                  : "Novo Construtor Autônomo (PF)"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Cadastre uma nova construtora ou autônomo responsável por obras
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
              onClick={() => navigate("/dashboard/construtoras")}
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
            onValueChange={(value) => setConstrutoraType(value as ConstrutoraType)}
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
                      <Building2 className="h-5 w-5 text-blue-500" />
                      Dados da Construtora (PJ)
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados da construtora. Os campos serão preenchidos automaticamente após digitar o CNPJ.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...pjForm}>
                      <form onSubmit={pjForm.handleSubmit(onSubmitPJ)} className="space-y-6">
                        {/* Dados principais */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Dados Principais
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={pjForm.control}
                              name="documento"
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
                                        {field.value && isComplete(field.value, 'cnpj') && !isLoadingCNPJ && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleManualCNPJLookup}
                                            className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-950"
                                          >
                                            <Search className="h-3 w-3 text-blue-500" />
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
                              name="nome_razao_social"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Razão Social</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Razão Social da empresa"
                                      {...field}
                                      className={cn(
                                        "bg-background/50 focus:bg-background transition-colors",
                                        cnpjData && "border-blue-200 dark:border-blue-800"
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
                                        cnpjData && "border-blue-200 dark:border-blue-800"
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

                        {/* Contato */}
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
                              name="telefone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefone</FormLabel>
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
                                        disabled={isLoadingCNPJ}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Endereço */}
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
                                        cnpjData && cnpjData.endereco?.cep && "border-blue-200 dark:border-blue-800"
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
                                        cnpjData && cnpjData.endereco?.logradouro && "border-blue-200 dark:border-blue-800"
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
                                        cnpjData && cnpjData.endereco?.numero && "border-blue-200 dark:border-blue-800"
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
                                        cnpjData && cnpjData.endereco?.complemento && "border-blue-200 dark:border-blue-800"
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
                                        cnpjData && cnpjData.endereco?.bairro && "border-blue-200 dark:border-blue-800"
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
                                        cnpjData && cnpjData.endereco?.municipio && "border-blue-200 dark:border-blue-800"
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
                                          cnpjData && cnpjData.endereco?.uf && "border-blue-200 dark:border-blue-800"
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

                        {/* Responsável Técnico */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Responsável Técnico (opcional)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={pjForm.control}
                              name="responsavel_tecnico"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Responsável Técnico</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Nome completo"
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pjForm.control}
                              name="documento_responsavel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Documento do Responsável</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="CPF ou CREA/CAU"
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

                        {/* Botões de ação */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/construtoras")}
                            disabled={pjMutation.isPending}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={pjMutation.isPending || isLoadingCNPJ}
                            className={cn(
                              "min-w-[140px]",
                              "bg-gradient-to-r from-blue-500 to-blue-600",
                              "hover:from-blue-600 hover:to-blue-700",
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
                                Criar Construtora
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
                      <User className="h-5 w-5 text-blue-500" />
                      Dados do Construtor Autônomo (PF)
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados do construtor autônomo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...pfForm}>
                      <form onSubmit={pfForm.handleSubmit(onSubmitPF)} className="space-y-6">
                        {/* Dados pessoais */}
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
                                      placeholder="Nome completo"
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
                          </div>
                        </div>

                        {/* Contato */}
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
                              name="telefone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefone</FormLabel>
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

                        {/* Endereço */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Endereço
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                              control={pfForm.control}
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
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="endereco"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Logradouro</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Rua, Avenida, etc."
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="numero"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123"
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="complemento"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Complemento</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Sala, Andar, etc."
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="bairro"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Nome do bairro"
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="cidade"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Nome da cidade"
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="estado"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estado</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value ?? ''}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
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

                        {/* Responsável Técnico */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Responsável Técnico (opcional)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={pfForm.control}
                              name="responsavel_tecnico"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Responsável Técnico</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Nome completo"
                                      {...field}
                                      value={field.value ?? ''}
                                      className="bg-background/50 focus:bg-background transition-colors"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={pfForm.control}
                              name="documento_responsavel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Documento do Responsável</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="CPF ou CREA/CAU"
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

                        {/* Botões de ação */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/construtoras")}
                            disabled={pfMutation.isPending}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={pfMutation.isPending}
                            className={cn(
                              "min-w-[140px]",
                              "bg-gradient-to-r from-blue-500 to-blue-600",
                              "hover:from-blue-600 hover:to-blue-700",
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
                                Criar Construtor
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

export default NovaConstrutora; 