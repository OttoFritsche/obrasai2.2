import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
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
    },
    {
      title: "Total de Despesas",
      value: formatCurrencyBR(totalDespesas),
      change: formatCurrencyBR(mudancaDespesas),
      changeType: mudancaDespesas >= 0 ? "increase" as const : "decrease" as const,
    },
    {
      title: "Orçamento Disponível",
      value: formatCurrencyBR(orcamentoDisponivel),
      change: formatCurrencyBR(mudancaOrcamento),
      changeType: mudancaOrcamento >= 0 ? "increase" as const : "decrease" as const,
    },
    {
      title: "Notas Fiscais",
      value: totalNotas.toString(),
      change: `+${mudancaNotas}`,
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
