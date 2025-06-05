/**
 * 📊 Componente de Composição Detalhada de Custos
 * 
 * Exibe a composição de custos organizada por etapas da obra
 * com detalhamento de materiais e mão de obra.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight,
  Calculator,
  Users,
  Package,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Wrench
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import { ItemOrcamento } from "@/lib/validations/orcamento";
import { orcamentoUtils } from "@/services/orcamentoApi";

// ====================================
// 🎯 INTERFACES E TIPOS
// ====================================

interface ResumoCategoria {
  categoria: string;
  valor_total: number;
  percentual: number;
  quantidade_itens: number;
}

interface ResumoEtapa {
  etapa: string;
  valor_total: number;
  percentual: number;
  quantidade_itens: number;
}

interface ComposicaoDetalhada {
  resumo_categorias: ResumoCategoria[];
  resumo_etapas: ResumoEtapa[];
  total_itens: number;
  percentual_mao_obra: number;
  percentual_material: number;
}

interface ComposicaoDetalhadaProps {
  itens: ItemOrcamento[];
  composicao?: ComposicaoDetalhada;
  custoTotal: number;
}

// ====================================
// 🎨 ÍCONES POR CATEGORIA
// ====================================

const iconesPorCategoria = {
  'MATERIAL_CONSTRUCAO': Package,
  'MAO_DE_OBRA': Users,
  'SERVICOS_TERCEIRIZADOS': Wrench,
  'ADMINISTRATIVO': Calculator,
  'ALUGUEL_EQUIPAMENTOS': TrendingUp,
  'TRANSPORTE_FRETE': TrendingUp,
  'TAXAS_LICENCAS': Calculator,
  'IMPREVISTOS': BarChart3,
  'OUTROS': PieChart
};

const iconesPorEtapa = {
  'PLANEJAMENTO': Calculator,
  'FUNDACAO': Package,
  'ESTRUTURA': Package,
  'ALVENARIA': Package,
  'COBERTURA': Package,
  'INSTALACOES_ELETRICAS': Wrench,
  'INSTALACOES_HIDRAULICAS': Wrench,
  'REVESTIMENTOS_INTERNOS': Package,
  'PINTURA': Package,
  'ACABAMENTOS': Package,
  'LIMPEZA_POS_OBRA': Users,
  'ENTREGA_VISTORIA': Calculator
};

// ====================================
// 🧮 FUNÇÕES AUXILIARES
// ====================================

function calcularComposicao(itens: ItemOrcamento[]): ComposicaoDetalhada {
  const custoTotal = itens.reduce((total, item) => 
    total + (item.quantidade_estimada * item.valor_unitario_base), 0
  );

  // Resumo por categoria
  const porCategoria = itens.reduce((acc, item) => {
    const categoria = item.categoria;
    if (!acc[categoria]) {
      acc[categoria] = { total: 0, itens: 0 };
    }
    acc[categoria].total += item.quantidade_estimada * item.valor_unitario_base;
    acc[categoria].itens += 1;
    return acc;
  }, {} as Record<string, { total: number; itens: number }>);

  const resumoCategorias = Object.entries(porCategoria).map(([categoria, dados]) => ({
    categoria,
    valor_total: dados.total,
    percentual: Math.round((dados.total / custoTotal) * 100 * 10) / 10,
    quantidade_itens: dados.itens
  })).sort((a, b) => b.valor_total - a.valor_total);

  // Resumo por etapa
  const porEtapa = itens.reduce((acc, item) => {
    const etapa = item.etapa;
    if (!acc[etapa]) {
      acc[etapa] = { total: 0, itens: 0 };
    }
    acc[etapa].total += item.quantidade_estimada * item.valor_unitario_base;
    acc[etapa].itens += 1;
    return acc;
  }, {} as Record<string, { total: number; itens: number }>);

  const resumoEtapas = Object.entries(porEtapa).map(([etapa, dados]) => ({
    etapa,
    valor_total: dados.total,
    percentual: Math.round((dados.total / custoTotal) * 100 * 10) / 10,
    quantidade_itens: dados.itens
  })).sort((a, b) => b.valor_total - a.valor_total);

  // Calcular percentuais específicos
  const custoMaoObra = resumoCategorias.find(c => c.categoria === 'MAO_DE_OBRA')?.valor_total || 0;
  const custoMaterial = resumoCategorias.find(c => c.categoria === 'MATERIAL_CONSTRUCAO')?.valor_total || 0;

  return {
    resumo_categorias: resumoCategorias,
    resumo_etapas: resumoEtapas,
    total_itens: itens.length,
    percentual_mao_obra: Math.round((custoMaoObra / custoTotal) * 100 * 10) / 10,
    percentual_material: Math.round((custoMaterial / custoTotal) * 100 * 10) / 10
  };
}

// ====================================
// 🎨 COMPONENTES AUXILIARES
// ====================================

const ItemEtapaDetalhado: React.FC<{ 
  etapa: string; 
  itens: ItemOrcamento[];
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ etapa, itens, isExpanded, onToggle }) => {
  const custoEtapa = itens.reduce((total, item) => 
    total + (item.quantidade_estimada * item.valor_unitario_base), 0
  );

  const IconeEtapa = iconesPorEtapa[etapa as keyof typeof iconesPorEtapa] || Package;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-3">
            <IconeEtapa className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">
                {etapa.replace(/_/g, ' ')}
              </CardTitle>
              <CardDescription>
                {itens.length} itens • {orcamentoUtils.formatarValor(custoEtapa)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {itens.length} itens
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.insumo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.categoria.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.quantidade_estimada.toFixed(2)} {item.unidade_medida}
                      </TableCell>
                      <TableCell>
                        {orcamentoUtils.formatarValor(item.valor_unitario_base)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {orcamentoUtils.formatarValor(
                          item.quantidade_estimada * item.valor_unitario_base
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// ====================================
// 🏗️ COMPONENTE PRINCIPAL
// ====================================

export const ComposicaoDetalhada: React.FC<ComposicaoDetalhadaProps> = ({
  itens,
  composicao: composicaoExternal,
  custoTotal
}) => {
  const [etapasExpandidas, setEtapasExpandidas] = useState<Set<string>>(new Set());

  // Usar composição externa ou calcular internamente
  const composicao = composicaoExternal || calcularComposicao(itens);

  // Agrupar itens por etapa
  const itensPorEtapa = itens.reduce((acc, item) => {
    const etapa = item.etapa;
    if (!acc[etapa]) {
      acc[etapa] = [];
    }
    acc[etapa].push(item);
    return acc;
  }, {} as Record<string, ItemOrcamento[]>);

  // Handlers
  const toggleEtapa = (etapa: string) => {
    const novasEtapasExpandidas = new Set(etapasExpandidas);
    if (novasEtapasExpandidas.has(etapa)) {
      novasEtapasExpandidas.delete(etapa);
    } else {
      novasEtapasExpandidas.add(etapa);
    }
    setEtapasExpandidas(novasEtapasExpandidas);
  };

  const expandirTodas = () => {
    setEtapasExpandidas(new Set(Object.keys(itensPorEtapa)));
  };

  const recolherTodas = () => {
    setEtapasExpandidas(new Set());
  };

  if (itens.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
          <p className="text-muted-foreground">
            Os itens detalhados serão exibidos após o cálculo do orçamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Composição Detalhada de Custos
          </CardTitle>
          <CardDescription>
            {composicao.total_itens} itens distribuídos em {composicao.resumo_etapas.length} etapas da obra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {composicao.percentual_material}%
              </div>
              <div className="text-sm text-muted-foreground">Materiais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {composicao.percentual_mao_obra}%
              </div>
              <div className="text-sm text-muted-foreground">Mão de Obra</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {composicao.resumo_etapas.length}
              </div>
              <div className="text-sm text-muted-foreground">Etapas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {composicao.total_itens}
              </div>
              <div className="text-sm text-muted-foreground">Itens</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={expandirTodas}
            >
              Expandir Todas
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={recolherTodas}
            >
              Recolher Todas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="etapas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="etapas">Por Etapas</TabsTrigger>
          <TabsTrigger value="categorias">Por Categorias</TabsTrigger>
          <TabsTrigger value="resumo">Resumo Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="etapas" className="space-y-4">
          {composicao.resumo_etapas.map((resumo) => {
            const itensEtapa = itensPorEtapa[resumo.etapa] || [];
            return (
              <ItemEtapaDetalhado
                key={resumo.etapa}
                etapa={resumo.etapa}
                itens={itensEtapa}
                isExpanded={etapasExpandidas.has(resumo.etapa)}
                onToggle={() => toggleEtapa(resumo.etapa)}
              />
            );
          })}
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          {composicao.resumo_categorias.map((categoria) => {
            const IconeCategoria = iconesPorCategoria[categoria.categoria as keyof typeof iconesPorCategoria] || Package;
            
            return (
              <Card key={categoria.categoria}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <IconeCategoria className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {categoria.categoria.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {categoria.quantidade_itens} itens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {orcamentoUtils.formatarValor(categoria.valor_total)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {categoria.percentual}% do total
                      </div>
                    </div>
                  </div>
                  <Progress value={categoria.percentual} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {composicao.resumo_categorias.slice(0, 5).map((categoria) => (
                  <div key={categoria.categoria} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {categoria.categoria.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {categoria.percentual}%
                      </span>
                    </div>
                    <Progress value={categoria.percentual} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Principais Etapas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {composicao.resumo_etapas.slice(0, 5).map((etapa) => (
                  <div key={etapa.etapa} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {etapa.etapa.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {etapa.percentual}%
                      </span>
                    </div>
                    <Progress value={etapa.percentual} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComposicaoDetalhada; 