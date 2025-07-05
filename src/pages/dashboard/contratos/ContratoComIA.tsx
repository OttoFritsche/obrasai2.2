import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Copy, FileText, Lightbulb, Send, Sparkles } from "lucide-react";
import { useEffect, useRef,useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useContratoAI } from "@/hooks/useContratoAI";
import { useContrato, useContratos, useTemplatesContratos } from "@/hooks/useContratos";
import { useObras } from "@/hooks/useObras";
import { supabase } from "@/integrations/supabase/client";
import { orcamentosParametricosApi } from '@/services/orcamentoApi';

const contratoSchema = z.object({
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  obra_id: z.string().min(1, "Selecione uma obra"),
  template_id: z.string().min(1, "Selecione um template"),
  
  // Dados do contratante
  contratante_nome: z.string().min(3, "Nome do contratante é obrigatório"),
  contratante_documento: z.string().min(11, "Documento do contratante é obrigatório"),
  contratante_endereco: z.string().default(""),
  contratante_email: z.string().default(""),
  contratante_telefone: z.string().default(""),
  
  // Dados do contratado
  contratado_nome: z.string().min(3, "Nome do contratado é obrigatório"),
  contratado_documento: z.string().min(11, "Documento do contratado é obrigatório"),
  contratado_endereco: z.string().default(""),
  contratado_email: z.string().default(""),
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

const ContratoComIA = () => {
  const navigate = useNavigate();
  const { id: contratoId } = useParams();
  const [inputMessage, setInputMessage] = useState("");
  const [typingResponse, setTypingResponse] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAiMessageRef = useRef<string>("");
  
  const { createContrato, updateContrato } = useContratos();
  const { contrato } = useContrato(contratoId || "");
  const { data: templates } = useTemplatesContratos();
  const { obras } = useObras();
  
  const {
    messages,
    suggestions,
    isLoading: aiLoading,
    sendMessage,
    applySuggestion,
    clearConversation,
    quickSuggestions,
  } = useContratoAI();

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      titulo: contrato?.titulo || "",
      obra_id: contrato?.obra_id || "",
      template_id: contrato?.template_id || "",
      contratante_nome: contrato?.contratante_nome || "",
      contratante_documento: contrato?.contratante_documento || "",
      contratante_endereco: contrato?.contratante_endereco || "",
      contratante_email: contrato?.contratante_email || "",
      contratante_telefone: contrato?.contratante_telefone || "",
      contratado_nome: contrato?.contratado_nome || "",
      contratado_documento: contrato?.contratado_documento || "",
      contratado_endereco: contrato?.contratado_endereco || "",
      contratado_email: contrato?.contratado_email || "",
      contratado_telefone: contrato?.contratado_telefone || "",
      valor_total: contrato?.valor_total || 0,
      forma_pagamento: contrato?.forma_pagamento || "VISTA",
      prazo_execucao: contrato?.prazo_execucao || 30,
      data_inicio: contrato?.data_inicio || "",
      descricao_servicos: contrato?.descricao_servicos || "",
      clausulas_especiais: contrato?.clausulas_especiais || "",
      observacoes: contrato?.observacoes || "",
    }
  });

  const watchedValues = form.watch();

  const obraSelecionada = Boolean(watchedValues.obra_id);

  const getContratoContext = async () => {
    const context: Record<string, unknown> = {
      tipo_servico: "CONSTRUCAO",
      valor_total: watchedValues.valor_total,
      prazo_execucao: watchedValues.prazo_execucao,
      titulo: watchedValues.titulo,
      descricao_servicos: watchedValues.descricao_servicos,
      clausulas_especiais: watchedValues.clausulas_especiais,
      observacoes: watchedValues.observacoes,
      template_id: watchedValues.template_id,
    };

    // Buscar dados completos da obra selecionada
    const obra = obras?.find((o) => o.id === watchedValues.obra_id);
    if (obra) {
      context.obra = obra;
      // Buscar orçamento principal da obra
      try {
        const orcamentos = await orcamentosParametricosApi.getByObra(obra.id);
        if (orcamentos && orcamentos.length > 0) {
          context.orcamento = orcamentos[0]; // Pega o orçamento mais recente
        }
      } catch (e) {
        // Ignorar erro de orçamento
      }
      // NOVO: Buscar dados da construtora vinculada
      if (obra.construtora_id) {
        const { data: construtora } = await supabase
          .from('construtoras')
          .select('*')
          .eq('id', obra.construtora_id)
          .single();
        if (construtora) {
          context.construtora = construtora;
        }
      }
    }
    return context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!watchedValues.obra_id) {
      toast.warning('Selecione uma obra para que a IA possa analisar o contexto completo!');
      return;
    }
    const context = await getContratoContext();
    await sendMessage(inputMessage, context, contratoId);
    setInputMessage("");
  };

  const handleApplySuggestion = (suggestion: { conteudo: string }, field: string) => {
    form.setValue(field as keyof ContratoFormData, suggestion.conteudo);
    applySuggestion(suggestion, field);
  };

  const onSubmit = async (data: ContratoFormData) => {
    try {
      if (contratoId) {
        await updateContrato.mutateAsync({ id: contratoId, ...data });
        toast.success("Contrato atualizado com sucesso!");
      } else {
        await createContrato.mutateAsync(data);
        toast.success("Contrato criado com sucesso!");
      }
      navigate("/dashboard/contratos");
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
      toast.error("Erro ao salvar contrato");
    }
  };

  const renderSuggestionButton = (field: keyof ContratoFormData, type: string) => {
    const fieldSuggestions = suggestions.filter(s => s.tipo === type);
    
    if (fieldSuggestions.length === 0) return null;

    return (
      <div className="absolute top-0 right-0 p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const suggestion = fieldSuggestions[0];
            handleApplySuggestion(suggestion, field);
          }}
        >
          <Sparkles className="h-4 w-4 text-blue-500" />
        </Button>
        {fieldSuggestions.length > 1 && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
            {fieldSuggestions.length}
          </Badge>
        )}
      </div>
    );
  };

  // Efeito de digitação na resposta da IA
  useEffect(() => {
    // Encontrar a última mensagem da IA
    const lastAiMsg = messages.length > 0 ? [...messages].reverse().find(m => m.role === "assistant") : undefined;
    if (!lastAiMsg || !lastAiMsg.content) {
      setTypingResponse("");
      lastAiMessageRef.current = "";
      return;
    }
    // Se a mensagem mudou, iniciar efeito de digitação
    if (lastAiMsg.content !== lastAiMessageRef.current) {
      lastAiMessageRef.current = lastAiMsg.content;
      setTypingResponse("");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      let i = 0;
      const type = () => {
        setTypingResponse(lastAiMsg.content.slice(0, i));
        if (i < lastAiMsg.content.length) {
          i++;
          typingTimeoutRef.current = setTimeout(type, 4 + Math.random() * 8);
        } else {
          setTypingResponse(lastAiMsg.content);
        }
      };
      type();
    }
    // Cleanup
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [messages]);

  // Preencher automaticamente o título do contrato ao selecionar o template
  useEffect(() => {
    if (watchedValues.template_id && templates) {
      const selectedTemplate = templates.find(t => t.id === watchedValues.template_id);
      if (selectedTemplate) {
        let autoTitle = selectedTemplate.nome.trim();
        if (!autoTitle.toLowerCase().startsWith('contrato')) {
          autoTitle = `Contrato de ${autoTitle}`;
        }
        if (!watchedValues.titulo || watchedValues.titulo.startsWith('Contrato de') || watchedValues.titulo === selectedTemplate.nome) {
          form.setValue('titulo', autoTitle);
        }
      }
    }
  }, [watchedValues.template_id, watchedValues.titulo, templates, form]);

  // Preencher contratante ao selecionar obra
  useEffect(() => {
    const obraId = watchedValues.obra_id;
    if (!obraId) return;
    const obraSelecionada = obras?.find((o) => o.id === obraId);
    if (!obraSelecionada || !obraSelecionada.construtora_id) return;
    // Buscar dados da construtora/autônomo
    supabase
      .from("construtoras")
      .select("*")
      .eq("id", obraSelecionada.construtora_id)
      .single()
      .then(({ data, _error }) => {
        if (data) {
          if (data.tipo === "pj") {
            form.setValue("contratante_nome", data.razao_social || "");
            form.setValue("contratante_documento", data.documento || "");
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
  }, [watchedValues.obra_id, obras, form]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8">
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
                  {contratoId ? "Editar Contrato com IA" : "Novo Contrato com IA"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Use a IA especializada para criar contratos profissionais
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
                <Bot className="h-4 w-4" />
                <span>Assistente IA</span>
              </Badge>
              <Badge 
                variant="outline" 
                className="flex items-center space-x-1 bg-[#182b4d]/10 dark:bg-[#182b4d]/30 text-[#182b4d] dark:text-[#daa916] border-[#182b4d]/30 dark:border-[#daa916]/50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Paramétrico</span>
              </Badge>
              <Button
                type="button"
                variant="outline"
                onClick={clearConversation}
                size="sm"
                className="ml-2"
              >
                <Bot className="h-4 w-4 mr-2" />
                Limpar Chat
              </Button>
            </motion.div>
          </motion.div>

          {/* Card de introdução IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/50 to-[#182b4d]/10 dark:from-blue-900/10 dark:to-[#182b4d]/20 backdrop-blur-sm mb-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-300">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span>IA Especializada em Contratos de Construção Civil</span>
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Gere contratos profissionais, cláusulas, descrições e observações com base em normas técnicas e legislação brasileira.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Layout Dividido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]"
          >
            {/* AVISO: Seleção de obra obrigatória */}
            {!obraSelecionada && (
              <div className="col-span-1 lg:col-span-2 mb-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  Selecione uma obra para preencher o contrato e utilizar a IA.
                </div>
              </div>
            )}
            {/* LADO ESQUERDO: Formulário do Contrato */}
            <Card className="flex flex-col border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dados do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Campos de Obra e Template primeiro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="obra_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Obra *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={aiLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a obra" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {obras?.map((obra) => (
                                  <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
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
                            <FormLabel>Template *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!obraSelecionada || aiLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o template" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {templates?.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>{template.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Campo de Título do Contrato depois */}
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Contrato *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={watchedValues.template_id && templates ? (() => {
                              const selectedTemplate = templates.find(t => t.id === watchedValues.template_id);
                              if (!selectedTemplate) return "Ex: Contrato de Pintura Externa";
                              return selectedTemplate.nome.toLowerCase().startsWith('contrato') ? selectedTemplate.nome : `Contrato de ${selectedTemplate.nome}`;
                            })() : "Ex: Contrato de Pintura Externa"} disabled={!obraSelecionada || aiLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dados Financeiros */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Valores e Prazos</h3>
                      
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
                                  disabled={!obraSelecionada || aiLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="prazo_execucao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prazo (dias) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="30" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  disabled={!obraSelecionada || aiLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Campos com IA */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Detalhes do Contrato</h3>
                      
                      <FormField
                        control={form.control}
                        name="descricao_servicos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição dos Serviços *</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva detalhadamente os serviços a serem executados..."
                                  rows={4}
                                  {...field}
                                  disabled={!obraSelecionada || aiLoading}
                                />
                              </FormControl>
                              {renderSuggestionButton("descricao_servicos", "descricao")}
                            </div>
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
                            <div className="relative">
                              <FormControl>
                                <Textarea
                                  placeholder="Cláusulas específicas para este contrato..."
                                  rows={4}
                                  {...field}
                                  disabled={!obraSelecionada || aiLoading}
                                />
                              </FormControl>
                              {renderSuggestionButton("clausulas_especiais", "clausula")}
                            </div>
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
                            <div className="relative">
                              <FormControl>
                                <Textarea
                                  placeholder="Observações importantes sobre o contrato..."
                                  rows={3}
                                  {...field}
                                  disabled={!obraSelecionada || aiLoading}
                                />
                              </FormControl>
                              {renderSuggestionButton("observacoes", "observacao")}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={!obraSelecionada || createContrato.isPending || updateContrato.isPending}
                      >
                        {createContrato.isPending || updateContrato.isPending 
                          ? "Salvando..." 
                          : contratoId ? "Atualizar Contrato" : "Criar Contrato"
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* LADO DIREITO: Chat IA */}
            <Card className="flex flex-col border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/95 to-slate-100/95 dark:from-blue-900/20 dark:to-slate-800/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Assistente IA - Contratos
                  {aiLoading && (
                    <Badge variant="secondary" className="ml-auto">
                      <div className="animate-pulse">Pensando...</div>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Área de mensagens */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      // Se for a última mensagem da IA, mostrar com efeito de digitação
                      const isLastAi =
                        message.role === "assistant" &&
                        index === messages.map((m) => m.role).lastIndexOf("assistant");
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {isLastAi && typingResponse !== ""
                                ? typingResponse
                                : !isLastAi
                                ? message.content
                                : null}
                            </p>
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold opacity-70">
                                  Sugestões disponíveis:
                                </p>
                                {message.suggestions.map((suggestion, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 bg-blue-50 border border-blue-200 rounded-md text-xs"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {suggestion.tipo}
                                      </Badge>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          navigator.clipboard.writeText(suggestion.conteudo);
                                          toast.success("Sugestão copiada!");
                                        }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <p className="text-gray-700 mb-1">
                                      {suggestion.conteudo}
                                    </p>
                                    <p className="text-gray-500 text-xs italic">
                                      {suggestion.justificativa}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    {/* Indicador de IA está digitando */}
                    {aiLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center gap-2">
                          <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">IA está digitando</span>
                          <span className="animate-bounce inline-block text-blue-500">.</span>
                          <span className="animate-bounce inline-block text-blue-500" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce inline-block text-blue-500" style={{ animationDelay: '0.4s' }}>.</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input de mensagem */}
                <div className="border-t p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Pergunte sobre cláusulas, descrições ou observações..."
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      disabled={!obraSelecionada || aiLoading}
                    />
                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!obraSelecionada || aiLoading || !inputMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sugestões rápidas */}
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setInputMessage(suggestion)}
                        disabled={aiLoading}
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion.slice(0, 30)}...
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContratoComIA;