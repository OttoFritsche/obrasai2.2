import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getPreflightHeaders, getSecureCorsHeaders } from "./cors.ts";

interface TrainingChatRequest {
    message: string;
    topic?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function getRelevantChunks(query: string, topic?: string) {
    try {
        // 1️⃣ Gerar embedding da pergunta usando OpenAI (obrigatório para busca vetorial)
        if (!OPENAI_API_KEY) {
            console.warn(
                "OPENAI_API_KEY não configurada – caindo para busca full-text",
            );
            throw new Error("sem-embedding");
        }

        const embeddingResponse = await fetch(
            "https://api.openai.com/v1/embeddings",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input: query,
                    model: "text-embedding-3-small",
                }),
            },
        );

        if (!embeddingResponse.ok) {
            console.error(
                "Erro ao gerar embedding:",
                await embeddingResponse.text(),
            );
            throw new Error("embedding-fail");
        }

        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding as number[];

        // 2️⃣ Query vetorial usando operador <#> (menor distância = mais semelhante)
        // Usamos RPC raw via supabase-js
        const { data, error } = await supabase.rpc(
            "buscar_documentos_semelhantes",
            {
                p_embedding: queryEmbedding,
                p_topic: topic ? `%${topic.toLowerCase()}%` : null,
                p_limit: 8,
            },
        );

        if (error) {
            console.error("Erro na RPC de busca vetorial:", error);
            throw error;
        }

        const vetorial = (data as Array<{ conteudo: string }>).map((d) =>
            d.conteudo
        );

        if (vetorial.length > 0) return vetorial;

        // Se nada encontrado, buscar via full-text
        console.info(
            "Nenhum contexto vetorial encontrado, usando fallback full-text",
        );

        let q = supabase
            .from("embeddings_conhecimento")
            .select("conteudo")
            .limit(8);

        if (topic) {
            q = q.ilike("titulo", `%${topic}%`);
        }

        q = q.textSearch("conteudo", query, { type: "plain" });

        const { data: ftData } = await q;
        return ftData?.map((d: { conteudo: string }) => d.conteudo) || [];
    } catch (err) {
        // Fallback para busca full-text se algo falhar
        const msg = (err as Error).message || "";
        console.warn("Fallback para busca full-text de documentos", msg);

        let q = supabase
            .from("embeddings_conhecimento")
            .select("conteudo")
            .limit(5);

        if (topic) {
            q = q.ilike("titulo", `%${topic}%`);
        }

        q = q.textSearch("conteudo", query, { type: "plain" });

        const { data } = await q;
        return data?.map((d: { conteudo: string }) => d.conteudo) || [];
    }
}

async function gerarResposta(
    message: string,
    context: string[],
): Promise<string> {
    // Fallback para DeepSeek caso OPENAI_API_KEY não esteja definido
    const deepseekKey = Deno.env.get("DEEPSEEK_API");

    if (!OPENAI_API_KEY && !deepseekKey) {
        return "Desculpe, o serviço de IA não está configurado no momento.";
    }

    const systemPrompt =
        `Você é tutor do ObrasAI. Utilize APENAS o CONTEXTO fornecido para responder de forma didática, em português brasileiro. Se não souber, diga que não possui informação.`;

    const messages = [
        {
            role: "system",
            content: `${systemPrompt}\n\nCONTEXTO:\n${context.join("\n---\n")}`,
        },
        { role: "user", content: message },
    ];

    // DeepSeek ou OpenAI
    const url = deepseekKey && !OPENAI_API_KEY
        ? "https://api.deepseek.com/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${
            deepseekKey && !OPENAI_API_KEY ? deepseekKey : OPENAI_API_KEY
        }`,
    };

    const body = {
        model: deepseekKey && !OPENAI_API_KEY
            ? "deepseek-chat"
            : "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 1200,
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.error(
            "Erro na API de IA:",
            response.status,
            await response.text(),
        );
        throw new Error("Falha ao gerar resposta da IA");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ||
        "Não consegui gerar resposta.";
}

serve(async (req: Request) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getSecureCorsHeaders(origin);

    // Pré-flight CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: { ...getPreflightHeaders(origin) },
        });
    }

    try {
        if (req.method !== "POST") {
            return new Response(
                JSON.stringify({ error: "Método não permitido" }),
                {
                    status: 405,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const { message, topic } = (await req.json()) as TrainingChatRequest;
        if (!message) {
            return new Response(
                JSON.stringify({ error: "Campo 'message' é obrigatório." }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const contextChunks = await getRelevantChunks(message, topic);
        const resposta = await gerarResposta(message, contextChunks);

        return new Response(
            JSON.stringify({
                success: true,
                result: { resposta_bot: resposta },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Erro na função obrasai-training-chat:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Erro interno" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
