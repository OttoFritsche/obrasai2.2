import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  User,
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import type {
  ConstrutoraPJFormValues,
  ConstrutoraPFFormValues,
  ConstrutoraType} from "@/lib/validations/construtora";
import {
  construtoraPJSchema,
  construtoraPFSchema
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
import { useTenantValidation } from "@/hooks/useTenantValidation";
import { supabase } from "@/integrations/supabase/client";

const EditarConstrutora = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { validTenantId } = useTenantValidation();
  const [construtoraType, setConstrutoraType] = useState<ConstrutoraType>("pj");
  const { lookupCNPJ, isLoading: isLoadingCNPJ, data: cnpjData, reset: resetCNPJ } = useCNPJLookup();
  const filledFromCNPJRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  // Formulários
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

  // Carregar dados existentes
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("construtoras")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error("Construtora não encontrada");
          setLoading(false);
          return;
        }
        if (data.tipo === "pj") {
          setConstrutoraType("pj");
          // Mapear campos do banco para o formulário PJ
          const pjData = {
            documento: data.documento,
            nome_razao_social: data.nome_razao_social,
            nome_fantasia: data.nome_fantasia || "",
            email: data.email || "",
            telefone: data.telefone || "",
            endereco: data.endereco || "",
            numero: data.numero || "",
            complemento: data.complemento || "",
            bairro: data.bairro || "",
            cidade: data.cidade || "",
            estado: data.estado || "",
            cep: data.cep || "",
            responsavel_tecnico: data.responsavel_tecnico || "",
            documento_responsavel: data.documento_responsavel || ""
          };
          pjForm.reset(pjData);
        } else {
          setConstrutoraType("pf");
          // Mapear campos do banco para o formulário PF
          const pfData = {
            cpf: data.documento, // 'documento' do banco vai para 'cpf' do formulário
            nome: data.nome_razao_social, // 'nome_razao_social' do banco vai para 'nome' do formulário
            email: data.email || "",
            telefone: data.telefone || "",
            endereco: data.endereco || "",
            numero: data.numero || "",
            complemento: data.complemento || "",
            bairro: data.bairro || "",
            cidade: data.cidade || "",
            estado: data.estado || "",
            cep: data.cep || "",
            responsavel_tecnico: data.responsavel_tecnico || "",
            documento_responsavel: data.documento_responsavel || ""
          };
          pfForm.reset(pfData);
        }
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [id]);

  // Watch do campo CNPJ para busca automática
  const documentoValue = pjForm.watch("documento");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (documentoValue && isComplete(documentoValue, "cnpj") && filledFromCNPJRef.current !== documentoValue) {
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
          const fieldsCount = [
            data.razao_social,
            data.nome_fantasia,
            data.telefone_principal,
            data.endereco?.logradouro,
            data.endereco?.bairro,
            data.endereco?.municipio,
            data.endereco?.uf,
            data.endereco?.cep,
          ].filter(Boolean).length;
          if (fieldsCount > 3) {
            toast.success(`${fieldsCount} campos preenchidos automaticamente!`);
          }
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
    if (!documentoValue || !isComplete(documentoValue, "cnpj")) {
      filledFromCNPJRef.current = null;
    }
  }, [documentoValue]);

  // Mutations
  const pjMutation = useMutation({
    mutationFn: async (values: ConstrutoraPJFormValues) => {
      if (!validTenantId) throw new Error("Tenant ID não encontrado");
      const { error } = await supabase
        .from("construtoras")
        .update({ ...values, tipo: "pj", tenant_id: validTenantId })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Construtora atualizada com sucesso!");
      navigate("/dashboard/construtoras");
    },
    onError: (error) => {
      console.error("Erro ao atualizar construtora PJ:", error);
      toast.error("Erro ao atualizar construtora. Tente novamente.");
    },
  });

  const pfMutation = useMutation({
    mutationFn: async (values: ConstrutoraPFFormValues) => {
      if (!validTenantId) throw new Error("Tenant ID não encontrado");
      
      // Mapear campos do formulário para o banco de dados
      const construtoraData = {
        documento: values.cpf, // CPF vai para o campo 'documento'
        nome_razao_social: values.nome, // Nome vai para 'nome_razao_social'
        email: values.email,
        telefone: values.telefone,
        endereco: values.endereco,
        numero: values.numero,
        complemento: values.complemento,
        bairro: values.bairro,
        cidade: values.cidade,
        estado: values.estado,
        cep: values.cep,
        responsavel_tecnico: values.responsavel_tecnico,
        documento_responsavel: values.documento_responsavel,
        tipo: "pf",
        tenant_id: validTenantId
      };
      
      const { error } = await supabase
        .from("construtoras")
        .update(construtoraData)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Construtor(a) autônomo atualizado com sucesso!");
      navigate("/dashboard/construtoras");
    },
    onError: (error) => {
      console.error("Erro ao atualizar construtor PF:", error);
      toast.error("Erro ao atualizar construtor. Tente novamente.");
    },
  });

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from("construtoras").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir construtora");
    } else {
      toast.success("Construtora excluída com sucesso!");
      navigate("/dashboard/construtoras");
    }
  };

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
        const fieldsCount = [
          data.razao_social,
          data.nome_fantasia,
          data.telefone_principal,
          data.endereco?.logradouro,
          data.endereco?.bairro,
          data.endereco?.municipio,
          data.endereco?.uf,
          data.endereco?.cep,
        ].filter(Boolean).length;
        if (fieldsCount > 3) {
          toast.success(`${fieldsCount} campos preenchidos manualmente!`);
        }
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
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
              {construtoraType === "pj" ? (
                <Building2 className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              ) : (
                <User className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {construtoraType === "pj"
                  ? "Editar Construtora (PJ)"
                  : "Editar Construtor Autônomo (PF)"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Edite os dados da construtora ou autônomo responsável por obras
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
            value={construtoraType}
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
                      Edite os dados da construtora. Os campos podem ser preenchidos automaticamente após digitar o CNPJ.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...pjForm}>
                      <form onSubmit={pjForm.handleSubmit(onSubmitPJ)} className="space-y-6">
                        {/* Dados principais */}
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
                                      value={formatCNPJ(field.value || "")}
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
                                      {field.value && isComplete(field.value, "cnpj") && !isLoadingCNPJ && (
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
                                <FormDescription>Nome comercial da empresa</FormDescription>
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
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Contato */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={pjForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="email@empresa.com"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                  />
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
                                  <Input
                                    placeholder="(00) 00000-0000"
                                    {...field}
                                    value={formatPhone(field.value || "")}
                                    onChange={(e) => {
                                      const formatted = formatPhone(e.target.value);
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

                        {/* Endereço */}
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
                                    value={formatCEP(field.value || "")}
                                    onChange={(e) => {
                                      const formatted = formatCEP(e.target.value);
                                      field.onChange(formatted);
                                    }}
                                    className="bg-background/50 focus:bg-background transition-colors"
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
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
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
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
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
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
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
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
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
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
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
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                    disabled={isLoadingCNPJ}
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

                        {/* Responsável técnico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={pjForm.control}
                            name="responsavel_tecnico"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Responsável Técnico</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do responsável técnico (opcional)"
                                    {...field}
                                    value={field.value ?? ""}
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
                                    placeholder="CPF/CREA/CAU (opcional)"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Botões de ação */}
                        <div className="flex justify-between gap-3 pt-6 border-t">
                          <div>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => setShowDelete(true)}
                              className="min-w-[120px]"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </Button>
                          </div>
                          <div className="flex gap-3">
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
                                  Salvar Alterações
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        {/* Modal de confirmação de exclusão */}
                        {showDelete && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-xl max-w-md w-full">
                              <h2 className="text-lg font-bold mb-4">Confirmar exclusão</h2>
                              <p className="mb-6">Tem certeza que deseja excluir esta construtora? Esta ação não poderá ser desfeita.</p>
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowDelete(false)}>
                                  Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
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
                      Edite os dados do construtor autônomo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...pfForm}>
                      <form onSubmit={pfForm.handleSubmit(onSubmitPF)} className="space-y-6">
                        {/* Dados pessoais */}
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
                                    value={formatCPF(field.value || "")}
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

                        {/* Contato */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={pfForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="email@dominio.com"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                  />
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
                                  <Input
                                    placeholder="(00) 00000-0000"
                                    {...field}
                                    value={formatPhone(field.value || "")}
                                    onChange={(e) => {
                                      const formatted = formatPhone(e.target.value);
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

                        {/* Endereço */}
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
                                    value={formatCEP(field.value || "")}
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
                                    value={field.value ?? ""}
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
                                    value={field.value ?? ""}
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
                                    value={field.value ?? ""}
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
                                    value={field.value ?? ""}
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
                                    value={field.value ?? ""}
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
                                    value={field.value ?? ""}
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

                        {/* Responsável técnico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={pfForm.control}
                            name="responsavel_tecnico"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Responsável Técnico</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do responsável técnico (opcional)"
                                    {...field}
                                    value={field.value ?? ""}
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
                                    placeholder="CPF/CREA/CAU (opcional)"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Botões de ação */}
                        <div className="flex justify-between gap-3 pt-6 border-t">
                          <div>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => setShowDelete(true)}
                              className="min-w-[120px]"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </Button>
                          </div>
                          <div className="flex gap-3">
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
                                  Salvar Alterações
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        {/* Modal de confirmação de exclusão */}
                        {showDelete && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-xl max-w-md w-full">
                              <h2 className="text-lg font-bold mb-4">Confirmar exclusão</h2>
                              <p className="mb-6">Tem certeza que deseja excluir este construtor? Esta ação não poderá ser desfeita.</p>
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowDelete(false)}>
                                  Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
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

export default EditarConstrutora;