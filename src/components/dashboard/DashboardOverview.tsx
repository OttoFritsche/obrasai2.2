import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { formatCurrencyBR } from "@/lib/i18n";

export const DashboardOverview = () => {
  // Placeholder data - in a real application, this would come from the database
  const stats = [
    {
      title: "Obras em Andamento",
      value: "5",
      change: "+2",
      changeType: "increase" as const,
    },
    {
      title: "Total de Despesas",
      value: formatCurrencyBR(342500.75),
      change: formatCurrencyBR(15000),
      changeType: "increase" as const,
    },
    {
      title: "Orçamento Disponível",
      value: formatCurrencyBR(567400),
      change: formatCurrencyBR(15000),
      changeType: "decrease" as const,
    },
    {
      title: "Notas Fiscais",
      value: "37",
      change: "+4",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[#182b4d] text-white border border-[#daa916]">
          <CardHeader className="pb-1">
            <CardTitle className="text-2xl font-medium text-[#daa916] text-center">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className={`text-xs ${
              stat.changeType === "increase" ? "text-green-400" : "text-red-400"
            } flex items-center`}>
              <span>
                {stat.changeType === "increase" ? "↑" : "↓"} {stat.change}
              </span>
              <span className="text-gray-400 ml-1">comparado ao mês passado</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
