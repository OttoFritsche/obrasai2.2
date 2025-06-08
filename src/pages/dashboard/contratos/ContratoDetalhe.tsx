import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Calculator, 
  Calendar,
  Download,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useContrato, useGerarPDF, useEnviarAssinatura } from "@/hooks/useContratos";
import { formatCurrencyBR, formatDateBR } from "@/lib/i18n";

const ContratoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: contrato, isLoading, error, refetch } = useContrato(id!);
  const gerarPDF = useGerarPDF(id!);
  const enviarAssinatura = useEnviarAssinatura(id!);
  
  const [emailContratado, setEmailContratado] = useState("");

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      'RASCUNHO': { variant: 'secondary', label: 'Rascunho', icon: Edit },
      'AGUARDANDO_ASSINATURA': { variant: 'warning', label: 'Aguardando Assinatura', icon: Clock },
      'ATIVO': { variant: 'success', label: 'Ativo', icon: CheckCircle },
      'CONCLUIDO': { variant: 'default', label: 'Concluído', icon: CheckCircle },
      'CANCELADO': { variant: 'destructive', label: 'Cancelado', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig['RASCUNHO'];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleGerarPDF = async () => {
    try {
      const resultado = await gerarPDF.mutateAsync(false);
      
      if (resultado?.pdf_url) {
        toast.success("Documento gerado com sucesso! Clique em 'Ver Documento' para acessar.");
      } else {
        toast.success("Documento gerado! Recarregue a página para ver o link.");
      }
      
      // Recarregar dados do contrato para mostrar o novo documento
      refetch();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar documento");
    }
  };

  const handleEnviarAssinatura = async () => {
    if (!emailContratado) {
      toast.error("Informe o email do contratado");
      return;
    }
    
    try {
      await enviarAssinatura.mutateAsync({ 
        email: emailContratado,
        telefone: contrato?.contratado_telefone 
      });
      toast.success("Contrato enviado para assinatura!");
    } catch (error) {
      console.error("Erro ao enviar para assinatura:", error);
      toast.error("Erro ao enviar contrato");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando contrato...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contrato) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">Contrato não encontrado</p>
            <Button onClick={() => navigate("/dashboard/contratos")}>
              Voltar aos Contratos
            </Button>
          </div>
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
              <h1 className="text-2xl font-bold">{contrato.titulo}</h1>
              <p className="text-muted-foreground">
                Contrato {contrato.numero_contrato}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(contrato.status)}
          </div>
        </div>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGerarPDF}
                disabled={gerarPDF.isPending}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {gerarPDF.isPending ? "Gerando..." : "Gerar Documento"}
              </Button>
              
              {contrato.status === 'RASCUNHO' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="Email do contratado"
                    value={emailContratado}
                    onChange={(e) => setEmailContratado(e.target.value)}
                  />
                  <Button
                    onClick={handleEnviarAssinatura}
                    disabled={enviarAssinatura.isPending}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {enviarAssinatura.isPending ? "Enviando..." : "Enviar p/ Assinatura"}
                  </Button>
                </div>
              )}
              
              {contrato.url_documento && (
                <Button variant="outline" asChild>
                  <a href={contrato.url_documento} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Documento
                  </a>
                </Button>
              )}
              
              {contrato.hash_documento && !contrato.url_documento && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Documento gerado (recarregue a página)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Documento */}
        {(contrato.url_documento || contrato.hash_documento) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documento Gerado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contrato.url_documento ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-green-800">Documento disponível</p>
                      <p className="text-sm text-green-600">Clique em "Ver Documento" para acessar</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={contrato.url_documento} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Abrir
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-yellow-800">Documento gerado</p>
                    <p className="text-sm text-yellow-600">Recarregue a página para ver o link de acesso</p>
                  </div>
                </div>
              )}
              
              {contrato.hash_documento && (
                <div className="text-xs text-muted-foreground">
                  <p>Hash do documento: <code className="bg-muted px-1 rounded">{contrato.hash_documento.substring(0, 16)}...</code></p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados do Contratante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contratante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="font-semibold">{contrato.contratante_nome}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documento</p>
                <p className="font-mono">{contrato.contratante_documento}</p>
              </div>
              {contrato.contratante_endereco && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p>{contrato.contratante_endereco}</p>
                </div>
              )}
              {contrato.contratante_email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{contrato.contratante_email}</p>
                </div>
              )}
              {contrato.contratante_telefone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p>{contrato.contratante_telefone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Contratado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contratado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="font-semibold">{contrato.contratado_nome}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documento</p>
                <p className="font-mono">{contrato.contratado_documento}</p>
              </div>
              {contrato.contratado_endereco && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p>{contrato.contratado_endereco}</p>
                </div>
              )}
              {contrato.contratado_email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{contrato.contratado_email}</p>
                </div>
              )}
              {contrato.contratado_telefone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p>{contrato.contratado_telefone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações Financeiras e Técnicas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrencyBR(contrato.valor_total)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forma de Pagamento</p>
                <p className="font-semibold">{contrato.forma_pagamento}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prazos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prazo de Execução</p>
                <p className="font-semibold">{contrato.prazo_execucao} dias</p>
              </div>
              {contrato.data_inicio && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                  <p className="font-semibold">{formatDateBR(contrato.data_inicio)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                <p>{formatDateBR(contrato.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Obra Vinculada */}
        {contrato.obras && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Obra Vinculada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{contrato.obras.nome}</p>
              <p className="text-muted-foreground">
                {contrato.obras.endereco}, {contrato.obras.cidade}/{contrato.obras.estado}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Descrição dos Serviços */}
        {contrato.descricao_servicos && (
          <Card>
            <CardHeader>
              <CardTitle>Descrição dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{contrato.descricao_servicos}</p>
            </CardContent>
          </Card>
        )}

        {/* Cláusulas Especiais */}
        {contrato.clausulas_especiais && (
          <Card>
            <CardHeader>
              <CardTitle>Cláusulas Especiais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{contrato.clausulas_especiais}</p>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {contrato.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{contrato.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ContratoDetalhe; 