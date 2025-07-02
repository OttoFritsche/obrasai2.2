import React, { useState, useEffect } from 'react'
import { Building2, History, Clock, FileText, Upload, Zap, CheckCircle, AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/ui/metric-card'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PlantaAnalysis {
  id: string
  filename: string
  analysis_data: {
    summary: string
    areas: Array<{
      nome: string
      area: number
      uso: string
    }>
    issues: string[]
    recommendations: string[]
    total_area: number
    api_used?: 'openai' | 'fallback'
  }
  created_at: string
  obra_nome?: string
}

interface Obra {
  id: string
  nome: string
  endereco?: string
  created_at: string
}

export function PlantasIA() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PlantaAnalysis | null>(null)
  const [history, setHistory] = useState<PlantaAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [obras, setObras] = useState<Obra[]>([])
  const [selectedObraId, setSelectedObraId] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    loadObras()
    loadHistory()
  }, [])

  const loadObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('id, nome, endereco, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setObras(data || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as obras",
        variant: "destructive"
      })
    }
  }

  const loadHistory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('planta_analyses')
        .select('id, filename, created_at, analysis_data')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar as análises anteriores.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo PDF ou imagem (JPG, PNG, WebP)",
          variant: "destructive"
        })
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        })
        return
      }

      setFile(selectedFile)
      setAnalysis(null)
    }
  }

  const analyzeFile = async () => {
    if (!file) return

    if (!selectedObraId) {
      toast({
        title: "Obra necessária",
        description: "Por favor, selecione uma obra para associar a análise",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const { data, error } = await supabase.functions.invoke('analyze-planta', {
        body: {
          file: base64,
          filename: file.name,
          fileType: file.type,
          obra_id: selectedObraId
        }
      })

      if (error) throw error

      setAnalysis(data)
      await loadHistory()
      
      const apiUsed = data.analysis_data?.api_used || 'fallback'
      toast({
        title: "Análise concluída!",
        description: apiUsed === 'openai' 
          ? "Análise realizada com GPT-4o Vision ✨" 
          : "Análise realizada com sistema interno",
        variant: "default"
      })

    } catch (error: Error & { message?: string }) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro na análise",
        description: error.message || "Ocorreu um erro durante a análise",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const deleteAllAnalyses = async () => {
    if (history.length === 0) {
      toast({
        title: "Nenhuma análise",
        description: "Não há análises para excluir.",
        variant: "default"
      })
      return
    }

    // Confirmação forte antes de excluir TUDO
    const confirmDelete = window.confirm(
      `⚠️ ATENÇÃO: Você está prestes a excluir TODAS as ${history.length} análises!\n\nEsta ação é IRREVERSÍVEL e não pode ser desfeita.\n\nTem certeza absoluta que deseja continuar?`
    )
    
    if (!confirmDelete) return

    // Segunda confirmação para ter certeza
    const doubleConfirm = window.confirm(
      `Última confirmação: Excluir todas as ${history.length} análises de plantas?\n\nDigite SIM para confirmar ou cancele.`
    )
    
    if (!doubleConfirm) return

    try {
      // Deletar todas as análises do usuário atual
      const { error } = await supabase
        .from('planta_analyses')
        .delete()
        .not('id', 'is', null) // Deleta todos os registros do usuário

      if (error) throw error

      // Limpar estado local
      setHistory([])
      setAnalysis(null)

      toast({
        title: "Todas as análises excluídas",
        description: `${history.length} análises foram excluídas permanentemente.`,
        variant: "default"
      })

    } catch (error: Error & { message?: string }) {
      console.error('Erro ao excluir todas as análises:', error)
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir as análises",
        variant: "destructive"
      })
    }
  }

  // Calcular métricas para os cards
  const totalAnalises = history.length
  const analisesGPT4o = history.filter(h => h.analysis_data.api_used === 'openai').length
  const totalAreas = history.reduce((sum, h) => sum + (h.analysis_data.total_area || 0), 0)
  const mediaAmbientes = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + (h.analysis_data.areas?.length || 0), 0) / history.length)
    : 0

  if (loading) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
            <p className="text-muted-foreground">Carregando análises...</p>
          </div>
        </motion.div>
      </DashboardLayout>
    )
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
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Plantas IA</h1>
              <p className="text-sm text-muted-foreground">
                Análise inteligente de plantas baixas com GPT-4o Vision
              </p>
            </div>
          </motion.div>
        </div>

        {/* Cards de métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Total de Análises"
            value={totalAnalises.toString()}
            icon={FileText}
            trend={{ value: 0, isPositive: true }}
            iconColor="primary"
            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700"
          />
          <MetricCard
            title="Análises GPT-4o"
            value={analisesGPT4o.toString()}
            icon={Zap}
            trend={{ value: 0, isPositive: true }}
            iconColor="success"
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700"
          />
          <MetricCard
            title="Área Total"
            value={`${totalAreas.toFixed(0)} m²`}
            icon={Building2}
            trend={{ value: 0, isPositive: true }}
            iconColor="info"
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          />
          <MetricCard
            title="Média Ambientes"
            value={mediaAmbientes.toString()}
            icon={CheckCircle}
            trend={{ value: 0, isPositive: true }}
            iconColor="warning"
            className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700"
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload e Análise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-300">Nova Análise</span>
                </CardTitle>
                <CardDescription>
                  Faça upload de uma planta baixa (PDF ou imagem) para análise com IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleção de Obra */}
                <div className="space-y-2">
                  <Label htmlFor="obra-select" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Building2 className="h-4 w-4" />
                    Obra
                  </Label>
                  <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                      <SelectValue placeholder="Selecione uma obra..." />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{obra.nome}</span>
                            {obra.endereco && (
                              <span className="text-xs text-muted-foreground">{obra.endereco}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Upload de Arquivo */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Arquivo da Planta Baixa
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    disabled={isAnalyzing}
                    className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PDF, JPG, PNG, WebP (máx 10MB)
                  </p>
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-emerald-200 dark:border-emerald-700"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={analyzeFile}
                  disabled={!file || isAnalyzing || !selectedObraId}
                  className={cn(
                    "w-full bg-gradient-to-r from-emerald-500 to-green-600",
                    "hover:from-emerald-600 hover:to-green-700",
                    "text-white shadow-lg",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analisar Planta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Histórico de Análises */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="h-8 w-8 rounded-lg bg-slate-500/10 dark:bg-slate-400/10 flex items-center justify-center">
                        <History className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">Histórico de Análises</span>
                    </CardTitle>
                    <CardDescription>
                      Suas análises anteriores de plantas baixas
                    </CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteAllAnalyses}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Todas ({history.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma análise realizada ainda.</p>
                    <p className="text-xs">Faça upload de uma planta baixa para começar!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600"
                        onClick={() => setAnalysis(item)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm truncate">
                              {item.filename}
                            </h4>
                            {item.obra_nome && (
                              <p className="text-xs text-muted-foreground">
                                {item.obra_nome}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {item.analysis_data.api_used === 'openai' && (
                              <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
                                GPT-4o
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {item.analysis_data.areas?.length || 0} ambientes
                            </span>

                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {item.analysis_data.total_area?.toFixed(1) || 0} m²
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Resultados da Análise */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-green-200/50 dark:border-green-700/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                  <span className="text-green-700 dark:text-green-300">Resultado da Análise</span>
                  {analysis.analysis_data.api_used === 'openai' && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
                      GPT-4o Vision ✨
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {analysis.filename} • {formatDate(analysis.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resumo */}
                <div>
                  <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Resumo</h4>
                  <p className="text-sm text-muted-foreground bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-green-200 dark:border-green-700">
                    {analysis.analysis_data.summary}
                  </p>
                </div>

                {/* Área Total */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Área Total</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {analysis.analysis_data.total_area?.toFixed(1) || 0} m²
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Ambientes</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {analysis.analysis_data.areas?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Ambientes Identificados */}
                {analysis.analysis_data.areas && analysis.analysis_data.areas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Ambientes Identificados</h4>
                    <div className="space-y-2">
                      {analysis.analysis_data.areas.map((area, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-between items-center p-2 bg-white/60 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700"
                        >
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{area.nome}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {area.uso}
                            </Badge>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {area.area?.toFixed(1) || 0} m²
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Problemas Identificados */}
                {analysis.analysis_data.issues && analysis.analysis_data.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Problemas Identificados
                    </h4>
                    <ul className="space-y-1 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                      {analysis.analysis_data.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recomendações */}
                {analysis.analysis_data.recommendations && analysis.analysis_data.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Recomendações
                    </h4>
                    <ul className="space-y-1 bg-green-50/50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-700">
                      {analysis.analysis_data.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}