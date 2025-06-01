import { useState } from "react";
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
  Loader2
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
  const [fornecedorType, setFornecedorType] = useState<FornecedorType>("pj");
  
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

  const pjMutation = useMutation({
    mutationFn: fornecedoresPJApi.create,
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
    mutationFn: fornecedoresPFApi.create,
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
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 dark:bg-pink-400/10 flex items-center justify-center">
              {fornecedorType === "pj" ? (
                <Building2 className="h-6 w-6 text-pink-500 dark:text-pink-400" />
              ) : (
                <User className="h-6 w-6 text-pink-500 dark:text-pink-400" />
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
                      <Building2 className="h-5 w-5 text-pink-500" />
                      Dados da Pessoa Jurídica
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados do fornecedor pessoa jurídica
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
                              "bg-gradient-to-r from-pink-500 to-pink-600",
                              "hover:from-pink-600 hover:to-pink-700",
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
                      <User className="h-5 w-5 text-pink-500" />
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
                              "bg-gradient-to-r from-pink-500 to-pink-600",
                              "hover:from-pink-600 hover:to-pink-700",
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
