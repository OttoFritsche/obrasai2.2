import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface SinapiItem {
  codigo: string
  descricao: string
  unidade: string
  preco_unitario: number
  fonte: string
  estado?: string | null
  data_referencia?: string | null
}

export interface FiltrosSinapi {
  termo?: string
  categoria?: string
  estado?: string
  fonte?: string
  limite?: number
}

export const useSinapiDespesas = () => {
  const [filtros, setFiltros] = useState<FiltrosSinapi>({})
  
  // Buscar insumos SINAPI unificado
  const { data: itens, isLoading, error } = useQuery({
    queryKey: ['sinapi-despesas', filtros],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('buscar_sinapi_unificado', {
        p_termo: filtros.termo || '',
        p_categoria: filtros.categoria || '',
        p_estado: filtros.estado || 'SP',
        p_fonte: filtros.fonte || 'todos',
        p_limite: filtros.limite || 50
      })
      
      if (error) throw error
      return data as SinapiItem[]
    },
    enabled: !!filtros.termo && filtros.termo.length >= 3
  })
  
  // Buscar item específico por código
  const buscarPorCodigo = useCallback(async (codigo: string) => {
    const { data, error } = await supabase.rpc('buscar_sinapi_por_codigo', {
      codigo_param: codigo
    })
    
    if (error) throw error
    return data?.[0] as SinapiItem | null
  }, [])
  
  // Calcular variação percentual
  const calcularVariacao = useCallback((valorReal: number, valorSinapi: number) => {
    if (!valorSinapi || valorSinapi === 0) return 0
    const variacao = ((valorReal - valorSinapi) / valorSinapi) * 100
    return Number(variacao.toFixed(2))
  }, [])
  
  // Hook para buscar com termo específico
  const useBuscarSinapi = (termo: string, limite: number = 10) => {
    return useQuery({
      queryKey: ['sinapi-busca', termo, limite],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('buscar_sinapi_unificado', {
          p_termo: termo,
          p_categoria: '',
          p_estado: 'SP',
          p_fonte: 'todos',
          p_limite: limite
        })
        
        if (error) throw error
        return data as SinapiItem[]
      },
      enabled: !!termo && termo.length >= 3,
      staleTime: 1000 * 60 * 5 // 5 minutos
    })
  }
  
  return {
    itens: itens || [],
    isLoading,
    error,
    filtros,
    setFiltros,
    buscarPorCodigo,
    calcularVariacao,
    useBuscarSinapi
  }
}