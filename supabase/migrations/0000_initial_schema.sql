

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE TYPE "public"."categoria_enum" AS ENUM (
    'MATERIAL_CONSTRUCAO',
    'MAO_DE_OBRA',
    'ALUGUEL_EQUIPAMENTOS',
    'TRANSPORTE_FRETE',
    'TAXAS_LICENCAS',
    'SERVICOS_TERCEIRIZADOS',
    'ADMINISTRATIVO',
    'IMPREVISTOS',
    'OUTROS',
    'DEMOLICAO_REMOCAO',
    'PROTECAO_ESTRUTURAL',
    'AQUISICAO_TERRENO_AREA',
    'AQUISICAO_IMOVEL_REFORMA_LEILAO'
);


ALTER TYPE "public"."categoria_enum" OWNER TO "postgres";


CREATE TYPE "public"."etapa_enum" AS ENUM (
    'FUNDACAO',
    'ESTRUTURA',
    'ALVENARIA',
    'COBERTURA',
    'INSTALACOES_ELETRICAS',
    'INSTALACOES_HIDRAULICAS',
    'REVESTIMENTOS_INTERNOS',
    'REVESTIMENTOS_EXTERNOS',
    'PINTURA',
    'ACABAMENTOS',
    'PAISAGISMO',
    'DOCUMENTACAO',
    'OUTROS',
    'DEMOLICAO',
    'ADAPTACAO_ESTRUTURAL',
    'RECUPERACAO_ESTRUTURAL',
    'READEQUACAO_INSTALACOES',
    'PLANEJAMENTO',
    'TERRAPLANAGEM',
    'INSTALACOES_GAS',
    'INSTALACOES_AR_CONDICIONADO',
    'AUTOMACAO',
    'LIMPEZA_POS_OBRA',
    'ENTREGA_VISTORIA'
);


ALTER TYPE "public"."etapa_enum" OWNER TO "postgres";


CREATE TYPE "public"."insumo_enum" AS ENUM (
    'CONCRETO_USINADO',
    'ACO_CA50',
    'FORMA_MADEIRA',
    'ESCAVACAO',
    'IMPERMEABILIZACAO_FUND',
    'IMPERMEABILIZANTE_ASFALTICO',
    'LASTRO_BRITA',
    'CONCRETO_MAGRO',
    'ACO_CA60',
    'TELA_SOLDADA',
    'ESPAÇADOR_ACO',
    'LAJE_PRE_MOLDADA',
    'VIGA_CONCRETO',
    'PILAR_CONCRETO',
    'TIJOLO_CERAMICO',
    'BLOCO_CONCRETO',
    'TIJOLO_ECOLOGICO',
    'BLOCO_CELULAR',
    'ARGAMASSA_ASSENTAMENTO',
    'CIMENTO_CP2',
    'CIMENTO_CP5',
    'CAL_HIDRATADA',
    'AREIA_MEDIA_LAVADA',
    'BRITA_0',
    'VERGA_CONTRAVERGA',
    'TELHA_CERAMICA',
    'TELHA_FIBROCIMENTO',
    'TELHA_CONCRETO',
    'TELHA_METALICA',
    'MADEIRAMENTO_TELHADO',
    'MANTA_SUBCOBERTURA',
    'RUFO_CALHA',
    'IMPERMEABILIZACAO_LAJE',
    'FIO_CABO_ELETRICO',
    'ELETRODUTO',
    'QUADRO_DISTRIBUICAO',
    'DISJUNTOR',
    'TOMADA_INTERRUPTOR',
    'LUMINARIA',
    'CABO_REDE_CAT6',
    'CABO_COAXIAL',
    'INTERFONE',
    'SENSOR_PRESENCA',
    'TUBO_PVC_ESGOTO',
    'TUBO_PVC_AGUA_FRIA',
    'TUBO_CPVC_AGUA_QUENTE',
    'TUBO_PEX_AGUA_QUENTE',
    'CONEXOES_HIDRAULICAS',
    'CAIXA_DAGUA',
    'CAIXA_GORDURA',
    'CAIXA_INSPECAO',
    'LOUCAS_METAIS',
    'AQUECEDOR_AGUA',
    'REGISTRO_GAVETA',
    'REGISTRO_PRESSAO',
    'FILTRO_AGUA',
    'CHAPISCO',
    'EMBOCO',
    'REBOCO',
    'GESSO_LISO',
    'AZULEJO',
    'PISO_CERAMICO',
    'PORCELANATO',
    'PISO_LAMINADO',
    'PISO_VINILICO',
    'RODAPE',
    'REJUNTE_EPOXI',
    'REJUNTE_ACRILICO',
    'FORRO_PVC',
    'FORRO_GESSO_ACARTONADO',
    'REVESTIMENTO_FACHADA',
    'TEXTURA_GRAFIATO',
    'PISO_EXTERNO',
    'IMPERMEABILIZANTE_PAREDE',
    'MASSA_CORRIDA_PVA',
    'MASSA_ACRILICA',
    'SELADOR_ACRILICO',
    'TINTA_LATEX_PVA',
    'TINTA_ACRILICA',
    'VERNIZ',
    'LIXA',
    'FITA_CREPE',
    'ROLO_PINTURA',
    'TRINCHA_PINCEL',
    'SOLVENTE_THINNER',
    'PORTA_MADEIRA',
    'PORTA_ALUMINIO',
    'JANELA_MADEIRA',
    'JANELA_ALUMINIO',
    'JANELA_VIDRO',
    'BANCADA_GRANITO',
    'SOLEIRA_PEITORIL',
    'VIDRO_COMUM',
    'ESPELHO',
    'BOX_BANHEIRO',
    'FECHADURA_DOBRADICA',
    'GUARDA_CORPO',
    'TERRA_ADUBADA',
    'GRAMA',
    'MUDA_PLANTA',
    'PEDRA_DECORATIVA',
    'LIMITADOR_GRAMA',
    'SISTEMA_IRRIGACAO',
    'ILUMINACAO_JARDIM',
    'PROJETO_ARQUITETONICO',
    'PROJETO_ESTRUTURAL',
    'PROJETO_ELETRICO',
    'PROJETO_HIDRAULICO',
    'ART_RRT',
    'TAXA_PREFEITURA',
    'TAXA_CARTORIO',
    'ISS',
    'SEGURO_OBRA',
    'CONSULTORIA_ESPECIALIZADA',
    'PEDREIRO',
    'SERVENTE',
    'ELETRICISTA',
    'ENCANADOR',
    'PINTOR',
    'GESSEIRO',
    'CARPINTEIRO',
    'MARMORISTA',
    'VIDRACEIRO',
    'SERRALHEIRO',
    'JARDINEIRO',
    'MESTRE_OBRAS',
    'ENGENHEIRO_ARQUITETO',
    'AJUDANTE_GERAL',
    'BETONEIRA',
    'ANDAIME',
    'MARTELETE',
    'ESCORA',
    'COMPACTADOR_SOLO',
    'ESMERILHADEIRA',
    'GERADOR_ENERGIA',
    'BOMBA_SUBMERSA',
    'EPI',
    'FERRAMENTA',
    'PLACAS_SINALIZACAO',
    'AGUA_OBRA',
    'LUZ_OBRA',
    'LIMPEZA_OBRA',
    'CONTAINER_ENTULHO',
    'CONSUMIVEIS_ESCRITORIO',
    'ALIMENTACAO_EQUIPE',
    'TRANSPORTE_EQUIPE',
    'TAXAS_BANCARIAS',
    'OUTROS',
    'DEMOLICAO_PAREDE',
    'DEMOLICAO_PISO',
    'DEMOLICAO_REVESTIMENTO',
    'REMOCAO_ENTULHO',
    'PROTECAO_ESQUADRIAS',
    'PROTECAO_PISOS',
    'LONA_PLASTICA',
    'FITA_SINALIZACAO',
    'REFORCO_ESTRUTURAL',
    'RECUPERACAO_CONCRETO',
    'ADAPTACAO_ELETRICA',
    'ADAPTACAO_HIDRAULICA',
    'REGULARIZACAO_PISO',
    'REGULARIZACAO_PAREDE',
    'ADITIVO_ADERENCIA',
    'ARGAMASSA_RECUPERACAO',
    'PRIMER_ADERENCIA',
    'SELADOR_SUPERFICIE',
    'CONTRAPISO_AUTONIVELANTE',
    'MANTA_ISOLAMENTO',
    'PROJETO_ARQUITETONICO_COMPLETO'
);


ALTER TYPE "public"."insumo_enum" OWNER TO "postgres";


CREATE TYPE "public"."padrao_obra_enum" AS ENUM (
    'POPULAR',
    'NORMAL',
    'ALTO',
    'LUXO'
);


ALTER TYPE "public"."padrao_obra_enum" OWNER TO "postgres";


CREATE TYPE "public"."status_orcamento_enum" AS ENUM (
    'RASCUNHO',
    'CONCLUIDO',
    'VINCULADO_OBRA',
    'CONVERTIDO'
);


ALTER TYPE "public"."status_orcamento_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_obra_enum" AS ENUM (
    'R1_UNIFAMILIAR',
    'R4_MULTIFAMILIAR',
    'COMERCIAL_LOJA',
    'COMERCIAL_ESCRITORIO',
    'COMERCIAL_GALPAO',
    'INDUSTRIAL_LEVE',
    'INDUSTRIAL_PESADA',
    'INSTITUCIONAL',
    'REFORMA_RESIDENCIAL',
    'REFORMA_COMERCIAL',
    'R2_MULTIFAMILIAR',
    'COMERCIAL',
    'INDUSTRIAL',
    'HOSPITALAR',
    'EDUCACIONAL'
);


ALTER TYPE "public"."tipo_obra_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."atualizar_percentual_grupo"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_projeto DECIMAL(15,2);
BEGIN
    -- Buscar total do projeto
    SELECT valor_total_geral
    INTO total_projeto
    FROM projetos
    WHERE id = NEW.projeto_id;
    
    -- Atualizar percentual do grupo
    IF total_projeto > 0 THEN
        UPDATE grupos_servicos
        SET percentual_projeto = (NEW.valor_total_grupo * 100 / total_projeto)
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."atualizar_percentual_grupo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."atualizar_preco_item_sinapi"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Se o item usa preço SINAPI e tem código definido
    IF NEW.usa_preco_sinapi = true AND NEW.codigo_sinapi IS NOT NULL THEN
        -- Buscar preço atualizado do SINAPI
        NEW.valor_unitario_base := obter_preco_sinapi_por_estado(
            NEW.codigo_sinapi,
            COALESCE(NEW.estado_referencia_preco, 'SP'),
            CURRENT_DATE
        );
        
        -- Se não encontrou preço, manter o valor original mas registrar observação
        IF NEW.valor_unitario_base IS NULL THEN
            NEW.observacoes := COALESCE(NEW.observacoes, '') || 
                ' [AVISO: Preço SINAPI não encontrado para código ' || NEW.codigo_sinapi || ']';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."atualizar_preco_item_sinapi"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."atualizar_preco_item_sinapi"() IS 'Atualiza automaticamente o preço unitário do item baseado no SINAPI quando usa_preco_sinapi=true';



CREATE OR REPLACE FUNCTION "public"."atualizar_totais_grupo"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    grupo_id INTEGER;
    total_grupo DECIMAL(15,2);
BEGIN
    -- Determinar o grupo afetado
    IF TG_OP = 'DELETE' THEN
        grupo_id := OLD.grupo_servico_id;
    ELSE
        grupo_id := NEW.grupo_servico_id;
    END IF;
    
    -- Se não há grupo, sair
    IF grupo_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calcular total do grupo
    SELECT COALESCE(SUM(valor_total_item), 0)
    INTO total_grupo
    FROM orcamento_itens
    WHERE grupo_servico_id = grupo_id;
    
    -- Atualizar o grupo
    UPDATE grupos_servicos 
    SET 
        valor_total_grupo = total_grupo,
        updated_at = NOW()
    WHERE id = grupo_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."atualizar_totais_grupo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."atualizar_totais_projeto"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    proj_id INTEGER;
    total_materiais DECIMAL(15,2);
    total_mao_obra DECIMAL(15,2);
    total_equipamentos DECIMAL(15,2);
    total_geral DECIMAL(15,2);
    percentual_total DECIMAL(5,2);
BEGIN
    -- Determinar o projeto afetado
    IF TG_OP = 'DELETE' THEN
        proj_id := OLD.projeto_id;
    ELSE
        proj_id := NEW.projeto_id;
    END IF;
    
    -- Calcular totais por categoria
    SELECT 
        COALESCE(SUM(valor_total_material), 0),
        COALESCE(SUM(valor_total_mao_obra), 0),
        COALESCE(SUM(valor_total_equipamento), 0),
        COALESCE(SUM(valor_total_item), 0)
    INTO total_materiais, total_mao_obra, total_equipamentos, total_geral
    FROM orcamento_itens
    WHERE projeto_id = proj_id;
    
    -- Buscar percentuais do projeto para aplicar BDI
    SELECT percentual_bdi + percentual_lucro + percentual_impostos
    INTO percentual_total
    FROM projetos
    WHERE id = proj_id;
    
    -- Aplicar BDI apenas nos itens que permitem
    SELECT COALESCE(SUM(
        CASE 
            WHEN aplicar_bdi THEN valor_total_item * (1 + percentual_total / 100)
            ELSE valor_total_item
        END
    ), 0)
    INTO total_geral
    FROM orcamento_itens oi
    JOIN projetos p ON oi.projeto_id = p.id
    WHERE oi.projeto_id = proj_id;
    
    -- Atualizar o projeto
    UPDATE projetos 
    SET 
        valor_total_materiais = total_materiais,
        valor_total_mao_obra = total_mao_obra,
        valor_total_equipamentos = total_equipamentos,
        valor_total_geral = total_geral,
        updated_at = NOW()
    WHERE id = proj_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."atualizar_totais_projeto"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."buscar_conhecimento_semantico"("p_obra_id" "uuid", "p_query_embedding" "public"."vector", "p_limite" integer DEFAULT 10, "p_threshold" double precision DEFAULT 0.7) RETURNS TABLE("id" "uuid", "tipo_conteudo" character varying, "titulo" "text", "conteudo_resumido" "text", "similarity" double precision, "metadata" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.tipo_conteudo,
    e.titulo,
    e.conteudo_resumido,
    (1 - (e.embedding <=> p_query_embedding)) as similarity,
    e.metadata
  FROM embeddings_conhecimento e
  WHERE e.obra_id = p_obra_id
    AND (1 - (e.embedding <=> p_query_embedding)) > p_threshold
  ORDER BY e.embedding <=> p_query_embedding
  LIMIT p_limite;
END;
$$;


ALTER FUNCTION "public"."buscar_conhecimento_semantico"("p_obra_id" "uuid", "p_query_embedding" "public"."vector", "p_limite" integer, "p_threshold" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."buscar_documentos_semelhantes"("p_embedding" "public"."vector", "p_topic" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 5) RETURNS TABLE("conteudo" "text")
    LANGUAGE "sql" STABLE
    AS $$
  select ec.conteudo
  from embeddings_conhecimento ec
  where (
    p_topic is null 
    or lower(ec.titulo) like lower(p_topic)
    or lower(ec.tipo_conteudo) like lower(p_topic)
  )
  order by ec.embedding <#> p_embedding
  limit p_limit;
$$;


ALTER FUNCTION "public"."buscar_documentos_semelhantes"("p_embedding" "public"."vector", "p_topic" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."buscar_sinapi_por_codigo"("p_codigo" "text") RETURNS TABLE("codigo" "text", "descricao" "text", "unidade" "text", "preco_unitario" numeric, "categoria" "text", "fonte" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        resultado.codigo,
        resultado.descricao,
        resultado.unidade,
        resultado.preco_unitario,
        resultado.categoria,
        resultado.fonte
    FROM buscar_sinapi_unificado(
        p_codigo,  -- termo
        NULL,      -- categoria
        NULL,      -- estado
        NULL,      -- fonte
        10         -- limite maior para garantir que encontre
    ) resultado
    WHERE resultado.codigo = p_codigo;
END;
$$;


ALTER FUNCTION "public"."buscar_sinapi_por_codigo"("p_codigo" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."buscar_sinapi_unificado"("p_termo" "text" DEFAULT NULL::"text", "p_categoria" "text" DEFAULT NULL::"text", "p_estado" "text" DEFAULT NULL::"text", "p_fonte" "text" DEFAULT NULL::"text", "p_limite" integer DEFAULT 50) RETURNS TABLE("codigo" "text", "descricao" "text", "unidade" "text", "preco_unitario" numeric, "categoria" "text", "fonte" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Normalizar parâmetros vazios para NULL
    IF p_termo = '' THEN p_termo := NULL; END IF;
    IF p_categoria = '' THEN p_categoria := NULL; END IF;
    IF p_estado = '' THEN p_estado := NULL; END IF;
    IF p_fonte = '' OR p_fonte = 'todos' THEN p_fonte := NULL; END IF;
    
    RETURN QUERY
    SELECT 
        resultado.codigo,
        resultado.descricao,
        resultado.unidade,
        resultado.preco_unitario,
        resultado.categoria,
        resultado.fonte
    FROM (
        SELECT 
            si.codigo_do_insumo::TEXT as codigo,
            si.descricao_do_insumo::TEXT as descricao,
            si.unidade::TEXT as unidade,
            COALESCE(si.preco_sp, 0) as preco_unitario,
            si.categoria::TEXT as categoria,
            'insumos'::TEXT as fonte,
            CASE 
                WHEN p_termo IS NOT NULL AND si.descricao_do_insumo ILIKE p_termo || '%' THEN 1
                WHEN p_termo IS NOT NULL AND si.codigo_do_insumo ILIKE p_termo || '%' THEN 2
                WHEN p_termo IS NOT NULL AND si.descricao_do_insumo ILIKE '%' || p_termo || '%' THEN 3
                ELSE 4
            END as relevancia
        FROM sinapi_insumos si
        WHERE 
            (p_termo IS NULL OR 
             si.descricao_do_insumo ILIKE '%' || p_termo || '%' OR 
             si.codigo_do_insumo ILIKE '%' || p_termo || '%')
            AND (p_categoria IS NULL OR si.categoria = p_categoria)
            AND (p_fonte IS NULL OR p_fonte = 'insumos')
            AND si.ativo = true
        
        UNION ALL
        
        SELECT 
            scmo.codigo_composicao::TEXT as codigo,
            scmo.descricao::TEXT as descricao,
            scmo.unidade::TEXT as unidade,
            COALESCE(scmo.preco_sem_sp, 0) as preco_unitario,
            scmo.grupo::TEXT as categoria,
            'composicoes_mao_obra'::TEXT as fonte,
            CASE 
                WHEN p_termo IS NOT NULL AND scmo.descricao ILIKE p_termo || '%' THEN 1
                WHEN p_termo IS NOT NULL AND scmo.codigo_composicao ILIKE p_termo || '%' THEN 2
                WHEN p_termo IS NOT NULL AND scmo.descricao ILIKE '%' || p_termo || '%' THEN 3
                ELSE 4
            END as relevancia
        FROM sinapi_composicoes_mao_obra scmo
        WHERE 
            (p_termo IS NULL OR 
             scmo.descricao ILIKE '%' || p_termo || '%' OR 
             scmo.codigo_composicao ILIKE '%' || p_termo || '%')
            AND (p_categoria IS NULL OR scmo.grupo = p_categoria)
            AND (p_fonte IS NULL OR p_fonte = 'composicoes_mao_obra')
            AND scmo.ativo = true
    ) resultado
    ORDER BY resultado.relevancia, resultado.descricao
    LIMIT p_limite;
END;
$$;


ALTER FUNCTION "public"."buscar_sinapi_unificado"("p_termo" "text", "p_categoria" "text", "p_estado" "text", "p_fonte" "text", "p_limite" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calcular_fator_complexidade_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum", "p_area_total" numeric, "p_percentual_demolir" numeric DEFAULT 30) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    fator_base numeric := 1.0;
    fator_complexidade numeric := 1.0;
    fator_area numeric := 1.0;
    fator_demolicao numeric := 1.0;
BEGIN
    -- Fator base por tipo de obra
    CASE p_tipo_obra
        WHEN 'REFORMA_RESIDENCIAL' THEN fator_base := 1.2;
        WHEN 'REFORMA_COMERCIAL' THEN fator_base := 1.4;
        ELSE fator_base := 1.0;
    END CASE;
    
    -- Fator de complexidade por padrão
    CASE p_padrao_obra
        WHEN 'POPULAR' THEN fator_complexidade := 1.0;
        WHEN 'NORMAL' THEN fator_complexidade := 1.1;
        WHEN 'ALTO' THEN fator_complexidade := 1.25;
        WHEN 'LUXO' THEN fator_complexidade := 1.4;
    END CASE;
    
    -- Fator de área (reformas em áreas pequenas são proporcionalmente mais caras)
    IF p_area_total <= 50 THEN
        fator_area := 1.3;
    ELSIF p_area_total <= 100 THEN
        fator_area := 1.15;
    ELSIF p_area_total <= 200 THEN
        fator_area := 1.05;
    ELSE
        fator_area := 1.0;
    END IF;
    
    -- Fator de demolição (quanto mais demolir, mais complexo)
    fator_demolicao := 1.0 + (p_percentual_demolir / 100) * 0.5;
    
    RETURN fator_base * fator_complexidade * fator_area * fator_demolicao;
END;
$$;


ALTER FUNCTION "public"."calcular_fator_complexidade_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum", "p_area_total" numeric, "p_percentual_demolir" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calcular_valores_item"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    preco_material DECIMAL(10,4) := 0;
    preco_mao_obra DECIMAL(10,4) := 0;
    preco_equipamento DECIMAL(10,4) := 0;
    estado_ref CHAR(2);
    modalidade_des VARCHAR(20);
BEGIN
    -- Buscar configurações do projeto
    SELECT estado_referencia, modalidade_desoneracao 
    INTO estado_ref, modalidade_des
    FROM projetos 
    WHERE id = NEW.projeto_id;
    
    -- Se tem referência SINAPI insumo, buscar preço
    IF NEW.sinapi_insumo_id IS NOT NULL THEN
        SELECT 
            CASE 
                WHEN estado_ref = 'SP' THEN CAST(preco_sp AS DECIMAL(10,4))
                -- Adicionar outros estados conforme necessário
                ELSE CAST(preco_sp AS DECIMAL(10,4))
            END
        INTO preco_material
        FROM sinapi_insumos 
        WHERE id = NEW.sinapi_insumo_id;
        
        NEW.preco_unitario_material := COALESCE(preco_material, NEW.preco_unitario_material);
    END IF;
    
    -- Se tem referência SINAPI composição, buscar preço de mão de obra
    IF NEW.sinapi_composicao_id IS NOT NULL THEN
        SELECT 
            CASE 
                WHEN modalidade_des = 'COM_DESONERACAO' AND estado_ref = 'SP' THEN preco_com_sp
                WHEN modalidade_des = 'SEM_DESONERACAO' AND estado_ref = 'SP' THEN preco_sem_sp
                -- Adicionar outros estados conforme necessário
                ELSE COALESCE(preco_sem_sp, preco_com_sp)
            END
        INTO preco_mao_obra
        FROM sinapi_composicoes_mao_obra 
        WHERE id = NEW.sinapi_composicao_id;
        
        NEW.preco_unitario_mao_obra := COALESCE(preco_mao_obra, NEW.preco_unitario_mao_obra);
    END IF;
    
    -- Calcular preço unitário total
    NEW.preco_unitario_total := 
        COALESCE(NEW.preco_unitario_material, 0) + 
        COALESCE(NEW.preco_unitario_mao_obra, 0) + 
        COALESCE(NEW.preco_unitario_equipamento, 0);
    
    -- Aplicar percentual de desperdício nos materiais
    NEW.valor_total_material := 
        COALESCE(NEW.preco_unitario_material, 0) * 
        NEW.quantidade * 
        (1 + COALESCE(NEW.percentual_desperdicio, 0) / 100);
    
    -- Calcular valores totais
    NEW.valor_total_mao_obra := 
        COALESCE(NEW.preco_unitario_mao_obra, 0) * NEW.quantidade;
    
    NEW.valor_total_equipamento := 
        COALESCE(NEW.preco_unitario_equipamento, 0) * NEW.quantidade;
    
    NEW.valor_total_item := 
        NEW.valor_total_material + 
        NEW.valor_total_mao_obra + 
        NEW.valor_total_equipamento;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calcular_valores_item"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_analytics_events"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM analytics_events 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_analytics_events"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."estatisticas_uso_ia"("tenant_uuid" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("total_conversas" bigint, "total_tokens" bigint, "tempo_medio_resposta" numeric, "total_buscas" bigint, "sugestoes_ativas" bigint, "economia_estimada" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM conversas_ia WHERE tenant_id = COALESCE(tenant_uuid, (SELECT tenant_id FROM profiles WHERE id = auth.uid()))),
        (SELECT COALESCE(SUM(tokens_usados), 0) FROM conversas_ia WHERE tenant_id = COALESCE(tenant_uuid, (SELECT tenant_id FROM profiles WHERE id = auth.uid()))),
        (SELECT COALESCE(AVG(tempo_resposta_ms), 0) FROM conversas_ia WHERE tenant_id = COALESCE(tenant_uuid, (SELECT tenant_id FROM profiles WHERE id = auth.uid()))),
        (SELECT COUNT(*) FROM historico_buscas_ia WHERE tenant_id = COALESCE(tenant_uuid, (SELECT tenant_id FROM profiles WHERE id = auth.uid()))),
        (SELECT COUNT(*) FROM ia_sugestoes WHERE status = 'pendente' AND tenant_id = COALESCE(tenant_uuid, (SELECT tenant_id FROM profiles WHERE id = auth.uid()))),
        (SELECT COALESCE(SUM(economia_estimada), 0) FROM ia_sugestoes WHERE status = 'aplicada' AND tenant_id = COALESCE(tenant_uuid, (SELECT tenant_id FROM profiles WHERE id = auth.uid())));
END;
$$;


ALTER FUNCTION "public"."estatisticas_uso_ia"("tenant_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_tenant_id_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Se tenant_id não foi fornecido, gerar um novo
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id = gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_tenant_id_for_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_tenant_id_for_new_user"() IS 'Gera tenant_id único para novos usuários';



CREATE OR REPLACE FUNCTION "public"."gerar_numero_contrato"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    ano_atual TEXT;
    proximo_numero INTEGER;
    numero_formatado TEXT;
BEGIN
    IF NEW.numero_contrato IS NULL OR NEW.numero_contrato = '' THEN
        ano_atual := EXTRACT(YEAR FROM now())::TEXT;
        
        -- Buscar próximo número sequencial para o ano
        SELECT COALESCE(MAX(
            CASE 
                WHEN numero_contrato ~ ('^CTR-' || ano_atual || '-[0-9]+$') 
                THEN SUBSTRING(numero_contrato FROM '-([0-9]+)$')::INTEGER 
                ELSE 0 
            END
        ), 0) + 1 
        INTO proximo_numero
        FROM contratos 
        WHERE tenant_id = NEW.tenant_id;
        
        numero_formatado := 'CTR-' || ano_atual || '-' || LPAD(proximo_numero::TEXT, 4, '0');
        NEW.numero_contrato := numero_formatado;
    END IF;
    
    RETURN NEW;
END;
$_$;


ALTER FUNCTION "public"."gerar_numero_contrato"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gerar_orcamento_automatico_sinapi"("p_orcamento_id" "uuid", "p_area_total" numeric, "p_estado" character varying DEFAULT 'SP'::character varying) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_orcamento RECORD;
    v_coeficiente RECORD;
    v_preco_unitario NUMERIC;
    v_quantidade_total NUMERIC;
    v_itens_criados INTEGER := 0;
BEGIN
    -- Buscar dados do orçamento
    SELECT tipo_obra, padrao_obra 
    INTO v_orcamento
    FROM orcamentos_parametricos 
    WHERE id = p_orcamento_id;
    
    IF v_orcamento IS NULL THEN
        RAISE EXCEPTION 'Orçamento não encontrado: %', p_orcamento_id;
    END IF;
    
    -- Buscar coeficientes técnicos aplicáveis
    FOR v_coeficiente IN
        SELECT 
            ct.categoria,
            ct.etapa,
            ct.insumo,
            ct.quantidade_por_m2,
            ct.unidade_medida,
            ct.codigo_sinapi,
            ct.sinapi_insumo_id
        FROM coeficientes_tecnicos ct
        WHERE ct.tipo_obra = v_orcamento.tipo_obra
        AND ct.padrao_obra = v_orcamento.padrao_obra
        AND ct.ativo = true
        AND ct.quantidade_por_m2 > 0
    LOOP
        -- Calcular quantidade total
        v_quantidade_total := v_coeficiente.quantidade_por_m2 * p_area_total;
        
        -- Buscar preço no SINAPI se disponível
        IF v_coeficiente.codigo_sinapi IS NOT NULL THEN
            v_preco_unitario := obter_preco_sinapi_por_estado(
                v_coeficiente.codigo_sinapi,
                p_estado,
                CURRENT_DATE
            );
        END IF;
        
        -- Se não encontrou preço no SINAPI, usar um valor padrão baixo para indicar necessidade de ajuste
        IF v_preco_unitario IS NULL THEN
            v_preco_unitario := 0.01;
        END IF;
        
        -- Inserir item no orçamento
        INSERT INTO itens_orcamento (
            orcamento_id,
            categoria,
            etapa,
            insumo,
            quantidade_estimada,
            unidade_medida,
            valor_unitario_base,
            codigo_sinapi,
            sinapi_insumo_id,
            estado_referencia_preco,
            usa_preco_sinapi,
            observacoes
        ) VALUES (
            p_orcamento_id,
            v_coeficiente.categoria,
            v_coeficiente.etapa,
            v_coeficiente.insumo,
            v_quantidade_total,
            v_coeficiente.unidade_medida,
            v_preco_unitario,
            v_coeficiente.codigo_sinapi,
            v_coeficiente.sinapi_insumo_id,
            p_estado,
            CASE WHEN v_coeficiente.codigo_sinapi IS NOT NULL THEN true ELSE false END,
            CASE 
                WHEN v_preco_unitario = 0.01 THEN 'PREÇO SINAPI NÃO ENCONTRADO - VERIFICAR MANUALMENTE'
                WHEN v_coeficiente.codigo_sinapi IS NOT NULL THEN 'PREÇO BASEADO EM SINAPI OFICIAL'
                ELSE 'COEFICIENTE TÉCNICO SEM REFERÊNCIA SINAPI'
            END
        );
        
        v_itens_criados := v_itens_criados + 1;
    END LOOP;
    
    RETURN v_itens_criados;
END;
$$;


ALTER FUNCTION "public"."gerar_orcamento_automatico_sinapi"("p_orcamento_id" "uuid", "p_area_total" numeric, "p_estado" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."gerar_orcamento_automatico_sinapi"("p_orcamento_id" "uuid", "p_area_total" numeric, "p_estado" character varying) IS 'Função para geração automática de orçamentos - requer autenticação';



CREATE OR REPLACE FUNCTION "public"."get_current_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."get_current_tenant_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_current_tenant_id"() IS 'Retorna o tenant_id do usuário autenticado atual';



CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', '')
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limpar_embeddings_antigos"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    registros_removidos INTEGER;
BEGIN
    DELETE FROM sinapi_embeddings 
    WHERE updated_at < NOW() - INTERVAL '90 days'
    AND versao_embedding != '1.0'; -- Manter versão atual
    
    GET DIAGNOSTICS registros_removidos = ROW_COUNT;
    RETURN registros_removidos;
END;
$$;


ALTER FUNCTION "public"."limpar_embeddings_antigos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obter_coeficientes_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum") RETURNS TABLE("categoria" "public"."categoria_enum", "etapa" "public"."etapa_enum", "insumo" "public"."insumo_enum", "quantidade_por_m2" numeric, "unidade_medida" "text", "observacoes_tecnicas" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ct.categoria,
        ct.etapa,
        ct.insumo,
        ct.quantidade_por_m2,
        ct.unidade_medida,
        ct.observacoes_tecnicas
    FROM coeficientes_tecnicos ct
    WHERE ct.tipo_obra = p_tipo_obra
      AND ct.padrao_obra = p_padrao_obra
      AND ct.ativo = true
    ORDER BY 
        CASE ct.etapa
            WHEN 'DEMOLICAO' THEN 1
            WHEN 'ADAPTACAO_ESTRUTURAL' THEN 2
            WHEN 'RECUPERACAO_ESTRUTURAL' THEN 3
            WHEN 'READEQUACAO_INSTALACOES' THEN 4
            WHEN 'REVESTIMENTOS_INTERNOS' THEN 5
            WHEN 'REVESTIMENTOS_EXTERNOS' THEN 6
            WHEN 'PINTURA' THEN 7
            WHEN 'ACABAMENTOS' THEN 8
            ELSE 9
        END,
        ct.categoria,
        ct.insumo;
END;
$$;


ALTER FUNCTION "public"."obter_coeficientes_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."obter_preco_sinapi_por_estado"("p_codigo_insumo" character varying, "p_estado" character varying, "p_mes_referencia" "date" DEFAULT CURRENT_DATE) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    v_preco NUMERIC;
    v_coluna_preco TEXT;
BEGIN
    -- Definir qual coluna de preço usar baseado no estado
    v_coluna_preco := CASE LOWER(p_estado)
        WHEN 'ac' THEN 'preco_ac'
        WHEN 'al' THEN 'preco_al'
        WHEN 'am' THEN 'preco_am'
        WHEN 'ap' THEN 'preco_ap'
        WHEN 'ba' THEN 'preco_ba'
        WHEN 'ce' THEN 'preco_ce'
        WHEN 'df' THEN 'preco_df'
        WHEN 'es' THEN 'preco_es'
        WHEN 'go' THEN 'preco_go'
        WHEN 'ma' THEN 'preco_ma'
        WHEN 'mg' THEN 'preco_mg'
        WHEN 'ms' THEN 'preco_ms'
        WHEN 'mt' THEN 'preco_mt'
        WHEN 'pa' THEN 'preco_pa'
        WHEN 'pb' THEN 'preco_pb'
        WHEN 'pe' THEN 'preco_pe'
        WHEN 'pi' THEN 'preco_pi'
        WHEN 'pr' THEN 'preco_pr'
        WHEN 'rj' THEN 'preco_rj'
        WHEN 'rn' THEN 'preco_rn'
        WHEN 'ro' THEN 'preco_ro'
        WHEN 'rr' THEN 'preco_rr'
        WHEN 'rs' THEN 'preco_rs'
        WHEN 'sc' THEN 'preco_sc'
        WHEN 'se' THEN 'preco_se'
        WHEN 'sp' THEN 'preco_sp'
        WHEN 'to' THEN 'preco_to'
        ELSE 'preco_sp' -- Default para SP se estado não encontrado
    END;
    
    -- Executar consulta dinâmica para buscar o preço
    EXECUTE format('
        SELECT %I 
        FROM sinapi_insumos 
        WHERE codigo_do_insumo = $1 
        AND ativo = true 
        AND mes_referencia <= $2 
        ORDER BY mes_referencia DESC 
        LIMIT 1
    ', v_coluna_preco) 
    INTO v_preco 
    USING p_codigo_insumo, p_mes_referencia;
    
    -- Retornar o preço ou NULL se não encontrado
    RETURN COALESCE(v_preco, NULL);
END;
$_$;


ALTER FUNCTION "public"."obter_preco_sinapi_por_estado"("p_codigo_insumo" character varying, "p_estado" character varying, "p_mes_referencia" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."obter_preco_sinapi_por_estado"("p_codigo_insumo" character varying, "p_estado" character varying, "p_mes_referencia" "date") IS 'Função pública para consulta de preços SINAPI - sem dados sensíveis';



CREATE OR REPLACE FUNCTION "public"."registrar_historico_contrato"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO historico_contratos (contrato_id, acao, descricao, usuario_id, tenant_id)
        VALUES (NEW.id, 'CRIACAO', 'Contrato criado', NEW.criado_por, NEW.tenant_id);
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO historico_contratos (contrato_id, acao, descricao, dados_alteracao, usuario_id, tenant_id)
            VALUES (NEW.id, 'MUDANCA_STATUS', 
                   'Status alterado de ' || OLD.status || ' para ' || NEW.status,
                   jsonb_build_object('status_anterior', OLD.status, 'status_novo', NEW.status),
                   NEW.criado_por, NEW.tenant_id);
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."registrar_historico_contrato"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_ai_insights"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_ai_insights"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_chat_messages"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_chat_messages"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_despesas"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_despesas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_fornecedores_pf"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_fornecedores_pf"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_fornecedores_pj"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_fornecedores_pj"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_notas_fiscais"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_notas_fiscais"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_obras"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_obras"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id_subscriptions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tenant_id = get_current_tenant_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_tenant_id_subscriptions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sincronizar_coeficiente_com_sinapi"("p_coeficiente_id" "uuid", "p_forcar_atualizacao" boolean DEFAULT false) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_codigo_sinapi VARCHAR(50);
    v_sinapi_insumo_id INTEGER;
    v_sinapi_descricao TEXT;
    v_sinapi_unidade VARCHAR(50);
    v_atualizado BOOLEAN := false;
BEGIN
    -- Buscar dados do coeficiente
    SELECT codigo_sinapi, sinapi_insumo_id
    INTO v_codigo_sinapi, v_sinapi_insumo_id
    FROM coeficientes_tecnicos
    WHERE id = p_coeficiente_id;
    
    -- Se tem código SINAPI mas não tem referência, ou se forçar atualização
    IF v_codigo_sinapi IS NOT NULL AND (v_sinapi_insumo_id IS NULL OR p_forcar_atualizacao) THEN
        
        -- Buscar dados mais recentes do SINAPI
        SELECT id, descricao_do_insumo, unidade
        INTO v_sinapi_insumo_id, v_sinapi_descricao, v_sinapi_unidade
        FROM sinapi_insumos
        WHERE codigo_do_insumo = v_codigo_sinapi
        AND ativo = true
        ORDER BY mes_referencia DESC
        LIMIT 1;
        
        -- Se encontrou dados do SINAPI, atualizar o coeficiente
        IF v_sinapi_insumo_id IS NOT NULL THEN
            UPDATE coeficientes_tecnicos
            SET 
                sinapi_insumo_id = v_sinapi_insumo_id,
                -- Atualizar unidade se for diferente (com validação)
                unidade_medida = CASE 
                    WHEN unidade_medida IS NULL OR unidade_medida = '' 
                    THEN v_sinapi_unidade
                    ELSE unidade_medida
                END,
                -- Marcar como validado oficialmente se veio do SINAPI
                validado_oficialmente = true,
                -- Atualizar fonte de dados
                fonte_dados = 'SINAPI_INTEGRADO',
                updated_at = NOW()
            WHERE id = p_coeficiente_id;
            
            v_atualizado := true;
        END IF;
    END IF;
    
    RETURN v_atualizado;
END;
$$;


ALTER FUNCTION "public"."sincronizar_coeficiente_com_sinapi"("p_coeficiente_id" "uuid", "p_forcar_atualizacao" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."sincronizar_coeficiente_com_sinapi"("p_coeficiente_id" "uuid", "p_forcar_atualizacao" boolean) IS 'Sincroniza um coeficiente técnico específico com dados do SINAPI';



CREATE OR REPLACE FUNCTION "public"."sincronizar_todos_coeficientes_sinapi"() RETURNS TABLE("coeficiente_id" "uuid", "codigo_sinapi" character varying, "status_sincronizacao" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_coeficiente RECORD;
    v_resultado BOOLEAN;
BEGIN
    -- Percorrer todos os coeficientes com código SINAPI
    FOR v_coeficiente IN 
        SELECT id, codigo_sinapi 
        FROM coeficientes_tecnicos 
        WHERE codigo_sinapi IS NOT NULL 
        AND ativo = true
    LOOP
        -- Tentar sincronizar cada coeficiente
        SELECT sincronizar_coeficiente_com_sinapi(v_coeficiente.id, false) 
        INTO v_resultado;
        
        -- Retornar resultado
        coeficiente_id := v_coeficiente.id;
        codigo_sinapi := v_coeficiente.codigo_sinapi;
        status_sincronizacao := CASE 
            WHEN v_resultado THEN 'SINCRONIZADO'
            ELSE 'NAO_ENCONTRADO_SINAPI'
        END;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;


ALTER FUNCTION "public"."sincronizar_todos_coeficientes_sinapi"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."sincronizar_todos_coeficientes_sinapi"() IS 'Sincroniza todos os coeficientes técnicos com códigos SINAPI';



CREATE OR REPLACE FUNCTION "public"."trigger_regras_reforma"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Se for reforma, aplicar margem de erro maior
    IF validar_orcamento_reforma(NEW.tipo_obra) THEN
        -- Reformas têm margem de erro maior devido às incertezas
        NEW.margem_erro_estimada := COALESCE(NEW.margem_erro_estimada, 25.0);
        NEW.confianca_estimativa := COALESCE(NEW.confianca_estimativa, 70);
        
        -- Adicionar alertas específicos para reforma
        NEW.alertas_ia := COALESCE(NEW.alertas_ia, ARRAY[]::text[]) || 
                         ARRAY[
                             'Reforma: considere custos adicionais para descobertas imprevistas',
                             'Reforma: tempo de execução pode ser 20-30% maior que obra nova',
                             'Reforma: necessário vistoria prévia detalhada das condições existentes'
                         ];
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_regras_reforma"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversoes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_conversoes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sinapi_composicoes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sinapi_composicoes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sinapi_manutencoes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sinapi_manutencoes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_updated_at_column"() IS 'Atualiza automaticamente a coluna updated_at';



CREATE OR REPLACE FUNCTION "public"."user_can_access_composition"("composition_id" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM composicoes_personalizadas 
        WHERE id = composition_id 
        AND (usuario_id = auth.uid() OR publica = true)
    );
END;
$$;


ALTER FUNCTION "public"."user_can_access_composition"("composition_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_owns_project"("project_id" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projetos 
        WHERE id = project_id 
        AND usuario_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."user_owns_project"("project_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_orcamento_reforma"("p_tipo_obra" "public"."tipo_obra_enum") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN p_tipo_obra IN ('REFORMA_RESIDENCIAL', 'REFORMA_COMERCIAL');
END;
$$;


ALTER FUNCTION "public"."validar_orcamento_reforma"("p_tipo_obra" "public"."tipo_obra_enum") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."aditivos_contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contrato_id" "uuid",
    "numero_aditivo" integer NOT NULL,
    "tipo_aditivo" character varying(50) NOT NULL,
    "descricao_alteracao" "text" NOT NULL,
    "valor_alteracao" numeric(15,2) DEFAULT 0,
    "prazo_alteracao" integer DEFAULT 0,
    "novo_valor_total" numeric(15,2),
    "nova_data_fim" "date",
    "justificativa" "text" NOT NULL,
    "documentos_suporte" "jsonb" DEFAULT '[]'::"jsonb",
    "aprovado_por" character varying(255),
    "status" character varying(50) DEFAULT 'RASCUNHO'::character varying,
    "data_aprovacao" timestamp with time zone,
    "hash_documento" character varying(64),
    "url_documento" "text",
    "criado_por" "uuid",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "aditivos_contratos_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('RASCUNHO'::character varying)::"text", ('AGUARDANDO_APROVACAO'::character varying)::"text", ('APROVADO'::character varying)::"text", ('REJEITADO'::character varying)::"text"]))),
    CONSTRAINT "aditivos_contratos_tipo_aditivo_check" CHECK ((("tipo_aditivo")::"text" = ANY (ARRAY[('VALOR'::character varying)::"text", ('PRAZO'::character varying)::"text", ('ESCOPO'::character varying)::"text", ('MISTO'::character varying)::"text"])))
);


ALTER TABLE "public"."aditivos_contratos" OWNER TO "postgres";


COMMENT ON TABLE "public"."aditivos_contratos" IS 'Aditivos e alterações contratuais';



CREATE TABLE IF NOT EXISTS "public"."ai_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "insight_type" "text" NOT NULL,
    "insight_data" "jsonb",
    "summary_ptbr" "text",
    "generated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."ai_insights" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ai_insights"."tenant_id" IS 'Identificador do tenant para isolamento multi-tenant';



CREATE TABLE IF NOT EXISTS "public"."alertas_desvio" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "tipo_alerta" character varying(20) NOT NULL,
    "percentual_desvio" numeric NOT NULL,
    "valor_orcado" numeric NOT NULL,
    "valor_realizado" numeric NOT NULL,
    "valor_desvio" numeric NOT NULL,
    "categoria" character varying(50),
    "etapa" character varying(50),
    "descricao" "text",
    "status" character varying(20) DEFAULT 'ATIVO'::character varying,
    "notificado_email" boolean DEFAULT false,
    "data_notificacao" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "alertas_desvio_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('ATIVO'::character varying)::"text", ('VISUALIZADO'::character varying)::"text", ('RESOLVIDO'::character varying)::"text", ('IGNORADO'::character varying)::"text"]))),
    CONSTRAINT "alertas_desvio_tipo_alerta_check" CHECK ((("tipo_alerta")::"text" = ANY (ARRAY[('BAIXO'::character varying)::"text", ('MEDIO'::character varying)::"text", ('ALTO'::character varying)::"text", ('CRITICO'::character varying)::"text"])))
);


ALTER TABLE "public"."alertas_desvio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "page" "text",
    "properties" "jsonb" DEFAULT '{}'::"jsonb",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_events" IS 'Tabela para armazenar todos os eventos de analytics do ObrasAI';



COMMENT ON COLUMN "public"."analytics_events"."event_type" IS 'Tipo do evento: lead_captured, user_action, ai_usage, conversion, etc.';



COMMENT ON COLUMN "public"."analytics_events"."user_id" IS 'ID do usuário associado ao evento (se autenticado)';



COMMENT ON COLUMN "public"."analytics_events"."session_id" IS 'ID da sessão para tracking de visitantes anônimos';



COMMENT ON COLUMN "public"."analytics_events"."properties" IS 'Dados adicionais do evento em formato JSON';



COMMENT ON COLUMN "public"."analytics_events"."timestamp" IS 'Timestamp preciso do evento';



CREATE TABLE IF NOT EXISTS "public"."assinaturas_contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contrato_id" "uuid",
    "tipo_assinatura" character varying(50) NOT NULL,
    "nome_assinante" character varying(255) NOT NULL,
    "email_assinante" character varying(255) NOT NULL,
    "documento_assinante" character varying(20),
    "cargo_assinante" character varying(100),
    "token_assinatura" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "data_envio" timestamp with time zone DEFAULT "now"(),
    "data_assinatura" timestamp with time zone,
    "data_expiracao" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "ip_assinatura" "inet",
    "user_agent" "text",
    "coordenadas_assinatura" "jsonb",
    "hash_assinatura" character varying(64),
    "status" character varying(50) DEFAULT 'PENDENTE'::character varying,
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assinaturas_contratos_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('PENDENTE'::character varying)::"text", ('ASSINADO'::character varying)::"text", ('EXPIRADO'::character varying)::"text", ('CANCELADO'::character varying)::"text"]))),
    CONSTRAINT "assinaturas_contratos_tipo_assinatura_check" CHECK ((("tipo_assinatura")::"text" = ANY (ARRAY[('CONTRATANTE'::character varying)::"text", ('CONTRATADO'::character varying)::"text"])))
);


ALTER TABLE "public"."assinaturas_contratos" OWNER TO "postgres";


COMMENT ON TABLE "public"."assinaturas_contratos" IS 'Controle de assinaturas eletrônicas dos contratos';



CREATE TABLE IF NOT EXISTS "public"."bases_custos_regionais" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "estado" "text" NOT NULL,
    "cidade" "text" NOT NULL,
    "regiao" "text",
    "tipo_obra" "public"."tipo_obra_enum" NOT NULL,
    "padrao_obra" "public"."padrao_obra_enum" NOT NULL,
    "custo_m2_base" numeric(8,2) NOT NULL,
    "indice_regional" numeric(5,3) DEFAULT 1.0,
    "fonte_dados" "text" NOT NULL,
    "referencia_cub" "text",
    "data_referencia" "date" NOT NULL,
    "data_atualizacao" timestamp with time zone DEFAULT "now"(),
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bases_custos_regionais_custo_m2_base_check" CHECK (("custo_m2_base" > (0)::numeric)),
    CONSTRAINT "bases_custos_regionais_estado_check" CHECK (("length"("estado") = 2))
);


ALTER TABLE "public"."bases_custos_regionais" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "obra_id" "uuid",
    "mensagem" "text" NOT NULL,
    "resposta_bot" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


COMMENT ON COLUMN "public"."chat_messages"."tenant_id" IS 'Identificador do tenant para isolamento multi-tenant';



CREATE TABLE IF NOT EXISTS "public"."coeficientes_tecnicos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tipo_obra" "public"."tipo_obra_enum" NOT NULL,
    "padrao_obra" "public"."padrao_obra_enum" NOT NULL,
    "categoria" "public"."categoria_enum" NOT NULL,
    "etapa" "public"."etapa_enum" NOT NULL,
    "insumo" "public"."insumo_enum" NOT NULL,
    "quantidade_por_m2" numeric(8,4) NOT NULL,
    "unidade_medida" "text" NOT NULL,
    "fonte_tecnica" "text" NOT NULL,
    "norma_referencia" "text",
    "variacao_minima" numeric(8,4),
    "variacao_maxima" numeric(8,4),
    "observacoes_tecnicas" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "fonte_dados" character varying(50) DEFAULT 'INTERNO'::character varying,
    "codigo_sinapi" character varying(20),
    "validado_oficialmente" boolean DEFAULT false,
    "data_referencia" "date" DEFAULT CURRENT_DATE,
    "sinapi_insumo_id" integer,
    CONSTRAINT "coeficientes_tecnicos_quantidade_por_m2_check" CHECK (("quantidade_por_m2" > (0)::numeric))
);


ALTER TABLE "public"."coeficientes_tecnicos" OWNER TO "postgres";


COMMENT ON TABLE "public"."coeficientes_tecnicos" IS 'Tabela de coeficientes técnicos integrada com SINAPI através dos campos codigo_sinapi e sinapi_insumo_id';



COMMENT ON COLUMN "public"."coeficientes_tecnicos"."sinapi_insumo_id" IS 'Referência ao insumo SINAPI oficial para sincronização de dados';



CREATE TABLE IF NOT EXISTS "public"."comparacoes_orcamento_real" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "orcamento_id" "uuid" NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "valor_orcado" numeric(12,2) NOT NULL,
    "valor_real" numeric(12,2) NOT NULL,
    "desvio_percentual" numeric(6,2) GENERATED ALWAYS AS (
CASE
    WHEN ("valor_orcado" > (0)::numeric) THEN ((("valor_real" - "valor_orcado") / "valor_orcado") * (100)::numeric)
    ELSE (0)::numeric
END) STORED,
    "desvios_por_categoria" "jsonb",
    "desvios_por_etapa" "jsonb",
    "principais_desvios" "text"[],
    "causas_identificadas" "text"[],
    "licoes_aprendidas" "text"[],
    "score_precisao" integer,
    "fatores_sucesso" "text"[],
    "fatores_erro" "text"[],
    "data_inicio_obra" "date",
    "data_fim_obra" "date",
    "data_analise" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "comparacoes_orcamento_real_score_precisao_check" CHECK ((("score_precisao" >= 0) AND ("score_precisao" <= 100)))
);


ALTER TABLE "public"."comparacoes_orcamento_real" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."composicao_insumos" (
    "id" integer NOT NULL,
    "composicao_id" integer NOT NULL,
    "sinapi_insumo_id" integer,
    "descricao_personalizada" "text",
    "unidade" character varying(10) NOT NULL,
    "coeficiente" numeric(10,6) NOT NULL,
    "preco_unitario" numeric(10,4),
    "tipo_insumo" character varying(20) DEFAULT 'MATERIAL'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "composicao_insumos_tipo_insumo_check" CHECK ((("tipo_insumo")::"text" = ANY (ARRAY[('MATERIAL'::character varying)::"text", ('MAO_OBRA'::character varying)::"text", ('EQUIPAMENTO'::character varying)::"text"])))
);


ALTER TABLE "public"."composicao_insumos" OWNER TO "postgres";


COMMENT ON TABLE "public"."composicao_insumos" IS 'Insumos que compõem as composições personalizadas';



CREATE SEQUENCE IF NOT EXISTS "public"."composicao_insumos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."composicao_insumos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."composicao_insumos_id_seq" OWNED BY "public"."composicao_insumos"."id";



CREATE TABLE IF NOT EXISTS "public"."composicoes_personalizadas" (
    "id" integer NOT NULL,
    "usuario_id" "uuid",
    "codigo" character varying(50) NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text",
    "unidade" character varying(10) NOT NULL,
    "categoria" character varying(100),
    "subcategoria" character varying(100),
    "publica" boolean DEFAULT false,
    "ativa" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."composicoes_personalizadas" OWNER TO "postgres";


COMMENT ON TABLE "public"."composicoes_personalizadas" IS 'Composições criadas pelos usuários para serviços específicos';



CREATE SEQUENCE IF NOT EXISTS "public"."composicoes_personalizadas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."composicoes_personalizadas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."composicoes_personalizadas_id_seq" OWNED BY "public"."composicoes_personalizadas"."id";



CREATE TABLE IF NOT EXISTS "public"."configuracoes_alerta" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "threshold_baixo" numeric DEFAULT 5.0,
    "threshold_medio" numeric DEFAULT 10.0,
    "threshold_alto" numeric DEFAULT 15.0,
    "notificar_email" boolean DEFAULT true,
    "notificar_dashboard" boolean DEFAULT true,
    "alertas_por_categoria" "jsonb" DEFAULT '{}'::"jsonb",
    "alertas_por_etapa" "jsonb" DEFAULT '{}'::"jsonb",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."configuracoes_alerta" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."configuracoes_alerta_avancadas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid",
    "usuario_id" "uuid",
    "tenant_id" "uuid",
    "threshold_baixo" numeric(5,2) DEFAULT 5.00,
    "threshold_medio" numeric(5,2) DEFAULT 10.00,
    "threshold_alto" numeric(5,2) DEFAULT 15.00,
    "threshold_critico" numeric(5,2) DEFAULT 25.00,
    "notificar_email" boolean DEFAULT true,
    "notificar_dashboard" boolean DEFAULT true,
    "notificar_webhook" boolean DEFAULT false,
    "webhook_url" "text",
    "alertas_por_categoria" boolean DEFAULT true,
    "alertas_por_etapa" boolean DEFAULT true,
    "frequencia_verificacao" integer DEFAULT 24,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."configuracoes_alerta_avancadas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."construtoras" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "tipo" character varying(10) NOT NULL,
    "nome_razao_social" character varying(255) NOT NULL,
    "nome_fantasia" character varying(255),
    "documento" character varying(20) NOT NULL,
    "inscricao_estadual" character varying(30),
    "email" character varying(255),
    "telefone" character varying(30),
    "endereco" "text",
    "numero" character varying(20),
    "complemento" character varying(100),
    "bairro" character varying(100),
    "cidade" character varying(100),
    "estado" character varying(2),
    "cep" character varying(20),
    "responsavel_tecnico" character varying(255),
    "documento_responsavel" character varying(20),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "construtoras_tipo_check" CHECK ((("tipo")::"text" = ANY (ARRAY[('pj'::character varying)::"text", ('pf'::character varying)::"text"])))
);


ALTER TABLE "public"."construtoras" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contexto_ia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid",
    "tipo_contexto" character varying(50) NOT NULL,
    "conteudo" "text" NOT NULL,
    "embedding" "public"."vector"(1536),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contexto_ia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "numero_contrato" character varying(50) NOT NULL,
    "template_id" "uuid",
    "obra_id" "uuid",
    "titulo" character varying(255) NOT NULL,
    "contratante_nome" character varying(255) NOT NULL,
    "contratante_documento" character varying(20) NOT NULL,
    "contratante_endereco" "text",
    "contratante_email" character varying(255),
    "contratante_telefone" character varying(20),
    "contratado_nome" character varying(255) NOT NULL,
    "contratado_documento" character varying(20) NOT NULL,
    "contratado_endereco" "text",
    "contratado_email" character varying(255) NOT NULL,
    "contratado_telefone" character varying(20),
    "valor_total" numeric(15,2) NOT NULL,
    "forma_pagamento" "text",
    "prazo_execucao" integer,
    "data_inicio" "date",
    "data_fim_prevista" "date",
    "descricao_servicos" "text" NOT NULL,
    "clausulas_especiais" "text",
    "observacoes" "text",
    "variaveis_template" "jsonb" DEFAULT '{}'::"jsonb",
    "status" character varying(50) DEFAULT 'RASCUNHO'::character varying,
    "data_assinatura" timestamp with time zone,
    "hash_documento" character varying(64),
    "url_documento" "text",
    "criado_por" "uuid",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "progresso_execucao" integer DEFAULT 0,
    CONSTRAINT "contratos_progresso_execucao_check" CHECK ((("progresso_execucao" >= 0) AND ("progresso_execucao" <= 100))),
    CONSTRAINT "contratos_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('RASCUNHO'::character varying)::"text", ('AGUARDANDO_ASSINATURA'::character varying)::"text", ('ASSINADO'::character varying)::"text", ('EM_EXECUCAO'::character varying)::"text", ('CONCLUIDO'::character varying)::"text", ('CANCELADO'::character varying)::"text"])))
);


ALTER TABLE "public"."contratos" OWNER TO "postgres";


COMMENT ON TABLE "public"."contratos" IS 'Contratos principais do sistema com dados completos';



COMMENT ON COLUMN "public"."contratos"."progresso_execucao" IS 'Percentual de progresso da execução do contrato (0-100%)';



CREATE TABLE IF NOT EXISTS "public"."conversas_ia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid",
    "obra_id" "uuid",
    "pergunta" "text" NOT NULL,
    "resposta" "text" NOT NULL,
    "contexto_usado" "jsonb" DEFAULT '{}'::"jsonb",
    "contexto_semantico" "jsonb" DEFAULT '{}'::"jsonb",
    "satisfacao" integer,
    "tokens_usados" integer DEFAULT 0,
    "similarity_score" double precision DEFAULT 0,
    "tempo_resposta_ms" integer DEFAULT 0,
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "conversas_ia_satisfacao_check" CHECK ((("satisfacao" >= 1) AND ("satisfacao" <= 5)))
);


ALTER TABLE "public"."conversas_ia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversoes_orcamento_despesa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "orcamento_id" "uuid" NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "data_conversao" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'PENDENTE'::character varying,
    "total_itens_orcamento" integer DEFAULT 0,
    "total_despesas_criadas" integer DEFAULT 0,
    "valor_total_orcamento" numeric(15,2) DEFAULT 0,
    "valor_total_despesas" numeric(15,2) DEFAULT 0,
    "configuracao_mapeamento" "jsonb" DEFAULT '{}'::"jsonb",
    "observacoes" "text",
    "erros_processamento" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "conversoes_orcamento_despesa_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('PENDENTE'::character varying)::"text", ('PROCESSANDO'::character varying)::"text", ('CONCLUIDA'::character varying)::"text", ('ERRO'::character varying)::"text"])))
);


ALTER TABLE "public"."conversoes_orcamento_despesa" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversoes_orcamento_despesa" IS 'Tabela para rastrear conversões de orçamentos paramétricos em despesas reais';



COMMENT ON COLUMN "public"."conversoes_orcamento_despesa"."configuracao_mapeamento" IS 'JSON com configurações de como mapear categorias, etapas e insumos';



COMMENT ON COLUMN "public"."conversoes_orcamento_despesa"."erros_processamento" IS 'Array JSON com erros ocorridos durante o processamento';



CREATE TABLE IF NOT EXISTS "public"."despesas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "usuario_id" "uuid",
    "fornecedor_pj_id" "uuid",
    "fornecedor_pf_id" "uuid",
    "descricao" "text" NOT NULL,
    "data_despesa" "date" DEFAULT CURRENT_DATE NOT NULL,
    "insumo" "public"."insumo_enum",
    "etapa" "public"."etapa_enum",
    "categoria" "public"."categoria_enum",
    "unidade" "text",
    "quantidade" numeric(10,2) DEFAULT 1.00 NOT NULL,
    "valor_unitario" numeric(12,2) NOT NULL,
    "custo" numeric(12,2) NOT NULL,
    "numero_nf" "text",
    "observacoes" "text",
    "pago" boolean DEFAULT false NOT NULL,
    "data_pagamento" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "forma_pagamento" "text",
    "tenant_id" "uuid",
    "codigo_sinapi" character varying(20),
    "valor_referencia_sinapi" numeric(10,2),
    "variacao_sinapi" numeric(5,2),
    "fonte_sinapi" character varying(50),
    "estado_referencia" character varying(2)
);


ALTER TABLE "public"."despesas" OWNER TO "postgres";


COMMENT ON COLUMN "public"."despesas"."codigo_sinapi" IS 'Código do item SINAPI selecionado como referência';



COMMENT ON COLUMN "public"."despesas"."valor_referencia_sinapi" IS 'Valor unitário de referência do SINAPI';



COMMENT ON COLUMN "public"."despesas"."variacao_sinapi" IS 'Variação percentual entre valor pago e referência SINAPI';



COMMENT ON COLUMN "public"."despesas"."fonte_sinapi" IS 'Fonte dos dados SINAPI: dados_oficiais, insumos ou composicoes';



COMMENT ON COLUMN "public"."despesas"."estado_referencia" IS 'Estado de referência para os preços SINAPI';



CREATE TABLE IF NOT EXISTS "public"."embeddings_conhecimento" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid",
    "tipo_conteudo" character varying(50) NOT NULL,
    "referencia_id" "uuid" NOT NULL,
    "titulo" "text" NOT NULL,
    "conteudo" "text" NOT NULL,
    "conteudo_resumido" "text",
    "embedding" "public"."vector"(1536),
    "titulo_embedding" "public"."vector"(1536),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tokens_usados" integer DEFAULT 0,
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."embeddings_conhecimento" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fornecedores_pf" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "usuario_id" "uuid",
    "cpf" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "rg" "text",
    "data_nascimento" "date",
    "tipo_fornecedor" "text",
    "email" "text",
    "telefone_principal" "text",
    "telefone_secundario" "text",
    "endereco" "text",
    "numero" "text",
    "complemento" "text",
    "bairro" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."fornecedores_pf" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fornecedores_pj" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "usuario_id" "uuid",
    "cnpj" "text" NOT NULL,
    "razao_social" "text" NOT NULL,
    "nome_fantasia" "text",
    "inscricao_estadual" "text",
    "inscricao_municipal" "text",
    "email" "text",
    "telefone_principal" "text",
    "telefone_secundario" "text",
    "website" "text",
    "endereco" "text",
    "numero" "text",
    "complemento" "text",
    "bairro" "text",
    "cidade" "text",
    "estado" "text",
    "cep" "text",
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."fornecedores_pj" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."historico_alertas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alerta_id" "uuid",
    "obra_id" "uuid",
    "usuario_id" "uuid",
    "tenant_id" "uuid",
    "tipo_alerta" "text" NOT NULL,
    "percentual_desvio" numeric(10,2),
    "valor_orcado" numeric(15,2),
    "valor_realizado" numeric(15,2),
    "valor_desvio" numeric(15,2),
    "acao" "text" NOT NULL,
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."historico_alertas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."historico_buscas_ia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid",
    "obra_id" "uuid",
    "query_original" "text" NOT NULL,
    "query_processada" "text",
    "tipo_busca" "text" NOT NULL,
    "resultados_encontrados" integer DEFAULT 0,
    "tempo_resposta_ms" integer DEFAULT 0,
    "embedding_query" "public"."vector"(1536),
    "filtros_aplicados" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "historico_buscas_ia_tipo_busca_check" CHECK (("tipo_busca" = ANY (ARRAY['sinapi_semantica'::"text", 'conhecimento'::"text", 'documentos'::"text"])))
);


ALTER TABLE "public"."historico_buscas_ia" OWNER TO "postgres";


COMMENT ON TABLE "public"."historico_buscas_ia" IS 'Histórico de buscas semânticas realizadas pelos usuários';



CREATE TABLE IF NOT EXISTS "public"."historico_contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contrato_id" "uuid",
    "acao" character varying(100) NOT NULL,
    "descricao" "text",
    "dados_alteracao" "jsonb" DEFAULT '{}'::"jsonb",
    "usuario_id" "uuid",
    "ip_usuario" "inet",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."historico_contratos" OWNER TO "postgres";


COMMENT ON TABLE "public"."historico_contratos" IS 'Log de todas as ações realizadas nos contratos';



CREATE TABLE IF NOT EXISTS "public"."ia_contratos_interacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "contrato_id" "uuid",
    "pergunta" "text" NOT NULL,
    "resposta" "text" NOT NULL,
    "contexto_contrato" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sugestoes_geradas" "jsonb" DEFAULT '[]'::"jsonb",
    "qualidade_resposta" numeric(3,2),
    "feedback_usuario" integer,
    "tempo_resposta_ms" integer DEFAULT 0,
    "modelo_ia" character varying(50) DEFAULT 'deepseek'::character varying,
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ia_contratos_interacoes_feedback_usuario_check" CHECK ((("feedback_usuario" >= 1) AND ("feedback_usuario" <= 5))),
    CONSTRAINT "ia_contratos_interacoes_qualidade_resposta_check" CHECK ((("qualidade_resposta" >= (0)::numeric) AND ("qualidade_resposta" <= (1)::numeric)))
);


ALTER TABLE "public"."ia_contratos_interacoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."ia_contratos_interacoes" IS 'Tabela para armazenar interações da IA especializada em contratos';



COMMENT ON COLUMN "public"."ia_contratos_interacoes"."contexto_contrato" IS 'Contexto do contrato usado para gerar a resposta';



COMMENT ON COLUMN "public"."ia_contratos_interacoes"."sugestoes_geradas" IS 'Array JSON das sugestões geradas pela IA';



COMMENT ON COLUMN "public"."ia_contratos_interacoes"."qualidade_resposta" IS 'Score de qualidade da resposta de 0.00 a 1.00';



COMMENT ON COLUMN "public"."ia_contratos_interacoes"."feedback_usuario" IS 'Avaliação do usuário de 1 a 5 estrelas';



COMMENT ON COLUMN "public"."ia_contratos_interacoes"."modelo_ia" IS 'Modelo de IA utilizado (deepseek, gpt-4, etc)';



CREATE TABLE IF NOT EXISTS "public"."ia_sugestoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid",
    "obra_id" "uuid",
    "tipo_sugestao" "text" NOT NULL,
    "titulo" "text" NOT NULL,
    "descricao" "text" NOT NULL,
    "dados_contexto" "jsonb" DEFAULT '{}'::"jsonb",
    "prioridade" integer DEFAULT 3,
    "status" "text" DEFAULT 'pendente'::"text",
    "confidence_score" numeric(3,2),
    "economia_estimada" numeric(15,2),
    "impacto_cronograma" integer,
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ia_sugestoes_prioridade_check" CHECK ((("prioridade" >= 1) AND ("prioridade" <= 5))),
    CONSTRAINT "ia_sugestoes_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'visualizada'::"text", 'aplicada'::"text", 'rejeitada'::"text"]))),
    CONSTRAINT "ia_sugestoes_tipo_sugestao_check" CHECK (("tipo_sugestao" = ANY (ARRAY['insumo_alternativo'::"text", 'otimizacao_custo'::"text", 'melhoria_processo'::"text", 'alerta_orcamento'::"text", 'recomendacao_geral'::"text"])))
);


ALTER TABLE "public"."ia_sugestoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."ia_sugestoes" IS 'Sugestões e recomendações geradas pela IA';



CREATE TABLE IF NOT EXISTS "public"."itens_orcamento" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "orcamento_id" "uuid" NOT NULL,
    "categoria" "public"."categoria_enum" NOT NULL,
    "etapa" "public"."etapa_enum" NOT NULL,
    "insumo" "public"."insumo_enum" NOT NULL,
    "quantidade_estimada" numeric(10,3) NOT NULL,
    "unidade_medida" "text" NOT NULL,
    "valor_unitario_base" numeric(10,2) NOT NULL,
    "valor_total" numeric(12,2) GENERATED ALWAYS AS (("quantidade_estimada" * "valor_unitario_base")) STORED,
    "fonte_preco" "text",
    "indice_regional" numeric(5,3) DEFAULT 1.0,
    "coeficiente_tecnico" numeric(8,4),
    "observacoes" "text",
    "alternativas_sugeridas" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "sinapi_insumo_id" integer,
    "codigo_sinapi" character varying(50),
    "estado_referencia_preco" character varying(2) DEFAULT 'SP'::character varying,
    "usa_preco_sinapi" boolean DEFAULT false,
    CONSTRAINT "itens_orcamento_quantidade_estimada_check" CHECK (("quantidade_estimada" > (0)::numeric)),
    CONSTRAINT "itens_orcamento_valor_unitario_base_check" CHECK (("valor_unitario_base" > (0)::numeric))
);


ALTER TABLE "public"."itens_orcamento" OWNER TO "postgres";


COMMENT ON COLUMN "public"."itens_orcamento"."sinapi_insumo_id" IS 'Referência direta ao insumo SINAPI oficial para obter preços atualizados';



COMMENT ON COLUMN "public"."itens_orcamento"."codigo_sinapi" IS 'Código SINAPI do insumo para busca rápida e referência';



COMMENT ON COLUMN "public"."itens_orcamento"."estado_referencia_preco" IS 'Estado (UF) usado como referência para preço regionalizado do SINAPI';



COMMENT ON COLUMN "public"."itens_orcamento"."usa_preco_sinapi" IS 'Indica se o item deve usar preço oficial do SINAPI automaticamente';



CREATE TABLE IF NOT EXISTS "public"."leads" (
    "email" character varying(255) NOT NULL,
    "nome" character varying(255),
    "telefone" character varying(255),
    "empresa" character varying(255),
    "cargo" character varying(255),
    "interesse" character varying(100),
    "origem" character varying(100),
    "data_lead" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."metricas_ia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid",
    "obra_id" "uuid",
    "funcao_ia" character varying(50) NOT NULL,
    "tokens_usados" integer DEFAULT 0,
    "tempo_resposta" integer DEFAULT 0,
    "custo_api" numeric(10,6) DEFAULT 0,
    "sucesso" boolean DEFAULT true,
    "erro_detalhes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."metricas_ia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notas_fiscais" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "obra_id" "uuid" NOT NULL,
    "despesa_id" "uuid",
    "fornecedor_pj_id" "uuid",
    "fornecedor_pf_id" "uuid",
    "numero" "text",
    "data_emissao" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valor_total" numeric(12,2) NOT NULL,
    "arquivo_url" "text",
    "arquivo_path" "text",
    "chave_acesso" "text",
    "descricao" "text",
    "usuario_upload_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."notas_fiscais" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notificacoes_alertas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alerta_id" "uuid",
    "usuario_id" "uuid",
    "tenant_id" "uuid",
    "tipo_notificacao" "text" NOT NULL,
    "status" "text" DEFAULT 'PENDENTE'::"text",
    "titulo" "text" NOT NULL,
    "mensagem" "text" NOT NULL,
    "dados_extras" "jsonb",
    "tentativas" integer DEFAULT 0,
    "max_tentativas" integer DEFAULT 3,
    "proximo_envio" timestamp with time zone,
    "enviada_em" timestamp with time zone,
    "lida_em" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notificacoes_alertas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."obras" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "endereco" "text" NOT NULL,
    "cidade" "text" NOT NULL,
    "estado" "text" NOT NULL,
    "cep" "text" NOT NULL,
    "data_inicio" "date",
    "data_prevista_termino" "date",
    "orcamento" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid",
    "construtora_id" "uuid" NOT NULL
);


ALTER TABLE "public"."obras" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orcamentos_parametricos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "obra_id" "uuid",
    "usuario_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "nome_orcamento" "text" NOT NULL,
    "descricao" "text",
    "tipo_obra" "public"."tipo_obra_enum" NOT NULL,
    "padrao_obra" "public"."padrao_obra_enum" NOT NULL,
    "estado" "text" NOT NULL,
    "cidade" "text" NOT NULL,
    "cep" "text",
    "area_total" numeric(10,2) NOT NULL,
    "area_construida" numeric(10,2),
    "area_detalhada" "jsonb",
    "especificacoes" "jsonb",
    "parametros_entrada" "jsonb",
    "custo_estimado" numeric(12,2) NOT NULL,
    "custo_m2" numeric(8,2) NOT NULL,
    "margem_erro_estimada" numeric(5,2) DEFAULT 15.0,
    "confianca_estimativa" integer DEFAULT 80,
    "parametros_ia" "jsonb",
    "sugestoes_ia" "text"[],
    "alertas_ia" "text"[],
    "status" "public"."status_orcamento_enum" DEFAULT 'RASCUNHO'::"public"."status_orcamento_enum",
    "data_calculo" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "orcamentos_parametricos_area_total_check" CHECK (("area_total" > (0)::numeric)),
    CONSTRAINT "orcamentos_parametricos_confianca_estimativa_check" CHECK ((("confianca_estimativa" >= 0) AND ("confianca_estimativa" <= 100))),
    CONSTRAINT "orcamentos_parametricos_custo_estimado_check" CHECK (("custo_estimado" >= (0)::numeric)),
    CONSTRAINT "orcamentos_parametricos_custo_m2_check" CHECK (("custo_m2" > (0)::numeric)),
    CONSTRAINT "orcamentos_parametricos_estado_check" CHECK (("length"("estado") = 2))
);


ALTER TABLE "public"."orcamentos_parametricos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfis_usuario" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text",
    "tipo" character varying(30) NOT NULL,
    "dashboard_padrao" character varying(30) DEFAULT 'atendimento'::character varying NOT NULL,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."perfis_usuario" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissoes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "modulo" character varying(50) NOT NULL,
    "acao" character varying(20) NOT NULL,
    "permitido" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planta_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "obra_id" "uuid",
    "filename" "text" NOT NULL,
    "analysis_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."planta_analyses" OWNER TO "postgres";


COMMENT ON TABLE "public"."planta_analyses" IS 'Armazena análises de plantas baixas realizadas pela IA';



COMMENT ON COLUMN "public"."planta_analyses"."analysis_data" IS 'JSON com dados da análise: áreas, cômodos, materiais, orçamento, etc.';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "cpf" "text",
    "telefone" "text",
    "data_nascimento" "date",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."tenant_id" IS 'Identificador do tenant para isolamento multi-tenant';



CREATE TABLE IF NOT EXISTS "public"."sinapi_composicoes_mao_obra" (
    "id" integer NOT NULL,
    "codigo_composicao" character varying(20) NOT NULL,
    "grupo" character varying(255) NOT NULL,
    "descricao" "text" NOT NULL,
    "unidade" character varying(10) NOT NULL,
    "preco_sem_ac" numeric(10,4),
    "preco_sem_al" numeric(10,4),
    "preco_sem_am" numeric(10,4),
    "preco_sem_ap" numeric(10,4),
    "preco_sem_ba" numeric(10,4),
    "preco_sem_ce" numeric(10,4),
    "preco_sem_df" numeric(10,4),
    "preco_sem_es" numeric(10,4),
    "preco_sem_go" numeric(10,4),
    "preco_sem_ma" numeric(10,4),
    "preco_sem_mg" numeric(10,4),
    "preco_sem_ms" numeric(10,4),
    "preco_sem_mt" numeric(10,4),
    "preco_sem_pa" numeric(10,4),
    "preco_sem_pb" numeric(10,4),
    "preco_sem_pe" numeric(10,4),
    "preco_sem_pi" numeric(10,4),
    "preco_sem_pr" numeric(10,4),
    "preco_sem_rj" numeric(10,4),
    "preco_sem_rn" numeric(10,4),
    "preco_sem_ro" numeric(10,4),
    "preco_sem_rr" numeric(10,4),
    "preco_sem_rs" numeric(10,4),
    "preco_sem_sc" numeric(10,4),
    "preco_sem_se" numeric(10,4),
    "preco_sem_sp" numeric(10,4),
    "preco_sem_to" numeric(10,4),
    "preco_com_ac" numeric(10,4),
    "preco_com_al" numeric(10,4),
    "preco_com_am" numeric(10,4),
    "preco_com_ap" numeric(10,4),
    "preco_com_ba" numeric(10,4),
    "preco_com_ce" numeric(10,4),
    "preco_com_df" numeric(10,4),
    "preco_com_es" numeric(10,4),
    "preco_com_go" numeric(10,4),
    "preco_com_ma" numeric(10,4),
    "preco_com_mg" numeric(10,4),
    "preco_com_ms" numeric(10,4),
    "preco_com_mt" numeric(10,4),
    "preco_com_pa" numeric(10,4),
    "preco_com_pb" numeric(10,4),
    "preco_com_pe" numeric(10,4),
    "preco_com_pi" numeric(10,4),
    "preco_com_pr" numeric(10,4),
    "preco_com_rj" numeric(10,4),
    "preco_com_rn" numeric(10,4),
    "preco_com_ro" numeric(10,4),
    "preco_com_rr" numeric(10,4),
    "preco_com_rs" numeric(10,4),
    "preco_com_sc" numeric(10,4),
    "preco_com_se" numeric(10,4),
    "preco_com_sp" numeric(10,4),
    "preco_com_to" numeric(10,4),
    "mes_referencia" "date" DEFAULT CURRENT_DATE NOT NULL,
    "fonte_dados" character varying(50) DEFAULT 'SINAPI_OFICIAL'::character varying,
    "ativo" boolean DEFAULT true,
    "importado_em" timestamp without time zone DEFAULT "now"(),
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."sinapi_composicoes_mao_obra" OWNER TO "postgres";


COMMENT ON TABLE "public"."sinapi_composicoes_mao_obra" IS 'Composições SINAPI de mão de obra - dados públicos oficiais sem RLS';



COMMENT ON COLUMN "public"."sinapi_composicoes_mao_obra"."codigo_composicao" IS 'Código oficial SINAPI da composição';



COMMENT ON COLUMN "public"."sinapi_composicoes_mao_obra"."grupo" IS 'Grupo de serviços (ex: Acessibilidade, Alvenaria Estrutural)';



COMMENT ON COLUMN "public"."sinapi_composicoes_mao_obra"."descricao" IS 'Descrição completa do serviço/composição';



COMMENT ON COLUMN "public"."sinapi_composicoes_mao_obra"."unidade" IS 'Unidade de medida (M2, M3, UN, etc.)';



CREATE SEQUENCE IF NOT EXISTS "public"."sinapi_composicoes_mao_obra_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."sinapi_composicoes_mao_obra_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sinapi_composicoes_mao_obra_id_seq" OWNED BY "public"."sinapi_composicoes_mao_obra"."id";



CREATE TABLE IF NOT EXISTS "public"."sinapi_dados_oficiais" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "codigo_sinapi" character varying(20) NOT NULL,
    "descricao_insumo" "text" NOT NULL,
    "unidade_medida" character varying(10) NOT NULL,
    "preco_unitario" numeric(12,4) NOT NULL,
    "estado" character varying(2) NOT NULL,
    "mes_referencia" "date" NOT NULL,
    "fonte_dados" character varying(100) DEFAULT 'SINAPI/IBGE'::character varying,
    "categoria" character varying(50),
    "subcategoria" character varying(100),
    "tipo_insumo" character varying(30),
    "ativo" boolean DEFAULT true,
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sinapi_dados_oficiais_tipo_insumo_check" CHECK ((("tipo_insumo")::"text" = ANY (ARRAY[('MATERIAL'::character varying)::"text", ('SERVICO'::character varying)::"text", ('MAO_DE_OBRA'::character varying)::"text", ('EQUIPAMENTO'::character varying)::"text"])))
);


ALTER TABLE "public"."sinapi_dados_oficiais" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sinapi_dados_oficiais_backup" (
    "id" "uuid",
    "codigo_sinapi" character varying(20),
    "descricao_insumo" "text",
    "unidade_medida" character varying(10),
    "preco_unitario" numeric(12,4),
    "estado" character varying(2),
    "mes_referencia" "date",
    "fonte_dados" character varying(100),
    "categoria" character varying(50),
    "subcategoria" character varying(100),
    "tipo_insumo" character varying(30),
    "ativo" boolean,
    "observacoes" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."sinapi_dados_oficiais_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sinapi_embeddings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "codigo_sinapi" "text" NOT NULL,
    "tipo_item" "text" NOT NULL,
    "descricao" "text" NOT NULL,
    "descricao_processada" "text",
    "embedding" "public"."vector"(1536),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "versao_embedding" "text" DEFAULT '1.0'::"text",
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sinapi_embeddings_tipo_item_check" CHECK (("tipo_item" = ANY (ARRAY['insumo'::"text", 'composicao'::"text"])))
);


ALTER TABLE "public"."sinapi_embeddings" OWNER TO "postgres";


COMMENT ON TABLE "public"."sinapi_embeddings" IS 'Cache de embeddings dos dados SINAPI para busca semântica';



CREATE TABLE IF NOT EXISTS "public"."sinapi_insumos" (
    "id" integer NOT NULL,
    "codigo_da_familia" character varying(20),
    "codigo_do_insumo" character varying(20) NOT NULL,
    "descricao_do_insumo" "text" NOT NULL,
    "unidade" character varying(50),
    "categoria" character varying(50),
    "preco_ac" numeric(12,4),
    "preco_al" numeric(12,4),
    "preco_am" numeric(12,4),
    "preco_ap" numeric(12,4),
    "preco_ba" numeric(12,4),
    "preco_ce" numeric(12,4),
    "preco_df" numeric(12,4),
    "preco_es" numeric(12,4),
    "preco_go" numeric(12,4),
    "preco_ma" numeric(12,4),
    "preco_mg" numeric(12,4),
    "preco_ms" numeric(12,4),
    "preco_mt" numeric(12,4),
    "preco_pa" numeric(12,4),
    "preco_pb" numeric(12,4),
    "preco_pe" numeric(12,4),
    "preco_pi" numeric(12,4),
    "preco_pr" numeric(12,4),
    "preco_rj" numeric(12,4),
    "preco_rn" numeric(12,4),
    "preco_ro" numeric(12,4),
    "preco_rr" numeric(12,4),
    "preco_rs" numeric(12,4),
    "preco_sc" numeric(12,4),
    "preco_se" numeric(12,4),
    "preco_sp" numeric(12,4),
    "preco_to" numeric(12,4),
    "mes_referencia" "date" DEFAULT CURRENT_DATE NOT NULL,
    "importado_em" timestamp without time zone DEFAULT "now"(),
    "ativo" boolean DEFAULT true
);


ALTER TABLE "public"."sinapi_insumos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sinapi_insumos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."sinapi_insumos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sinapi_insumos_id_seq" OWNED BY "public"."sinapi_insumos"."id";



CREATE TABLE IF NOT EXISTS "public"."sinapi_manutencoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "data_referencia" "date" NOT NULL,
    "tipo" character varying(20) NOT NULL,
    "codigo_sinapi" integer NOT NULL,
    "descricao" "text" NOT NULL,
    "tipo_manutencao" character varying(100) NOT NULL,
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sinapi_manutencoes_tipo_check" CHECK ((("tipo")::"text" = ANY (ARRAY[('INSUMO'::character varying)::"text", ('COMPOSIÇÃO'::character varying)::"text"])))
);


ALTER TABLE "public"."sinapi_manutencoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."sinapi_manutencoes" IS 'Tabela para armazenar dados oficiais de manutenções do SINAPI - 25.361 registros de alterações, inclusões e exclusões';



COMMENT ON COLUMN "public"."sinapi_manutencoes"."data_referencia" IS 'Data da manutenção/alteração no SINAPI';



COMMENT ON COLUMN "public"."sinapi_manutencoes"."tipo" IS 'Tipo do item: INSUMO ou COMPOSIÇÃO';



COMMENT ON COLUMN "public"."sinapi_manutencoes"."codigo_sinapi" IS 'Código oficial SINAPI do item';



COMMENT ON COLUMN "public"."sinapi_manutencoes"."descricao" IS 'Descrição detalhada do item';



COMMENT ON COLUMN "public"."sinapi_manutencoes"."tipo_manutencao" IS 'Tipo de manutenção: ALTERAÇÃO DE DESCRIÇÃO, INCLUSÃO, EXCLUSÃO, etc.';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_product_id" "text",
    "stripe_price_id" "text",
    "status" "text",
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tenant_id" "uuid"
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."subscriptions"."tenant_id" IS 'Identificador do tenant para isolamento multi-tenant';



CREATE TABLE IF NOT EXISTS "public"."templates_contratos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text",
    "categoria" character varying(100) DEFAULT 'CONSTRUCAO'::character varying NOT NULL,
    "template_html" "text" NOT NULL,
    "campos_variaveis" "jsonb" DEFAULT '{}'::"jsonb",
    "clausulas_obrigatorias" "jsonb" DEFAULT '[]'::"jsonb",
    "valor_minimo" numeric(15,2),
    "valor_maximo" numeric(15,2),
    "ativo" boolean DEFAULT true,
    "versao" integer DEFAULT 1,
    "tenant_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "ia_prompts" "jsonb" DEFAULT '{}'::"jsonb",
    "ia_sugestoes_padrao" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."templates_contratos" OWNER TO "postgres";


COMMENT ON TABLE "public"."templates_contratos" IS 'Templates reutilizáveis para geração de contratos';



COMMENT ON COLUMN "public"."templates_contratos"."ia_prompts" IS 'Prompts específicos para IA por tipo de seção do contrato';



COMMENT ON COLUMN "public"."templates_contratos"."ia_sugestoes_padrao" IS 'Sugestões padrão da IA para este tipo de template';



CREATE OR REPLACE VIEW "public"."tenant_statistics" AS
 SELECT "p"."tenant_id",
    "count"(DISTINCT "o"."id") AS "total_obras",
    "count"(DISTINCT "d"."id") AS "total_despesas",
    "count"(DISTINCT "fp"."id") AS "total_fornecedores_pf",
    "count"(DISTINCT "fj"."id") AS "total_fornecedores_pj",
    "count"(DISTINCT "nf"."id") AS "total_notas_fiscais",
    "count"(DISTINCT "ai"."id") AS "total_ai_insights",
    "count"(DISTINCT "cm"."id") AS "total_chat_messages",
    COALESCE("sum"("d"."custo"), (0)::numeric) AS "total_custos",
    COALESCE("sum"("o"."orcamento"), (0)::numeric) AS "total_orcamentos"
   FROM ((((((("public"."profiles" "p"
     LEFT JOIN "public"."obras" "o" ON (("o"."tenant_id" = "p"."tenant_id")))
     LEFT JOIN "public"."despesas" "d" ON (("d"."tenant_id" = "p"."tenant_id")))
     LEFT JOIN "public"."fornecedores_pf" "fp" ON (("fp"."tenant_id" = "p"."tenant_id")))
     LEFT JOIN "public"."fornecedores_pj" "fj" ON (("fj"."tenant_id" = "p"."tenant_id")))
     LEFT JOIN "public"."notas_fiscais" "nf" ON (("nf"."tenant_id" = "p"."tenant_id")))
     LEFT JOIN "public"."ai_insights" "ai" ON (("ai"."tenant_id" = "p"."tenant_id")))
     LEFT JOIN "public"."chat_messages" "cm" ON (("cm"."tenant_id" = "p"."tenant_id")))
  GROUP BY "p"."tenant_id";


ALTER TABLE "public"."tenant_statistics" OWNER TO "postgres";


COMMENT ON VIEW "public"."tenant_statistics" IS 'Estatísticas agregadas por tenant para monitoramento';



CREATE TABLE IF NOT EXISTS "public"."user_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "last_request_at" timestamp with time zone DEFAULT "now"(),
    "request_count" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_rate_limits" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_rate_limits" IS 'Controla rate limiting por usuário e ação';



COMMENT ON COLUMN "public"."user_rate_limits"."action" IS 'Tipo de ação: analyze_planta, ai_chat, etc.';



COMMENT ON COLUMN "public"."user_rate_limits"."request_count" IS 'Número de requests no período atual';



CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "supabase_auth_id" "uuid",
    "nome" character varying(255),
    "email" character varying(255) NOT NULL,
    "telefone" character varying(20),
    "perfil_id" "uuid",
    "ativo" boolean DEFAULT true,
    "ultimo_acesso" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_coeficientes_tecnicos_sinapi" AS
 SELECT "ct"."id",
    "ct"."tipo_obra",
    "ct"."padrao_obra",
    "ct"."categoria",
    "ct"."etapa",
    "ct"."insumo",
    "ct"."quantidade_por_m2",
    "ct"."unidade_medida",
    "ct"."fonte_tecnica",
    "ct"."codigo_sinapi",
    "ct"."validado_oficialmente",
    "si"."descricao_do_insumo" AS "sinapi_descricao",
    "si"."unidade" AS "sinapi_unidade",
    "si"."categoria" AS "sinapi_categoria",
    "si"."mes_referencia" AS "sinapi_mes_referencia",
    "si"."preco_sp",
    "si"."preco_rj",
    "si"."preco_mg",
    "si"."preco_rs",
    "si"."preco_pr",
    "ct"."ativo",
    "ct"."created_at",
    "ct"."updated_at"
   FROM ("public"."coeficientes_tecnicos" "ct"
     LEFT JOIN "public"."sinapi_insumos" "si" ON (("ct"."sinapi_insumo_id" = "si"."id")));


ALTER TABLE "public"."v_coeficientes_tecnicos_sinapi" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_coeficientes_tecnicos_sinapi" IS 'View de coeficientes técnicos integrados com dados SINAPI';



CREATE OR REPLACE VIEW "public"."v_itens_orcamento_sinapi" AS
 SELECT "io"."id",
    "io"."orcamento_id",
    "io"."categoria",
    "io"."etapa",
    "io"."insumo",
    "io"."quantidade_estimada",
    "io"."unidade_medida",
    "io"."valor_unitario_base",
    "io"."valor_total",
    "io"."codigo_sinapi",
    "io"."estado_referencia_preco",
    "io"."usa_preco_sinapi",
    "io"."observacoes",
    "si"."codigo_do_insumo" AS "sinapi_codigo",
    "si"."descricao_do_insumo" AS "sinapi_descricao",
    "si"."unidade" AS "sinapi_unidade",
    "si"."categoria" AS "sinapi_categoria",
    "si"."mes_referencia" AS "sinapi_mes_referencia",
    "public"."obter_preco_sinapi_por_estado"("io"."codigo_sinapi", COALESCE("io"."estado_referencia_preco", 'SP'::character varying), CURRENT_DATE) AS "preco_sinapi_atual",
        CASE
            WHEN ("io"."usa_preco_sinapi" = true) THEN 'SINAPI_OFICIAL'::"text"
            WHEN ("io"."codigo_sinapi" IS NOT NULL) THEN 'MANUAL_COM_REFERENCIA'::"text"
            ELSE 'MANUAL_SEM_REFERENCIA'::"text"
        END AS "tipo_precificacao",
        CASE
            WHEN (("io"."codigo_sinapi" IS NOT NULL) AND ("public"."obter_preco_sinapi_por_estado"("io"."codigo_sinapi", COALESCE("io"."estado_referencia_preco", 'SP'::character varying), CURRENT_DATE) > (0)::numeric)) THEN "round"(((("io"."valor_unitario_base" - "public"."obter_preco_sinapi_por_estado"("io"."codigo_sinapi", COALESCE("io"."estado_referencia_preco", 'SP'::character varying), CURRENT_DATE)) / "public"."obter_preco_sinapi_por_estado"("io"."codigo_sinapi", COALESCE("io"."estado_referencia_preco", 'SP'::character varying), CURRENT_DATE)) * (100)::numeric), 2)
            ELSE NULL::numeric
        END AS "diferenca_percentual_sinapi",
    "io"."created_at",
    "io"."updated_at"
   FROM ("public"."itens_orcamento" "io"
     LEFT JOIN "public"."sinapi_insumos" "si" ON (("io"."sinapi_insumo_id" = "si"."id")))
  WHERE ("io"."orcamento_id" IS NOT NULL);


ALTER TABLE "public"."v_itens_orcamento_sinapi" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_itens_orcamento_sinapi" IS 'View integrada de itens de orçamento com dados SINAPI e análise de preços';



CREATE OR REPLACE VIEW "public"."v_orcamento_analise_sinapi" AS
 SELECT "op"."id" AS "orcamento_id",
    "op"."nome_orcamento",
    "op"."tipo_obra",
    "op"."padrao_obra",
    "op"."estado",
    "op"."cidade",
    "op"."area_total",
    "op"."custo_estimado",
    "op"."custo_m2",
    "count"("vios"."id") AS "total_itens",
    "count"(
        CASE
            WHEN ("vios"."usa_preco_sinapi" = true) THEN 1
            ELSE NULL::integer
        END) AS "itens_preco_sinapi",
    "count"(
        CASE
            WHEN ("vios"."codigo_sinapi" IS NOT NULL) THEN 1
            ELSE NULL::integer
        END) AS "itens_com_referencia_sinapi",
    "sum"("vios"."valor_total") AS "valor_total_itens",
    "sum"(
        CASE
            WHEN ("vios"."usa_preco_sinapi" = true) THEN "vios"."valor_total"
            ELSE (0)::numeric
        END) AS "valor_com_preco_sinapi",
    "round"(((("count"(
        CASE
            WHEN ("vios"."usa_preco_sinapi" = true) THEN 1
            ELSE NULL::integer
        END))::numeric / (NULLIF("count"("vios"."id"), 0))::numeric) * (100)::numeric), 2) AS "percentual_aderencia_sinapi",
    "round"("avg"(
        CASE
            WHEN ("vios"."diferenca_percentual_sinapi" IS NOT NULL) THEN "vios"."diferenca_percentual_sinapi"
            ELSE NULL::numeric
        END), 2) AS "diferenca_media_sinapi",
    "op"."created_at",
    "op"."updated_at"
   FROM ("public"."orcamentos_parametricos" "op"
     LEFT JOIN "public"."v_itens_orcamento_sinapi" "vios" ON (("op"."id" = "vios"."orcamento_id")))
  GROUP BY "op"."id", "op"."nome_orcamento", "op"."tipo_obra", "op"."padrao_obra", "op"."estado", "op"."cidade", "op"."area_total", "op"."custo_estimado", "op"."custo_m2", "op"."created_at", "op"."updated_at";


ALTER TABLE "public"."v_orcamento_analise_sinapi" OWNER TO "postgres";


COMMENT ON VIEW "public"."v_orcamento_analise_sinapi" IS 'View de análise de orçamentos com estatísticas de aderência ao SINAPI';



CREATE OR REPLACE VIEW "public"."vw_comparativo_desoneracao" AS
 SELECT "scm"."codigo_composicao",
    "scm"."descricao",
    "scm"."unidade",
    "scm"."grupo",
    "scm"."preco_sem_sp" AS "preco_sem_desoneracao",
    "scm"."preco_com_sp" AS "preco_com_desoneracao",
    ("scm"."preco_sem_sp" - "scm"."preco_com_sp") AS "diferenca_absoluta",
        CASE
            WHEN ("scm"."preco_sem_sp" > (0)::numeric) THEN "round"(((("scm"."preco_sem_sp" - "scm"."preco_com_sp") * (100)::numeric) / "scm"."preco_sem_sp"), 2)
            ELSE (0)::numeric
        END AS "diferenca_percentual",
        CASE
            WHEN (("scm"."preco_sem_sp" > (0)::numeric) AND (((("scm"."preco_sem_sp" - "scm"."preco_com_sp") * (100)::numeric) / "scm"."preco_sem_sp") > (15)::numeric)) THEN 'ALTA'::"text"
            WHEN (("scm"."preco_sem_sp" > (0)::numeric) AND (((("scm"."preco_sem_sp" - "scm"."preco_com_sp") * (100)::numeric) / "scm"."preco_sem_sp") > (5)::numeric)) THEN 'MÉDIA'::"text"
            WHEN (("scm"."preco_sem_sp" > (0)::numeric) AND (((("scm"."preco_sem_sp" - "scm"."preco_com_sp") * (100)::numeric) / "scm"."preco_sem_sp") > (0)::numeric)) THEN 'BAIXA'::"text"
            ELSE 'NENHUMA'::"text"
        END AS "nivel_economia"
   FROM "public"."sinapi_composicoes_mao_obra" "scm"
  WHERE (("scm"."preco_sem_sp" IS NOT NULL) AND ("scm"."preco_com_sp" IS NOT NULL) AND ("scm"."preco_sem_sp" > (0)::numeric))
  ORDER BY
        CASE
            WHEN ("scm"."preco_sem_sp" > (0)::numeric) THEN "round"(((("scm"."preco_sem_sp" - "scm"."preco_com_sp") * (100)::numeric) / "scm"."preco_sem_sp"), 2)
            ELSE (0)::numeric
        END DESC;


ALTER TABLE "public"."vw_comparativo_desoneracao" OWNER TO "postgres";


COMMENT ON VIEW "public"."vw_comparativo_desoneracao" IS 'Comparativo de preços com e sem desoneração para análise de economia';



CREATE TABLE IF NOT EXISTS "public"."webhooks_alertas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "configuracao_id" "uuid",
    "alerta_id" "uuid",
    "tenant_id" "uuid",
    "url" "text" NOT NULL,
    "metodo" "text" DEFAULT 'POST'::"text",
    "headers" "jsonb",
    "payload" "jsonb",
    "status" "text" DEFAULT 'PENDENTE'::"text",
    "codigo_resposta" integer,
    "resposta" "text",
    "tentativas" integer DEFAULT 0,
    "max_tentativas" integer DEFAULT 3,
    "proximo_envio" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "enviado_em" timestamp with time zone
);


ALTER TABLE "public"."webhooks_alertas" OWNER TO "postgres";


ALTER TABLE ONLY "public"."composicao_insumos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."composicao_insumos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."composicoes_personalizadas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."composicoes_personalizadas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sinapi_composicoes_mao_obra" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sinapi_composicoes_mao_obra_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sinapi_insumos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sinapi_insumos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."aditivos_contratos"
    ADD CONSTRAINT "aditivos_contratos_contrato_id_numero_aditivo_key" UNIQUE ("contrato_id", "numero_aditivo");



ALTER TABLE ONLY "public"."aditivos_contratos"
    ADD CONSTRAINT "aditivos_contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_insights"
    ADD CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alertas_desvio"
    ADD CONSTRAINT "alertas_desvio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assinaturas_contratos"
    ADD CONSTRAINT "assinaturas_contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assinaturas_contratos"
    ADD CONSTRAINT "assinaturas_contratos_token_assinatura_key" UNIQUE ("token_assinatura");



ALTER TABLE ONLY "public"."bases_custos_regionais"
    ADD CONSTRAINT "bases_custos_regionais_estado_cidade_tipo_obra_padrao_obra__key" UNIQUE ("estado", "cidade", "tipo_obra", "padrao_obra", "data_referencia");



ALTER TABLE ONLY "public"."bases_custos_regionais"
    ADD CONSTRAINT "bases_custos_regionais_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coeficientes_tecnicos"
    ADD CONSTRAINT "coeficientes_tecnicos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coeficientes_tecnicos"
    ADD CONSTRAINT "coeficientes_tecnicos_tipo_obra_padrao_obra_categoria_etapa_key" UNIQUE ("tipo_obra", "padrao_obra", "categoria", "etapa", "insumo");



ALTER TABLE ONLY "public"."comparacoes_orcamento_real"
    ADD CONSTRAINT "comparacoes_orcamento_real_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."composicao_insumos"
    ADD CONSTRAINT "composicao_insumos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."composicao_insumos"
    ADD CONSTRAINT "composicao_insumos_unique" UNIQUE ("composicao_id", "sinapi_insumo_id", "descricao_personalizada");



ALTER TABLE ONLY "public"."composicoes_personalizadas"
    ADD CONSTRAINT "composicoes_personalizadas_codigo_unique" UNIQUE ("codigo", "usuario_id");



ALTER TABLE ONLY "public"."composicoes_personalizadas"
    ADD CONSTRAINT "composicoes_personalizadas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracoes_alerta_avancadas"
    ADD CONSTRAINT "configuracoes_alerta_avancadas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracoes_alerta"
    ADD CONSTRAINT "configuracoes_alerta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."construtoras"
    ADD CONSTRAINT "construtoras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."construtoras"
    ADD CONSTRAINT "construtoras_tenant_id_documento_key" UNIQUE ("tenant_id", "documento");



ALTER TABLE ONLY "public"."contexto_ia"
    ADD CONSTRAINT "contexto_ia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_numero_contrato_key" UNIQUE ("numero_contrato");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversas_ia"
    ADD CONSTRAINT "conversas_ia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversoes_orcamento_despesa"
    ADD CONSTRAINT "conversoes_orcamento_despesa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."despesas"
    ADD CONSTRAINT "despesas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embeddings_conhecimento"
    ADD CONSTRAINT "embeddings_conhecimento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fornecedores_pf"
    ADD CONSTRAINT "fornecedores_pf_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."fornecedores_pf"
    ADD CONSTRAINT "fornecedores_pf_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fornecedores_pj"
    ADD CONSTRAINT "fornecedores_pj_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."fornecedores_pj"
    ADD CONSTRAINT "fornecedores_pj_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historico_alertas"
    ADD CONSTRAINT "historico_alertas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historico_buscas_ia"
    ADD CONSTRAINT "historico_buscas_ia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."historico_contratos"
    ADD CONSTRAINT "historico_contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ia_contratos_interacoes"
    ADD CONSTRAINT "ia_contratos_interacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ia_sugestoes"
    ADD CONSTRAINT "ia_sugestoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itens_orcamento"
    ADD CONSTRAINT "itens_orcamento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_final_pkey" PRIMARY KEY ("email");



ALTER TABLE ONLY "public"."metricas_ia"
    ADD CONSTRAINT "metricas_ia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_chave_acesso_key" UNIQUE ("chave_acesso");



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificacoes_alertas"
    ADD CONSTRAINT "notificacoes_alertas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orcamentos_parametricos"
    ADD CONSTRAINT "orcamentos_parametricos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfis_usuario"
    ADD CONSTRAINT "perfis_usuario_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."perfis_usuario"
    ADD CONSTRAINT "perfis_usuario_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."planta_analyses"
    ADD CONSTRAINT "planta_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sinapi_composicoes_mao_obra"
    ADD CONSTRAINT "sinapi_composicoes_mao_obra_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sinapi_dados_oficiais"
    ADD CONSTRAINT "sinapi_dados_oficiais_codigo_sinapi_estado_mes_referencia_key" UNIQUE ("codigo_sinapi", "estado", "mes_referencia");



ALTER TABLE ONLY "public"."sinapi_dados_oficiais"
    ADD CONSTRAINT "sinapi_dados_oficiais_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sinapi_embeddings"
    ADD CONSTRAINT "sinapi_embeddings_codigo_sinapi_tipo_item_tenant_id_key" UNIQUE ("codigo_sinapi", "tipo_item", "tenant_id");



ALTER TABLE ONLY "public"."sinapi_embeddings"
    ADD CONSTRAINT "sinapi_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sinapi_insumos"
    ADD CONSTRAINT "sinapi_insumos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sinapi_manutencoes"
    ADD CONSTRAINT "sinapi_manutencoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."templates_contratos"
    ADD CONSTRAINT "templates_contratos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sinapi_insumos"
    ADD CONSTRAINT "uk_sinapi_codigo_insumo_mes" UNIQUE ("codigo_do_insumo", "mes_referencia");



ALTER TABLE ONLY "public"."sinapi_composicoes_mao_obra"
    ADD CONSTRAINT "uk_sinapi_composicoes_codigo" UNIQUE ("codigo_composicao");



ALTER TABLE ONLY "public"."user_rate_limits"
    ADD CONSTRAINT "user_rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_rate_limits"
    ADD CONSTRAINT "user_rate_limits_user_id_action_key" UNIQUE ("user_id", "action");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_supabase_auth_id_key" UNIQUE ("supabase_auth_id");



ALTER TABLE ONLY "public"."webhooks_alertas"
    ADD CONSTRAINT "webhooks_alertas_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_aditivos_contrato" ON "public"."aditivos_contratos" USING "btree" ("contrato_id");



CREATE INDEX "idx_aditivos_status" ON "public"."aditivos_contratos" USING "btree" ("status");



CREATE INDEX "idx_aditivos_tenant" ON "public"."aditivos_contratos" USING "btree" ("tenant_id");



CREATE INDEX "idx_aditivos_tipo" ON "public"."aditivos_contratos" USING "btree" ("tipo_aditivo");



CREATE INDEX "idx_ai_insights_tenant_id" ON "public"."ai_insights" USING "btree" ("tenant_id");



CREATE INDEX "idx_alertas_desvio_created_at" ON "public"."alertas_desvio" USING "btree" ("created_at");



CREATE INDEX "idx_alertas_desvio_obra_id" ON "public"."alertas_desvio" USING "btree" ("obra_id");



CREATE INDEX "idx_alertas_desvio_status" ON "public"."alertas_desvio" USING "btree" ("status");



CREATE INDEX "idx_alertas_desvio_tenant_id" ON "public"."alertas_desvio" USING "btree" ("tenant_id");



CREATE INDEX "idx_analytics_events_event_type" ON "public"."analytics_events" USING "btree" ("event_type");



CREATE INDEX "idx_analytics_events_session_id" ON "public"."analytics_events" USING "btree" ("session_id");



CREATE INDEX "idx_analytics_events_timestamp" ON "public"."analytics_events" USING "btree" ("timestamp");



CREATE INDEX "idx_analytics_events_type_timestamp" ON "public"."analytics_events" USING "btree" ("event_type", "timestamp");



CREATE INDEX "idx_analytics_events_user_id" ON "public"."analytics_events" USING "btree" ("user_id");



CREATE INDEX "idx_assinaturas_contrato" ON "public"."assinaturas_contratos" USING "btree" ("contrato_id");



CREATE INDEX "idx_assinaturas_email" ON "public"."assinaturas_contratos" USING "btree" ("email_assinante");



CREATE INDEX "idx_assinaturas_status" ON "public"."assinaturas_contratos" USING "btree" ("status");



CREATE INDEX "idx_assinaturas_tenant" ON "public"."assinaturas_contratos" USING "btree" ("tenant_id");



CREATE INDEX "idx_assinaturas_token" ON "public"."assinaturas_contratos" USING "btree" ("token_assinatura");



CREATE INDEX "idx_chat_messages_tenant_id" ON "public"."chat_messages" USING "btree" ("tenant_id");



CREATE INDEX "idx_coef_codigo_sinapi" ON "public"."coeficientes_tecnicos" USING "btree" ("codigo_sinapi");



CREATE INDEX "idx_coef_fonte_dados" ON "public"."coeficientes_tecnicos" USING "btree" ("fonte_dados");



CREATE INDEX "idx_coeficientes_ativo" ON "public"."coeficientes_tecnicos" USING "btree" ("ativo");



CREATE INDEX "idx_coeficientes_insumo" ON "public"."coeficientes_tecnicos" USING "btree" ("categoria", "etapa", "insumo");



CREATE INDEX "idx_coeficientes_tecnicos_sinapi_insumo_id" ON "public"."coeficientes_tecnicos" USING "btree" ("sinapi_insumo_id");



CREATE INDEX "idx_coeficientes_tipo_padrao" ON "public"."coeficientes_tecnicos" USING "btree" ("tipo_obra", "padrao_obra");



CREATE INDEX "idx_comparacoes_obra_id" ON "public"."comparacoes_orcamento_real" USING "btree" ("obra_id");



CREATE INDEX "idx_comparacoes_orcamento_id" ON "public"."comparacoes_orcamento_real" USING "btree" ("orcamento_id");



CREATE INDEX "idx_comparacoes_tenant_id" ON "public"."comparacoes_orcamento_real" USING "btree" ("tenant_id");



CREATE INDEX "idx_composicao_insumos_composicao" ON "public"."composicao_insumos" USING "btree" ("composicao_id");



CREATE INDEX "idx_composicao_insumos_sinapi" ON "public"."composicao_insumos" USING "btree" ("sinapi_insumo_id");



CREATE INDEX "idx_composicoes_categoria" ON "public"."composicoes_personalizadas" USING "btree" ("categoria");



CREATE INDEX "idx_composicoes_publica" ON "public"."composicoes_personalizadas" USING "btree" ("publica") WHERE ("publica" = true);



CREATE INDEX "idx_composicoes_usuario" ON "public"."composicoes_personalizadas" USING "btree" ("usuario_id");



CREATE INDEX "idx_configuracoes_alerta_avancadas_obra_id" ON "public"."configuracoes_alerta_avancadas" USING "btree" ("obra_id");



CREATE INDEX "idx_configuracoes_alerta_avancadas_tenant_id" ON "public"."configuracoes_alerta_avancadas" USING "btree" ("tenant_id");



CREATE INDEX "idx_configuracoes_alerta_avancadas_usuario_id" ON "public"."configuracoes_alerta_avancadas" USING "btree" ("usuario_id");



CREATE INDEX "idx_configuracoes_alerta_obra_id" ON "public"."configuracoes_alerta" USING "btree" ("obra_id");



CREATE INDEX "idx_configuracoes_alerta_tenant_id" ON "public"."configuracoes_alerta" USING "btree" ("tenant_id");



CREATE INDEX "idx_contexto_ia_embedding" ON "public"."contexto_ia" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_contexto_ia_obra_id" ON "public"."contexto_ia" USING "btree" ("obra_id");



CREATE INDEX "idx_contexto_ia_tenant_id" ON "public"."contexto_ia" USING "btree" ("tenant_id");



CREATE INDEX "idx_contratos_contratado_email" ON "public"."contratos" USING "btree" ("contratado_email");



CREATE INDEX "idx_contratos_data_criacao" ON "public"."contratos" USING "btree" ("created_at");



CREATE INDEX "idx_contratos_numero" ON "public"."contratos" USING "btree" ("numero_contrato");



CREATE INDEX "idx_contratos_obra" ON "public"."contratos" USING "btree" ("obra_id");



CREATE INDEX "idx_contratos_progresso" ON "public"."contratos" USING "btree" ("progresso_execucao");



CREATE INDEX "idx_contratos_status" ON "public"."contratos" USING "btree" ("status");



CREATE INDEX "idx_contratos_tenant" ON "public"."contratos" USING "btree" ("tenant_id");



CREATE INDEX "idx_conversas_ia_created_at" ON "public"."conversas_ia" USING "btree" ("created_at");



CREATE INDEX "idx_conversas_ia_obra_id" ON "public"."conversas_ia" USING "btree" ("obra_id");



CREATE INDEX "idx_conversas_ia_tenant_id" ON "public"."conversas_ia" USING "btree" ("tenant_id");



CREATE INDEX "idx_conversas_ia_usuario_id" ON "public"."conversas_ia" USING "btree" ("usuario_id");



CREATE INDEX "idx_conversoes_data" ON "public"."conversoes_orcamento_despesa" USING "btree" ("data_conversao");



CREATE INDEX "idx_conversoes_obra_id" ON "public"."conversoes_orcamento_despesa" USING "btree" ("obra_id");



CREATE INDEX "idx_conversoes_orcamento_id" ON "public"."conversoes_orcamento_despesa" USING "btree" ("orcamento_id");



CREATE INDEX "idx_conversoes_status" ON "public"."conversoes_orcamento_despesa" USING "btree" ("status");



CREATE INDEX "idx_conversoes_tenant_id" ON "public"."conversoes_orcamento_despesa" USING "btree" ("tenant_id");



CREATE INDEX "idx_conversoes_usuario_id" ON "public"."conversoes_orcamento_despesa" USING "btree" ("usuario_id");



CREATE INDEX "idx_custos_ativo" ON "public"."bases_custos_regionais" USING "btree" ("ativo");



CREATE INDEX "idx_custos_localizacao" ON "public"."bases_custos_regionais" USING "btree" ("estado", "cidade");



CREATE INDEX "idx_custos_tipo_padrao" ON "public"."bases_custos_regionais" USING "btree" ("tipo_obra", "padrao_obra");



CREATE INDEX "idx_despesas_tenant_id" ON "public"."despesas" USING "btree" ("tenant_id");



CREATE INDEX "idx_embeddings_embedding" ON "public"."embeddings_conhecimento" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_embeddings_obra_id" ON "public"."embeddings_conhecimento" USING "btree" ("obra_id");



CREATE INDEX "idx_embeddings_referencia_id" ON "public"."embeddings_conhecimento" USING "btree" ("referencia_id");



CREATE INDEX "idx_embeddings_tenant_id" ON "public"."embeddings_conhecimento" USING "btree" ("tenant_id");



CREATE INDEX "idx_embeddings_tipo_conteudo" ON "public"."embeddings_conhecimento" USING "btree" ("tipo_conteudo");



CREATE INDEX "idx_embeddings_titulo_embedding" ON "public"."embeddings_conhecimento" USING "ivfflat" ("titulo_embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_fornecedores_pf_tenant_id" ON "public"."fornecedores_pf" USING "btree" ("tenant_id");



CREATE INDEX "idx_fornecedores_pj_tenant_id" ON "public"."fornecedores_pj" USING "btree" ("tenant_id");



CREATE INDEX "idx_historico_acao" ON "public"."historico_contratos" USING "btree" ("acao");



CREATE INDEX "idx_historico_alertas_alerta_id" ON "public"."historico_alertas" USING "btree" ("alerta_id");



CREATE INDEX "idx_historico_alertas_created_at" ON "public"."historico_alertas" USING "btree" ("created_at");



CREATE INDEX "idx_historico_alertas_obra_id" ON "public"."historico_alertas" USING "btree" ("obra_id");



CREATE INDEX "idx_historico_buscas_created" ON "public"."historico_buscas_ia" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_historico_buscas_obra" ON "public"."historico_buscas_ia" USING "btree" ("obra_id");



CREATE INDEX "idx_historico_buscas_tenant" ON "public"."historico_buscas_ia" USING "btree" ("tenant_id");



CREATE INDEX "idx_historico_buscas_tipo" ON "public"."historico_buscas_ia" USING "btree" ("tipo_busca");



CREATE INDEX "idx_historico_buscas_usuario" ON "public"."historico_buscas_ia" USING "btree" ("usuario_id");



CREATE INDEX "idx_historico_contrato" ON "public"."historico_contratos" USING "btree" ("contrato_id");



CREATE INDEX "idx_historico_data" ON "public"."historico_contratos" USING "btree" ("created_at");



CREATE INDEX "idx_historico_tenant" ON "public"."historico_contratos" USING "btree" ("tenant_id");



CREATE INDEX "idx_historico_usuario" ON "public"."historico_contratos" USING "btree" ("usuario_id");



CREATE INDEX "idx_ia_contratos_interacoes_contrato" ON "public"."ia_contratos_interacoes" USING "btree" ("contrato_id");



CREATE INDEX "idx_ia_contratos_interacoes_data" ON "public"."ia_contratos_interacoes" USING "btree" ("created_at");



CREATE INDEX "idx_ia_contratos_interacoes_qualidade" ON "public"."ia_contratos_interacoes" USING "btree" ("qualidade_resposta");



CREATE INDEX "idx_ia_contratos_interacoes_user" ON "public"."ia_contratos_interacoes" USING "btree" ("user_id");



CREATE INDEX "idx_ia_sugestoes_obra" ON "public"."ia_sugestoes" USING "btree" ("obra_id");



CREATE INDEX "idx_ia_sugestoes_prioridade" ON "public"."ia_sugestoes" USING "btree" ("prioridade" DESC);



CREATE INDEX "idx_ia_sugestoes_status" ON "public"."ia_sugestoes" USING "btree" ("status");



CREATE INDEX "idx_ia_sugestoes_tenant" ON "public"."ia_sugestoes" USING "btree" ("tenant_id");



CREATE INDEX "idx_ia_sugestoes_tipo" ON "public"."ia_sugestoes" USING "btree" ("tipo_sugestao");



CREATE INDEX "idx_itens_categoria_etapa" ON "public"."itens_orcamento" USING "btree" ("categoria", "etapa");



CREATE INDEX "idx_itens_insumo" ON "public"."itens_orcamento" USING "btree" ("insumo");



CREATE INDEX "idx_itens_orcamento_codigo_sinapi" ON "public"."itens_orcamento" USING "btree" ("codigo_sinapi");



CREATE INDEX "idx_itens_orcamento_estado_referencia" ON "public"."itens_orcamento" USING "btree" ("estado_referencia_preco");



CREATE INDEX "idx_itens_orcamento_id" ON "public"."itens_orcamento" USING "btree" ("orcamento_id");



CREATE INDEX "idx_itens_orcamento_sinapi_insumo_id" ON "public"."itens_orcamento" USING "btree" ("sinapi_insumo_id");



CREATE INDEX "idx_leads_data_lead" ON "public"."leads" USING "btree" ("data_lead");



CREATE INDEX "idx_leads_origem" ON "public"."leads" USING "btree" ("origem");



CREATE INDEX "idx_metricas_ia_created_at" ON "public"."metricas_ia" USING "btree" ("created_at");



CREATE INDEX "idx_metricas_ia_funcao_ia" ON "public"."metricas_ia" USING "btree" ("funcao_ia");



CREATE INDEX "idx_metricas_ia_obra_id" ON "public"."metricas_ia" USING "btree" ("obra_id");



CREATE INDEX "idx_metricas_ia_tenant_id" ON "public"."metricas_ia" USING "btree" ("tenant_id");



CREATE INDEX "idx_metricas_ia_usuario_id" ON "public"."metricas_ia" USING "btree" ("usuario_id");



CREATE INDEX "idx_notas_fiscais_tenant_id" ON "public"."notas_fiscais" USING "btree" ("tenant_id");



CREATE INDEX "idx_notificacoes_alertas_created_at" ON "public"."notificacoes_alertas" USING "btree" ("created_at");



CREATE INDEX "idx_notificacoes_alertas_status" ON "public"."notificacoes_alertas" USING "btree" ("status");



CREATE INDEX "idx_notificacoes_alertas_usuario_id" ON "public"."notificacoes_alertas" USING "btree" ("usuario_id");



CREATE INDEX "idx_obras_tenant_id" ON "public"."obras" USING "btree" ("tenant_id");



CREATE INDEX "idx_orcamentos_localizacao" ON "public"."orcamentos_parametricos" USING "btree" ("estado", "cidade");



CREATE INDEX "idx_orcamentos_obra_id" ON "public"."orcamentos_parametricos" USING "btree" ("obra_id");



CREATE INDEX "idx_orcamentos_status" ON "public"."orcamentos_parametricos" USING "btree" ("status");



CREATE INDEX "idx_orcamentos_tenant_id" ON "public"."orcamentos_parametricos" USING "btree" ("tenant_id");



CREATE INDEX "idx_orcamentos_tipo_padrao" ON "public"."orcamentos_parametricos" USING "btree" ("tipo_obra", "padrao_obra");



CREATE INDEX "idx_orcamentos_usuario_id" ON "public"."orcamentos_parametricos" USING "btree" ("usuario_id");



CREATE INDEX "idx_planta_analyses_created_at" ON "public"."planta_analyses" USING "btree" ("created_at");



CREATE INDEX "idx_planta_analyses_obra_id" ON "public"."planta_analyses" USING "btree" ("obra_id");



CREATE INDEX "idx_planta_analyses_user_id" ON "public"."planta_analyses" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_tenant_id" ON "public"."profiles" USING "btree" ("tenant_id");



CREATE UNIQUE INDEX "idx_profiles_tenant_id_unique" ON "public"."profiles" USING "btree" ("tenant_id");



CREATE INDEX "idx_sinapi_ativo" ON "public"."sinapi_insumos" USING "btree" ("ativo");



CREATE INDEX "idx_sinapi_categoria" ON "public"."sinapi_dados_oficiais" USING "btree" ("categoria", "subcategoria");



CREATE INDEX "idx_sinapi_codigo" ON "public"."sinapi_dados_oficiais" USING "btree" ("codigo_sinapi");



CREATE INDEX "idx_sinapi_codigo_familia" ON "public"."sinapi_insumos" USING "btree" ("codigo_da_familia");



CREATE INDEX "idx_sinapi_codigo_insumo" ON "public"."sinapi_insumos" USING "btree" ("codigo_do_insumo");



CREATE INDEX "idx_sinapi_composicoes_ativo" ON "public"."sinapi_composicoes_mao_obra" USING "btree" ("ativo") WHERE ("ativo" = true);



CREATE INDEX "idx_sinapi_composicoes_codigo" ON "public"."sinapi_composicoes_mao_obra" USING "btree" ("codigo_composicao");



CREATE INDEX "idx_sinapi_composicoes_descricao" ON "public"."sinapi_composicoes_mao_obra" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "descricao"));



CREATE INDEX "idx_sinapi_composicoes_grupo" ON "public"."sinapi_composicoes_mao_obra" USING "btree" ("grupo");



CREATE INDEX "idx_sinapi_dados_ativo_preco" ON "public"."sinapi_dados_oficiais" USING "btree" ("ativo", "preco_unitario") WHERE ("preco_unitario" > (0)::numeric);



CREATE INDEX "idx_sinapi_dados_categoria" ON "public"."sinapi_dados_oficiais" USING "btree" ("categoria", "subcategoria");



CREATE INDEX "idx_sinapi_dados_codigo" ON "public"."sinapi_dados_oficiais" USING "btree" ("codigo_sinapi");



CREATE INDEX "idx_sinapi_dados_edge_function" ON "public"."sinapi_dados_oficiais" USING "btree" ("estado", "tipo_insumo", "ativo", "preco_unitario") WHERE (("ativo" = true) AND ("preco_unitario" > (0)::numeric));



CREATE INDEX "idx_sinapi_dados_estado_tipo" ON "public"."sinapi_dados_oficiais" USING "btree" ("estado", "tipo_insumo");



CREATE INDEX "idx_sinapi_embeddings_codigo" ON "public"."sinapi_embeddings" USING "btree" ("codigo_sinapi");



CREATE INDEX "idx_sinapi_embeddings_tenant" ON "public"."sinapi_embeddings" USING "btree" ("tenant_id");



CREATE INDEX "idx_sinapi_embeddings_tipo" ON "public"."sinapi_embeddings" USING "btree" ("tipo_item");



CREATE INDEX "idx_sinapi_estado_mes" ON "public"."sinapi_dados_oficiais" USING "btree" ("estado", "mes_referencia");



CREATE INDEX "idx_sinapi_manutencoes_codigo" ON "public"."sinapi_manutencoes" USING "btree" ("codigo_sinapi");



CREATE INDEX "idx_sinapi_manutencoes_codigo_data" ON "public"."sinapi_manutencoes" USING "btree" ("codigo_sinapi", "data_referencia" DESC);



CREATE INDEX "idx_sinapi_manutencoes_data" ON "public"."sinapi_manutencoes" USING "btree" ("data_referencia");



CREATE INDEX "idx_sinapi_manutencoes_tenant" ON "public"."sinapi_manutencoes" USING "btree" ("tenant_id");



CREATE INDEX "idx_sinapi_manutencoes_tipo" ON "public"."sinapi_manutencoes" USING "btree" ("tipo");



CREATE INDEX "idx_sinapi_manutencoes_tipo_manutencao" ON "public"."sinapi_manutencoes" USING "btree" ("tipo_manutencao");



CREATE INDEX "idx_sinapi_mes_ativo" ON "public"."sinapi_insumos" USING "btree" ("mes_referencia", "ativo");



CREATE INDEX "idx_sinapi_mes_ref" ON "public"."sinapi_insumos" USING "btree" ("mes_referencia");



CREATE INDEX "idx_sinapi_tipo" ON "public"."sinapi_dados_oficiais" USING "btree" ("tipo_insumo");



CREATE INDEX "idx_sinapi_unidade" ON "public"."sinapi_insumos" USING "btree" ("unidade");



CREATE INDEX "idx_subscriptions_tenant_id" ON "public"."subscriptions" USING "btree" ("tenant_id");



CREATE INDEX "idx_templates_contratos_ativo" ON "public"."templates_contratos" USING "btree" ("ativo");



CREATE INDEX "idx_templates_contratos_categoria" ON "public"."templates_contratos" USING "btree" ("categoria");



CREATE INDEX "idx_templates_contratos_tenant" ON "public"."templates_contratos" USING "btree" ("tenant_id");



CREATE INDEX "idx_user_rate_limits_last_request" ON "public"."user_rate_limits" USING "btree" ("last_request_at");



CREATE INDEX "idx_user_rate_limits_user_action" ON "public"."user_rate_limits" USING "btree" ("user_id", "action");



CREATE INDEX "idx_usuarios_email" ON "public"."usuarios" USING "btree" ("email");



CREATE INDEX "idx_usuarios_perfil_id" ON "public"."usuarios" USING "btree" ("perfil_id");



CREATE INDEX "idx_webhooks_alertas_proximo_envio" ON "public"."webhooks_alertas" USING "btree" ("proximo_envio");



CREATE INDEX "idx_webhooks_alertas_status" ON "public"."webhooks_alertas" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "set_despesas_updated_at" BEFORE UPDATE ON "public"."despesas" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_fornecedores_pf_updated_at" BEFORE UPDATE ON "public"."fornecedores_pf" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_fornecedores_pj_updated_at" BEFORE UPDATE ON "public"."fornecedores_pj" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_notas_fiscais_updated_at" BEFORE UPDATE ON "public"."notas_fiscais" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_obras_updated_at" BEFORE UPDATE ON "public"."obras" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_atualizar_preco_sinapi" BEFORE INSERT OR UPDATE ON "public"."itens_orcamento" FOR EACH ROW EXECUTE FUNCTION "public"."atualizar_preco_item_sinapi"();



CREATE OR REPLACE TRIGGER "trigger_composicoes_personalizadas_updated_at" BEFORE UPDATE ON "public"."composicoes_personalizadas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_conversoes_updated_at" BEFORE UPDATE ON "public"."conversoes_orcamento_despesa" FOR EACH ROW EXECUTE FUNCTION "public"."update_conversoes_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_generate_tenant_id_profiles" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."generate_tenant_id_for_new_user"();



CREATE OR REPLACE TRIGGER "trigger_gerar_numero_contrato" BEFORE INSERT ON "public"."contratos" FOR EACH ROW EXECUTE FUNCTION "public"."gerar_numero_contrato"();



CREATE OR REPLACE TRIGGER "trigger_historico_contrato" AFTER INSERT OR UPDATE ON "public"."contratos" FOR EACH ROW EXECUTE FUNCTION "public"."registrar_historico_contrato"();



CREATE OR REPLACE TRIGGER "trigger_regras_reforma" BEFORE INSERT OR UPDATE ON "public"."orcamentos_parametricos" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_regras_reforma"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_ai_insights" BEFORE INSERT ON "public"."ai_insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_ai_insights"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_chat_messages" BEFORE INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_chat_messages"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_despesas" BEFORE INSERT ON "public"."despesas" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_despesas"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_fornecedores_pf" BEFORE INSERT ON "public"."fornecedores_pf" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_fornecedores_pf"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_fornecedores_pj" BEFORE INSERT ON "public"."fornecedores_pj" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_fornecedores_pj"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_notas_fiscais" BEFORE INSERT ON "public"."notas_fiscais" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_notas_fiscais"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_obras" BEFORE INSERT ON "public"."obras" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_obras"();



CREATE OR REPLACE TRIGGER "trigger_set_tenant_id_subscriptions" BEFORE INSERT ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."set_tenant_id_subscriptions"();



CREATE OR REPLACE TRIGGER "trigger_update_sinapi_composicoes_updated_at" BEFORE UPDATE ON "public"."sinapi_composicoes_mao_obra" FOR EACH ROW EXECUTE FUNCTION "public"."update_sinapi_composicoes_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_sinapi_manutencoes_updated_at" BEFORE UPDATE ON "public"."sinapi_manutencoes" FOR EACH ROW EXECUTE FUNCTION "public"."update_sinapi_manutencoes_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_despesas" BEFORE UPDATE ON "public"."despesas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_fornecedores_pf" BEFORE UPDATE ON "public"."fornecedores_pf" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_fornecedores_pj" BEFORE UPDATE ON "public"."fornecedores_pj" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_notas_fiscais" BEFORE UPDATE ON "public"."notas_fiscais" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_obras" BEFORE UPDATE ON "public"."obras" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_profiles" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_updated_at_subscriptions" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_aditivos_contratos_updated_at" BEFORE UPDATE ON "public"."aditivos_contratos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_alertas_desvio_updated_at" BEFORE UPDATE ON "public"."alertas_desvio" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_assinaturas_contratos_updated_at" BEFORE UPDATE ON "public"."assinaturas_contratos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bases_custos_regionais_updated_at" BEFORE UPDATE ON "public"."bases_custos_regionais" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_coeficientes_tecnicos_updated_at" BEFORE UPDATE ON "public"."coeficientes_tecnicos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comparacoes_orcamento_real_updated_at" BEFORE UPDATE ON "public"."comparacoes_orcamento_real" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_configuracoes_alerta_avancadas_updated_at" BEFORE UPDATE ON "public"."configuracoes_alerta_avancadas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_configuracoes_alerta_updated_at" BEFORE UPDATE ON "public"."configuracoes_alerta" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contratos_updated_at" BEFORE UPDATE ON "public"."contratos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ia_sugestoes_updated_at" BEFORE UPDATE ON "public"."ia_sugestoes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_itens_orcamento_updated_at" BEFORE UPDATE ON "public"."itens_orcamento" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orcamentos_parametricos_updated_at" BEFORE UPDATE ON "public"."orcamentos_parametricos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_planta_analyses_updated_at" BEFORE UPDATE ON "public"."planta_analyses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sinapi_embeddings_updated_at" BEFORE UPDATE ON "public"."sinapi_embeddings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_templates_contratos_updated_at" BEFORE UPDATE ON "public"."templates_contratos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_rate_limits_updated_at" BEFORE UPDATE ON "public"."user_rate_limits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."aditivos_contratos"
    ADD CONSTRAINT "aditivos_contratos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."aditivos_contratos"
    ADD CONSTRAINT "aditivos_contratos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_insights"
    ADD CONSTRAINT "ai_insights_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alertas_desvio"
    ADD CONSTRAINT "alertas_desvio_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alertas_desvio"
    ADD CONSTRAINT "alertas_desvio_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assinaturas_contratos"
    ADD CONSTRAINT "assinaturas_contratos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coeficientes_tecnicos"
    ADD CONSTRAINT "coeficientes_tecnicos_sinapi_insumo_id_fkey" FOREIGN KEY ("sinapi_insumo_id") REFERENCES "public"."sinapi_insumos"("id");



ALTER TABLE ONLY "public"."comparacoes_orcamento_real"
    ADD CONSTRAINT "comparacoes_orcamento_real_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comparacoes_orcamento_real"
    ADD CONSTRAINT "comparacoes_orcamento_real_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos_parametricos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."composicao_insumos"
    ADD CONSTRAINT "composicao_insumos_composicao_id_fkey" FOREIGN KEY ("composicao_id") REFERENCES "public"."composicoes_personalizadas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."composicao_insumos"
    ADD CONSTRAINT "composicao_insumos_sinapi_insumo_id_fkey" FOREIGN KEY ("sinapi_insumo_id") REFERENCES "public"."sinapi_insumos"("id");



ALTER TABLE ONLY "public"."composicoes_personalizadas"
    ADD CONSTRAINT "composicoes_personalizadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."configuracoes_alerta_avancadas"
    ADD CONSTRAINT "configuracoes_alerta_avancadas_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."configuracoes_alerta_avancadas"
    ADD CONSTRAINT "configuracoes_alerta_avancadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."configuracoes_alerta"
    ADD CONSTRAINT "configuracoes_alerta_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."configuracoes_alerta"
    ADD CONSTRAINT "configuracoes_alerta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."contexto_ia"
    ADD CONSTRAINT "contexto_ia_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id");



ALTER TABLE ONLY "public"."contratos"
    ADD CONSTRAINT "contratos_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates_contratos"("id");



ALTER TABLE ONLY "public"."conversas_ia"
    ADD CONSTRAINT "conversas_ia_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversas_ia"
    ADD CONSTRAINT "conversas_ia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversoes_orcamento_despesa"
    ADD CONSTRAINT "conversoes_orcamento_despesa_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversoes_orcamento_despesa"
    ADD CONSTRAINT "conversoes_orcamento_despesa_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos_parametricos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversoes_orcamento_despesa"
    ADD CONSTRAINT "conversoes_orcamento_despesa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."despesas"
    ADD CONSTRAINT "despesas_fornecedor_pf_id_fkey" FOREIGN KEY ("fornecedor_pf_id") REFERENCES "public"."fornecedores_pf"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."despesas"
    ADD CONSTRAINT "despesas_fornecedor_pj_id_fkey" FOREIGN KEY ("fornecedor_pj_id") REFERENCES "public"."fornecedores_pj"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."despesas"
    ADD CONSTRAINT "despesas_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."despesas"
    ADD CONSTRAINT "despesas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embeddings_conhecimento"
    ADD CONSTRAINT "embeddings_conhecimento_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fornecedores_pf"
    ADD CONSTRAINT "fornecedores_pf_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fornecedores_pj"
    ADD CONSTRAINT "fornecedores_pj_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."historico_alertas"
    ADD CONSTRAINT "historico_alertas_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "public"."alertas_desvio"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."historico_alertas"
    ADD CONSTRAINT "historico_alertas_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."historico_alertas"
    ADD CONSTRAINT "historico_alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."historico_buscas_ia"
    ADD CONSTRAINT "historico_buscas_ia_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."historico_buscas_ia"
    ADD CONSTRAINT "historico_buscas_ia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."historico_contratos"
    ADD CONSTRAINT "historico_contratos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."historico_contratos"
    ADD CONSTRAINT "historico_contratos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ia_contratos_interacoes"
    ADD CONSTRAINT "ia_contratos_interacoes_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id");



ALTER TABLE ONLY "public"."ia_contratos_interacoes"
    ADD CONSTRAINT "ia_contratos_interacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ia_sugestoes"
    ADD CONSTRAINT "ia_sugestoes_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ia_sugestoes"
    ADD CONSTRAINT "ia_sugestoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itens_orcamento"
    ADD CONSTRAINT "itens_orcamento_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos_parametricos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itens_orcamento"
    ADD CONSTRAINT "itens_orcamento_sinapi_insumo_id_fkey" FOREIGN KEY ("sinapi_insumo_id") REFERENCES "public"."sinapi_insumos"("id");



ALTER TABLE ONLY "public"."metricas_ia"
    ADD CONSTRAINT "metricas_ia_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id");



ALTER TABLE ONLY "public"."metricas_ia"
    ADD CONSTRAINT "metricas_ia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_despesa_id_fkey" FOREIGN KEY ("despesa_id") REFERENCES "public"."despesas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_fornecedor_pf_id_fkey" FOREIGN KEY ("fornecedor_pf_id") REFERENCES "public"."fornecedores_pf"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_fornecedor_pj_id_fkey" FOREIGN KEY ("fornecedor_pj_id") REFERENCES "public"."fornecedores_pj"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notas_fiscais"
    ADD CONSTRAINT "notas_fiscais_usuario_upload_id_fkey" FOREIGN KEY ("usuario_upload_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notificacoes_alertas"
    ADD CONSTRAINT "notificacoes_alertas_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "public"."alertas_desvio"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notificacoes_alertas"
    ADD CONSTRAINT "notificacoes_alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_construtora_id_fkey" FOREIGN KEY ("construtora_id") REFERENCES "public"."construtoras"("id");



ALTER TABLE ONLY "public"."obras"
    ADD CONSTRAINT "obras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orcamentos_parametricos"
    ADD CONSTRAINT "orcamentos_parametricos_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orcamentos_parametricos"
    ADD CONSTRAINT "orcamentos_parametricos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfis_usuario"("id");



ALTER TABLE ONLY "public"."planta_analyses"
    ADD CONSTRAINT "planta_analyses_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."planta_analyses"
    ADD CONSTRAINT "planta_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sinapi_manutencoes"
    ADD CONSTRAINT "sinapi_manutencoes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_rate_limits"
    ADD CONSTRAINT "user_rate_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfis_usuario"("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_supabase_auth_id_fkey" FOREIGN KEY ("supabase_auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhooks_alertas"
    ADD CONSTRAINT "webhooks_alertas_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "public"."alertas_desvio"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhooks_alertas"
    ADD CONSTRAINT "webhooks_alertas_configuracao_id_fkey" FOREIGN KEY ("configuracao_id") REFERENCES "public"."configuracoes_alerta_avancadas"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can view all analytics events" ON "public"."analytics_events" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow insert leads" ON "public"."leads" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow read leads" ON "public"."leads" FOR SELECT USING (true);



CREATE POLICY "Allow update leads" ON "public"."leads" FOR UPDATE USING (true);



CREATE POLICY "Apenas admins podem modificar bases de custos" ON "public"."bases_custos_regionais" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'ADMIN'::"text")))));



CREATE POLICY "Apenas admins podem modificar coeficientes técnicos" ON "public"."coeficientes_tecnicos" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'ADMIN'::"text")))));



CREATE POLICY "Apenas sistema pode modificar embeddings SINAPI" ON "public"."sinapi_embeddings" USING (false);



CREATE POLICY "Bases de custos são visíveis para todos" ON "public"."bases_custos_regionais" FOR SELECT USING (("ativo" = true));



CREATE POLICY "Coeficientes técnicos são visíveis para todos" ON "public"."coeficientes_tecnicos" FOR SELECT USING (("ativo" = true));



CREATE POLICY "Permitir atualização SINAPI para admins" ON "public"."sinapi_insumos" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text")))));



CREATE POLICY "Permitir atualização de dados próprios" ON "public"."sinapi_manutencoes" FOR UPDATE TO "authenticated" USING (("tenant_id" = "auth"."uid"())) WITH CHECK (("tenant_id" = "auth"."uid"()));



COMMENT ON POLICY "Permitir atualização de dados próprios" ON "public"."sinapi_manutencoes" IS 'Permite que usuários atualizem apenas seus próprios dados';



CREATE POLICY "Permitir exclusão SINAPI para admins" ON "public"."sinapi_insumos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text")))));



CREATE POLICY "Permitir exclusão de dados próprios" ON "public"."sinapi_manutencoes" FOR DELETE TO "authenticated" USING (("tenant_id" = "auth"."uid"()));



COMMENT ON POLICY "Permitir exclusão de dados próprios" ON "public"."sinapi_manutencoes" IS 'Permite que usuários excluam apenas seus próprios dados';



CREATE POLICY "Permitir inserção SINAPI para admins" ON "public"."sinapi_insumos" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text")))));



CREATE POLICY "Permitir inserção anônima para testes" ON "public"."orcamentos_parametricos" FOR INSERT WITH CHECK ((("usuario_id" = '00000000-0000-0000-0000-000000000000'::"uuid") AND ("tenant_id" = '00000000-0000-0000-0000-000000000000'::"uuid")));



CREATE POLICY "Permitir inserção de dados SINAPI públicos" ON "public"."sinapi_manutencoes" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IS NULL));



COMMENT ON POLICY "Permitir inserção de dados SINAPI públicos" ON "public"."sinapi_manutencoes" IS 'Permite inserção de dados SINAPI públicos (tenant_id = NULL) durante importação';



CREATE POLICY "Permitir inserção de dados próprios" ON "public"."sinapi_manutencoes" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" = "auth"."uid"()));



COMMENT ON POLICY "Permitir inserção de dados próprios" ON "public"."sinapi_manutencoes" IS 'Permite que usuários insiram dados com seu próprio tenant_id';



CREATE POLICY "Permitir leitura SINAPI para usuários autenticados" ON "public"."sinapi_insumos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Permitir leitura de dados SINAPI" ON "public"."sinapi_manutencoes" FOR SELECT TO "authenticated" USING (true);



COMMENT ON POLICY "Permitir leitura de dados SINAPI" ON "public"."sinapi_manutencoes" IS 'Permite que qualquer usuário autenticado leia dados SINAPI (públicos e privados)';



CREATE POLICY "Sistema pode inserir sugestões" ON "public"."ia_sugestoes" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert analytics events" ON "public"."analytics_events" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Todos podem ler embeddings SINAPI do seu tenant" ON "public"."sinapi_embeddings" FOR SELECT USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can delete own conversions" ON "public"."conversoes_orcamento_despesa" FOR DELETE USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Users can delete their own alert configurations" ON "public"."configuracoes_alerta" FOR DELETE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own conversions" ON "public"."conversoes_orcamento_despesa" FOR INSERT WITH CHECK (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Users can insert their own alert configurations" ON "public"."configuracoes_alerta" FOR INSERT WITH CHECK (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own alerts" ON "public"."alertas_desvio" FOR INSERT WITH CHECK (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can update own conversions" ON "public"."conversoes_orcamento_despesa" FOR UPDATE USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Users can update their own alert configurations" ON "public"."configuracoes_alerta" FOR UPDATE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own alerts" ON "public"."alertas_desvio" FOR UPDATE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own analytics events" ON "public"."analytics_events" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own conversions" ON "public"."conversoes_orcamento_despesa" FOR SELECT USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Users can view their own alert configurations" ON "public"."configuracoes_alerta" FOR SELECT USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own alerts" ON "public"."alertas_desvio" FOR SELECT USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem acessar suas próprias mensagens" ON "public"."chat_messages" USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuários podem atualizar itens de seus orçamentos" ON "public"."itens_orcamento" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."orcamentos_parametricos" "op"
  WHERE (("op"."id" = "itens_orcamento"."orcamento_id") AND ("op"."tenant_id" = ( SELECT "profiles"."tenant_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários podem atualizar seus orçamentos" ON "public"."orcamentos_parametricos" FOR UPDATE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem atualizar seus próprios rate limits" ON "public"."user_rate_limits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem atualizar status de sugestões de suas obras" ON "public"."ia_sugestoes" FOR UPDATE USING ((("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) AND (("obra_id" IN ( SELECT "obras"."id"
   FROM "public"."obras"
  WHERE ("obras"."usuario_id" = "auth"."uid"()))) OR ("usuario_id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem atualizar suas comparações" ON "public"."comparacoes_orcamento_real" FOR UPDATE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem atualizar suas próprias análises" ON "public"."planta_analyses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem criar comparações" ON "public"."comparacoes_orcamento_real" FOR INSERT WITH CHECK (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem criar itens de orçamento" ON "public"."itens_orcamento" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orcamentos_parametricos" "op"
  WHERE (("op"."id" = "itens_orcamento"."orcamento_id") AND ("op"."tenant_id" = ( SELECT "profiles"."tenant_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários podem criar orçamentos" ON "public"."orcamentos_parametricos" FOR INSERT WITH CHECK ((("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) AND ("usuario_id" = "auth"."uid"())));



CREATE POLICY "Usuários podem criar suas próprias composições" ON "public"."composicoes_personalizadas" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuários podem deletar insumos de suas composições" ON "public"."composicao_insumos" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."composicoes_personalizadas" "cp"
  WHERE (("cp"."id" = "composicao_insumos"."composicao_id") AND ("cp"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem deletar itens de seus orçamentos" ON "public"."itens_orcamento" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."orcamentos_parametricos" "op"
  WHERE (("op"."id" = "itens_orcamento"."orcamento_id") AND ("op"."tenant_id" = ( SELECT "profiles"."tenant_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários podem deletar seus orçamentos" ON "public"."orcamentos_parametricos" FOR DELETE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem deletar suas comparações" ON "public"."comparacoes_orcamento_real" FOR DELETE USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem deletar suas próprias análises" ON "public"."planta_analyses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem deletar suas próprias composições" ON "public"."composicoes_personalizadas" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuários podem editar insumos de suas composições" ON "public"."composicao_insumos" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."composicoes_personalizadas" "cp"
  WHERE (("cp"."id" = "composicao_insumos"."composicao_id") AND ("cp"."usuario_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."composicoes_personalizadas" "cp"
  WHERE (("cp"."id" = "composicao_insumos"."composicao_id") AND ("cp"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem editar suas próprias composições" ON "public"."composicoes_personalizadas" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "usuario_id")) WITH CHECK (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuários podem inserir insumos em suas composições" ON "public"."composicao_insumos" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."composicoes_personalizadas" "cp"
  WHERE (("cp"."id" = "composicao_insumos"."composicao_id") AND ("cp"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem inserir seu histórico de buscas" ON "public"."historico_buscas_ia" FOR INSERT WITH CHECK ((("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) AND ("usuario_id" = "auth"."uid"())));



CREATE POLICY "Usuários podem inserir seus próprios rate limits" ON "public"."user_rate_limits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem inserir suas próprias análises" ON "public"."planta_analyses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver composições públicas e próprias" ON "public"."composicoes_personalizadas" FOR SELECT TO "authenticated" USING ((("publica" = true) OR ("auth"."uid"() = "usuario_id")));



CREATE POLICY "Usuários podem ver histórico de seus alertas" ON "public"."historico_alertas" USING ((("auth"."uid"() = "usuario_id") OR ("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem ver insumos de composições acessíveis" ON "public"."composicao_insumos" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."composicoes_personalizadas" "cp"
  WHERE (("cp"."id" = "composicao_insumos"."composicao_id") AND (("cp"."usuario_id" = "auth"."uid"()) OR ("cp"."publica" = true))))));



CREATE POLICY "Usuários podem ver itens de seus orçamentos" ON "public"."itens_orcamento" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orcamentos_parametricos" "op"
  WHERE (("op"."id" = "itens_orcamento"."orcamento_id") AND ("op"."tenant_id" = ( SELECT "profiles"."tenant_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Usuários podem ver seu histórico de buscas" ON "public"."historico_buscas_ia" FOR SELECT USING ((("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) AND ("usuario_id" = "auth"."uid"())));



CREATE POLICY "Usuários podem ver seus próprios orçamentos" ON "public"."orcamentos_parametricos" FOR SELECT USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem ver seus próprios rate limits" ON "public"."user_rate_limits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver suas configurações de alerta" ON "public"."configuracoes_alerta_avancadas" USING ((("auth"."uid"() = "usuario_id") OR ("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem ver suas notificações" ON "public"."notificacoes_alertas" USING ((("auth"."uid"() = "usuario_id") OR ("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem ver suas próprias análises" ON "public"."planta_analyses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver suas próprias comparações" ON "public"."comparacoes_orcamento_real" FOR SELECT USING (("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem ver sugestões de suas obras" ON "public"."ia_sugestoes" FOR SELECT USING ((("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) AND (("obra_id" IN ( SELECT "obras"."id"
   FROM "public"."obras"
  WHERE ("obras"."usuario_id" = "auth"."uid"()))) OR ("usuario_id" = "auth"."uid"()))));



CREATE POLICY "Usuários podem ver webhooks de seus alertas" ON "public"."webhooks_alertas" USING (("tenant_id" = ( SELECT "webhooks_alertas"."tenant_id"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Usuários veem apenas aditivos de seu tenant" ON "public"."aditivos_contratos" USING (("tenant_id" = (("auth"."jwt"() ->> 'sub'::"text"))::"uuid"));



CREATE POLICY "Usuários veem apenas assinaturas de seu tenant" ON "public"."assinaturas_contratos" USING (("tenant_id" = (("auth"."jwt"() ->> 'sub'::"text"))::"uuid"));



CREATE POLICY "Usuários veem apenas contratos de seu tenant" ON "public"."contratos" USING (("tenant_id" = (("auth"."jwt"() ->> 'sub'::"text"))::"uuid"));



CREATE POLICY "Usuários veem apenas histórico de seu tenant" ON "public"."historico_contratos" USING (("tenant_id" = (("auth"."jwt"() ->> 'sub'::"text"))::"uuid"));



CREATE POLICY "Usuários veem apenas suas interações IA contratos" ON "public"."ia_contratos_interacoes" USING (("user_id" = (("auth"."jwt"() ->> 'sub'::"text"))::"uuid"));



CREATE POLICY "Usuários veem templates do tenant ou globais" ON "public"."templates_contratos" USING ((("tenant_id" = (("auth"."jwt"() ->> 'sub'::"text"))::"uuid") OR ("tenant_id" IS NULL)));



ALTER TABLE "public"."aditivos_contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_insights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ai_insights_tenant_isolation" ON "public"."ai_insights" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."alertas_desvio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assinaturas_contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bases_custos_regionais" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chat_messages_tenant_isolation" ON "public"."chat_messages" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."coeficientes_tecnicos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comparacoes_orcamento_real" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."composicao_insumos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."composicoes_personalizadas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."configuracoes_alerta" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."configuracoes_alerta_avancadas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contexto_ia" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "contexto_ia_insert_policy" ON "public"."contexto_ia" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."obras" "o"
  WHERE (("o"."id" = "contexto_ia"."obra_id") AND ("o"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "contexto_ia_select_policy" ON "public"."contexto_ia" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."obras" "o"
  WHERE (("o"."id" = "contexto_ia"."obra_id") AND ("o"."usuario_id" = "auth"."uid"())))));



ALTER TABLE "public"."contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversas_ia" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversas_ia_insert_policy" ON "public"."conversas_ia" FOR INSERT TO "authenticated" WITH CHECK (("usuario_id" = "auth"."uid"()));



CREATE POLICY "conversas_ia_select_policy" ON "public"."conversas_ia" FOR SELECT TO "authenticated" USING (("usuario_id" = "auth"."uid"()));



ALTER TABLE "public"."conversoes_orcamento_despesa" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."despesas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "despesas_tenant_isolation" ON "public"."despesas" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."embeddings_conhecimento" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "embeddings_conhecimento_delete_policy" ON "public"."embeddings_conhecimento" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."obras" "o"
  WHERE (("o"."id" = "embeddings_conhecimento"."obra_id") AND ("o"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "embeddings_conhecimento_insert_policy" ON "public"."embeddings_conhecimento" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."obras" "o"
  WHERE (("o"."id" = "embeddings_conhecimento"."obra_id") AND ("o"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "embeddings_conhecimento_select_policy" ON "public"."embeddings_conhecimento" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."obras" "o"
  WHERE (("o"."id" = "embeddings_conhecimento"."obra_id") AND ("o"."usuario_id" = "auth"."uid"())))));



CREATE POLICY "embeddings_conhecimento_update_policy" ON "public"."embeddings_conhecimento" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."obras" "o"
  WHERE (("o"."id" = "embeddings_conhecimento"."obra_id") AND ("o"."usuario_id" = "auth"."uid"())))));



ALTER TABLE "public"."fornecedores_pf" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fornecedores_pf_tenant_isolation" ON "public"."fornecedores_pf" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."fornecedores_pj" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fornecedores_pj_tenant_isolation" ON "public"."fornecedores_pj" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."historico_alertas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."historico_buscas_ia" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."historico_contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ia_contratos_interacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ia_sugestoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."itens_orcamento" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."metricas_ia" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "metricas_ia_insert_policy" ON "public"."metricas_ia" FOR INSERT TO "authenticated" WITH CHECK (("usuario_id" = "auth"."uid"()));



CREATE POLICY "metricas_ia_select_policy" ON "public"."metricas_ia" FOR SELECT TO "authenticated" USING (("usuario_id" = "auth"."uid"()));



ALTER TABLE "public"."notas_fiscais" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notas_fiscais_tenant_isolation" ON "public"."notas_fiscais" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."notificacoes_alertas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."obras" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "obras_tenant_isolation" ON "public"."obras" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."orcamentos_parametricos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."perfis_usuario" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "perfis_usuario_select_policy" ON "public"."perfis_usuario" FOR SELECT USING (true);



ALTER TABLE "public"."permissoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissoes_select_policy" ON "public"."permissoes" FOR SELECT USING (true);



ALTER TABLE "public"."planta_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_own_profile" ON "public"."profiles" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."sinapi_embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sinapi_insumos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sinapi_manutencoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_tenant_isolation" ON "public"."subscriptions" USING (("tenant_id" = "public"."get_current_tenant_id"()));



ALTER TABLE "public"."templates_contratos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuarios_select_policy" ON "public"."usuarios" FOR SELECT USING (true);



ALTER TABLE "public"."webhooks_alertas" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."atualizar_percentual_grupo"() TO "anon";
GRANT ALL ON FUNCTION "public"."atualizar_percentual_grupo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."atualizar_percentual_grupo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."atualizar_preco_item_sinapi"() TO "anon";
GRANT ALL ON FUNCTION "public"."atualizar_preco_item_sinapi"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."atualizar_preco_item_sinapi"() TO "service_role";



GRANT ALL ON FUNCTION "public"."atualizar_totais_grupo"() TO "anon";
GRANT ALL ON FUNCTION "public"."atualizar_totais_grupo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."atualizar_totais_grupo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."atualizar_totais_projeto"() TO "anon";
GRANT ALL ON FUNCTION "public"."atualizar_totais_projeto"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."atualizar_totais_projeto"() TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."buscar_conhecimento_semantico"("p_obra_id" "uuid", "p_query_embedding" "public"."vector", "p_limite" integer, "p_threshold" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_conhecimento_semantico"("p_obra_id" "uuid", "p_query_embedding" "public"."vector", "p_limite" integer, "p_threshold" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_conhecimento_semantico"("p_obra_id" "uuid", "p_query_embedding" "public"."vector", "p_limite" integer, "p_threshold" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."buscar_documentos_semelhantes"("p_embedding" "public"."vector", "p_topic" "text", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_documentos_semelhantes"("p_embedding" "public"."vector", "p_topic" "text", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_documentos_semelhantes"("p_embedding" "public"."vector", "p_topic" "text", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."buscar_sinapi_por_codigo"("p_codigo" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_sinapi_por_codigo"("p_codigo" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_sinapi_por_codigo"("p_codigo" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."buscar_sinapi_unificado"("p_termo" "text", "p_categoria" "text", "p_estado" "text", "p_fonte" "text", "p_limite" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_sinapi_unificado"("p_termo" "text", "p_categoria" "text", "p_estado" "text", "p_fonte" "text", "p_limite" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_sinapi_unificado"("p_termo" "text", "p_categoria" "text", "p_estado" "text", "p_fonte" "text", "p_limite" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calcular_fator_complexidade_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum", "p_area_total" numeric, "p_percentual_demolir" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_fator_complexidade_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum", "p_area_total" numeric, "p_percentual_demolir" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_fator_complexidade_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum", "p_area_total" numeric, "p_percentual_demolir" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calcular_valores_item"() TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_valores_item"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_valores_item"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_analytics_events"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_analytics_events"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_analytics_events"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."estatisticas_uso_ia"("tenant_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."estatisticas_uso_ia"("tenant_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."estatisticas_uso_ia"("tenant_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tenant_id_for_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tenant_id_for_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tenant_id_for_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gerar_numero_contrato"() TO "anon";
GRANT ALL ON FUNCTION "public"."gerar_numero_contrato"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gerar_numero_contrato"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gerar_orcamento_automatico_sinapi"("p_orcamento_id" "uuid", "p_area_total" numeric, "p_estado" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."gerar_orcamento_automatico_sinapi"("p_orcamento_id" "uuid", "p_area_total" numeric, "p_estado" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gerar_orcamento_automatico_sinapi"("p_orcamento_id" "uuid", "p_area_total" numeric, "p_estado" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_role"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."limpar_embeddings_antigos"() TO "anon";
GRANT ALL ON FUNCTION "public"."limpar_embeddings_antigos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."limpar_embeddings_antigos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."obter_coeficientes_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."obter_coeficientes_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."obter_coeficientes_reforma"("p_tipo_obra" "public"."tipo_obra_enum", "p_padrao_obra" "public"."padrao_obra_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."obter_preco_sinapi_por_estado"("p_codigo_insumo" character varying, "p_estado" character varying, "p_mes_referencia" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."obter_preco_sinapi_por_estado"("p_codigo_insumo" character varying, "p_estado" character varying, "p_mes_referencia" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."obter_preco_sinapi_por_estado"("p_codigo_insumo" character varying, "p_estado" character varying, "p_mes_referencia" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."registrar_historico_contrato"() TO "anon";
GRANT ALL ON FUNCTION "public"."registrar_historico_contrato"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_historico_contrato"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_ai_insights"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_ai_insights"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_ai_insights"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_chat_messages"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_chat_messages"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_chat_messages"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_despesas"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_despesas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_despesas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_fornecedores_pf"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_fornecedores_pf"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_fornecedores_pf"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_fornecedores_pj"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_fornecedores_pj"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_fornecedores_pj"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_notas_fiscais"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_notas_fiscais"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_notas_fiscais"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_obras"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_obras"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_obras"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id_subscriptions"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id_subscriptions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id_subscriptions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sincronizar_coeficiente_com_sinapi"("p_coeficiente_id" "uuid", "p_forcar_atualizacao" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sincronizar_coeficiente_com_sinapi"("p_coeficiente_id" "uuid", "p_forcar_atualizacao" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sincronizar_coeficiente_com_sinapi"("p_coeficiente_id" "uuid", "p_forcar_atualizacao" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sincronizar_todos_coeficientes_sinapi"() TO "anon";
GRANT ALL ON FUNCTION "public"."sincronizar_todos_coeficientes_sinapi"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sincronizar_todos_coeficientes_sinapi"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_regras_reforma"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_regras_reforma"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_regras_reforma"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversoes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversoes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversoes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sinapi_composicoes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sinapi_composicoes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sinapi_composicoes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sinapi_manutencoes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sinapi_manutencoes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sinapi_manutencoes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_can_access_composition"("composition_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."user_can_access_composition"("composition_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_can_access_composition"("composition_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."user_owns_project"("project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."user_owns_project"("project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_owns_project"("project_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_orcamento_reforma"("p_tipo_obra" "public"."tipo_obra_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."validar_orcamento_reforma"("p_tipo_obra" "public"."tipo_obra_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_orcamento_reforma"("p_tipo_obra" "public"."tipo_obra_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";









GRANT ALL ON TABLE "public"."aditivos_contratos" TO "anon";
GRANT ALL ON TABLE "public"."aditivos_contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."aditivos_contratos" TO "service_role";



GRANT ALL ON TABLE "public"."ai_insights" TO "anon";
GRANT ALL ON TABLE "public"."ai_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_insights" TO "service_role";



GRANT ALL ON TABLE "public"."alertas_desvio" TO "anon";
GRANT ALL ON TABLE "public"."alertas_desvio" TO "authenticated";
GRANT ALL ON TABLE "public"."alertas_desvio" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."assinaturas_contratos" TO "anon";
GRANT ALL ON TABLE "public"."assinaturas_contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."assinaturas_contratos" TO "service_role";



GRANT ALL ON TABLE "public"."bases_custos_regionais" TO "anon";
GRANT ALL ON TABLE "public"."bases_custos_regionais" TO "authenticated";
GRANT ALL ON TABLE "public"."bases_custos_regionais" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."coeficientes_tecnicos" TO "anon";
GRANT ALL ON TABLE "public"."coeficientes_tecnicos" TO "authenticated";
GRANT ALL ON TABLE "public"."coeficientes_tecnicos" TO "service_role";



GRANT ALL ON TABLE "public"."comparacoes_orcamento_real" TO "anon";
GRANT ALL ON TABLE "public"."comparacoes_orcamento_real" TO "authenticated";
GRANT ALL ON TABLE "public"."comparacoes_orcamento_real" TO "service_role";



GRANT ALL ON TABLE "public"."composicao_insumos" TO "anon";
GRANT ALL ON TABLE "public"."composicao_insumos" TO "authenticated";
GRANT ALL ON TABLE "public"."composicao_insumos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."composicao_insumos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."composicao_insumos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."composicao_insumos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."composicoes_personalizadas" TO "anon";
GRANT ALL ON TABLE "public"."composicoes_personalizadas" TO "authenticated";
GRANT ALL ON TABLE "public"."composicoes_personalizadas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."composicoes_personalizadas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."composicoes_personalizadas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."composicoes_personalizadas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."configuracoes_alerta" TO "anon";
GRANT ALL ON TABLE "public"."configuracoes_alerta" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracoes_alerta" TO "service_role";



GRANT ALL ON TABLE "public"."configuracoes_alerta_avancadas" TO "anon";
GRANT ALL ON TABLE "public"."configuracoes_alerta_avancadas" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracoes_alerta_avancadas" TO "service_role";



GRANT ALL ON TABLE "public"."construtoras" TO "anon";
GRANT ALL ON TABLE "public"."construtoras" TO "authenticated";
GRANT ALL ON TABLE "public"."construtoras" TO "service_role";



GRANT ALL ON TABLE "public"."contexto_ia" TO "anon";
GRANT ALL ON TABLE "public"."contexto_ia" TO "authenticated";
GRANT ALL ON TABLE "public"."contexto_ia" TO "service_role";



GRANT ALL ON TABLE "public"."contratos" TO "anon";
GRANT ALL ON TABLE "public"."contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."contratos" TO "service_role";



GRANT ALL ON TABLE "public"."conversas_ia" TO "anon";
GRANT ALL ON TABLE "public"."conversas_ia" TO "authenticated";
GRANT ALL ON TABLE "public"."conversas_ia" TO "service_role";



GRANT ALL ON TABLE "public"."conversoes_orcamento_despesa" TO "anon";
GRANT ALL ON TABLE "public"."conversoes_orcamento_despesa" TO "authenticated";
GRANT ALL ON TABLE "public"."conversoes_orcamento_despesa" TO "service_role";



GRANT ALL ON TABLE "public"."despesas" TO "anon";
GRANT ALL ON TABLE "public"."despesas" TO "authenticated";
GRANT ALL ON TABLE "public"."despesas" TO "service_role";



GRANT ALL ON TABLE "public"."embeddings_conhecimento" TO "anon";
GRANT ALL ON TABLE "public"."embeddings_conhecimento" TO "authenticated";
GRANT ALL ON TABLE "public"."embeddings_conhecimento" TO "service_role";



GRANT ALL ON TABLE "public"."fornecedores_pf" TO "anon";
GRANT ALL ON TABLE "public"."fornecedores_pf" TO "authenticated";
GRANT ALL ON TABLE "public"."fornecedores_pf" TO "service_role";



GRANT ALL ON TABLE "public"."fornecedores_pj" TO "anon";
GRANT ALL ON TABLE "public"."fornecedores_pj" TO "authenticated";
GRANT ALL ON TABLE "public"."fornecedores_pj" TO "service_role";



GRANT ALL ON TABLE "public"."historico_alertas" TO "anon";
GRANT ALL ON TABLE "public"."historico_alertas" TO "authenticated";
GRANT ALL ON TABLE "public"."historico_alertas" TO "service_role";



GRANT ALL ON TABLE "public"."historico_buscas_ia" TO "anon";
GRANT ALL ON TABLE "public"."historico_buscas_ia" TO "authenticated";
GRANT ALL ON TABLE "public"."historico_buscas_ia" TO "service_role";



GRANT ALL ON TABLE "public"."historico_contratos" TO "anon";
GRANT ALL ON TABLE "public"."historico_contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."historico_contratos" TO "service_role";



GRANT ALL ON TABLE "public"."ia_contratos_interacoes" TO "anon";
GRANT ALL ON TABLE "public"."ia_contratos_interacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."ia_contratos_interacoes" TO "service_role";



GRANT ALL ON TABLE "public"."ia_sugestoes" TO "anon";
GRANT ALL ON TABLE "public"."ia_sugestoes" TO "authenticated";
GRANT ALL ON TABLE "public"."ia_sugestoes" TO "service_role";



GRANT ALL ON TABLE "public"."itens_orcamento" TO "anon";
GRANT ALL ON TABLE "public"."itens_orcamento" TO "authenticated";
GRANT ALL ON TABLE "public"."itens_orcamento" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."metricas_ia" TO "anon";
GRANT ALL ON TABLE "public"."metricas_ia" TO "authenticated";
GRANT ALL ON TABLE "public"."metricas_ia" TO "service_role";



GRANT ALL ON TABLE "public"."notas_fiscais" TO "anon";
GRANT ALL ON TABLE "public"."notas_fiscais" TO "authenticated";
GRANT ALL ON TABLE "public"."notas_fiscais" TO "service_role";



GRANT ALL ON TABLE "public"."notificacoes_alertas" TO "anon";
GRANT ALL ON TABLE "public"."notificacoes_alertas" TO "authenticated";
GRANT ALL ON TABLE "public"."notificacoes_alertas" TO "service_role";



GRANT ALL ON TABLE "public"."obras" TO "anon";
GRANT ALL ON TABLE "public"."obras" TO "authenticated";
GRANT ALL ON TABLE "public"."obras" TO "service_role";



GRANT ALL ON TABLE "public"."orcamentos_parametricos" TO "anon";
GRANT ALL ON TABLE "public"."orcamentos_parametricos" TO "authenticated";
GRANT ALL ON TABLE "public"."orcamentos_parametricos" TO "service_role";



GRANT ALL ON TABLE "public"."perfis_usuario" TO "anon";
GRANT ALL ON TABLE "public"."perfis_usuario" TO "authenticated";
GRANT ALL ON TABLE "public"."perfis_usuario" TO "service_role";



GRANT ALL ON TABLE "public"."permissoes" TO "anon";
GRANT ALL ON TABLE "public"."permissoes" TO "authenticated";
GRANT ALL ON TABLE "public"."permissoes" TO "service_role";



GRANT ALL ON TABLE "public"."planta_analyses" TO "anon";
GRANT ALL ON TABLE "public"."planta_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."planta_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sinapi_composicoes_mao_obra" TO "anon";
GRANT ALL ON TABLE "public"."sinapi_composicoes_mao_obra" TO "authenticated";
GRANT ALL ON TABLE "public"."sinapi_composicoes_mao_obra" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sinapi_composicoes_mao_obra_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sinapi_composicoes_mao_obra_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sinapi_composicoes_mao_obra_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sinapi_dados_oficiais" TO "anon";
GRANT ALL ON TABLE "public"."sinapi_dados_oficiais" TO "authenticated";
GRANT ALL ON TABLE "public"."sinapi_dados_oficiais" TO "service_role";



GRANT ALL ON TABLE "public"."sinapi_dados_oficiais_backup" TO "anon";
GRANT ALL ON TABLE "public"."sinapi_dados_oficiais_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."sinapi_dados_oficiais_backup" TO "service_role";



GRANT ALL ON TABLE "public"."sinapi_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."sinapi_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."sinapi_embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."sinapi_insumos" TO "anon";
GRANT ALL ON TABLE "public"."sinapi_insumos" TO "authenticated";
GRANT ALL ON TABLE "public"."sinapi_insumos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sinapi_insumos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sinapi_insumos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sinapi_insumos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sinapi_manutencoes" TO "anon";
GRANT ALL ON TABLE "public"."sinapi_manutencoes" TO "authenticated";
GRANT ALL ON TABLE "public"."sinapi_manutencoes" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."templates_contratos" TO "anon";
GRANT ALL ON TABLE "public"."templates_contratos" TO "authenticated";
GRANT ALL ON TABLE "public"."templates_contratos" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_statistics" TO "anon";
GRANT ALL ON TABLE "public"."tenant_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."user_rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."user_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."user_rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."v_coeficientes_tecnicos_sinapi" TO "anon";
GRANT ALL ON TABLE "public"."v_coeficientes_tecnicos_sinapi" TO "authenticated";
GRANT ALL ON TABLE "public"."v_coeficientes_tecnicos_sinapi" TO "service_role";



GRANT ALL ON TABLE "public"."v_itens_orcamento_sinapi" TO "anon";
GRANT ALL ON TABLE "public"."v_itens_orcamento_sinapi" TO "authenticated";
GRANT ALL ON TABLE "public"."v_itens_orcamento_sinapi" TO "service_role";



GRANT ALL ON TABLE "public"."v_orcamento_analise_sinapi" TO "anon";
GRANT ALL ON TABLE "public"."v_orcamento_analise_sinapi" TO "authenticated";
GRANT ALL ON TABLE "public"."v_orcamento_analise_sinapi" TO "service_role";



GRANT ALL ON TABLE "public"."vw_comparativo_desoneracao" TO "anon";
GRANT ALL ON TABLE "public"."vw_comparativo_desoneracao" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_comparativo_desoneracao" TO "service_role";



GRANT ALL ON TABLE "public"."webhooks_alertas" TO "anon";
GRANT ALL ON TABLE "public"."webhooks_alertas" TO "authenticated";
GRANT ALL ON TABLE "public"."webhooks_alertas" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
