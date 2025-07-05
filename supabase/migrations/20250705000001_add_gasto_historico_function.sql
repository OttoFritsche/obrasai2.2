create or replace function public.get_gasto_historico_obra(p_obra_id uuid)
returns table (
    data_gasto date,
    gasto_acumulado numeric
)
language sql
as $$
with gastos_diarios as (
    -- 1. Agrega os custos operacionais por dia
    select
        d.data_despesa,
        sum(d.custo) as gasto_dia
    from
        public.despesas d
    where
        d.obra_id = p_obra_id
        and d.categoria <> 'AQUISICAO_TERRENO_AREA' -- Exclui custos de aquisição
    group by
        d.data_despesa
)
-- 2. Calcula o somatório acumulado sobre os gastos diários
select
    gd.data_despesa,
    sum(gd.gasto_dia) over (order by gd.data_despesa asc rows between unbounded preceding and current row) as gasto_acumulado
from
    gastos_diarios gd
order by
    gd.data_despesa asc;
$$; 