import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateBR, formatCurrencyBR } from "@/lib/i18n";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RecentProjects = () => {
  // Placeholder data - in a real application, this would come from the database
  const projects = [
    {
      id: "1",
      name: "Edifício Residencial Aurora",
      city: "São Paulo",
      state: "SP",
      budget: 1250000,
      endDate: "2023-12-15",
      status: "Em andamento",
    },
    {
      id: "2",
      name: "Condomínio Marina Bay",
      city: "Rio de Janeiro",
      state: "RJ",
      budget: 3450000,
      endDate: "2024-03-10",
      status: "Em andamento",
    },
    {
      id: "3",
      name: "Centro Comercial Ipanema",
      city: "Belo Horizonte",
      state: "MG",
      budget: 2185000,
      endDate: "2023-11-20",
      status: "Atrasado",
    },
    {
      id: "4",
      name: "Residencial Jardim das Flores",
      city: "Curitiba",
      state: "PR",
      budget: 1840000,
      endDate: "2024-01-05",
      status: "Em andamento",
    },
  ];

  return (
    <Card className="col-span-1 lg:col-span-2 bg-[#182b4d] text-white border border-[#daa916]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-medium text-[#daa916] text-center flex-grow">
          Obras Recentes
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-[#daa916]"
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Nome</th>
                <th className="text-left py-3 font-medium">Localização</th>
                <th className="text-left py-3 font-medium">Orçamento</th>
                <th className="text-left py-3 font-medium">Término</th>
                <th className="text-left py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b">
                  <td className="py-3">{project.name}</td>
                  <td className="py-3">{project.city}, {project.state}</td>
                  <td className="py-3">{formatCurrencyBR(project.budget)}</td>
                  <td className="py-3">{formatDateBR(project.endDate)}</td>
                  <td className="py-3">
                    <Badge
                      variant={project.status === "Em andamento" ? "default" : "destructive"}
                      className={project.status === "Em andamento" ? "bg-green-500" : ""}
                    >
                      {project.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

