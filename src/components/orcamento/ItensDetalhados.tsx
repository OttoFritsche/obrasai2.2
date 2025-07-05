/**
 * 📋 Componente de Itens Detalhados do Orçamento
 * 
 * Exibe uma tabela detalhada e interativa dos itens do orçamento,
 * com filtros, agrupamento por categoria e visualização atraente.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Package,
  Search,
  Settings,
  Truck,
  Wrench} from "lucide-react";
import React, { memo,useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ItemOrcamento } from "@/lib/validations/orcamento";
import { orcamentoUtils } from "@/services/orcamentoApi";

// ====================================
// 🎨 TIPOS E INTERFACES
// ====================================

interface ItensDetalhadosProps {
  itens: ItemOrcamento[];
  className?: string;
}

interface ItemAgrupado {
  categoria: string;
  itens: ItemOrcamento[];
  total: number;
  percentual: number;
  quantidadeItens: number;
}

// ====================================
// 🎯 CONFIGURAÇÕES E CONSTANTES
// ====================================

const CATEGORIA_LABELS: Record<string, string> = {
  MATERIAL_CONSTRUCAO: "Material de Construção",
  MAO_DE_OBRA: "Mão de Obra",
  ALUGUEL_EQUIPAMENTOS: "Aluguel de Equipamentos",
  TRANSPORTE_FRETE: "Transporte e Frete",
  TAXAS_LICENCAS: "Taxas e Licenças",
  SERVICOS_TERCEIRIZADOS: "Serviços Terceirizados",
  ADMINISTRATIVO: "Administrativo",
  IMPREVISTOS: "Imprevistos",
  OUTROS: "Outros"
};

const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  MATERIAL_CONSTRUCAO: <Package className="h-4 w-4" />,
  MAO_DE_OBRA: <Wrench className="h-4 w-4" />,
  ALUGUEL_EQUIPAMENTOS: <Settings className="h-4 w-4" />,
  TRANSPORTE_FRETE: <Truck className="h-4 w-4" />,
  TAXAS_LICENCAS: <FileText className="h-4 w-4" />,
  SERVICOS_TERCEIRIZADOS: <Wrench className="h-4 w-4" />,
  ADMINISTRATIVO: <FileText className="h-4 w-4" />,
  IMPREVISTOS: <AlertTriangle className="h-4 w-4" />,
  OUTROS: <Package className="h-4 w-4" />
};

const CATEGORIA_CORES: Record<string, string> = {
  MATERIAL_CONSTRUCAO: "bg-blue-500/10 text-blue-700 border-blue-200",
  MAO_DE_OBRA: "bg-green-500/10 text-green-700 border-green-200",
  ALUGUEL_EQUIPAMENTOS: "bg-purple-500/10 text-purple-700 border-purple-200",
  TRANSPORTE_FRETE: "bg-orange-500/10 text-orange-700 border-orange-200",
  TAXAS_LICENCAS: "bg-red-500/10 text-red-700 border-red-200",
  SERVICOS_TERCEIRIZADOS: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  ADMINISTRATIVO: "bg-gray-500/10 text-gray-700 border-gray-200",
  IMPREVISTOS: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  OUTROS: "bg-indigo-500/10 text-indigo-700 border-indigo-200"
};

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================

const ItensDetalhados = memo<ItensDetalhadosProps>(({ itens, className }) => {
  // Estados locais
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set());

  // Cálculos e agrupamentos
  const totalGeral = useMemo(() => {
    return itens.reduce((sum, item) => sum + (item.valor_unitario_base * item.quantidade_estimada), 0);
  }, [itens]);

  const itensAgrupados = useMemo(() => {
    // Filtrar itens
    let itensFiltrados = itens;
    
    if (filtroTexto) {
      itensFiltrados = itens.filter(item => 
        item.insumo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (item.observacoes && item.observacoes.toLowerCase().includes(filtroTexto.toLowerCase()))
      );
    }
    
    if (filtroCategoria !== "todas") {
      itensFiltrados = itensFiltrados.filter(item => item.categoria === filtroCategoria);
    }

    // Agrupar por categoria
    const grupos = itensFiltrados.reduce((acc, item) => {
      const categoria = item.categoria;
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(item);
      return acc;
    }, {} as Record<string, ItemOrcamento[]>);

    // Converter para array com totais
    return Object.entries(grupos).map(([categoria, itensCategoria]) => {
      const total = itensCategoria.reduce((sum, item) => 
        sum + (item.valor_unitario_base * item.quantidade_estimada), 0
      );
      const percentual = totalGeral > 0 ? (total / totalGeral) * 100 : 0;
      
      return {
        categoria,
        itens: itensCategoria.sort((a, b) => 
          (b.valor_unitario_base * b.quantidade_estimada) - (a.valor_unitario_base * a.quantidade_estimada)
        ),
        total,
        percentual,
        quantidadeItens: itensCategoria.length
      };
    }).sort((a, b) => b.total - a.total);
  }, [itens, filtroTexto, filtroCategoria, totalGeral]);

  // Handlers
  const toggleCategoria = useCallback((categoria: string) => {
    const novasExpandidas = new Set(categoriasExpandidas);
    if (novasExpandidas.has(categoria)) {
      novasExpandidas.delete(categoria);
    } else {
      novasExpandidas.add(categoria);
    }
    setCategoriasExpandidas(novasExpandidas);
  }, [categoriasExpandidas]);

  const expandirTodas = useCallback(() => {
    setCategoriasExpandidas(new Set(itensAgrupados.map(grupo => grupo.categoria)));
  }, [itensAgrupados]);

  const recolherTodas = useCallback(() => {
    setCategoriasExpandidas(new Set());
  }, []);

  // ====================================
  // 🎨 RENDER
  // ====================================

  return (
    <Card className={cn("border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Itens Detalhados
            </CardTitle>
            <CardDescription>
              {itens.length} itens • Total: {orcamentoUtils.formatarValor(totalGeral)}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandirTodas}
              className="text-xs"
            >
              Expandir Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={recolherTodas}
              className="text-xs"
            >
              Recolher Todas
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por insumo ou observação..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de categorias */}
        <div className="space-y-4">
          {itensAgrupados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            itensAgrupados.map((grupo, index) => (
              <motion.div
                key={grupo.categoria}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Collapsible
                  open={categoriasExpandidas.has(grupo.categoria)}
                  onOpenChange={() => toggleCategoria(grupo.categoria)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="w-full p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {categoriasExpandidas.has(grupo.categoria) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {CATEGORIA_ICONS[grupo.categoria]}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold">{CATEGORIA_LABELS[grupo.categoria]}</h3>
                            <p className="text-sm text-muted-foreground">
                              {grupo.quantidadeItens} {grupo.quantidadeItens === 1 ? 'item' : 'itens'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {orcamentoUtils.formatarValor(grupo.total)}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", CATEGORIA_CORES[grupo.categoria])}
                          >
                            {grupo.percentual.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={grupo.percentual} className="h-2" />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Insumo</TableHead>
                            <TableHead className="text-center">Qtd.</TableHead>
                            <TableHead className="text-center">Unidade</TableHead>
                            <TableHead className="text-right">Valor Unit.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center">Fonte</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.itens.map((item, itemIndex) => {
                            const valorTotal = item.valor_unitario_base * item.quantidade_estimada;
                            
                            return (
                              <TableRow key={`${item.id || itemIndex}`} className="hover:bg-muted/50">
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{item.insumo}</div>
                                    {item.observacoes && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {item.observacoes}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {item.quantidade_estimada.toLocaleString('pt-BR', { 
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2 
                                  })}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {item.unidade_medida}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {orcamentoUtils.formatarValor(item.valor_unitario_base)}
                                </TableCell>
                                <TableCell className="text-right font-mono font-semibold">
                                  {orcamentoUtils.formatarValor(valorTotal)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant={item.fonte_preco === 'IA' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {item.fonte_preco || 'N/A'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ItensDetalhados.displayName = 'ItensDetalhados';

export default ItensDetalhados;