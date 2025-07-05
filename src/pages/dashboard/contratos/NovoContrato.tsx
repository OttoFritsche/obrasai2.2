import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Calendar, FileText, Save,Users } from "lucide-react";
import { useEffect,useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useContratos, useTemplatesContratos } from "@/hooks/useContratos";
import { useObras } from "@/hooks/useObras";
import { supabase } from "@/integrations/supabase/client";

const contratoSchema = z.object({
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  obra_id: z.string().min(1, "Selecione uma obra"),
  template_id: z.string().min(1, "Selecione um template"),
  
  // Dados do contratante
  contratante_nome: z.string().min(3, "Nome do contratante é obrigatório"),
  contratante_documento: z.string().min(11, "Documento do contratante é obrigatório"),
  contratante_endereco: z.string().default(""),
  contratante_email: z.string().default("").refine((val) => val === "" || z.string().email().safeParse(val).success, "Email inválido"),
  contratante_telefone: z.string().default(""),
  
  // Dados do contratado
  contratado_nome: z.string().min(3, "Nome do contratado é obrigatório"),
  contratado_documento: z.string().min(11, "Documento do contratado é obrigatório"),
  contratado_endereco: z.string().default(""),
  contratado_email: z.string().default("").refine((val) => val === "" || z.string().email().safeParse(val).success, "Email inválido"),
  contratado_telefone: z.string().default(""),
  
  // Dados financeiros e técnicos
  valor_total: z.number().positive("Valor deve ser positivo"),
  forma_pagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  prazo_execucao: z.number().positive("Prazo deve ser positivo"),
  data_inicio: z.string().default(""),
  descricao_servicos: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  clausulas_especiais: z.string().default(""),
  observacoes: z.string().default(""),
});

type ContratoFormData = z.infer<typeof contratoSchema>;

const NovoContrato = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  const { createContrato } = useContratos();
  const { data: templates, isLoading: templatesLoading, error: templatesError } = useTemplatesContratos();
  const { obras } = useObras();

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      titulo: "",
      obra_id: "",
      template_id: "",
      contratante_nome: "",
      contratante_documento: "",
      contratante_endereco: "",
      contratante_email: "",
      contratante_telefone: "",
      contratado_nome: "",
      contratado_documento: "",
      contratado_endereco: "",
      contratado_email: "",
      contratado_telefone: "",
      valor_total: 0,
      forma_pagamento: "VISTA",
      prazo_execucao: 30,
      data_inicio: "",
      descricao_servicos: "",
      clausulas_especiais: "",
      observacoes: "",
    }
  });

  // Preencher contratante ao selecionar obra
  useEffect(() => {
    const obraId = form.watch("obra_id");
    if (!obraId) return;
    const obraSelecionada = obras?.find((o) => o.id === obraId);
    if (!obraSelecionada || !obraSelecionada.construtora_id) return;
    // Buscar dados da construtora/autônomo
    supabase
      .from("construtoras")
      .select("*")
      .eq("id", obraSelecionada.construtora_id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          if (data.tipo === "pj") {
            form.setValue("contratante_nome", data.razao_social || "");
            form.setValue("contratante_documento", data.cnpj || "");
            form.setValue("contratante_endereco", `${data.endereco || ''}, ${data.numero || ''} ${data.complemento || ''} - ${data.bairro || ''}, ${data.cidade || ''} - ${data.estado || ''}`.trim());
            form.setValue("contratante_email", data.email || "");
            form.setValue("contratante_telefone", data.telefone || "");
          } else {
            form.setValue("contratante_nome", data.nome || "");
            form.setValue("contratante_documento", data.cpf || "");
            form.setValue("contratante_endereco", `${data.endereco || ''}, ${data.numero || ''} ${data.complemento || ''} - ${data.bairro || ''}, ${data.cidade || ''} - ${data.estado || ''}`.trim());
            form.setValue("contratante_email", data.email || "");
            form.setValue("contratante_telefone", data.telefone || "");
          }
        }
      });
    // eslint-disable-next-line
  }, [form.watch("obra_id")]);

  const onSubmit = async (data: ContratoFormData) => {
    try {
      await createContrato.mutateAsync(data);
      toast.success("Contrato criado com sucesso!");
      navigate("/dashboard/contratos");
    } catch (_error) {
      console.error("Erro ao criar contrato:", error);
      toast.error("Erro ao criar contrato");
    }
  };

  const steps = [
    { id: 1, title: "Dados Básicos", icon: FileText },
    { id: 2, title: "Partes do Contrato", icon: Users },
    { id: 3, title: "Valores e Prazos", icon: Calculator },
    { id: 4, title: "Detalhes", icon: Calendar },
  ];

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Contrato *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Contrato de Execução de Estrutura - Casa João" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="obra_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obra *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {obras?.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.nome} - {obra.cidade}/{obra.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="template_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template de Contrato *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        templatesLoading ? "Carregando templates..." :
                        templatesError ? "Erro ao carregar templates" :
                        templates?.length === 0 ? "Nenhum template encontrado" :
                        "Selecione o template"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templatesLoading && (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    )}
                    {templatesError && (
                      <SelectItem value="error" disabled>Erro ao carregar templates</SelectItem>
                    )}
                    {templates && templates.length === 0 && (
                      <SelectItem value="empty" disabled>Nenhum template disponível</SelectItem>
                    )}
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.nome} ({template.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Dados do Contratante */}
      <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Dados do Contratante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contratante_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo ou razão social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contratante_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ *</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="contratante_endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contratante_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contratante_telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados do Contratado */}
      <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Dados do Contratado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contratado_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo ou razão social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contratado_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ *</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="contratado_endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contratado_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contratado_telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50/95 to-emerald-100/95 dark:from-emerald-900/20 dark:to-emerald-800/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Valores e Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="valor_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total (R$) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0,00" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VISTA">À Vista</SelectItem>
                      <SelectItem value="PARCELADO">Parcelado</SelectItem>
                      <SelectItem value="POR_ETAPA">Por Etapa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prazo_execucao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de Execução (dias) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="30" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="descricao_servicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição dos Serviços *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva detalhadamente os serviços a serem executados..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="clausulas_especiais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cláusulas Especiais</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Cláusulas específicas deste contrato (opcional)..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações adicionais (opcional)..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header animado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/contratos")}
                className="flex items-center space-x-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#182b4d] to-blue-600 bg-clip-text text-transparent">
                Novo Contrato Digital
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Crie um novo contrato digital especializado
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-2"
          >
            <Badge 
              variant="secondary" 
              className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
            >
              <FileText className="h-4 w-4" />
              <span>Novo Contrato</span>
            </Badge>
            <Badge 
              variant="outline" 
              className="flex items-center space-x-1 bg-[#182b4d]/10 dark:bg-[#182b4d]/30 text-[#182b4d] dark:text-[#daa916] border-[#182b4d]/30 dark:border-[#daa916]/50"
            >
              <Save className="h-4 w-4" />
              <span>Digital</span>
            </Badge>
          </motion.div>
        </motion.div>

        {/* Card de introdução */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/50 to-[#182b4d]/10 dark:from-blue-900/10 dark:to-[#182b4d]/20 backdrop-blur-sm mb-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-300">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span>Contrato Digital Especializado</span>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Gere contratos digitais completos, com campos para partes, valores, prazos e detalhes técnicos.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${currentStep >= step.id 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                    }
                  `}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <Separator />

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex gap-2">
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                      >
                        Próximo
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex items-center gap-2"
                        disabled={createContrato.isPending}
                      >
                        <Save className="h-4 w-4" />
                        {createContrato.isPending ? "Salvando..." : "Criar Contrato"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NovoContrato;