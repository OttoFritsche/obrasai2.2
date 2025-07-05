import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

interface SystemData {
    obras?: any[];
    despesas?: any[];
    orcamentos?: any[];
    fornecedores?: any[];
    contratos?: any[];
    construtoras?: any[];
    sinapi?: any[];
}

export const useSystemChatbot = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [systemData, setSystemData] = useState<SystemData>({});

    // Buscar dados do sistema para contexto
    const fetchSystemContext = async () => {
        try {
            // Buscar dados básicos de cada tabela para contexto
            const [
                { data: obras },
                { data: despesas },
                { data: orcamentos },
                { data: fornecedores },
                { data: contratos },
                { data: construtoras },
            ] = await Promise.all([
                supabase.from("obras").select("id, nome, status, valor_total")
                    .limit(10),
                supabase.from("despesas").select(
                    "id, descricao, valor, data_vencimento",
                ).limit(10),
                supabase.from("orcamentos").select(
                    "id, nome, valor_total, status",
                ).limit(10),
                supabase.from("fornecedores").select("id, nome, tipo").limit(
                    10,
                ),
                supabase.from("contratos").select(
                    "id, titulo, status, valor_total",
                ).limit(10),
                supabase.from("construtoras").select("id, nome, tipo").limit(
                    10,
                ),
            ]);

            setSystemData({
                obras: obras || [],
                despesas: despesas || [],
                orcamentos: orcamentos || [],
                fornecedores: fornecedores || [],
                contratos: contratos || [],
                construtoras: construtoras || [],
            });

            return {
                obras: obras || [],
                despesas: despesas || [],
                orcamentos: orcamentos || [],
                fornecedores: fornecedores || [],
                contratos: contratos || [],
                construtoras: construtoras || [],
            };
        } catch (error) {
            console.error("Erro ao buscar contexto do sistema:", error);
            return {};
        }
    };

    // Enviar mensagem para o chatbot
    const sendMessage = async (message: string): Promise<string> => {
        setIsLoading(true);

        try {
            // Buscar contexto atualizado do sistema
            const context = await fetchSystemContext();

            // Preparar contexto resumido para a IA
            const systemContext = {
                totalObras: context.obras?.length || 0,
                totalDespesas: context.despesas?.length || 0,
                totalOrcamentos: context.orcamentos?.length || 0,
                totalFornecedores: context.fornecedores?.length || 0,
                totalContratos: context.contratos?.length || 0,
                totalConstrutoras: context.construtoras?.length || 0,
                // Resumo de valores
                valorTotalObras: context.obras?.reduce((acc, obra) =>
                    acc + (obra.valor_total || 0), 0) || 0,
                valorTotalDespesas: context.despesas?.reduce((acc, despesa) =>
                    acc + (despesa.valor || 0), 0) || 0,
                valorTotalOrcamentos: context.orcamentos?.reduce((acc, orc) =>
                    acc + (orc.valor_total || 0), 0) || 0,
                // Dados recentes
                obrasRecentes: context.obras?.slice(0, 3).map((o) => ({
                    id: o.id,
                    nome: o.nome,
                    status: o.status,
                })),
                despesasRecentes: context.despesas?.slice(0, 3).map((d) => ({
                    id: d.id,
                    descricao: d.descricao,
                    valor: d.valor,
                })),
            };

            // Chamar Edge Function com contexto completo
            const { data, error } = await supabase.functions.invoke(
                "system-chatbot",
                {
                    body: {
                        message,
                        systemContext,
                        pageContext: "Sistema Completo",
                        capabilities: [
                            "Análise de obras e projetos",
                            "Controle de despesas e fornecedores",
                            "Orçamentos paramétricos com IA",
                            "Integração com tabela SINAPI",
                            "Gestão de contratos",
                            "Análise de métricas e KPIs",
                        ],
                    },
                },
            );

            if (error) {
                throw new Error(error.message);
            }

            return data.response ||
                "Desculpe, não consegui processar sua pergunta.";
        } catch (error) {
            console.error("Erro no chatbot do sistema:", error);

            // Resposta de fallback
            return `Desculpe, ocorreu um erro ao processar sua mensagem. 

Posso ajudar você com:
• 📊 Informações sobre obras (${systemData.obras?.length || 0} cadastradas)
• 💰 Controle de despesas (${systemData.despesas?.length || 0} registradas)
• 📋 Orçamentos e estimativas
• 🏢 Fornecedores e construtoras
• 📄 Contratos e documentos
• 🔧 Integração com SINAPI

Por favor, tente novamente ou seja mais específico com sua pergunta.`;
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar informações específicas
    const getSpecificInfo = async (type: string, id: string) => {
        try {
            switch (type) {
                case "obra":
                    const { data: obra } = await supabase
                        .from("obras")
                        .select("*")
                        .eq("id", id)
                        .single();
                    return obra;

                case "despesa":
                    const { data: despesa } = await supabase
                        .from("despesas")
                        .select("*")
                        .eq("id", id)
                        .single();
                    return despesa;

                case "orcamento":
                    const { data: orcamento } = await supabase
                        .from("orcamentos")
                        .select("*")
                        .eq("id", id)
                        .single();
                    return orcamento;

                default:
                    return null;
            }
        } catch (error) {
            console.error(`Erro ao buscar ${type}:`, error);
            return null;
        }
    };

    return {
        sendMessage,
        isLoading,
        systemData,
        fetchSystemContext,
        getSpecificInfo,
    };
};
