import { useReducer, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos
interface PlantaAnalysis {
  id: string;
  filename: string;
  analysis_data: {
    summary: string;
    areas: Array<{
      nome: string;
      area: number;
      uso: string;
    }>;
    issues: string[];
    recommendations: string[];
    total_area: number;
    api_used?: 'openai' | 'fallback';
  };
  created_at: string;
  obra_nome?: string;
}

interface Obra {
  id: string;
  nome: string;
  endereco?: string;
  created_at: string;
}

// Estado do hook
interface PlantaAnalyzerState {
  file: File | null;
  isAnalyzing: boolean;
  analysis: PlantaAnalysis | null;
  loading: boolean;
  selectedObraId: string;
  obras: Obra[];
  history: PlantaAnalysis[];
  error: string | null;
}

// Actions para o reducer
type PlantaAnalyzerAction =
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: PlantaAnalysis }
  | { type: 'ANALYSIS_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_OBRAS'; payload: Obra[] }
  | { type: 'SET_SELECTED_OBRA'; payload: string }
  | { type: 'SET_HISTORY'; payload: PlantaAnalysis[] }
  | { type: 'CLEAR_ANALYSIS' }
  | { type: 'CLEAR_ERROR' };

// Reducer para gerenciar estado
const plantaAnalyzerReducer = (
  state: PlantaAnalyzerState,
  action: PlantaAnalyzerAction
): PlantaAnalyzerState => {
  switch (action.type) {
    case 'SET_FILE':
      return {
        ...state,
        file: action.payload,
        analysis: null,
        error: null,
      };

    case 'START_ANALYSIS':
      return {
        ...state,
        isAnalyzing: true,
        error: null,
      };

    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        isAnalyzing: false,
        analysis: action.payload,
        error: null,
      };

    case 'ANALYSIS_ERROR':
      return {
        ...state,
        isAnalyzing: false,
        error: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_OBRAS':
      return {
        ...state,
        obras: action.payload,
      };

    case 'SET_SELECTED_OBRA':
      return {
        ...state,
        selectedObraId: action.payload,
      };

    case 'SET_HISTORY':
      return {
        ...state,
        history: action.payload,
      };

    case 'CLEAR_ANALYSIS':
      return {
        ...state,
        analysis: null,
        file: null,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Hook principal
export function usePlantaAnalyzer() {
  const { toast } = useToast();

  const initialState: PlantaAnalyzerState = {
    file: null,
    isAnalyzing: false,
    analysis: null,
    loading: true,
    selectedObraId: '',
    obras: [],
    history: [],
    error: null,
  };

  const [state, dispatch] = useReducer(plantaAnalyzerReducer, initialState);

  // Carregar obras na inicialização
  useEffect(() => {
    loadObras();
    loadHistory();
  }, []);

  // Carregar obras
  const loadObras = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('id, nome, endereco, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      dispatch({ type: 'SET_OBRAS', payload: data || [] });
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as obras",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Carregar histórico
  const loadHistory = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase
        .from('planta_analyses')
        .select('id, filename, created_at, analysis_data')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      dispatch({ type: 'SET_HISTORY', payload: data || [] });
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      dispatch({ 
        type: 'ANALYSIS_ERROR', 
        payload: 'Não foi possível carregar as análises anteriores' 
      });
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar as análises anteriores.",
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  // Validar arquivo
  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Por favor, selecione um arquivo PDF ou imagem (JPG, PNG, WebP)";
    }

    if (file.size > 10 * 1024 * 1024) {
      return "O arquivo deve ter no máximo 10MB";
    }

    return null;
  }, []);

  // Definir arquivo
  const setFile = useCallback((file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Arquivo inválido",
          description: error,
          variant: "destructive"
        });
        return;
      }
    }
    dispatch({ type: 'SET_FILE', payload: file });
  }, [validateFile, toast]);

  // Definir obra selecionada
  const setSelectedObraId = useCallback((obraId: string) => {
    dispatch({ type: 'SET_SELECTED_OBRA', payload: obraId });
  }, []);

  // Analisar arquivo
  const analyzeFile = useCallback(async () => {
    if (!state.file) {
      toast({
        title: "Arquivo necessário",
        description: "Por favor, selecione um arquivo para análise",
        variant: "destructive"
      });
      return;
    }

    if (!state.selectedObraId) {
      toast({
        title: "Obra necessária",
        description: "Por favor, selecione uma obra para associar a análise",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'START_ANALYSIS' });

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(state.file!);
      });

      const { data, error } = await supabase.functions.invoke('analyze-planta', {
        body: {
          file: base64,
          filename: state.file.name,
          fileType: state.file.type,
          obra_id: state.selectedObraId
        }
      });

      if (error) throw error;

      dispatch({ type: 'ANALYSIS_SUCCESS', payload: data });
      await loadHistory();

      const apiUsed = data.analysis_data?.api_used || 'fallback';
      toast({
        title: "Análise concluída!",
        description: apiUsed === 'openai' 
          ? "Análise realizada com GPT-4o Vision ✨" 
          : "Análise realizada com sistema interno",
        variant: "default"
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro na análise:', error);
      dispatch({ type: 'ANALYSIS_ERROR', payload: errorMessage });
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [state.file, state.selectedObraId, loadHistory, toast]);

  // Deletar todas as análises
  const deleteAllAnalyses = useCallback(async () => {
    if (state.history.length === 0) {
      toast({
        title: "Nenhuma análise",
        description: "Não há análises para excluir.",
        variant: "default"
      });
      return;
    }

    const confirmDelete = window.confirm(
      `⚠️ ATENÇÃO: Você está prestes a excluir TODAS as ${state.history.length} análises!\n\nEsta ação é IRREVERSÍVEL e não pode ser desfeita.\n\nTem certeza absoluta que deseja continuar?`
    );
    
    if (!confirmDelete) return;

    const doubleConfirm = window.confirm(
      `Última confirmação: Excluir todas as ${state.history.length} análises de plantas?\n\nDigite SIM para confirmar ou cancele.`
    );
    
    if (!doubleConfirm) return;

    try {
      const { error } = await supabase
        .from('planta_analyses')
        .delete()
        .not('id', 'is', null);

      if (error) throw error;

      dispatch({ type: 'SET_HISTORY', payload: [] });
      dispatch({ type: 'CLEAR_ANALYSIS' });

      toast({
        title: "Todas as análises excluídas",
        description: `${state.history.length} análises foram excluídas permanentemente.`,
        variant: "default"
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao excluir todas as análises:', error);
      dispatch({ type: 'ANALYSIS_ERROR', payload: errorMessage });
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [state.history.length, toast]);

  // Selecionar análise do histórico
  const selectAnalysis = useCallback((analysis: PlantaAnalysis) => {
    dispatch({ type: 'ANALYSIS_SUCCESS', payload: analysis });
  }, []);

  // Limpar análise atual
  const clearAnalysis = useCallback(() => {
    dispatch({ type: 'CLEAR_ANALYSIS' });
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Calcular métricas
  const metrics = {
    totalAnalises: state.history.length,
    analisesGPT4o: state.history.filter(h => h.analysis_data.api_used === 'openai').length,
    totalAreas: state.history.reduce((sum, h) => sum + (h.analysis_data.total_area || 0), 0),
    mediaAmbientes: state.history.length > 0 
      ? Math.round(state.history.reduce((sum, h) => sum + (h.analysis_data.areas?.length || 0), 0) / state.history.length)
      : 0
  };

  // Utilitário para formatar data
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return {
    // Estado
    ...state,
    
    // Funções principais
    setFile,
    setSelectedObraId,
    analyzeFile,
    deleteAllAnalyses,
    selectAnalysis,
    clearAnalysis,
    clearError,
    
    // Funções auxiliares
    loadObras,
    loadHistory,
    formatDate,
    
    // Métricas
    metrics,
    
    // Estados computados
    canAnalyze: !!state.file && !!state.selectedObraId && !state.isAnalyzing,
    hasHistory: state.history.length > 0,
    hasAnalysis: !!state.analysis,
    hasError: !!state.error,
  };
}