import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ObraFormValues, obraSchema } from '@/lib/validations/obra';
import { useObras } from '@/hooks/useObras';
import { useNavigate } from 'react-router-dom';

/**
 * Página de cadastro de nova obra multi-tenant.
 */
const NovaObraPage: React.FC = () => {
  const { createObra } = useObras();
  const navigate = useNavigate();

  // Configuração do formulário com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
  });

  // Função para submeter o formulário
  const onSubmit = async (values: ObraFormValues) => {
    try {
      await createObra.mutateAsync(values);
      navigate('/admin/obras');
    } catch (error) {
      alert('Erro ao cadastrar obra.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Nova Obra</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Nome</label>
          <input {...register('nome')} className="w-full border p-2 rounded" />
          {errors.nome && <span className="text-red-600">{errors.nome.message}</span>}
        </div>
        <div>
          <label className="block mb-1">Endereço</label>
          <input {...register('endereco')} className="w-full border p-2 rounded" />
          {errors.endereco && <span className="text-red-600">{errors.endereco.message}</span>}
        </div>
        <div>
          <label className="block mb-1">Cidade</label>
          <input {...register('cidade')} className="w-full border p-2 rounded" />
          {errors.cidade && <span className="text-red-600">{errors.cidade.message}</span>}
        </div>
        <div>
          <label className="block mb-1">Estado</label>
          <input {...register('estado')} className="w-full border p-2 rounded" />
          {errors.estado && <span className="text-red-600">{errors.estado.message}</span>}
        </div>
        <div>
          <label className="block mb-1">CEP</label>
          <input {...register('cep')} className="w-full border p-2 rounded" />
          {errors.cep && <span className="text-red-600">{errors.cep.message}</span>}
        </div>
        <div>
          <label className="block mb-1">Orçamento</label>
          <input type="number" step="0.01" {...register('orcamento', { valueAsNumber: true })} className="w-full border p-2 rounded" />
          {errors.orcamento && <span className="text-red-600">{errors.orcamento.message}</span>}
        </div>
        <div>
          <label className="block mb-1">Data de Início</label>
          <input type="date" {...register('data_inicio')} className="w-full border p-2 rounded" />
          {errors.data_inicio && <span className="text-red-600">{errors.data_inicio.message}</span>}
        </div>
        <div>
          <label className="block mb-1">Data Prevista de Término</label>
          <input type="date" {...register('data_prevista_termino')} className="w-full border p-2 rounded" />
          {errors.data_prevista_termino && <span className="text-red-600">{errors.data_prevista_termino.message}</span>}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isSubmitting || createObra.isLoading}
        >
          {isSubmitting || createObra.isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
};

export default NovaObraPage; 