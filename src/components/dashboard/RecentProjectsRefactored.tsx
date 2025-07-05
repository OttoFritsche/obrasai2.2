import React from 'react';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useObras } from "@/hooks/useObras";
import { formatCurrencyBR } from "@/lib/i18n";

// ✅ Tipos movidos para seção dedicada
interface Obra {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  orcamento_total: number;
  data_inicio?: string | null;
  data_fim?: string | null;
  // Campos antigos para compatibilidade
  orcamento?: number;
  data_prevista_termino?: string | null;
}

// ✅ Custom Hook - Lógica de Negócio Separada
const useRecentProjectsLogic = () => {
  const { obras, isLoading } = useObras();
  
  const recentProjects = obras?.slice(0, 4) || [];

  const getProjectStatus = (obra: Obra) => {
    if (!obra.data_inicio) {
      return {
        label: "Planejamento",
        variant: "secondary" as const,
        color: "bg-slate-500"
      };
    }
    
    if (obra.data_prevista_termino && new Date(obra.data_prevista_termino) < new Date()) {
      return {
        label: "Atrasado",
        variant: "destructive" as const,
        color: "bg-red-500"
      };
    }
    
    return {
      label: "Em andamento",
      variant: "default" as const,  
      color: "bg-emerald-500"
    };
  };

  return {
    recentProjects,
    isLoading,
    getProjectStatus
  };
};

// ✅ Componente de Loading Separado
const LoadingState: React.FC = () => (
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

// ✅ Componente de Estado Vazio Separado
const EmptyState: React.FC = () => (
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

// ✅ Componente de Item Individual Separado
interface ProjectItemProps {
  project: Obra;
  getProjectStatus: (obra: Obra) => {
    label: string;
    variant: "default" | "destructive" | "secondary";
    color: string;
  };
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, getProjectStatus }) => {
  const status = getProjectStatus(project);
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
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
        <Badge variant={status.variant} className="text-xs">
          {status.label}
        </Badge>
      </div>
    </div>
  );
};

// ✅ Container Principal - Apenas Orquestração
export const RecentProjectsRefactored: React.FC = () => {
  const { recentProjects, isLoading, getProjectStatus } = useRecentProjectsLogic();

  if (isLoading) return <LoadingState />;
  if (!recentProjects.length) return <EmptyState />;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Obras Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              getProjectStatus={getProjectStatus}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};