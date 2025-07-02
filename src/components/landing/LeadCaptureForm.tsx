import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useValidatedForm } from '@/hooks/useFormState';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calculator,
  Target,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Star,
  Building2,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Wizard,
  WizardProvider,
  WizardHeader,
  WizardProgress,
  WizardStepper,
  WizardContent,
  WizardNavigation,
  WizardStep,
  useWizard,
  useWizardStepValidation
} from '@/components/wizard/WizardComposition';
import { FormProvider, useFormContext } from '@/contexts/FormContext';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

// ✅ Schema de validação por step
const step1Schema = z.object({
  email: z.string().email('Email inválido'),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal(''))
});

const step2Schema = z.object({
  empresa: z.string().optional().or(z.literal('')),
  cargo: z.string().optional().or(z.literal('')),
  tipo_empresa: z.enum(['construtora', 'engenharia', 'arquitetura', 'individual', 'outro']).optional(),
  porte_empresa: z.enum(['micro', 'pequena', 'media', 'grande']).optional()
});

const step3Schema = z.object({
  numero_obras_mes: z.number().min(0).max(1000).optional(),
  orcamento_mensal: z.number().min(0).optional(),
  principal_desafio: z.string().optional().or(z.literal('')),
  como_conheceu: z.string().optional().or(z.literal('')),
  previsao_inicio: z.string().optional().or(z.literal('')),
  observacoes: z.string().optional().or(z.literal(''))
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type FormData = Step1Data & Step2Data & Step3Data;

interface LeadCaptureFormProps {
  onSuccess?: (leadId: string) => void;
  onClose?: () => void;
  className?: string;
  context?: {
    origem?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

// Componentes das etapas do wizard
const Step1BasicInfo: React.FC = () => {
  const { setValid } = useWizardStepValidation('step-1', true);
  const { form } = useFormContext<FormData>();
  const { register, formState: { errors, isValid }, watch } = form;
  
  const emailValue = watch('email');
  
  React.useEffect(() => {
    setValid(!!emailValue && !errors.email);
  }, [emailValue, errors.email, setValid]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4" />
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email', { required: 'Email é obrigatório' })}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="nome" className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4" />
          Nome Completo
        </Label>
        <Input
          id="nome"
          placeholder="Seu nome completo"
          {...register('nome')}
          className={errors.nome ? 'border-red-500' : ''}
        />
        {errors.nome && (
          <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="telefone" className="flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4" />
          Telefone
        </Label>
        <Input
          id="telefone"
          placeholder="(11) 99999-9999"
          {...register('telefone')}
          className={errors.telefone ? 'border-red-500' : ''}
        />
        {errors.telefone && (
          <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
        )}
      </div>
    </motion.div>
  );
};

const Step2CompanyInfo: React.FC = () => {
  const { setValid } = useWizardStepValidation('step-2', true);
  const { form } = useFormContext<FormData>();
  const { register, formState: { errors }, setValue, watch } = form;
  
  React.useEffect(() => {
    setValid(true); // Esta etapa é sempre válida (campos opcionais)
  }, [setValid]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="empresa" className="flex items-center gap-2 mb-2">
          <Building className="h-4 w-4" />
          Nome da Empresa
        </Label>
        <Input
          id="empresa"
          placeholder="Nome da sua empresa"
          {...register('empresa')}
        />
      </div>

      <div>
        <Label htmlFor="cargo" className="flex items-center gap-2 mb-2">
          <Briefcase className="h-4 w-4" />
          Seu Cargo
        </Label>
        <Input
          id="cargo"
          placeholder="Ex: Diretor, Engenheiro, Arquiteto"
          {...register('cargo')}
        />
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4" />
          Tipo de Empresa
        </Label>
        <Select onValueChange={(value) => setValue('tipo_empresa', value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="construtora">Construtora</SelectItem>
            <SelectItem value="engenharia">Engenharia</SelectItem>
            <SelectItem value="arquitetura">Arquitetura</SelectItem>
            <SelectItem value="individual">Profissional Individual</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4" />
          Porte da Empresa
        </Label>
        <Select onValueChange={(value) => setValue('porte_empresa', value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o porte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="micro">Micro (até 9 funcionários)</SelectItem>
            <SelectItem value="pequena">Pequena (10-49 funcionários)</SelectItem>
            <SelectItem value="media">Média (50-249 funcionários)</SelectItem>
            <SelectItem value="grande">Grande (250+ funcionários)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

const Step3ProjectDetails: React.FC = () => {
  const { setValid } = useWizardStepValidation('step-3', true);
  const { form } = useFormContext<FormData>();
  const { register, formState: { errors }, setValue } = form;
  
  React.useEffect(() => {
    setValid(true); // Esta etapa é sempre válida (campos opcionais)
  }, [setValid]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numero_obras_mes" className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4" />
            Obras por mês
          </Label>
          <Input
            id="numero_obras_mes"
            type="number"
            min="0"
            placeholder="Ex: 5"
            {...register('numero_obras_mes', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="orcamento_mensal" className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4" />
            Orçamento mensal (R$)
          </Label>
          <Input
            id="orcamento_mensal"
            type="number"
            min="0"
            placeholder="Ex: 100000"
            {...register('orcamento_mensal', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="principal_desafio" className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4" />
          Principal Desafio
        </Label>
        <Textarea
          id="principal_desafio"
          placeholder="Ex: Controle de custos, cronograma, gestão de fornecedores..."
          {...register('principal_desafio')}
          rows={3}
        />
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4" />
          Como nos conheceu?
        </Label>
        <Select onValueChange={(value) => setValue('como_conheceu', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="indicacao">Indicação</SelectItem>
            <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
            <SelectItem value="evento">Evento</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observacoes" className="mb-2 block">
          Observações adicionais
        </Label>
        <Textarea
          id="observacoes"
          placeholder="Algo mais que gostaria de compartilhar..."
          {...register('observacoes')}
          rows={2}
        />
      </div>
    </motion.div>
  );
};

// Componente interno que usa o FormContext
const LeadCaptureFormContent: React.FC<LeadCaptureFormProps> = ({
  onSuccess,
  onClose,
  className = '',
  context = {}
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { form } = useFormContext<FormData>();

  // Operação assíncrona para envio do lead
  const { execute: submitLead, isLoading } = useAsyncOperation({
    operation: async (data: FormData) => {
      // Preparar dados do lead
      const leadData = {
        ...data,
        numero_obras_mes: data.numero_obras_mes || undefined,
        orcamento_mensal: data.orcamento_mensal || undefined,
        interesse_nivel: 'alto' as const,
        origem: context.origem || 'landing_page',
        utm_source: context.utm_source,
        utm_medium: context.utm_medium,
        utm_campaign: context.utm_campaign
      };

      // Dados de contexto
      const requestContext = {
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      };

      // Enviar para Edge Function
      const { data: response, error } = await supabase.functions.invoke('lead-capture', {
        body: {
          lead: leadData,
          context: requestContext
        }
      });

      if (error) throw error;

      if (response?.success) {
        setIsCompleted(true);
        
        // Chamar callback de sucesso
        if (onSuccess) {
          onSuccess(response.lead_id);
        }

        // Auto-fechar após 3 segundos
        setTimeout(() => {
          if (onClose) onClose();
        }, 3000);

        return response;
      } else {
        throw new Error(response?.error || 'Erro desconhecido');
      }
    },
    showSuccessToast: false // Não mostrar toast pois temos tela de sucesso customizada
  });

  const handleComplete = async () => {
    const data = form.getValues();
    await submitLead(data);
  };

  const wizardSteps = [
    {
      id: 'step-1',
      title: 'Informações Básicas',
      description: 'Vamos começar com seus dados de contato',
      component: Step1BasicInfo
    },
    {
      id: 'step-2',
      title: 'Sobre sua Empresa',
      description: 'Conte-nos sobre seu negócio',
      component: Step2CompanyInfo
    },
    {
      id: 'step-3',
      title: 'Detalhes do Projeto',
      description: 'Como podemos ajudar você?',
      component: Step3ProjectDetails
    }
  ];

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-8 ${className}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="h-10 w-10 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Obrigado pelo seu interesse!
        </h3>
        
        <p className="text-gray-600 mb-6">
          Recebemos suas informações e nossa equipe entrará em contato em breve 
          para apresentar como o ObrasAI pode revolucionar sua gestão de obras.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>Resposta em até 24 horas</span>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto p-8 ${className}`}>
      <Wizard steps={wizardSteps} onComplete={handleComplete} className="space-y-6">
        <WizardHeader className="mb-8">
          <WizardProgress className="mb-6" />
          <WizardStepper className="text-center" />
        </WizardHeader>
        
        <WizardContent className="min-h-[400px]" />
        
        <WizardNavigation 
          className="flex justify-between pt-6"
          nextLabel="Próximo"
          prevLabel="Anterior"
          finishLabel="Finalizar"
          isLoading={isLoading}
        />
      </Wizard>
    </Card>
  );
};

export default LeadCaptureForm;