/**
 * 🧙‍♂️ Wizard Inteligente para Orçamento Paramétrico - REFATORADO
 * 
 * Componente multi-etapas para criação de orçamentos com IA,
 * totalmente refatorado seguindo o padrão container/presentational.
 * 
 * ANTES: 994 linhas em 1 arquivo (VIOLAÇÃO CRÍTICA)
 * DEPOIS: Separado em 8 componentes especializados + 1 hook customizado
 * 
 * @author ObrasAI Team - Refactored Version
 * @version 2.0.0
 */

import React from "react";

import { Form } from "@/components/ui/form";
import { useWizardOrcamento } from "@/hooks/useWizardOrcamento";
import type { Orcamento } from "@/types/api";

import { WizardEtapa1 } from "./wizard/WizardEtapa1";
import { WizardEtapa2 } from "./wizard/WizardEtapa2";
import { WizardEtapa3 } from "./wizard/WizardEtapa3";
import { WizardEtapa4 } from "./wizard/WizardEtapa4";
import { WizardHeader } from "./wizard/WizardHeader";
import { WizardNavigation } from "./wizard/WizardNavigation";

// ✅ Interface simplificada - apenas props essenciais
interface WizardOrcamentoRefactoredProps {
  onOrcamentoCriado?: (orcamento: Orcamento) => void;
  obraId?: string;
}

// ✅ Componente de renderização de etapa separado
interface WizardStepRendererProps {
  etapaAtual: number;
  form: ReturnType<typeof useWizardOrcamento>['form'];
  cepData: ReturnType<typeof useWizardOrcamento>['cepData'];
}

const WizardStepRenderer: React.FC<WizardStepRendererProps> = ({
  etapaAtual,
  form,
  cepData
}) => {
  switch (etapaAtual) {
    case 1:
      return <WizardEtapa1 form={form} />;
    case 2:
      return <WizardEtapa2 form={form} cepData={cepData} />;
    case 3:
      return <WizardEtapa3 form={form} />;
    case 4:
      return <WizardEtapa4 form={form} />;
    default:
      return <WizardEtapa1 form={form} />;
  }
};

// ✅ Container Principal - Apenas Orquestração
export const WizardOrcamentoRefactored: React.FC<WizardOrcamentoRefactoredProps> = ({
  onOrcamentoCriado,
  obraId
}) => {
  // ✅ Toda lógica delegada para o hook customizado
  const wizard = useWizardOrcamento({ onOrcamentoCriado, obraId });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* ✅ Header com progresso */}
      <WizardHeader
        etapaAtual={wizard.etapaAtual}
        isCalculando={wizard.isCalculando}
        calculandoIA={wizard.calculandoIA}
      />

      {/* ✅ Formulário */}
      <Form {...wizard.form}>
        <form className="space-y-6">
          
          {/* ✅ Renderização dinâmica da etapa atual */}
          <WizardStepRenderer
            etapaAtual={wizard.etapaAtual}
            form={wizard.form}
            cepData={wizard.cepData}
          />

        </form>
      </Form>

      {/* ✅ Navegação */}
      <WizardNavigation
        etapaAtual={wizard.etapaAtual}
        podeVoltar={wizard.podeVoltar}
        podeAvancar={wizard.podeAvancar}
        isUltimaEtapa={wizard.isUltimaEtapa}
        isSubmitindo={wizard.isSubmitindo}
        isCalculando={wizard.isCalculando}
        calculandoIA={wizard.calculandoIA}
        onEtapaAnterior={wizard.etapaAnterior}
        onProximaEtapa={wizard.proximaEtapa}
        onSubmit={wizard.handleSubmit}
      />

    </div>
  );
};

// ✅ Export com mesmo nome para facilitar substituição
export { WizardOrcamentoRefactored as WizardOrcamento };