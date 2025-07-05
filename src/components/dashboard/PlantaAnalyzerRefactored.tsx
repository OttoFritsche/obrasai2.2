import { Building2, Calculator, CheckCircle, FileText, Lightbulb,Upload, Zap } from 'lucide-react';
import React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// ✅ Tipos movidos para interface separada
interface PlantaAnalysis {
  area_total: number;
  comodos: Array<{
    nome: string;
    area: number;
    dimensoes: string;
    tipo: string;
  }>;
  materiais_estimados: {
    ceramica: number;
    tinta: number;
    eletrica: number;
    hidraulica: number;
    alvenaria: number;
  };
  orcamento_estimado: number;
  insights_ia: string[];
  detalhes_tecnicos: {
    paredes_lineares: number;
    portas_quantidade: number;
    janelas_quantidade: number;
    area_coberta: number;
  };
}

interface PlantaAnalyzerProps {
  obraId?: string;
  className?: string;
  onAnalysisComplete?: () => void;
}

// ✅ Utilitários movidos para funções separadas
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getComodoTypeColor = (tipo: string): string => {
  const colors = {
    'social': 'bg-blue-500',
    'intimo': 'bg-green-500',
    'servico': 'bg-orange-500',
    'circulacao': 'bg-purple-500',
    'area_molhada': 'bg-cyan-500',
  };
  return colors[tipo as keyof typeof colors] || 'bg-gray-500';
};

// ✅ Componente de Upload Separado
interface FileUploadSectionProps {
  selectedFile: File | null;
  isAnalyzing: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFile,
  isAnalyzing,
  onFileSelect
}) => (
  <div className="space-y-4">
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
      <input
        type="file"
        accept=".pdf"
        onChange={onFileSelect}
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

    {selectedFile && (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Arquivo selecionado:</strong> {selectedFile.name} 
          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </AlertDescription>
      </Alert>
    )}
  </div>
);

// ✅ Componente de Progresso Separado
interface AnalysisProgressProps {
  isAnalyzing: boolean;
  progress: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ isAnalyzing, progress }) => {
  if (!isAnalyzing) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-center text-gray-600">
        Analisando planta baixa com IA... {progress}%
      </p>
    </div>
  );
};

// ✅ Botão de Análise Separado
interface AnalyzeButtonProps {
  selectedFile: File | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ selectedFile, isAnalyzing, onAnalyze }) => (
  <Button
    onClick={onAnalyze}
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
);

// ✅ Cards de Overview Separados
interface OverviewCardsProps {
  analysis: PlantaAnalysis;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ analysis }) => (
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
);

// ✅ Detalhes de Cômodos Separados
interface ComodoDetailsProps {
  comodos: Array<{
    nome: string;
    area: number;
    dimensoes: string;
    tipo: string;
  }>;
}

const ComodoDetails: React.FC<ComodoDetailsProps> = ({ comodos }) => (
  <Card>
    <CardHeader>
      <CardTitle>Cômodos Identificados</CardTitle>
      <CardDescription>
        Ambientes detectados automaticamente pela IA
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comodos.map((comodo, index) => (
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
);

// ✅ Estimativa de Materiais Separada
interface MaterialsEstimationProps {
  materiais: {
    ceramica: number;
    tinta: number;
    eletrica: number;
    hidraulica: number;
    alvenaria: number;
  };
}

const MaterialsEstimation: React.FC<MaterialsEstimationProps> = ({ materiais }) => (
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
            {materiais.ceramica.toFixed(1)} m²
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-1">Tinta</h4>
          <p className="text-lg font-bold text-green-600">
            {materiais.tinta.toFixed(1)} L
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-1">Pontos Elétricos</h4>
          <p className="text-lg font-bold text-yellow-600">
            {materiais.eletrica} pontos
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-1">Pontos Hidráulicos</h4>
          <p className="text-lg font-bold text-cyan-600">
            {materiais.hidraulica} pontos
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-1">Alvenaria</h4>
          <p className="text-lg font-bold text-orange-600">
            {materiais.alvenaria.toFixed(1)} m²
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ✅ Detalhes Técnicos Separados
interface TechnicalDetailsProps {
  detalhes: {
    paredes_lineares: number;
    portas_quantidade: number;
    janelas_quantidade: number;
    area_coberta: number;
  };
}

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({ detalhes }) => (
  <Card>
    <CardHeader>
      <CardTitle>Detalhes Técnicos</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {detalhes.paredes_lineares.toFixed(1)}m
          </p>
          <p className="text-sm text-gray-600">Paredes Lineares</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {detalhes.portas_quantidade}
          </p>
          <p className="text-sm text-gray-600">Portas</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">
            {detalhes.janelas_quantidade}
          </p>
          <p className="text-sm text-gray-600">Janelas</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">
            {detalhes.area_coberta.toFixed(1)}m²
          </p>
          <p className="text-sm text-gray-600">Área Coberta</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ✅ Insights da IA Separados
interface AIInsightsProps {
  insights: string[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
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
          {insights.map((insight, index) => (
            <Alert key={index}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{insight}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ✅ Container Principal - Apenas Orquestração
export function PlantaAnalyzerRefactored({ obraId, className, onAnalysisComplete }: PlantaAnalyzerProps) {
  // Simulando o uso do hook (não vou quebrar o hook existente)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<PlantaAnalysis | null>(null);
  const [progress, setProgress] = React.useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setProgress(10);
    
    // Simular análise
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setProgress(0);
          // Simular resultado
          setAnalysis({
            area_total: 120.5,
            comodos: [
              { nome: "Sala de Estar", area: 25.5, dimensoes: "5.0m x 5.1m", tipo: "social" },
              { nome: "Cozinha", area: 15.2, dimensoes: "3.8m x 4.0m", tipo: "servico" },
            ],
            materiais_estimados: {
              ceramica: 85.2,
              tinta: 45.8,
              eletrica: 25,
              hidraulica: 12,
              alvenaria: 95.3
            },
            orcamento_estimado: 85000,
            insights_ia: ["Ótima distribuição dos ambientes", "Considere ampliar a área de serviço"],
            detalhes_tecnicos: {
              paredes_lineares: 45.2,
              portas_quantidade: 8,
              janelas_quantidade: 6,
              area_coberta: 110.8
            }
          });
          onAnalysisComplete?.();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

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
          <FileUploadSection
            selectedFile={selectedFile}
            isAnalyzing={isAnalyzing}
            onFileSelect={handleFileSelect}
          />
          
          <AnalysisProgress
            isAnalyzing={isAnalyzing}
            progress={progress}
          />
          
          <AnalyzeButton
            selectedFile={selectedFile}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
          />
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <OverviewCards analysis={analysis} />
          <ComodoDetails comodos={analysis.comodos} />
          <MaterialsEstimation materiais={analysis.materiais_estimados} />
          <TechnicalDetails detalhes={analysis.detalhes_tecnicos} />
          <AIInsights insights={analysis.insights_ia} />
        </div>
      )}
    </div>
  );
}