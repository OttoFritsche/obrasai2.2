import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Tipos para o Wizard
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  isValid?: boolean;
  isOptional?: boolean;
  component: React.ComponentType<any>;
}

interface WizardContextValue {
  steps: WizardStep[];
  currentStepIndex: number;
  currentStep: WizardStep;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateStepValidation: (stepId: string, isValid: boolean) => void;
  onComplete?: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

// Hook para usar o contexto do Wizard
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard deve ser usado dentro de um WizardProvider');
  }
  return context;
}

// Hook para validação de etapas
export function useWizardStepValidation(stepId: string, isValid: boolean) {
  const { updateStepValidation } = useWizard();
  
  React.useEffect(() => {
    updateStepValidation(stepId, isValid);
  }, [stepId, isValid, updateStepValidation]);
}

// Provider do Wizard
interface WizardProviderProps {
  children: React.ReactNode;
  steps: WizardStep[];
  onComplete?: () => void;
  initialStep?: number;
}

export function WizardProvider({ children, steps, onComplete, initialStep = 0 }: WizardProviderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [stepValidations, setStepValidations] = useState<Record<string, boolean>>({});

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  
  const canGoNext = useMemo(() => {
    if (isLastStep) return false;
    const currentStepValid = stepValidations[currentStep.id] ?? false;
    return currentStepValid || currentStep.isOptional;
  }, [isLastStep, stepValidations, currentStep]);
  
  const canGoPrev = currentStepIndex > 0;

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [canGoNext]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [canGoPrev]);

  const updateStepValidation = useCallback((stepId: string, isValid: boolean) => {
    setStepValidations(prev => ({
      ...prev,
      [stepId]: isValid
    }));
  }, []);

  const value = useMemo(() => ({
    steps,
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev,
    goToStep,
    nextStep,
    prevStep,
    updateStepValidation,
    onComplete
  }), [
    steps,
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev,
    goToStep,
    nextStep,
    prevStep,
    updateStepValidation,
    onComplete
  ]);

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

// Componente Wizard Root
interface WizardProps {
  children: React.ReactNode;
  className?: string;
}

export function Wizard({ children, className }: WizardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

// Componente WizardHeader
interface WizardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function WizardHeader({ children, className }: WizardHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

// Componente WizardProgress
interface WizardProgressProps {
  showLabels?: boolean;
  className?: string;
}

export function WizardProgress({ showLabels = true, className }: WizardProgressProps) {
  const { currentStepIndex, totalSteps, steps } = useWizard();
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Etapa {currentStepIndex + 1} de {totalSteps}</span>
        <span>{Math.round(progress)}% concluído</span>
      </div>
      <Progress value={progress} className="h-2" />
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {steps.map((step, index) => (
            <span 
              key={step.id}
              className={cn(
                'transition-colors',
                index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {step.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente WizardStepper
interface WizardStepperProps {
  variant?: 'dots' | 'numbers' | 'lines';
  className?: string;
}

export function WizardStepper({ variant = 'dots', className }: WizardStepperProps) {
  const { steps, currentStepIndex, goToStep } = useWizard();

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const isClickable = index <= currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && goToStep(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center justify-center transition-all duration-200',
                variant === 'dots' && 'w-3 h-3 rounded-full',
                variant === 'numbers' && 'w-8 h-8 rounded-full text-sm font-medium',
                variant === 'lines' && 'w-12 h-1 rounded',
                isCompleted && 'bg-primary text-primary-foreground',
                isActive && !isCompleted && 'bg-primary/20 border-2 border-primary',
                !isActive && !isCompleted && 'bg-muted',
                isClickable && 'cursor-pointer hover:scale-110',
                !isClickable && 'cursor-not-allowed opacity-50'
              )}
            >
              {variant === 'numbers' && (
                isCompleted ? <Check className="w-4 h-4" /> : index + 1
              )}
            </button>
            {index < steps.length - 1 && variant !== 'lines' && (
              <div className={cn(
                'w-8 h-0.5 transition-colors',
                index < currentStepIndex ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Componente WizardContent
interface WizardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function WizardContent({ children, className }: WizardContentProps) {
  const { currentStep } = useWizard();
  const StepComponent = currentStep.component;

  return (
    <div className={cn('min-h-[400px]', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{currentStep.title}</h2>
            {currentStep.description && (
              <p className="text-muted-foreground">{currentStep.description}</p>
            )}
          </div>
          {children || <StepComponent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Componente WizardNavigation
interface WizardNavigationProps {
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  showProgress?: boolean;
  className?: string;
}

export function WizardNavigation({ 
  nextLabel = 'Próximo',
  prevLabel = 'Anterior', 
  completeLabel = 'Finalizar',
  showProgress = false,
  className 
}: WizardNavigationProps) {
  const { 
    isFirstStep, 
    isLastStep, 
    canGoNext, 
    canGoPrev, 
    nextStep, 
    prevStep, 
    onComplete,
    currentStepIndex,
    totalSteps
  } = useWizard();

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-2">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={!canGoPrev}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{prevLabel}</span>
          </Button>
        )}
      </div>

      {showProgress && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{currentStepIndex + 1}</span>
          <span>/</span>
          <span>{totalSteps}</span>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {!isLastStep ? (
          <Button
            onClick={nextStep}
            disabled={!canGoNext}
            className="flex items-center space-x-2"
          >
            <span>{nextLabel}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canGoNext}
            className="flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{completeLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// Componente WizardStep (para uso individual)
interface WizardStepProps {
  stepId: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardStep({ stepId, children, className }: WizardStepProps) {
  const { currentStep } = useWizard();
  
  if (currentStep.id !== stepId) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

// Compound Component Export
Wizard.Provider = WizardProvider;
Wizard.Header = WizardHeader;
Wizard.Progress = WizardProgress;
Wizard.Stepper = WizardStepper;
Wizard.Content = WizardContent;
Wizard.Navigation = WizardNavigation;
Wizard.Step = WizardStep;

export { useWizard, useWizardStepValidation };