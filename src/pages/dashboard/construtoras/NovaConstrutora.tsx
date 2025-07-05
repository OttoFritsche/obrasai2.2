import { motion } from 'framer-motion';
import { ArrowLeft, Building2, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ConstrutoraFormPF } from '@/components/construtora/ConstrutoraFormPF';
import { ConstrutoraFormPJ } from '@/components/construtora/ConstrutoraFormPJ';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { useConstrutoraCNPJ } from '@/hooks/useConstrutoraCNPJ';
import { useConstrutoraForm } from '@/hooks/useConstrutoraForm';
import { useConstrutoraMutations } from '@/hooks/useConstrutoraMutations';

type ConstrutoraType = 'PJ' | 'PF';

/**
 * Componente principal para criação de novas construtoras
 * 
 * REFATORADO - Responsabilidades reduzidas:
 * - Gerenciar estado do tipo de construtora (PJ/PF)
 * - Coordenar hooks customizados
 * - Renderizar layout e navegação entre abas
 * - Delegar formulários para componentes específicos
 * 
 * Benefícios da refatoração:
 * - Redução de ~1125 para ~150 linhas
 * - Separação clara de responsabilidades
 * - Reutilização de componentes
 * - Facilidade de manutenção e testes
 * - Melhor legibilidade do código
 */
const NovaConstrutora = () => {
  const { user } = useAuth();
  const [construtoraType, setConstrutoraType] = useState<ConstrutoraType>('PJ');
  
  // Hooks customizados para lógica específica
  const { handleSubmitPJ, handleSubmitPF, isLoading: isMutationLoading } = useConstrutoraMutations();
  
  // Formulários tipados para cada tipo
  const pjForm = useConstrutoraForm({ tipo: 'PJ' });
  const pfForm = useConstrutoraForm({ tipo: 'PF' });
  
  // Hook para gerenciar CNPJ lookup automático
  const cnpjHook = useConstrutoraCNPJ(pjForm.form);
  
  const isLoading = isMutationLoading || cnpjHook.isLoadingCNPJ;
  
  // Os handlers já vêm do hook useConstrutoraMutations
  // handleSubmitPJ e handleSubmitPF já estão disponíveis
  
  const handleManualCNPJSearch = async () => {
    await cnpjHook.handleManualCNPJLookup();
  };
  
  const handleCancel = () => {
    window.history.back();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link to="/dashboard/construtoras">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nova Construtora</h1>
            <p className="text-muted-foreground">
              Cadastre uma nova construtora ou construtor autônomo
            </p>
          </div>
        </motion.div>

        {/* Formulário Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informações da Construtora</CardTitle>
              <CardDescription>
                Escolha o tipo e preencha as informações necessárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={construtoraType} 
                onValueChange={(value) => setConstrutoraType(value as ConstrutoraType)}
                className="space-y-6"
              >
                {/* Seletor de Tipo */}
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="PJ" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Pessoa Jurídica
                  </TabsTrigger>
                  <TabsTrigger value="PF" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Pessoa Física
                  </TabsTrigger>
                </TabsList>

                {/* Formulário PJ */}
                <TabsContent value="PJ" className="space-y-6">
                  <Form {...pjForm.form}>
                    <form onSubmit={pjForm.handleSubmit(handleSubmitPJ)} className="space-y-6">
                      <ConstrutoraFormPJ
                        control={pjForm.control}
                        isLoading={isLoading}
                        cnpjData={cnpjHook.cnpjData}
                        isCNPJLoading={cnpjHook.isLoadingCNPJ}
                        onManualCNPJSearch={handleManualCNPJSearch}
                      />
                      
                      {/* Ações */}
                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Criando...
                            </>
                          ) : (
                            'Criar Construtora'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                {/* Formulário PF */}
                <TabsContent value="PF" className="space-y-6">
                  <Form {...pfForm.form}>
                    <form onSubmit={pfForm.handleSubmit(handleSubmitPF)} className="space-y-6">
                      <ConstrutoraFormPF
                        control={pfForm.control}
                        isLoading={isLoading}
                      />
                      
                      {/* Ações */}
                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Criando...
                            </>
                          ) : (
                            'Criar Construtor'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NovaConstrutora;