import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, FileText, Lightbulb, Check, Send, Copy, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useContratos, useContrato, useTemplatesContratos } from "@/hooks/useContratos";
import { useObras } from "@/hooks/useObras";
import { useContratoAI } from "@/hooks/useContratoAI";

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

  const getContratoContext = () => ({
    tipo_servico: "CONSTRUCAO", // Pode ser determinado pelo template
    valor_total: watchedValues.valor_total,
    prazo_execucao: watchedValues.prazo_execucao,
    titulo: watchedValues.titulo,
    descricao_servicos: watchedValues.descricao_servicos,
    clausulas_especiais: watchedValues.clausulas_especiais,
    observacoes: watchedValues.observacoes,
    template_id: watchedValues.template_id,
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage, getContratoContext(), contratoId);
    setInputMessage("");
  };

  const handleApplySuggestion = (suggestion: any, field: string) => {
    form.setValue(field as any, suggestion.conteudo);
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/contratos")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {contratoId ? "Editar Contrato com IA" : "Novo Contrato com IA"}
                </h1>
                <p className="text-muted-foreground">
                  Use a IA especializada para criar contratos profissionais
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={clearConversation}
                size="sm"
              >
                <Bot className="h-4 w-4 mr-2" />
                Limpar Chat
              </Button>
            </div>
          </div>

          {/* Layout Dividido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            {/* LADO ESQUERDO: Formulário do Contrato */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dados do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Dados Básicos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados Básicos</h3>
                      
                      <FormField
                        control={form.control}
                        name="titulo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título do Contrato *</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input placeholder="Ex: Contrato de Pintura Externa" {...field} />
                              </FormControl>
                              {renderSuggestionButton("titulo", "descricao")}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="obra_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Obra *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <FormLabel>Template *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o template" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {templates?.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

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
                        disabled={createContrato.isPending || updateContrato.isPending}
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
            <Card className="flex flex-col">
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
                    {messages.map((message, index) => (
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
                            {message.content}
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
                    ))}
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
                      disabled={aiLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={aiLoading || !inputMessage.trim()}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContratoComIA; 