import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  onSuccess,
  onClose,
  className = '',
  context = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(
      currentStep === 1 ? step1Schema :
      currentStep === 2 ? step2Schema :
      step3Schema
    ),
    mode: 'onChange'
  });

  const watchedValues = watch();

  const steps = [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Vamos começar com seus dados de contato',
      icon: User,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Sobre sua Empresa',
      description: 'Conte-nos sobre seu negócio',
      icon: Building2,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Detalhes do Projeto',
      description: 'Como podemos ajudar você?',
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
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
        toast.success(response.message || 'Obrigado pelo seu interesse!');
        
        // Chamar callback de sucesso
        if (onSuccess) {
          onSuccess(response.lead_id);
        }

        // Auto-fechar após 3 segundos
        setTimeout(() => {
          if (onClose) onClose();
        }, 3000);

      } else {
        throw new Error(response?.error || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      toast.error('Não foi possível processar sua solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Header com progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? `bg-gradient-to-r ${step.color} text-white`
                    : 'bg-gray-200 text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <step.icon className="h-5 w-5" />
              </motion.div>
              
              {step.id < steps.length && (
                <div className={`w-20 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
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
                  {...register('email')}
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
          )}

          {/* Step 2: Sobre a Empresa */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
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
                <Select onValueChange={(value) => setValue('tipo_empresa', value as 'construtora' | 'engenharia' | 'arquitetura' | 'individual' | 'outro')}>
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
                <Select onValueChange={(value) => setValue('porte_empresa', value as 'micro' | 'pequena' | 'media' | 'grande')}>
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
          )}

          {/* Step 3: Detalhes do Projeto */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
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
          )}
        </AnimatePresence>

        {/* Botões de navegação */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={!watchedValues.email && currentStep === 1}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Finalizar
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default LeadCaptureForm;