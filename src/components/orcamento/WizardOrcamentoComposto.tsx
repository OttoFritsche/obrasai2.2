import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useWizard,
  useWizardStepValidation,
  Wizard,
  WizardContent,
  WizardHeader,
  WizardNavigation,
  WizardProgress,
  WizardProvider,
  WizardStep,
  WizardStepper} from '@/components/wizard/WizardComposition';

// Re-export para compatibilidade
export { useWizard, useWizardStepValidation };

// Componente principal do Wizard refatorado
interface WizardOrcamentoProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    component: React.ComponentType<Record<string, unknown>>;
    isOptional?: boolean;
  }>;
  onComplete?: () => void;
  className?: string;
  showProgress?: boolean;
  showStepper?: boolean;
}

const WizardOrcamento = ({ 
  steps, 
  onComplete, 
  className,
  showProgress = true,
  showStepper = true 
}: WizardOrcamentoProps) => {
  return (
    <WizardProvider steps={steps} onComplete={onComplete}>
      <Wizard className={className}>
        {showProgress && (
          <WizardHeader>
            <WizardProgress />
          </WizardHeader>
        )}
        
        {showStepper && <WizardStepper variant="numbers" />}
        
        <WizardContent />
        
        <WizardNavigation />
      </Wizard>
    </WizardProvider>
  );
};

// Componente de Step customizado para orçamentos
interface OrcamentoStepProps {
  stepId: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showBadge?: boolean;
}

const OrcamentoStep = ({ 
  stepId, 
  title, 
  description, 
  children, 
  className,
  showBadge = true 
}: OrcamentoStepProps) => {
  const { currentStep, currentStepIndex } = useWizard();
  
  if (currentStep.id !== stepId) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {showBadge && (
            <Badge variant="outline">Etapa {currentStepIndex + 1}</Badge>
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Wrapper para compatibilidade com a API antiga
interface LegacyWizardStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const LegacyWizardStep = ({ stepNumber, title, description, children, className }: LegacyWizardStepProps) => {
  return (
    <OrcamentoStep
      stepId={`step-${stepNumber}`}
      title={title}
      description={description}
      className={className}
    >
      {children}
    </OrcamentoStep>
  );
};

// Componente de navegação customizado para orçamentos
interface OrcamentoNavigationProps {
  className?: string;
  nextLabel?: string;
  prevLabel?: string;
  finishLabel?: string;
  isLoading?: boolean;
  showProgress?: boolean;
}

const OrcamentoNavigation = ({ 
  className, 
  nextLabel = 'Próximo', 
  prevLabel = 'Anterior',
  finishLabel = 'Finalizar',
  isLoading = false,
  showProgress = false
}: OrcamentoNavigationProps) => {
  return (
    <WizardNavigation
      className={className}
      nextLabel={nextLabel}
      prevLabel={prevLabel}
      completeLabel={finishLabel}
      showProgress={showProgress}
    />
  );
};

// Hook para compatibilidade com a API antiga
export const useOrcamentoStepValidation = (stepNumber: number) => {
  const stepId = `step-${stepNumber}`;
  const [isValid, setIsValid] = React.useState(false);
  
  useWizardStepValidation(stepId, isValid);
  
  const setValid = (valid: boolean) => {
    setIsValid(valid);
  };

  return { setValid };
};

// Exportar componentes como propriedades do componente principal
WizardOrcamento.Stepper = WizardStepper;
WizardOrcamento.Step = LegacyWizardStep;
WizardOrcamento.Navigation = OrcamentoNavigation;
WizardOrcamento.OrcamentoStep = OrcamentoStep;
WizardOrcamento.Provider = WizardProvider;
WizardOrcamento.Header = WizardHeader;
WizardOrcamento.Progress = WizardProgress;
WizardOrcamento.Content = WizardContent;

// Exportações principais
export { 
  OrcamentoNavigation,
  OrcamentoStep,
  useOrcamentoStepValidation,
  WizardContent,
  WizardHeader,
  WizardNavigation,
  WizardOrcamento, 
  WizardProgress,
  // Re-exports do sistema base
  WizardProvider,
  WizardStep,
  WizardStepper};
export default WizardOrcamento;