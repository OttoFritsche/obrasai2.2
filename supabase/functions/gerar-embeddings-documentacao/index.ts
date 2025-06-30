import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { documento, chunks } = await req.json();

    if (!documento || !chunks || !Array.isArray(chunks)) {
      return new Response(
        JSON.stringify({ error: "Documento e chunks são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verificar se a chave da API OpenAI está configurada
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY não configurada" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const resultados = [];

    // Controlar detalhes de log através da variável de ambiente DEBUG ("true" ou "1")
    const isDebug = (Deno.env.get("DEBUG") ?? "").toLowerCase() === "true" ||
      Deno.env.get("DEBUG") === "1";

    // Processar cada chunk
    for (const chunk of chunks) {
      // Gerar embeddings usando a API da OpenAI
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: chunk.conteudo,
          model: "text-embedding-ada-002",
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erro da API OpenAI:", errorData);
        return new Response(
          JSON.stringify({ error: "Erro ao gerar embeddings" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;

      // Log para depuração (omite conteúdo sensível em produção)
      if (isDebug) {
        console.log(
          "Preparando para inserir em embeddings_conhecimento (DEBUG):",
          {
            titulo: chunk.nome_documento || documento,
            conteudo_preview: chunk.conteudo.slice(0, 80) + "…",
            embedding_length: embedding.length,
            tipo_conteudo: documento,
          },
        );
      } else {
        console.log("Preparando para inserir em embeddings_conhecimento:", {
          titulo: chunk.nome_documento || documento,
          embedding_length: embedding.length,
          tipo_conteudo: documento,
        });
      }

      // Tentar inserir diretamente - se a tabela não existir, será criada automaticamente
      // através da migração SQL que deve estar aplicada no banco

      // Inserir no banco de dados (nova tabela)
      const { data: insertData, error: insertError } = await supabase
        .from("embeddings_conhecimento")
        .insert([
          {
            obra_id: null,
            tipo_conteudo: documento,
            referencia_id: crypto.randomUUID(),
            titulo: chunk.nome_documento || documento,
            conteudo: chunk.conteudo,
            conteudo_resumido: chunk.conteudo.slice(0, 120),
            // supabase-js will cast number[] → vector
            embedding,
          },
        ])
        .select();

      if (insertError) {
        let msg = insertError.message || insertError;
        if (String(msg).includes("does not exist")) {
          msg =
            "A tabela embeddings_conhecimento não existe. Certifique-se de rodar a migração correspondente no Supabase.";
        }
        console.error("Erro ao inserir no banco:", insertError);
        return new Response(
          JSON.stringify({
            error: "Erro ao salvar no banco de dados",
            details: msg,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      resultados.push(insertData[0]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        documento,
        chunks_processados: resultados.length,
        resultados,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Erro ao gerar embeddings:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
