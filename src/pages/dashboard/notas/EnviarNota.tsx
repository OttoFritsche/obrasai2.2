import { useState, useRef, useCallback, DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  ArrowLeft, 
  Upload, 
  UploadCloud,
  Building2,
  Receipt,
  Users,
  DollarSign,
  Hash,
  Key,
  MessageSquare,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { notaFiscalSchema, NotaFiscalFormValues } from "@/lib/validations/nota-fiscal";
import { obrasApi, fornecedoresPJApi, fornecedoresPFApi } from "@/services/api";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { useDespesas } from "@/hooks/useDespesas";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/contexts/auth";

const EnviarNota = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  // Hook para gerenciar notas fiscais
  const { createNotaFiscal } = useNotasFiscais();

  // ✅ Hook para gerenciar despesas com validação robusta de tenantId
  const { despesas } = useDespesas();

  const form = useForm<NotaFiscalFormValues>({
    resolver: zodResolver(notaFiscalSchema),
    defaultValues: {
      numero: "",
      data_emissao: new Date(),
      valor_total: 0,
      arquivo: null,
    },
  });

  const { data: obras, isLoading: isLoadingObras } = useQuery({
    queryKey: ["obras"],
    queryFn: obrasApi.getAll,
  });

  const selectedObraId = form.watch("obra_id");

  // ✅ Filtrar despesas por obra selecionada ao invés de fazer nova query
  const despesasFiltradas = despesas?.filter(despesa => despesa.obra_id === selectedObraId) || [];

  const { data: fornecedoresPJ, isLoading: isLoadingPJ } = useQuery({
    queryKey: ["fornecedores_pj", validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPJApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
  });

  const { data: fornecedoresPF, isLoading: isLoadingPF } = useQuery({
    queryKey: ["fornecedores_pf", validTenantId],
    queryFn: () => {
      if (!validTenantId) {
        throw new Error('Tenant ID não encontrado ou inválido');
      }
      return fornecedoresPFApi.getAll(validTenantId);
    },
    enabled: !!validTenantId,
  });

  const onSubmit = (values: NotaFiscalFormValues) => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo para a nota fiscal.");
      return;
    }

    createNotaFiscal.mutate(
      { notaFiscal: values, file: selectedFile },
      {
        onSuccess: () => {
          toast.success("Nota fiscal enviada com sucesso!");
          navigate("/dashboard/notas");
        },
        onError: (error) => {
          toast.error("Erro ao enviar nota fiscal. Tente novamente.");
          console.error("Error creating nota fiscal:", error);
        },
      }
    );
  };

  const isLoading = isLoadingObras || isLoadingPJ || isLoadingPF;

  const handleFileChange = useCallback((file: File | null) => {
      if (file) {
          form.setValue("arquivo", file, { shouldValidate: true }); 
          setSelectedFile(file);
      } else {
          form.setValue("arquivo", null, { shouldValidate: true });
          setSelectedFile(null);
          if (fileInputRef.current) {
              fileInputRef.current.value = "";
          }
      }
  }, [form]);

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(true);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
      event.preventDefault(); 
      setIsDraggingOver(true); 
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
          const file = files[0];
          const allowedTypes = ["application/pdf", "text/xml", "image/jpeg", "image/png"];
          const maxSize = 10 * 1024 * 1024; // 10 MB Limit

          if (!allowedTypes.includes(file.type)) {
             toast.error("Tipo de arquivo não suportado. Use PDF, XML, JPG ou PNG.");
             return;
          }
          if (file.size > maxSize) {
             toast.error(`Arquivo muito grande. O limite é ${(maxSize / 1024 / 1024).toFixed(0)} MB.`);
             return;
          }
          handleFileChange(file);
      }
  }, [handleFileChange]);

  const handleClick = () => {
      fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
      handleFileChange(null);
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
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
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 dark:bg-orange-400/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Enviar Nota Fiscal</h1>
              <p className="text-sm text-muted-foreground">
                Faça upload de uma nova nota fiscal no sistema
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
              onClick={() => navigate("/dashboard/notas")}
              className="group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voltar
            </Button>
          </motion.div>
        </div>

        {/* Área de Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-orange-500" />
                Upload do Arquivo
              </CardTitle>
              <CardDescription>
                Arraste e solte ou clique para selecionar a nota fiscal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer",
                  "transition-all duration-300 ease-in-out",
                  "bg-background/50 hover:bg-background/80",
                  isDraggingOver && "border-orange-500 bg-orange-500/5 scale-102",
                  selectedFile && "border-green-500 bg-green-500/5",
                  !selectedFile && !isDraggingOver && "border-border hover:border-orange-500/50"
                )}
                onClick={handleClick} 
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="relative">
                        <div className="h-16 w-16 rounded-xl bg-green-500/10 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold break-all max-w-md">{selectedFile.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleRemoveFile();
                        }}
                        className="group"
                      >
                        <Trash2 className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                        Remover Arquivo
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file-empty"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center justify-center space-y-4 pointer-events-none"
                    >
                      <motion.div
                        animate={isDraggingOver ? { scale: 1.1 } : { scale: 1 }}
                        className={cn(
                          "h-16 w-16 rounded-xl flex items-center justify-center transition-colors",
                          isDraggingOver ? "bg-orange-500/20" : "bg-orange-500/10"
                        )}
                      >
                        <UploadCloud className={cn(
                          "h-8 w-8 transition-colors",
                          isDraggingOver ? "text-orange-500" : "text-orange-400"
                        )} />
                      </motion.div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Arraste e solte a nota fiscal aqui ou{' '}
                          <span className="font-semibold text-orange-500 underline">clique para selecionar</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos suportados: PDF, XML, JPG, PNG (máx. 10MB)
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Dados da Nota Fiscal
              </CardTitle>
              <CardDescription>
                Preencha as informações da nota fiscal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Seção: Identificação */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Vinculação
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="obra_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Obra</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione a obra" />
                                </SelectTrigger>
                                <SelectContent>
                                  {obras?.map((obra) => (
                                    <SelectItem key={obra.id} value={obra.id}>
                                      {obra.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Obra associada à nota fiscal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="despesa_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Despesa (Opcional)</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ""}
                                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                                disabled={!selectedObraId}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione a despesa" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhuma despesa</SelectItem>
                                  {despesasFiltradas.map((despesa) => (
                                    <SelectItem key={despesa.id} value={despesa.id}>
                                      {despesa.descricao}
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

                  {/* Seção: Fornecedores */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Fornecedor
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fornecedor_pj_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor PJ</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ""}
                                onValueChange={(value) => {
                                  field.onChange(value === 'none' ? null : value);
                                  if (value && value !== 'none') {
                                    form.setValue("fornecedor_pf_id", null);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione fornecedor PJ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  {fornecedoresPJ?.map((fornecedor) => (
                                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                      {fornecedor.razao_social}
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
                        name="fornecedor_pf_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor PF</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ""}
                                onValueChange={(value) => {
                                  field.onChange(value === 'none' ? null : value);
                                  if (value && value !== 'none') {
                                    form.setValue("fornecedor_pj_id", null);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione fornecedor PF" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  {fornecedoresPF?.map((fornecedor) => (
                                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                      {fornecedor.nome}
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

                  {/* Seção: Dados da Nota */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Dados da Nota
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Nota</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="123456" 
                                  {...field} 
                                  className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="data_emissao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Emissão</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value}
                                onSelect={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="valor_total"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Total</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="0,00"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chave_acesso"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Chave de Acesso (Opcional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="Digite a chave de acesso da NFe" 
                                  {...field} 
                                  value={field.value ?? ''} 
                                  className="pl-9 bg-background/50 focus:bg-background transition-colors"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Chave de acesso da NFe (44 dígitos)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção: Observações */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Observações
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite observações ou descrição adicional sobre a nota fiscal..."
                              {...field}
                              value={field.value ?? ''}
                              className="bg-background/50 focus:bg-background transition-colors min-h-[100px] resize-none"
                            />
                          </FormControl>
                          <FormDescription>
                            Informações adicionais sobre a nota fiscal
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Campo hidden para arquivo */}
                  <FormField
                    control={form.control}
                    name="arquivo"
                    render={({ field: { onBlur, name } }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.xml,.jpg,.png"
                            onBlur={onBlur}
                            name={name}
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Alert de validação */}
                  {!selectedFile && (
                    <Alert className="border-orange-500/50 bg-orange-500/10">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-sm">
                        É necessário selecionar um arquivo da nota fiscal para continuar.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Botões de ação */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard/notas")}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !selectedFile}
                      className={cn(
                        "min-w-[140px]",
                        "bg-gradient-to-r from-orange-500 to-orange-600",
                        "hover:from-orange-600 hover:to-orange-700",
                        "text-white shadow-lg",
                        "transition-all duration-300"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar Nota
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

export default EnviarNota;
