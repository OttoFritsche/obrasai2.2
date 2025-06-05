import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateBR, formatCurrencyBR } from "@/lib/i18n";
import { Ellipsis, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useObras } from "@/hooks/useObras";
import { Link } from "react-router-dom";

// Definir tipo para obra
interface Obra {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  orcamento: number;
  data_inicio?: string;
  data_prevista_termino?: string;
}

export const RecentProjects = () => {
  const { obras, isLoading } = useObras();

  // Pegar as 4 obras mais recentes
  const recentProjects = obras?.slice(0, 4) || [];

  const getStatusColor = (obra: Obra): string => {
    if (!obra.data_inicio) return "bg-gray-500";
    if (obra.data_prevista_termino && new Date(obra.data_prevista_termino) < new Date()) {
      return "bg-red-500"; // Atrasado
    }
    return "bg-green-500"; // Em andamento
  };

  const getStatusLabel = (obra: Obra): string => {
    if (!obra.data_inicio) return "Planejamento";
    if (obra.data_prevista_termino && new Date(obra.data_prevista_termino) < new Date()) {
      return "Atrasado";
    }
    return "Em andamento";
  };

  if (isLoading) {
    return (
      <Card className="bg-[#182b4d] text-white border border-[#daa916]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-[#daa916]">
            Obras Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#daa916]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#182b4d] text-white border border-[#daa916]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#daa916] flex items-center justify-between">
          Obras Recentes
          <Button variant="outline" size="sm" asChild className="text-[#daa916] border-[#daa916]">
            <Link to="/dashboard/obras">Ver todas</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentProjects.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <Building className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-medium text-white">Nenhuma obra cadastrada</h3>
              <p className="text-sm text-gray-400">
                Comece criando sua primeira obra
              </p>
            </div>
            <Button asChild className="bg-[#daa916] text-[#182b4d] hover:bg-[#daa916]/90">
              <Link to="/dashboard/obras/nova">Criar Obra</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-600/50 bg-gray-800/50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project)}`}></div>
                  <div>
                    <p className="font-medium text-white">{project.nome}</p>
                    <p className="text-sm text-gray-400">
                      {project.cidade}/{project.estado}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {formatCurrencyBR(project.orcamento)}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(project).replace('bg-', 'border-')} ${getStatusColor(project).replace('bg-', 'text-')}`}
                  >
                    {getStatusLabel(project)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

