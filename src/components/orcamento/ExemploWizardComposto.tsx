import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect,useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useOrcamentoStepValidation,WizardOrcamento } from './WizardOrcamentoComposto';

// Schemas de validação para cada etapa
const etapa1Schema = z.object({
  nomeObra: z.string().min(1, 'Nome da obra é obrigatório'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  tipo: z.string().min(1, 'Tipo da obra é obrigatório'),
});

const etapa2Schema = z.object({
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

const etapa3Schema = z.object({
  orcamentoTotal: z.number().min(1, 'Orçamento deve ser maior que zero'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
});

type Etapa1Data = z.infer<typeof etapa1Schema>;
type Etapa2Data = z.infer<typeof etapa2Schema>;
type Etapa3Data = z.infer<typeof etapa3Schema>;

// Componente da Etapa 1
const Etapa1 = () => {
  const { setValid } = useOrcamentoStepValidation(1);
  const { register, formState: { errors, isValid }, watch } = useForm<Etapa1Data>({
    resolver: zodResolver(etapa1Schema),
    mode: 'onChange',
  });

  const watchedFields = watch();

  useEffect(() => {
    setValid(isValid);
  }, [isValid, setValid]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomeObra">Nome da Obra</Label>
        <Input
          id="nomeObra"
          placeholder="Ex: Residência João Silva"
          {...register('nomeObra')}
        />
        {errors.nomeObra && (
          <p className="text-sm text-red-500">{errors.nomeObra.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo da Obra</Label>
        <Select {...register('tipo')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="residencial">Residencial</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="reforma">Reforma</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipo && (
          <p className="text-sm text-red-500">{errors.tipo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva detalhes da obra..."
          rows={4}
          {...register('descricao')}
        />
        {errors.descricao && (
          <p className="text-sm text-red-500">{errors.descricao.message}</p>
        )}
      </div>
    </div>
  );
};

// Componente da Etapa 2
const Etapa2 = () => {
  const { setValid } = useOrcamentoStepValidation(2);
  const { register, formState: { errors, isValid } } = useForm<Etapa2Data>({
    resolver: zodResolver(etapa2Schema),
    mode: 'onChange',
  });

  useEffect(() => {
    setValid(isValid);
  }, [isValid, setValid]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          placeholder="Rua, número, bairro"
          {...register('endereco')}
        />
        {errors.endereco && (
          <p className="text-sm text-red-500">{errors.endereco.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            placeholder="Nome da cidade"
            {...register('cidade')}
          />
          {errors.cidade && (
            <p className="text-sm text-red-500">{errors.cidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            placeholder="00000-000"
            {...register('cep')}
          />
          {errors.cep && (
            <p className="text-sm text-red-500">{errors.cep.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente da Etapa 3
const Etapa3 = () => {
  const { setValid } = useOrcamentoStepValidation(3);
  const { register, formState: { errors, isValid } } = useForm<Etapa3Data>({
    resolver: zodResolver(etapa3Schema),
    mode: 'onChange',
  });

  useEffect(() => {
    setValid(isValid);
  }, [isValid, setValid]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orcamentoTotal">Orçamento Total (R$)</Label>
        <Input
          id="orcamentoTotal"
          type="number"
          placeholder="0,00"
          step="0.01"
          {...register('orcamentoTotal', { valueAsNumber: true })}
        />
        {errors.orcamentoTotal && (
          <p className="text-sm text-red-500">{errors.orcamentoTotal.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data de Início</Label>
          <Input
            id="dataInicio"
            type="date"
            {...register('dataInicio')}
          />
          {errors.dataInicio && (
            <p className="text-sm text-red-500">{errors.dataInicio.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataFim">Data de Conclusão</Label>
          <Input
            id="dataFim"
            type="date"
            {...register('dataFim')}
          />
          {errors.dataFim && (
            <p className="text-sm text-red-500">{errors.dataFim.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal que demonstra o uso do novo sistema
const ExemploWizardComposto = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Obra criada com sucesso!');
    setIsLoading(false);
  };

  // Definir as etapas do wizard
  const wizardSteps = [
    {
      id: 'step-1',
      title: 'Informações Básicas',
      description: 'Defina o nome, tipo e descrição da obra',
      component: Etapa1,
      isOptional: false
    },
    {
      id: 'step-2', 
      title: 'Localização',
      description: 'Informe o endereço onde a obra será realizada',
      component: Etapa2,
      isOptional: false
    },
    {
      id: 'step-3',
      title: 'Orçamento e Prazos', 
      description: 'Defina o orçamento total e cronograma da obra',
      component: Etapa3,
      isOptional: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nova Obra</h1>
        <p className="text-muted-foreground mt-2">
          Preencha as informações da obra em 3 etapas simples
        </p>
      </div>

      <WizardOrcamento 
        steps={wizardSteps}
        onComplete={handleComplete}
        showProgress={true}
        showStepper={true}
      />
    </div>
  );
};

// Exemplo alternativo usando a API de composição manual
export const ExemploWizardComposicaoManual = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Obra criada com sucesso!');
    setIsLoading(false);
  };

  const wizardSteps = [
    {
      id: 'step-1',
      title: 'Informações Básicas',
      description: 'Defina o nome, tipo e descrição da obra',
      component: Etapa1
    },
    {
      id: 'step-2',
      title: 'Localização', 
      description: 'Informe o endereço onde a obra será realizada',
      component: Etapa2
    },
    {
      id: 'step-3',
      title: 'Orçamento e Prazos',
      description: 'Defina o orçamento total e cronograma da obra', 
      component: Etapa3
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nova Obra - Composição Manual</h1>
        <p className="text-muted-foreground mt-2">
          Exemplo usando a API de composição manual
        </p>
      </div>

      <WizardOrcamento.Provider steps={wizardSteps} onComplete={handleComplete}>
        <WizardOrcamento.Header>
          <WizardOrcamento.Progress showLabels={true} />
        </WizardOrcamento.Header>
        
        <WizardOrcamento.Stepper variant="numbers" />
        
        <WizardOrcamento.Content />
        
        <WizardOrcamento.Navigation 
          nextLabel="Próximo"
          prevLabel="Anterior"
          finishLabel="Criar Obra"
          showProgress={true}
        />
      </WizardOrcamento.Provider>
    </div>
  );
};

export default ExemploWizardComposto;