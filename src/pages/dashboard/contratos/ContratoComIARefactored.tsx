/**
 * 🤖 Contrato com IA - REFATORADO
 * 
 * ANTES: 769 linhas misturando formulário, chat IA, validação e API calls
 * DEPOIS: Separado em Container + Form + Chat + Hook customizado
 * 
 * Refatoração baseada no padrão container/presentational para 
 * melhorar manutenibilidade e separação de responsabilidades.
 * 
 * @author ObrasAI Team - Refactored Version
 * @version 2.0.0
 */

import { ArrowLeft } from "lucide-react";
import React, { useMemo } from "react";

import { ContratoAIChat } from "@/components/contratos/ContratoAIChat";
import { ContratoFormSection } from "@/components/contratos/ContratoFormSection";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useContratoForm } from "@/hooks/useContratoForm";
import { useObras } from "@/hooks/useObras";

// ✅ Container Principal - Apenas Orquestração
const ContratoComIARefactored: React.FC = () => {
  const { obras } = useObras();
  
  const contratoForm = useContratoForm();

  // ✅ Contexto para IA baseado nos dados do formulário
  const contratoContext = useMemo(() => {
    const formData = contratoForm.form.getValues();
    return `
      Contrato: ${formData.titulo}
      Obra: ${contratoForm.obra?.nome || 'Não selecionada'}
      Valor: R$ ${formData.valor_total?.toLocaleString('pt-BR') || '0,00'}
      Prazo: ${formData.prazo_execucao} dias
      Contratante: ${formData.contratante_nome}
      Contratado: ${formData.contratado_nome}
      Serviços: ${formData.descricao_servicos}
    `.trim();
  }, [contratoForm.form.watch(), contratoForm.obra]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        
        {/* ✅ Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={contratoForm.voltarParaLista}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Contrato com Assistente IA</h1>
              <p className="text-gray-600">
                Crie e melhore contratos com ajuda da inteligência artificial
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Layout Principal - Formulário + Chat IA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ✅ Seção do Formulário */}
          <div className="space-y-6">
            <ContratoFormSection
              form={contratoForm.form}
              obras={obras || []}
              templates={contratoForm.templates}
              orcamentos={contratoForm.orcamentos}
              isCarregandoOrcamentos={contratoForm.isCarregandoOrcamentos}
              onPreencherDadosOrcamento={contratoForm.preencherDadosOrcamento}
              onSubmit={contratoForm.handleSubmit}
            />
          </div>

          {/* ✅ Seção do Chat IA */}
          <div className="lg:sticky lg:top-6">
            <ContratoAIChat contratoContext={contratoContext} />
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default ContratoComIARefactored;