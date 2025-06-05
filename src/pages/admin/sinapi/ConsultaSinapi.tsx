/**
 * 📋 Página de Consulta SINAPI
 * 
 * Página principal para consulta avançada de códigos SINAPI,
 * integrando busca unificada, histórico e estatísticas de manutenções.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Search, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Info,
  FileText,
  Activity,
  BarChart3,
  Wrench
} from "lucide-react";

import ConsultaAvancada from "@/components/sinapi/ConsultaAvancada";
import { useSinapiEstatisticas } from "@/hooks/useSinapiManutencoes";

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

export const ConsultaSinapi: React.FC = () => {
  const { estatisticas, isLoading: isLoadingStats } = useSinapiEstatisticas();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Cabeçalho da página */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consulta SINAPI</h1>
            <p className="text-muted-foreground">
              Sistema de busca avançada para códigos SINAPI e histórico de manutenções
            </p>
          </div>
        </div>
      </div>

      {/* Cards de informações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Base de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {estatisticas.total_registros.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  registros de manutenção
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Atualizações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-600">
                  {estatisticas.registros_recentes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  nos últimos 6 meses
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-600" />
              Tipos de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-amber-600">
                  {estatisticas.por_tipo.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  tipos distintos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Última Atualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Hoje
            </div>
            <p className="text-xs text-muted-foreground">
              base sempre atualizada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre funcionalidades */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-5 w-5" />
            Como usar a Consulta SINAPI
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Aproveite ao máximo as funcionalidades disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                <Search className="h-4 w-4" />
                Busca Inteligente
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Digite códigos SINAPI ou descrições. O sistema detecta automaticamente se é código numérico e ajusta a busca.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                <FileText className="h-4 w-4" />
                Histórico Detalhado
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Visualize todas as alterações de um código ao longo do tempo com timeline visual e filtros por tipo.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                <BarChart3 className="h-4 w-4" />
                Filtros Avançados
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Filtre por status (ativo/desativado), tipo de manutenção e período para encontrar exatamente o que precisa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas importantes */}
      {estatisticas.por_tipo.length > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Wrench className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Códigos de Manutenção SINAPI
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Esta base contém {estatisticas.total_registros.toLocaleString()} registros de manutenções do SINAPI. 
                    Sempre verifique o status do código antes de usar em orçamentos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Validação Automática
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Códigos são validados automaticamente e exibem alertas para códigos desativados ou com alterações recentes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Integração com Orçamentos
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Use o modo seleção para escolher códigos diretamente nos seus orçamentos com validação automática.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Componente principal de consulta */}
      <ConsultaAvancada />

      {/* Rodapé com estatísticas detalhadas */}
      {estatisticas.por_tipo.length > 5 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribuição por Tipo de Manutenção
            </CardTitle>
            <CardDescription>
              Principais tipos de manutenção encontrados na base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {estatisticas.por_tipo
                .sort((a, b) => b.qtd - a.qtd)
                .slice(0, 8)
                .map(({ tipo, qtd }) => (
                  <div key={tipo} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" title={tipo}>
                        {tipo}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {qtd.toLocaleString()}
                    </Badge>
                  </div>
                ))}
            </div>

            {estatisticas.por_tipo.length > 8 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  + {estatisticas.por_tipo.length - 8} outros tipos de manutenção
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultaSinapi; 