/**
 * 🏗️ Página de Novo Orçamento Paramétrico
 * 
 * Interface principal para criação de orçamentos inteligentes
 * usando IA e dados técnicos da construção civil.
 * 
 * @author ObrasAI Team
 * @version 2.0.0 - Orçamento Paramétrico
 */

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Sparkles, CheckCircle, Layers, Hammer, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { WizardOrcamento } from "@/components/orcamento";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// ====================================
// 🎯 TIPOS E INTERFACES
// ====================================

interface NovoOrcamentoProps {}

// ====================================
// 🏗️ COMPONENTE PRINCIPAL
// ====================================

export const NovoOrcamento: React.FC<NovoOrcamentoProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados da página
  const [orcamentoCriado, setOrcamentoCriado] = useState<string | null>(null);
  
  // Parâmetros da URL
  const obraId = searchParams.get('obra_id');
  const retornarPara = searchParams.get('return') || '/dashboard/obras';

  // ====================================
  // 🎯 HANDLERS DE EVENTOS
  // ====================================

  /**
   * Callback quando orçamento é criado com sucesso
   */
  const handleOrcamentoCriado = (orcamentoId: string) => {
    setOrcamentoCriado(orcamentoId);
    
    // Aguardar um pouco e redirecionar
    setTimeout(() => {
      navigate(`/dashboard/orcamentos/${orcamentoId}`);
    }, 2000);
  };

  /**
   * Voltar para página anterior
   */
  const handleVoltar = () => {
    navigate(retornarPara);
  };

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================

  if (orcamentoCriado) {
    return (
      <DashboardLayout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/30 to-green-50/30 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm"
        >
          <Card className="w-full max-w-md text-center border-emerald-200/50 dark:border-emerald-700/50 bg-gradient-to-br from-white/95 to-emerald-50/95 dark:from-slate-900/95 dark:to-emerald-900/20 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <CardTitle className="text-emerald-600 dark:text-emerald-400 text-xl">
                Orçamento Criado com Sucesso!
              </CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300">
IA está processando seu orçamento paramétrico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                    Gerando 35+ itens em 11 etapas...
                  </span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <Layers className="h-3 w-3" />
                    <span>Composição paramétrica por etapas</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <Users className="h-3 w-3" />
                    <span>Mão de obra especializada (30-35%)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <Hammer className="h-3 w-3" />
                    <span>Materiais regionais atualizados</span>
                  </div>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-emerald-600 dark:text-emerald-400"
                >
                  Você será redirecionado automaticamente para visualizar
                  os resultados da IA paramétrica.
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header da página com animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoltar}
                className="flex items-center space-x-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#182b4d] to-blue-600 bg-clip-text text-transparent">
                Novo Orçamento Paramétrico
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Crie estimativas precisas com IA - Orçamento Paramétrico
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-2"
          >
            <Badge 
              variant="secondary" 
              className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>IA Paramétrica</span>
            </Badge>
            <Badge 
              variant="outline" 
                              className="flex items-center space-x-1 bg-[#182b4d]/10 dark:bg-[#182b4d]/30 text-[#182b4d] dark:text-[#daa916] border-[#182b4d]/30 dark:border-[#daa916]/50"
            >
              <Layers className="h-4 w-4" />
              <span>Composição Paramétrica</span>
            </Badge>
          </motion.div>
        </motion.div>

        {/* Seção de introdução melhorada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
                      <Card className="border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/50 to-[#182b4d]/10 dark:from-blue-900/10 dark:to-[#182b4d]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-300">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span>Sistema Inteligente - Orçamento Paramétrico</span>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Nossa nova IA gera orçamentos com mais de 35 itens organizados em 11 etapas completas da construção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Funcionalidades principais - Orçamento Paramétrico */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 dark:bg-green-400/10 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-green-500 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-green-900 dark:text-green-300">11 Etapas Completas</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Serviços preliminares</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Fundação e estrutura</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Alvenaria e cobertura</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Instalações e acabamentos</span>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 rounded-lg bg-[#182b4d]/10 dark:bg-[#daa916]/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#182b4d] dark:text-[#daa916]" />
                </div>
                <h3 className="font-semibold text-[#182b4d] dark:text-[#daa916]">Mão de Obra Realística</h3>
              </div>
              <ul className="space-y-2 text-sm text-[#182b4d] dark:text-[#daa916]">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#182b4d] dark:text-[#daa916]" />
                      <span>30-35% do custo total</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#182b4d] dark:text-[#daa916]" />
                      <span>12 especialidades diferentes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#182b4d] dark:text-[#daa916]" />
                      <span>Horas estimadas por função</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#182b4d] dark:text-[#daa916]" />
                      <span>Valores regionais</span>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-[#daa916]/10 dark:bg-[#daa916]/20 flex items-center justify-center">
                      <Hammer className="h-5 w-5 text-[#daa916] dark:text-[#daa916]" />
                    </div>
                    <h3 className="font-semibold text-[#daa916] dark:text-[#daa916]">Materiais Estimados</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-[#daa916] dark:text-[#daa916]">
                                          <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[#daa916]" />
                        <span>35+ itens específicos</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[#daa916]" />
                        <span>Quantidades técnicas precisas</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[#daa916]" />
                        <span>Preços SINAPI atualizados</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[#daa916]" />
                        <span>Índices regionais aplicados</span>
                      </li>
                  </ul>
                </motion.div>
              </div>

              <Separator className="my-6" />

              {/* Destaque das melhorias */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200/50 dark:border-green-700/50"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    ORÇAMENTO PARAMÉTRICO
                  </Badge>
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Composição Paramétrica Completa
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                  Agora nossa IA gera orçamentos com a mesma qualidade de um engenheiro experiente: 
                  <strong> etapas organizadas</strong>, <strong>mão de obra realística</strong> e 
                  <strong> materiais estimados</strong> com quantidades técnicas precisas.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wizard de criação de orçamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <WizardOrcamento
            obraId={obraId}
            onOrcamentoCriado={handleOrcamentoCriado}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NovoOrcamento;