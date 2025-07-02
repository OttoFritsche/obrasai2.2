import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBR } from "@/lib/i18n";
import { useObras } from "@/hooks/useObras";

// Definir tipo para obra
interface Obra {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  orcamento: number;
  data_inicio?: string | null;
  data_prevista_termino?: string | null;
}

export const RecentProjects = () => {
  const { obras, isLoading } = useObras();

  // Pegar as 4 obras mais recentes
  const recentProjects = obras?.slice(0, 4) || [];

  const getStatusColor = (obra: Obra): string => {
    if (!obra.data_inicio) return "bg-slate-500";
    if (obra.data_prevista_termino && new Date(obra.data_prevista_termino) < new Date()) {
      return "bg-red-500"; // Atrasado
    }
    return "bg-emerald-500"; // Em andamento
  };

  const getStatusLabel = (obra: Obra): string => {
    if (!obra.data_inicio) return "Planejamento";
    if (obra.data_prevista_termino && new Date(obra.data_prevista_termino) < new Date()) {
      return "Atrasado";
    }
    return "Em andamento";
  };

  const getBadgeVariant = (obra: Obra): "default" | "destructive" | "secondary" => {
    if (!obra.data_inicio) return "secondary";
    if (obra.data_prevista_termino && new Date(obra.data_prevista_termino) < new Date()) {
      return "destructive";
    }
    return "default";
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Obras Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentProjects.length) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Obras Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            Nenhuma obra cadastrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Obras Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentProjects.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            Nenhuma obra encontrada.
          </p>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project)}`}></div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{project.nome}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {project.cidade}/{project.estado}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrencyBR(project.orcamento)}
                  </p>
                  <Badge variant={getBadgeVariant(project)} className="text-xs">
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

