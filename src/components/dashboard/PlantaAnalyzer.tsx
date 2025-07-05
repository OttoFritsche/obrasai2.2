import { Building2, Calculator, CheckCircle, FileText, Lightbulb,Upload, Zap } from 'lucide-react'
import React, { useCallback,useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface PlantaAnalysis {
  area_total: number
  comodos: Array<{
    nome: string
    area: number
    dimensoes: string
    tipo: string
  }>
  materiais_estimados: {
    ceramica: number
    tinta: number
    eletrica: number
    hidraulica: number
    alvenaria: number
  }
  orcamento_estimado: number
  insights_ia: string[]
  detalhes_tecnicos: {
    paredes_lineares: number
    portas_quantidade: number
    janelas_quantidade: number
    area_coberta: number
  }
}

interface PlantaAnalyzerProps {
  obraId?: string
  className?: string
  onAnalysisComplete?: () => void
}

export function PlantaAnalyzer({ obraId, className, onAnalysisComplete }: PlantaAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PlantaAnalysis | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive"
      })
      return
    }

    setSelectedFile(file)
    setAnalysis(null)
  }, [toast])

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setProgress(10)

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) {
        throw new Error('Usuário não autenticado')
      }

      setProgress(30)

      const formData = new FormData()
      formData.append('file', selectedFile)
      if (obraId) {
        formData.append('obra_id', obraId)
      }

      setProgress(50)

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-planta`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      )

      setProgress(80)

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de análises excedido. Tente novamente em 1 minuto.')
        }
        throw new Error(result.error || 'Erro na análise')
      }

      setProgress(100)
      setAnalysis(result.data)

      toast({
        title: "Análise concluída!",
        description: "Sua planta baixa foi analisada com sucesso.",
      })

      // Callback para atualizar histórico na página pai
      onAnalysisComplete?.()

    } catch (_error) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getComodoTypeColor = (tipo: string) => {
    const colors = {
      'social': 'bg-blue-500',
      'intimo': 'bg-green-500',
      'servico': 'bg-orange-500',
      'circulacao': 'bg-purple-500',
      'area_molhada': 'bg-cyan-500',
    }
    return colors[tipo as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Análise Inteligente de Plantas Baixas
          </CardTitle>
          <CardDescription>
            Faça upload de uma planta baixa em PDF e nossa IA irá analisar automaticamente 
            cômodos, áreas, materiais e orçamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isAnalyzing}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo PDF'}
                </p>
                <p className="text-sm text-gray-500">
                  Máximo 10MB • Apenas arquivos PDF
                </p>
              </div>
            </label>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Arquivo selecionado:</strong> {selectedFile.name} 
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                Analisando planta baixa com IA... {progress}%
              </p>
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-pulse" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Analisar Planta Baixa
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Área Total</p>
                    <p className="text-2xl font-bold">{analysis.area_total.toFixed(1)} m²</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cômodos</p>
                    <p className="text-2xl font-bold">{analysis.comodos.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Orçamento Est.</p>
                    <p className="text-lg font-bold">{formatCurrency(analysis.orcamento_estimado)}</p>
                  </div>
                  <Calculator className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cômodos Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Cômodos Identificados</CardTitle>
              <CardDescription>
                Ambientes detectados automaticamente pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.comodos.map((comodo, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{comodo.nome}</h4>
                      <Badge className={`text-white ${getComodoTypeColor(comodo.tipo)}`}>
                        {comodo.tipo}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Área:</strong> {comodo.area.toFixed(1)} m²</p>
                      <p><strong>Dimensões:</strong> {comodo.dimensoes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Materials Estimation */}
          <Card>
            <CardHeader>
              <CardTitle>Estimativa de Materiais</CardTitle>
              <CardDescription>
                Quantidade estimada de materiais para construção completa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-1">Cerâmica/Piso</h4>
                  <p className="text-lg font-bold text-blue-600">
                    {analysis.materiais_estimados.ceramica.toFixed(1)} m²
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-1">Tinta</h4>
                  <p className="text-lg font-bold text-green-600">
                    {analysis.materiais_estimados.tinta.toFixed(1)} L
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-1">Pontos Elétricos</h4>
                  <p className="text-lg font-bold text-yellow-600">
                    {analysis.materiais_estimados.eletrica} pontos
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-1">Pontos Hidráulicos</h4>
                  <p className="text-lg font-bold text-cyan-600">
                    {analysis.materiais_estimados.hidraulica} pontos
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-1">Alvenaria</h4>
                  <p className="text-lg font-bold text-orange-600">
                    {analysis.materiais_estimados.alvenaria.toFixed(1)} m²
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {analysis.detalhes_tecnicos.paredes_lineares.toFixed(1)}m
                  </p>
                  <p className="text-sm text-gray-600">Paredes Lineares</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.detalhes_tecnicos.portas_quantidade}
                  </p>
                  <p className="text-sm text-gray-600">Portas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {analysis.detalhes_tecnicos.janelas_quantidade}
                  </p>
                  <p className="text-sm text-gray-600">Janelas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {analysis.detalhes_tecnicos.area_coberta.toFixed(1)}m²
                  </p>
                  <p className="text-sm text-gray-600">Área Coberta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {analysis.insights_ia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Insights da IA
                </CardTitle>
                <CardDescription>
                  Recomendações técnicas baseadas na análise da planta baixa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.insights_ia.map((insight, index) => (
                    <Alert key={index}>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{insight}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
} 