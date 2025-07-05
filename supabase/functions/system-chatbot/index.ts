import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface SystemContext {
    totalObras: number;
    totalDespesas: number;
    totalOrcamentos: number;
    totalFornecedores: number;
    totalContratos: number;
    totalConstrutoras: number;
    valorTotalObras: number;
    valorTotalDespesas: number;
    valorTotalOrcamentos: number;
    obrasRecentes?: any[];
    despesasRecentes?: any[];
}

interface ChatRequest {
    message: string;
    systemContext?: SystemContext;
    pageContext?: string;
    capabilities?: string[];
}

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { message, systemContext, pageContext, capabilities } = await req
            .json() as ChatRequest;

        // Criar cliente Supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Analisar a mensagem para determinar o tipo de resposta
        const lowerMessage = message.toLowerCase();

        let response = "";

        // Respostas baseadas em contexto e padrões
        if (
            lowerMessage.includes("obras") &&
            (lowerMessage.includes("quantas") || lowerMessage.includes("total"))
        ) {
            response = `📊 **Status das Obras**\n\n`;
            response += `Total de obras cadastradas: **${
                systemContext?.totalObras || 0
            }**\n`;
            response += `Valor total em obras: **R$ ${
                (systemContext?.valorTotalObras || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                })
            }**\n\n`;

            if (
                systemContext?.obrasRecentes &&
                systemContext.obrasRecentes.length > 0
            ) {
                response += `**Obras recentes:**\n`;
                systemContext.obrasRecentes.forEach((obra) => {
                    response += `• ${obra.nome} - ${
                        obra.status || "Em andamento"
                    }\n`;
                });
            }
        } else if (
            lowerMessage.includes("despesas") &&
            (lowerMessage.includes("total") || lowerMessage.includes("quanto"))
        ) {
            response = `💰 **Resumo de Despesas**\n\n`;
            response += `Total de despesas registradas: **${
                systemContext?.totalDespesas || 0
            }**\n`;
            response += `Valor total: **R$ ${
                (systemContext?.valorTotalDespesas || 0).toLocaleString(
                    "pt-BR",
                    { minimumFractionDigits: 2 },
                )
            }**\n\n`;

            if (
                systemContext?.despesasRecentes &&
                systemContext.despesasRecentes.length > 0
            ) {
                response += `**Despesas recentes:**\n`;
                systemContext.despesasRecentes.forEach((despesa) => {
                    response += `• ${despesa.descricao} - R$ ${
                        despesa.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                        })
                    }\n`;
                });
            }
        } else if (
            lowerMessage.includes("orçamento") && lowerMessage.includes("criar")
        ) {
            response = `📋 **Como criar um orçamento com IA**\n\n`;
            response += `1. **Acesse o menu Orçamentos** no painel lateral\n`;
            response += `2. **Clique em "Novo Orçamento"**\n`;
            response += `3. **Escolha o tipo:**\n`;
            response += `   • Orçamento Paramétrico (baseado em m²)\n`;
            response += `   • Orçamento Detalhado (item por item)\n`;
            response += `4. **Preencha os dados básicos:**\n`;
            response += `   • Nome do orçamento\n`;
            response += `   • Área total em m²\n`;
            response += `   • Padrão de acabamento\n`;
            response += `5. **A IA calculará automaticamente:**\n`;
            response += `   • Custos baseados na tabela SINAPI\n`;
            response += `   • Quantitativos de materiais\n`;
            response += `   • Mão de obra necessária\n`;
            response += `   • Cronograma estimado\n\n`;
            response +=
                `💡 **Dica:** Use o orçamento paramétrico para estimativas rápidas!`;
        } else if (lowerMessage.includes("fornecedores")) {
            response = `🏢 **Fornecedores no Sistema**\n\n`;
            response += `Total cadastrado: **${
                systemContext?.totalFornecedores || 0
            }**\n\n`;
            response += `**Para cadastrar um novo fornecedor:**\n`;
            response += `1. Acesse Fornecedores no menu\n`;
            response += `2. Escolha entre Pessoa Física ou Jurídica\n`;
            response += `3. Clique em "Novo Fornecedor"\n`;
            response +=
                `4. Preencha os dados (CNPJ/CPF é validado automaticamente)\n`;
            response += `5. Salve o cadastro\n\n`;
            response +=
                `💡 **Dica:** Mantenha os fornecedores atualizados para facilitar o lançamento de despesas!`;
        } else if (lowerMessage.includes("contratos")) {
            response = `📄 **Gestão de Contratos**\n\n`;
            response += `Total de contratos: **${
                systemContext?.totalContratos || 0
            }**\n\n`;
            response += `**Funcionalidades disponíveis:**\n`;
            response += `• Criação de contratos com IA\n`;
            response += `• Templates personalizáveis\n`;
            response += `• Assinatura digital integrada\n`;
            response += `• Acompanhamento de status\n`;
            response += `• Alertas de vencimento\n\n`;
            response += `**Para criar um contrato:**\n`;
            response += `1. Acesse Contratos > Novo Contrato\n`;
            response += `2. Use o assistente de IA para gerar o conteúdo\n`;
            response += `3. Revise e ajuste conforme necessário\n`;
            response += `4. Envie para assinatura digital`;
        } else if (lowerMessage.includes("sinapi")) {
            response = `🔧 **Integração com SINAPI**\n\n`;
            response +=
                `O ObrasAI está totalmente integrado com a tabela SINAPI!\n\n`;
            response += `**Recursos disponíveis:**\n`;
            response += `• Consulta de preços atualizados\n`;
            response += `• Composições de serviços\n`;
            response += `• Cálculo automático de BDI\n`;
            response += `• Histórico de variações de preço\n`;
            response += `• Busca por código ou descrição\n\n`;
            response += `**Como usar:**\n`;
            response +=
                `1. Em qualquer orçamento, clique em "Adicionar Item SINAPI"\n`;
            response += `2. Busque por código ou descrição\n`;
            response += `3. O sistema trará automaticamente:\n`;
            response += `   • Preço unitário atualizado\n`;
            response += `   • Unidade de medida\n`;
            response += `   • Composição detalhada\n`;
            response += `   • Encargos aplicáveis`;
        } else if (
            lowerMessage.includes("ajuda") || lowerMessage.includes("help")
        ) {
            response = `🤖 **Como posso ajudar você?**\n\n`;
            response +=
                `Sou o assistente IA do ObrasAI e posso fornecer informações sobre:\n\n`;
            response += `📊 **Obras e Projetos**\n`;
            response += `• Status das obras\n`;
            response += `• Valores e orçamentos\n`;
            response += `• Cronogramas\n\n`;
            response += `💰 **Gestão Financeira**\n`;
            response += `• Controle de despesas\n`;
            response += `• Fluxo de caixa\n`;
            response += `• Relatórios financeiros\n\n`;
            response += `📋 **Orçamentos com IA**\n`;
            response += `• Orçamento paramétrico\n`;
            response += `• Integração SINAPI\n`;
            response += `• Análise de custos\n\n`;
            response += `🏢 **Cadastros**\n`;
            response += `• Fornecedores\n`;
            response += `• Construtoras\n`;
            response += `• Contratos\n\n`;
            response +=
                `💡 **Dica:** Seja específico em suas perguntas para respostas mais precisas!`;
        } else {
            // Resposta genérica baseada no contexto
            response = `Entendi sua pergunta sobre "${message}".\n\n`;
            response += `Com base nos dados do sistema:\n\n`;
            response += `📊 **Resumo Geral:**\n`;
            response += `• Obras cadastradas: ${
                systemContext?.totalObras || 0
            }\n`;
            response += `• Despesas registradas: ${
                systemContext?.totalDespesas || 0
            }\n`;
            response += `• Orçamentos criados: ${
                systemContext?.totalOrcamentos || 0
            }\n`;
            response += `• Fornecedores: ${
                systemContext?.totalFornecedores || 0
            }\n`;
            response += `• Contratos: ${
                systemContext?.totalContratos || 0
            }\n\n`;

            if (capabilities && capabilities.length > 0) {
                response += `**Posso ajudar com:**\n`;
                capabilities.forEach((cap) => {
                    response += `• ${cap}\n`;
                });
            }

            response +=
                `\n💡 **Dica:** Tente perguntas mais específicas como:\n`;
            response += `• "Quantas obras estão em andamento?"\n`;
            response += `• "Como criar um orçamento com IA?"\n`;
            response += `• "Qual o total de despesas?"`;
        }

        // Adicionar timestamp
        response += `\n\n---\n_Respondido em ${
            new Date().toLocaleString("pt-BR")
        }_`;

        return new Response(
            JSON.stringify({
                response,
                success: true,
            }),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (error) {
        console.error("Erro no chatbot:", error);

        return new Response(
            JSON.stringify({
                error: "Erro ao processar mensagem",
                response:
                    "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            },
        );
    }
});
