# Implementação Detalhada: Integração SINAPI com Cadastro de Despesas

## 📋 Resumo Executivo

Este documento detalha a implementação completa da integração entre as tabelas SINAPI e o sistema de cadastro de despesas do ObrasAI. A solução permite que usuários utilizem dados oficiais do SINAPI como referência, mantendo a flexibilidade de registrar valores reais pagos.

## 🎯 Objetivo

Integrar os dados SINAPI ao cadastro de despesas para:
- Facilitar o preenchimento de formulários com dados padronizados
- Fornecer referências oficiais de preços
- Permitir análise comparativa entre valores pagos vs. referência SINAPI
- Manter compliance com padrões governamentais

## 🗄️ Estrutura de Dados

### Tabelas SINAPI Existentes

```sql
-- Tabela principal de dados SINAPI
sinapi_dados_oficiais (
  codigo_sinapi VARCHAR,
  descricao_insumo TEXT,
  unidade_medida VARCHAR,
  preco_unitario DECIMAL(10,2),
  estado VARCHAR(2),
  mes_referencia DATE,
  categoria VARCHAR,
  subcategoria VARCHAR,
  tipo_insumo VARCHAR,
  ativo BOOLEAN
)

-- Tabela de insumos SINAPI
sinapi_insumos (
  codigo_do_insumo VARCHAR,
  descricao_do_insumo TEXT,
  unidade VARCHAR,
  categoria VARCHAR,
  -- Preços por estado
  preco_ac DECIMAL(10,2),
  preco_al DECIMAL(10,2),
  -- ... outros estados
)

-- Tabela de composições de mão de obra
sinapi_composicoes_mao_obra (
  codigo_composicao VARCHAR,
  grupo VARCHAR,
  descricao TEXT,
  unidade VARCHAR,
  -- Preços por estado (com e sem desoneração)
)
```

### Modificações na Tabela Despesas

```sql
-- Adicionar campos para integração SINAPI
ALTER TABLE despesas ADD COLUMN codigo_sinapi VARCHAR(20);
ALTER TABLE despesas ADD COLUMN valor_referencia_sinapi DECIMAL(10,2);
ALTER TABLE despesas ADD COLUMN variacao_sinapi DECIMAL(5,2);
ALTER TABLE despesas ADD COLUMN fonte_sinapi VARCHAR(50); -- 'dados_oficiais', 'insumos', 'composicoes'
ALTER TABLE despesas ADD COLUMN estado_referencia VARCHAR(2);
```

## 🔧 Componentes e Hooks

### 1. Hook para Integração SINAPI com Despesas

```typescript
// src/hooks/useSinapiDespesas.ts
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface SinapiItem {
  codigo: string
  descricao: string
  unidade: string
  preco_unitario: number
  categoria: string
  fonte: 'dados_oficiais' | 'insumos' | 'composicoes'
  estado?: string
}

export interface FiltrosSinapi {
  termo?: string
  categoria?: string
  estado?: string
  fonte?: string
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
        p_limite: 50
      })
      
      if (error) throw error
      return data as SinapiItem[]
    },
    enabled: true
  })
  
  // Buscar item específico por código
  const buscarPorCodigo = useCallback(async (codigo: string, estado: string = 'SP') => {
    const { data, error } = await supabase.rpc('buscar_sinapi_por_codigo', {
      p_codigo: codigo,
      p_estado: estado
    })
    
    if (error) throw error
    return data?.[0] as SinapiItem | null
  }, [])
  
  // Calcular variação percentual
  const calcularVariacao = useCallback((valorReal: number, valorSinapi: number) => {
    if (!valorSinapi || valorSinapi === 0) return 0
    return ((valorReal - valorSinapi) / valorSinapi) * 100
  }, [])
  
  // Obter grupos/etapas das composições
  const { data: grupos } = useQuery({
    queryKey: ['sinapi-grupos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sinapi_composicoes_mao_obra')
        .select('grupo')
        .not('grupo', 'is', null)
        .order('grupo')
      
      if (error) throw error
      return [...new Set(data.map(item => item.grupo))]
    }
  })
  
  return {
    itens: itens || [],
    grupos: grupos || [],
    isLoading,
    error,
    filtros,
    setFiltros,
    buscarPorCodigo,
    calcularVariacao
  }
}
```

### 2. Componente Seletor SINAPI para Despesas

```typescript
// src/components/dashboard/SinapiSelectorDespesas.tsx
import React, { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSinapiDespesas, SinapiItem } from '@/hooks/useSinapiDespesas'

interface SinapiSelectorDespesasProps {
  onSelect: (item: SinapiItem) => void
  estado?: string
  valorAtual?: number
}

export const SinapiSelectorDespesas: React.FC<SinapiSelectorDespesasProps> = ({
  onSelect,
  estado = 'SP',
  valorAtual
}) => {
  const [termo, setTermo] = useState('')
  const [mostrarResultados, setMostrarResultados] = useState(false)
  
  const { itens, isLoading, setFiltros, calcularVariacao } = useSinapiDespesas()
  
  const handleSearch = (value: string) => {
    setTermo(value)
    setFiltros({ termo: value, estado })
    setMostrarResultados(value.length > 2)
  }
  
  const handleSelect = (item: SinapiItem) => {
    onSelect(item)
    setMostrarResultados(false)
    setTermo('')
  }
  
  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 5) return <TrendingUp className="w-4 h-4 text-red-500" />
    if (variacao < -5) return <TrendingDown className="w-4 h-4 text-green-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar insumo SINAPI (código ou descrição)..."
          value={termo}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {mostrarResultados && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Buscando...
              </div>
            ) : itens.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhum item encontrado
              </div>
            ) : (
              itens.map((item, index) => {
                const variacao = valorAtual ? calcularVariacao(valorAtual, item.preco_unitario) : 0
                
                return (
                  <div
                    key={`${item.codigo}-${index}`}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.codigo}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.fonte}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {item.descricao}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Unidade: {item.unidade}</span>
                          <span>Categoria: {item.categoria}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          R$ {item.preco_unitario.toFixed(2)}
                        </div>
                        {valorAtual && (
                          <div className="flex items-center gap-1 text-xs">
                            {getVariacaoIcon(variacao)}
                            <span className={variacao > 5 ? 'text-red-500' : variacao < -5 ? 'text-green-500' : 'text-gray-500'}>
                              {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 3. Componente Indicador de Variação

```typescript
// src/components/dashboard/VariacaoSinapiIndicator.tsx
import React from 'react'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VariacaoSinapiIndicatorProps {
  valorReal: number
  valorSinapi: number
  className?: string
}

export const VariacaoSinapiIndicator: React.FC<VariacaoSinapiIndicatorProps> = ({
  valorReal,
  valorSinapi,
  className = ''
}) => {
  if (!valorReal || !valorSinapi) return null
  
  const variacao = ((valorReal - valorSinapi) / valorSinapi) * 100
  const valorAbsoluto = Math.abs(variacao)
  
  const getConfig = () => {
    if (valorAbsoluto <= 5) {
      return {
        icon: <Info className="w-4 h-4" />,
        variant: 'default' as const,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        message: 'Dentro da faixa normal de variação'
      }
    }
    
    if (variacao > 5) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        variant: 'destructive' as const,
        color: 'text-red-700',
        bg: 'bg-red-50',
        message: 'Acima da referência SINAPI - revisar fornecedor'
      }
    }
    
    return {
      icon: <CheckCircle className="w-4 h-4" />,
      variant: 'default' as const,
      color: 'text-green-700',
      bg: 'bg-green-50',
      message: 'Abaixo da referência SINAPI - bom negócio'
    }
  }
  
  const config = getConfig()
  
  return (
    <Alert className={`${config.bg} border-l-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={config.color}>
          {config.icon}
        </div>
        <AlertDescription className={config.color}>
          <div className="flex items-center justify-between">
            <span>{config.message}</span>
            <span className="font-semibold">
              {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs mt-1 opacity-75">
            Valor pago: R$ {valorReal.toFixed(2)} | Referência SINAPI: R$ {valorSinapi.toFixed(2)}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}
```

## 🔄 Modificações no Formulário de Despesas

### Atualização do Componente NovaDespesa.tsx

```typescript
// Adicionar ao src/components/dashboard/NovaDespesa.tsx

// Imports adicionais
import { SinapiSelectorDespesas } from './SinapiSelectorDespesas'
import { VariacaoSinapiIndicator } from './VariacaoSinapiIndicator'
import { useSinapiDespesas } from '@/hooks/useSinapiDespesas'

// Dentro do componente NovaDespesa
const { grupos: gruposSinapi } = useSinapiDespesas()
const [dadosSinapi, setDadosSinapi] = useState<{
  codigo?: string
  valorReferencia?: number
  fonte?: string
}>({})

// Handler para seleção SINAPI
const handleSinapiSelect = (item: SinapiItem) => {
  // Preencher campos automaticamente
  form.setValue('descricao', item.descricao)
  form.setValue('unidade', item.unidade)
  
  // Mapear categoria SINAPI para etapa (se possível)
  if (item.fonte === 'composicoes' && gruposSinapi.includes(item.categoria)) {
    form.setValue('etapa', item.categoria)
  }
  
  // Armazenar dados SINAPI para referência
  setDadosSinapi({
    codigo: item.codigo,
    valorReferencia: item.preco_unitario,
    fonte: item.fonte
  })
  
  // Focar no campo de valor para o usuário preencher
  setTimeout(() => {
    document.getElementById('valor_unitario')?.focus()
  }, 100)
}

// No JSX, adicionar após o campo de descrição:
<div className="space-y-4">
  <div>
    <Label htmlFor="sinapi-search">Buscar Insumo SINAPI (Opcional)</Label>
    <SinapiSelectorDespesas
      onSelect={handleSinapiSelect}
      estado={obraData?.estado || 'SP'}
      valorAtual={form.watch('valor_unitario')}
    />
    <p className="text-xs text-gray-500 mt-1">
      Selecione um item SINAPI para preencher automaticamente descrição, unidade e ter referência de preço
    </p>
  </div>
  
  {/* Campos de valor com comparação */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {dadosSinapi.valorReferencia && (
      <div>
        <Label>Valor de Referência SINAPI</Label>
        <Input
          value={`R$ ${dadosSinapi.valorReferencia.toFixed(2)}`}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Código: {dadosSinapi.codigo} | Fonte: {dadosSinapi.fonte}
        </p>
      </div>
    )}
    
    <div>
      <Label htmlFor="valor_unitario">Valor Real Pago *</Label>
      <Input
        id="valor_unitario"
        type="number"
        step="0.01"
        placeholder="Digite o valor que você pagou"
        {...form.register('valor_unitario', { valueAsNumber: true })}
      />
      {form.formState.errors.valor_unitario && (
        <p className="text-red-500 text-sm mt-1">
          {form.formState.errors.valor_unitario.message}
        </p>
      )}
    </div>
  </div>
  
  {/* Indicador de variação */}
  {dadosSinapi.valorReferencia && form.watch('valor_unitario') && (
    <VariacaoSinapiIndicator
      valorReal={form.watch('valor_unitario')}
      valorSinapi={dadosSinapi.valorReferencia}
    />
  )}
</div>

// No onSubmit, incluir dados SINAPI:
const onSubmit = async (data: any) => {
  try {
    const despesaData = {
      ...data,
      // Campos SINAPI
      codigo_sinapi: dadosSinapi.codigo || null,
      valor_referencia_sinapi: dadosSinapi.valorReferencia || null,
      variacao_sinapi: dadosSinapi.valorReferencia 
        ? ((data.valor_unitario - dadosSinapi.valorReferencia) / dadosSinapi.valorReferencia) * 100
        : null,
      fonte_sinapi: dadosSinapi.fonte || null,
      estado_referencia: obraData?.estado || null
    }
    
    await createDespesa.mutateAsync(despesaData)
    // ... resto do código
  } catch (error) {
    // ... tratamento de erro
  }
}
```

## 🗃️ Funções SQL no Supabase

### 1. Função de Busca Unificada

```sql
-- Função para buscar em todas as tabelas SINAPI
CREATE OR REPLACE FUNCTION buscar_sinapi_unificado(
  p_termo TEXT DEFAULT '',
  p_categoria TEXT DEFAULT '',
  p_estado TEXT DEFAULT 'SP',
  p_fonte TEXT DEFAULT 'todos',
  p_limite INTEGER DEFAULT 50
)
RETURNS TABLE (
  codigo TEXT,
  descricao TEXT,
  unidade TEXT,
  preco_unitario DECIMAL(10,2),
  categoria TEXT,
  fonte TEXT
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Buscar em sinapi_dados_oficiais
    SELECT 
      sdo.codigo_sinapi::TEXT as codigo,
      sdo.descricao_insumo::TEXT as descricao,
      sdo.unidade_medida::TEXT as unidade,
      sdo.preco_unitario,
      sdo.categoria::TEXT as categoria,
      'dados_oficiais'::TEXT as fonte
    FROM sinapi_dados_oficiais sdo
    WHERE 
      (p_fonte = 'todos' OR p_fonte = 'dados_oficiais')
      AND sdo.ativo = true
      AND (p_estado = '' OR sdo.estado = p_estado)
      AND (
        p_termo = '' OR 
        sdo.descricao_insumo ILIKE '%' || p_termo || '%' OR
        sdo.codigo_sinapi ILIKE '%' || p_termo || '%'
      )
      AND (
        p_categoria = '' OR 
        sdo.categoria ILIKE '%' || p_categoria || '%'
      )
    
    UNION ALL
    
    -- Buscar em sinapi_insumos
    SELECT 
      si.codigo_do_insumo::TEXT as codigo,
      si.descricao_do_insumo::TEXT as descricao,
      si.unidade::TEXT as unidade,
      CASE p_estado
        WHEN 'AC' THEN si.preco_ac
        WHEN 'AL' THEN si.preco_al
        WHEN 'AP' THEN si.preco_ap
        WHEN 'AM' THEN si.preco_am
        WHEN 'BA' THEN si.preco_ba
        WHEN 'CE' THEN si.preco_ce
        WHEN 'DF' THEN si.preco_df
        WHEN 'ES' THEN si.preco_es
        WHEN 'GO' THEN si.preco_go
        WHEN 'MA' THEN si.preco_ma
        WHEN 'MT' THEN si.preco_mt
        WHEN 'MS' THEN si.preco_ms
        WHEN 'MG' THEN si.preco_mg
        WHEN 'PA' THEN si.preco_pa
        WHEN 'PB' THEN si.preco_pb
        WHEN 'PR' THEN si.preco_pr
        WHEN 'PE' THEN si.preco_pe
        WHEN 'PI' THEN si.preco_pi
        WHEN 'RJ' THEN si.preco_rj
        WHEN 'RN' THEN si.preco_rn
        WHEN 'RS' THEN si.preco_rs
        WHEN 'RO' THEN si.preco_ro
        WHEN 'RR' THEN si.preco_rr
        WHEN 'SC' THEN si.preco_sc
        WHEN 'SP' THEN si.preco_sp
        WHEN 'SE' THEN si.preco_se
        WHEN 'TO' THEN si.preco_to
        ELSE si.preco_sp
      END as preco_unitario,
      si.categoria::TEXT as categoria,
      'insumos'::TEXT as fonte
    FROM sinapi_insumos si
    WHERE 
      (p_fonte = 'todos' OR p_fonte = 'insumos')
      AND si.ativo = true
      AND (
        p_termo = '' OR 
        si.descricao_do_insumo ILIKE '%' || p_termo || '%' OR
        si.codigo_do_insumo ILIKE '%' || p_termo || '%'
      )
      AND (
        p_categoria = '' OR 
        si.categoria ILIKE '%' || p_categoria || '%'
      )
    
    UNION ALL
    
    -- Buscar em sinapi_composicoes_mao_obra
    SELECT 
      scmo.codigo_composicao::TEXT as codigo,
      scmo.descricao::TEXT as descricao,
      scmo.unidade::TEXT as unidade,
      CASE p_estado
        WHEN 'AC' THEN scmo.preco_ac_sem_desoner
        WHEN 'AL' THEN scmo.preco_al_sem_desoner
        -- ... outros estados
        ELSE scmo.preco_sp_sem_desoner
      END as preco_unitario,
      scmo.grupo::TEXT as categoria,
      'composicoes'::TEXT as fonte
    FROM sinapi_composicoes_mao_obra scmo
    WHERE 
      (p_fonte = 'todos' OR p_fonte = 'composicoes')
      AND scmo.ativo = true
      AND (
        p_termo = '' OR 
        scmo.descricao ILIKE '%' || p_termo || '%' OR
        scmo.codigo_composicao ILIKE '%' || p_termo || '%'
      )
      AND (
        p_categoria = '' OR 
        scmo.grupo ILIKE '%' || p_categoria || '%'
      )
  )
  ORDER BY 
    CASE 
      WHEN codigo ILIKE p_termo || '%' THEN 1
      WHEN descricao ILIKE p_termo || '%' THEN 2
      ELSE 3
    END,
    descricao
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;
```

### 2. Função de Busca por Código

```sql
-- Função para buscar item específico por código
CREATE OR REPLACE FUNCTION buscar_sinapi_por_codigo(
  p_codigo TEXT,
  p_estado TEXT DEFAULT 'SP'
)
RETURNS TABLE (
  codigo TEXT,
  descricao TEXT,
  unidade TEXT,
  preco_unitario DECIMAL(10,2),
  categoria TEXT,
  fonte TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM buscar_sinapi_unificado(p_codigo, '', p_estado, 'todos', 1)
  WHERE codigo = p_codigo;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Relatórios e Análises

### 1. Query para Relatório de Variação SINAPI

```sql
-- Relatório de variação de preços vs SINAPI
SELECT 
  d.descricao,
  d.codigo_sinapi,
  d.valor_unitario as valor_pago,
  d.valor_referencia_sinapi as valor_sinapi,
  d.variacao_sinapi,
  d.fonte_sinapi,
  o.nome as obra,
  f.nome as fornecedor,
  d.data_despesa,
  CASE 
    WHEN d.variacao_sinapi > 15 THEN 'ALTO'
    WHEN d.variacao_sinapi > 5 THEN 'MODERADO'
    WHEN d.variacao_sinapi < -10 THEN 'ECONOMIA'
    ELSE 'NORMAL'
  END as status_variacao
FROM despesas d
LEFT JOIN obras o ON d.obra_id = o.id
LEFT JOIN fornecedores_pj f ON d.fornecedor_id = f.id
WHERE d.codigo_sinapi IS NOT NULL
ORDER BY ABS(d.variacao_sinapi) DESC;
```

### 2. Componente de Relatório

```typescript
// src/components/dashboard/RelatorioVariacaoSinapi.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'

export const RelatorioVariacaoSinapi: React.FC = () => {
  const { data: relatorio, isLoading } = useQuery({
    queryKey: ['relatorio-variacao-sinapi'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('relatorio_variacao_sinapi')
      if (error) throw error
      return data
    }
  })
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ALTO': return 'bg-red-100 text-red-800'
      case 'MODERADO': return 'bg-yellow-100 text-yellow-800'
      case 'ECONOMIA': return 'bg-green-100 text-green-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }
  
  if (isLoading) return <div>Carregando relatório...</div>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Variação SINAPI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatorio?.map((item: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{item.descricao}</h4>
                  <p className="text-sm text-gray-500">
                    Código: {item.codigo_sinapi} | Obra: {item.obra}
                  </p>
                </div>
                <Badge className={getStatusColor(item.status_variacao)}>
                  {item.status_variacao}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Valor Pago:</span>
                  <p className="font-medium">R$ {item.valor_pago?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Referência SINAPI:</span>
                  <p className="font-medium">R$ {item.valor_sinapi?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Variação:</span>
                  <p className={`font-medium ${
                    item.variacao_sinapi > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.variacao_sinapi > 0 ? '+' : ''}{item.variacao_sinapi?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🚀 Estratégia de Implementação

### Fase 1: Estrutura Base (1-2 dias)
1. ✅ Criar hook `useSinapiDespesas`
2. ✅ Implementar funções SQL no Supabase
3. ✅ Adicionar campos na tabela `despesas`
4. ✅ Criar componente `SinapiSelectorDespesas`

### Fase 2: Integração com Formulário (1 dia)
1. ✅ Modificar `NovaDespesa.tsx`
2. ✅ Implementar `VariacaoSinapiIndicator`
3. ✅ Adicionar validações e tratamento de erros
4. ✅ Testes básicos de funcionalidade

### Fase 3: Relatórios e Análises (1-2 dias)
1. ✅ Criar queries de relatório
2. ✅ Implementar `RelatorioVariacaoSinapi`
3. ✅ Adicionar métricas no dashboard
4. ✅ Testes de performance

### Fase 4: Refinamentos (1 dia)
1. 🔄 Otimizações de UX
2. 🔄 Melhorias de performance
3. 🔄 Documentação final
4. 🔄 Deploy e monitoramento

## 🧪 Testes

### Testes Manuais
1. **Busca SINAPI**: Testar busca por código e descrição
2. **Seleção de Item**: Verificar preenchimento automático
3. **Cálculo de Variação**: Validar percentuais
4. **Salvamento**: Confirmar persistência dos dados
5. **Relatórios**: Verificar geração de relatórios

### Casos de Teste
```typescript
// Exemplo de casos de teste
const casosTeste = [
  {
    nome: 'Busca por código SINAPI',
    entrada: '74209/001',
    esperado: 'Deve retornar cimento Portland'
  },
  {
    nome: 'Cálculo de variação positiva',
    valorReal: 1.00,
    valorSinapi: 0.85,
    esperado: '+17.6%'
  },
  {
    nome: 'Preenchimento automático',
    item: { descricao: 'Cimento', unidade: 'kg' },
    esperado: 'Campos preenchidos automaticamente'
  }
]
```

## 📈 Métricas de Sucesso

1. **Adoção**: % de despesas com referência SINAPI
2. **Precisão**: Redução de erros de digitação
3. **Eficiência**: Tempo médio de cadastro
4. **Análise**: Uso dos relatórios de variação
5. **Compliance**: Conformidade com padrões oficiais

## 🔧 Manutenção

### Atualizações SINAPI
- Sincronização mensal com dados oficiais
- Versionamento de preços históricos
- Notificações de mudanças significativas

### Monitoramento
- Performance das queries
- Taxa de erro nas buscas
- Uso dos componentes
- Feedback dos usuários

## 📝 Conclusão

Esta implementação fornece uma integração robusta e flexível entre os dados SINAPI e o sistema de despesas, mantendo a praticidade para o usuário enquanto oferece referências oficiais e análises comparativas valiosas para a gestão de custos de obras.

A solução é escalável, mantém a performance e segue os padrões de desenvolvimento do ObrasAI, garantindo uma experiência consistente e profissional.