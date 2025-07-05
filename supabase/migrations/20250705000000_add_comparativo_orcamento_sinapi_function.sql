-- Substitui a função anterior pela nova, com lógica real.
drop function if exists public.comparar_orcamento_sinapi(uuid);

create or replace function public.comparar_custo_m2_sinapi(p_orcamento_id uuid)
returns table (
    custo_m2_estimado numeric,
    custo_m2_referencia numeric,
    variacao_percentual numeric,
    fonte_referencia text,
    data_referencia date
)
language plpgsql
as $$
declare
    v_orcamento record;
    v_base_custo record;
begin
    -- 1. Buscar os detalhes do orçamento paramétrico
    select
        orc.custo_m2,
        orc.estado,
        orc.tipo_obra,
        orc.padrao_obra
    into v_orcamento
    from public.orcamentos_parametricos orc
    where orc.id = p_orcamento_id;

    -- Se não encontrar o orçamento, retorna nada
    if not found then
        return;
    end if;

    -- 2. Buscar a base de custo de referência mais recente para os critérios do orçamento
    select
        bc.custo_m2_base,
        bc.fonte_dados,
        bc.data_referencia
    into v_base_custo
    from public.bases_custos_regionais bc
    where
        bc.estado = v_orcamento.estado
        and bc.tipo_obra = v_orcamento.tipo_obra
        and bc.padrao_obra = v_orcamento.padrao_obra
        and bc.ativo = true
    order by
        bc.data_referencia desc
    limit 1;

    -- Se não encontrar uma base de custo correspondente, retorna apenas o custo estimado
    if not found then
        return query
        select
            v_orcamento.custo_m2,
            null::numeric,
            null::numeric,
            'N/A'::text,
            null::date;
        return;
    end if;

    -- 3. Calcular a variação e retornar os resultados
    return query
    select
        v_orcamento.custo_m2 as custo_m2_estimado,
        v_base_custo.custo_m2_base as custo_m2_referencia,
        ((v_orcamento.custo_m2 - v_base_custo.custo_m2_base) / v_base_custo.custo_m2_base) * 100 as variacao_percentual,
        v_base_custo.fonte_dados as fonte_referencia,
        v_base_custo.data_referencia as data_referencia;
end;
$$; 