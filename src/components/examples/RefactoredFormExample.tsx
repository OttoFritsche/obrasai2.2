/**
 * EXEMPLO DE REFATORAÇÃO - ANTES E DEPOIS
 * 
 * Este arquivo demonstra como aplicar as refatorações DRY
 * em um formulário típico do projeto ObrasAI
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Building, MapPin } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormSection,FormWrapper } from '@/components/ui/FormWrapper';
import { Input } from '@/components/ui/input';
// Novos imports refatorados
import { PageHeader } from '@/components/ui/PageHeader';
import { useFormMutation } from '@/hooks/useFormMutation';
import { obrasApi } from '@/lib/api/obras';

// Schema de validação
const obraSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos'),
  orcamento: z.number().min(0, 'Orçamento deve ser positivo'),
});

type ObraFormValues = z.infer<typeof obraSchema>;

// ============================================================================
// VERSÃO REFATORADA (RECOMENDADA)
// ============================================================================

export function NovaObraRefatorada() {
  const form = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      nome: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      orcamento: 0,
    },
  });

  // Hook refatorado para mutações
  const { mutate: createObra, isPending } = useFormMutation({
    mutationFn: obrasApi.create,
    successMessage: 'Obra criada com sucesso!',
    redirectTo: '/dashboard/obras',
    queryKey: 'obras',
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header refatorado */}
        <PageHeader 
          title="Nova Obra"
          description="Cadastre uma nova obra no sistema"
          backTo="/dashboard/obras"
          icon={<Building className="h-6 w-6 text-blue-500" />}
        />

        {/* Formulário refatorado */}
        <FormWrapper
          form={form}
          onSubmit={createObra}
          title="Informações da Obra"
          description="Preencha os dados básicos da obra"
          isLoading={isPending}
          cardVariant="blue"
          submitLabel="Criar Obra"
        >
          {/* Seção de localização */}
          <FormSection 
            title="Localização"
            description="Dados de endereço da obra"
            icon={<MapPin className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome da Obra</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Casa João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Seção financeira */}
          <FormSection title="Informações Financeiras">
            <FormField
              control={form.control}
              name="orcamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento Inicial</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        </FormWrapper>
      </div>
    </DashboardLayout>
  );
}

