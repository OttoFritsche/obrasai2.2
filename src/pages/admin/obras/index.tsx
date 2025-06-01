import React from 'react';
import { useObras } from '@/hooks/useObras';
import { useNavigate } from 'react-router-dom';

/**
 * Página de listagem de obras do tenant logado.
 */
const ObrasListPage: React.FC = () => {
  const { obras, isLoading, error, deleteObra } = useObras();
  const navigate = useNavigate();

  // Função para deletar obra com confirmação
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta obra?')) {
      await deleteObra.mutateAsync(id);
    }
  };

  if (isLoading) return <div>Carregando obras...</div>;
  if (error) return <div>Erro ao carregar obras.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Minhas Obras</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/admin/obras/new')}
        >
          Nova Obra
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nome</th>
            <th className="p-2">Endereço</th>
            <th className="p-2">Cidade</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {obras && obras.length > 0 ? (
            obras.map((obra: any) => (
              <tr key={obra.id} className="border-b">
                <td className="p-2">{obra.nome}</td>
                <td className="p-2">{obra.endereco}</td>
                <td className="p-2">{obra.cidade}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => navigate(`/admin/obras/${obra.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(obra.id)}
                    disabled={deleteObra.isLoading}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-4">Nenhuma obra cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ObrasListPage; 