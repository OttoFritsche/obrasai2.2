import { useState, useRef, useCallback, DragEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FileText, 
  ArrowLeft, 
  UploadCloud, 
  Save,
  Building2,
  Receipt,
  DollarSign,
  Hash,
  Key,
  MessageSquare,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { notaFiscalSchema, NotaFiscalFormValues } from "@/lib/validations/nota-fiscal";
import { notasFiscaisApi, obrasApi, fornecedoresPJApi, fornecedoresPFApi } from "@/services/api";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { useDespesas } from "@/hooks/useDespesas";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FileViewer from "@/components/ui/file-viewer";
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

const EditarNota = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fileViewerState, setFileViewerState] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }>({
    isOpen: false,
    fileUrl: "",
    fileName: "",
    fileType: ""
  });

  const tenantId = user?.profile?.tenant_id;
  const validTenantId = tenantId && typeof tenantId === 'string' ? tenantId : null;

  // Hook para gerenciar notas fiscais
  const { updateNotaFiscal } = useNotasFiscais();

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

  // Buscar os dados da nota fiscal atual
  const { data: notaFiscal, isLoading: isLoadingNota } = useQuery({
    queryKey: ["nota-fiscal", id, validTenantId],
    queryFn: () => {
      if (!id || !validTenantId) {
        throw new Error('ID da nota ou Tenant ID não encontrado');
      }
      return notasFiscaisApi.getById(id, validTenantId);
    },
    enabled: !!id && !!validTenantId,
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

  // Preencher o formulário quando a nota fiscal for carregada
  useEffect(() => {
    if (notaFiscal) {
      form.reset({
        obra_id: notaFiscal.obra_id,
        despesa_id: notaFiscal.despesa_id || undefined,
        fornecedor_pj_id: notaFiscal.fornecedor_pj_id || undefined,
        fornecedor_pf_id: notaFiscal.fornecedor_pf_id || undefined,
        numero: notaFiscal.numero || "",
        data_emissao: new Date(notaFiscal.data_emissao),
        valor_total: notaFiscal.valor_total,
        chave_acesso: notaFiscal.chave_acesso || "",
        descricao: notaFiscal.descricao || "",
      });
    }
  }, [notaFiscal, form]);

  const onSubmit = (values: NotaFiscalFormValues) => {
    if (!id) {
      toast.error("ID da nota fiscal não encontrado.");
      return;
    }

    updateNotaFiscal.mutate(
      { id, notaFiscal: values, file: selectedFile || undefined },
      {
        onSuccess: () => {
          toast.success("Nota fiscal atualizada com sucesso!");
          navigate("/dashboard/notas");
        },
        onError: (error) => {
          toast.error("Erro ao atualizar nota fiscal. Tente novamente.");
          console.error("Error updating nota fiscal:", error);
        },
      }
    );
  };

  const isLoading = isLoadingNota || isLoadingObras || isLoadingPJ || isLoadingPF;

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

  const handleViewCurrentFile = () => {
    if (!notaFiscal?.arquivo_url) return;
    
    // Determinar tipo de arquivo pela extensão da URL
    const getFileType = (url: string): string => {
      const extension = url.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'application/pdf';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'xml':
          return 'text/xml';
        default:
          return 'application/pdf';
      }
    };

    const fileName = `Nota_Fiscal_${notaFiscal.numero || notaFiscal.id}.${notaFiscal.arquivo_url.split('.').pop()}`;
    
    setFileViewerState({
      isOpen: true,
      fileUrl: notaFiscal.arquivo_url,
      fileName,
      fileType: getFileType(notaFiscal.arquivo_url)
    });
  };

  const closeFileViewer = () => {
    setFileViewerState({
      isOpen: false,
      fileUrl: "",
      fileName: "",
      fileType: ""
    });
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

  if (!notaFiscal) {
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
            <h3 className="text-lg font-semibold">Nota fiscal não encontrada</h3>
            <p className="text-muted-foreground">A nota fiscal solicitada não foi encontrada.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/notas")} variant="outline">
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
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 dark:bg-orange-400/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Editar Nota Fiscal</h1>
              <p className="text-sm text-muted-foreground">
                Atualize as informações da nota fiscal #{notaFiscal.numero || 'S/N'}
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

        {/* Arquivo Atual */}
        {notaFiscal.arquivo_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Arquivo Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-green-700 dark:text-green-300">
                      Nota fiscal anexada
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Arquivo disponível para visualização
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleViewCurrentFile}
                      className="text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <a
                      href={notaFiscal.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Nova Aba
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Selecione um novo arquivo abaixo se deseja substituir o arquivo atual
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Área de Upload - Opcional para edição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-orange-500" />
                {notaFiscal.arquivo_url ? "Substituir Arquivo (Opcional)" : "Upload do Arquivo"}
              </CardTitle>
              <CardDescription>
                {notaFiscal.arquivo_url 
                  ? "Arraste e solte ou clique para substituir o arquivo atual"
                  : "Arraste e solte ou clique para selecionar a nota fiscal"
                }
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
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.xml,.jpg,.png"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                
                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          Novo arquivo selecionado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-file"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-center">
                        <UploadCloud className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Arraste e solte ou clique para {notaFiscal.arquivo_url ? "substituir" : "selecionar"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, XML, JPG ou PNG • Máximo 10MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visualizador de arquivos */}
        <FileViewer
          isOpen={fileViewerState.isOpen}
          onClose={closeFileViewer}
          fileUrl={fileViewerState.fileUrl}
          fileName={fileViewerState.fileName}
          fileType={fileViewerState.fileType}
        />

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
                Atualize as informações da nota fiscal
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
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione a despesa" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem vinculação</SelectItem>
                                  {despesasFiltradas.map((despesa) => (
                                    <SelectItem key={despesa.id} value={despesa.id}>
                                      {despesa.descricao}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Despesa associada à nota fiscal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fornecedor_pj_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor PJ (Opcional)</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ""}
                                onValueChange={(value) => {
                                  field.onChange(value === "none" ? null : value);
                                  if (value && value !== "none") {
                                    form.setValue("fornecedor_pf_id", null);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione fornecedor PJ" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem fornecedor PJ</SelectItem>
                                  {fornecedoresPJ?.map((fornecedor) => (
                                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                      {fornecedor.razao_social}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Fornecedor pessoa jurídica
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fornecedor_pf_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor PF (Opcional)</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value || ""}
                                onValueChange={(value) => {
                                  field.onChange(value === "none" ? null : value);
                                  if (value && value !== "none") {
                                    form.setValue("fornecedor_pj_id", null);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                                  <SelectValue placeholder="Selecione fornecedor PF" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem fornecedor PF</SelectItem>
                                  {fornecedoresPF?.map((fornecedor) => (
                                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                                      {fornecedor.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Fornecedor pessoa física
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção: Dados da Nota */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
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
                                  placeholder="Ex: 12345"
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
                    </div>

                    <FormField
                      control={form.control}
                      name="chave_acesso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chave de Acesso (Opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Chave de acesso da NFe"
                                {...field}
                                value={field.value ?? ''}
                                className="pl-9 bg-background/50 focus:bg-background transition-colors"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Chave de 44 dígitos da NFe (se aplicável)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard/notas")}
                      disabled={updateNotaFiscal.isPending}
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateNotaFiscal.isPending}
                      className={cn(
                        "flex-1 sm:flex-none min-w-[140px]",
                        "bg-gradient-to-r from-orange-500 to-orange-600",
                        "hover:from-orange-600 hover:to-orange-700",
                        "text-white shadow-lg",
                        "transition-all duration-300"
                      )}
                    >
                      {updateNotaFiscal.isPending ? (
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

export default EditarNota; 