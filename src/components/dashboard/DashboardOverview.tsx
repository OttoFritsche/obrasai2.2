import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBR } from "@/lib/i18n";
import { useObras } from "@/hooks/useObras";
import { useDespesas } from "@/hooks/useDespesas";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";

export const DashboardOverview = () => {
  const { obras } = useObras();
  const { despesas } = useDespesas();
  const { notasFiscais } = useNotasFiscais();

  // Calcular estatísticas reais
  const obrasEmAndamento = obras?.filter(obra => 
    obra.data_inicio && (!obra.data_prevista_termino || new Date(obra.data_prevista_termino) > new Date())
  ).length || 0;

  const totalDespesas = despesas?.reduce((sum, despesa) => sum + despesa.custo, 0) || 0;
  const orcamentoTotal = obras?.reduce((sum, obra) => sum + obra.orcamento, 0) || 0;
  const orcamentoDisponivel = orcamentoTotal - totalDespesas;
  const totalNotas = notasFiscais?.length || 0;

  // Calcular mudanças (por enquanto zeradas, mas pode ser implementado com dados históricos)
  const mudancaDespesas = 0;
  const mudancaOrcamento = 0;
  const mudancaNotas = 0;

  const stats = [
    {
      title: "Obras em Andamento",
      value: obrasEmAndamento.toString(),
      change: "+0",
      changeType: "increase" as const,
      cardStyle: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700",
      titleColor: "text-slate-700 dark:text-slate-300"
    },
    {
      title: "Total de Despesas",
      value: formatCurrencyBR(totalDespesas),
      change: formatCurrencyBR(mudancaDespesas),
      changeType: mudancaDespesas >= 0 ? "increase" as const : "decrease" as const,
      cardStyle: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700",
      titleColor: "text-orange-700 dark:text-orange-400"
    },
    {
      title: "Orçamento Disponível",
      value: formatCurrencyBR(orcamentoDisponivel),
      change: formatCurrencyBR(mudancaOrcamento),
      changeType: mudancaOrcamento >= 0 ? "increase" as const : "decrease" as const,
      cardStyle: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700",
      titleColor: "text-emerald-700 dark:text-emerald-400"
    },
    {
      title: "Notas Fiscais",
      value: totalNotas.toString(),
      change: `+${mudancaNotas}`,
      changeType: "increase" as const,
      cardStyle: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700",
      titleColor: "text-blue-700 dark:text-blue-400"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 ${stat.cardStyle}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg font-semibold text-center ${stat.titleColor}`}>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
            <p className={`text-xs flex items-center gap-1 ${
              stat.changeType === "increase" 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-500 dark:text-red-400"
            }`}>
              <span>
                {stat.changeType === "increase" ? "↑" : "↓"} {stat.change}
              </span>
              <span className="text-slate-500 dark:text-slate-400">vs mês anterior</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
