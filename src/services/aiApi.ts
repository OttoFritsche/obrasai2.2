import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analyticsApi";

export interface ChatMessage {
  id: string;
  usuario_id: string;
  obra_id?: string | null;
  mensagem: string;
  resposta_bot: string | null;
  created_at: string;
}

export interface AIInsight {
  id: string;
  obra_id: string;
  insight_type: string;
  insight_data: {
    detalhe?: string;
    recomendacao?: string;
    valor_estimado?: number;
    probabilidade?: number;
    impacto?: string;
    prioridade?: "alta" | "media" | "baixa";
    [key: string]: unknown;
  };
  summary_ptbr: string | null;
  generated_at: string;
  created_at: string;
}

export const aiApi = {
  // Chat Messages
  getMessages: async (obraId?: string | null): Promise<ChatMessage[]> => {
    let query = supabase
      .from("chat_messages")
      .select("*")
      .order("created_at");

    if (obraId) {
      query = query.eq("obra_id", obraId);
    } else {
      query = query.is("obra_id", null);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as ChatMessage[];
  },

  sendMessage: async (
    message: string,
    obraId?: string | null,
    mode: "chat" | "training" = "chat",
    topic?: string,
  ): Promise<ChatMessage> => {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    // Obter o token de sessão
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");

    // Gerar um token CSRF simples (em produção, use algo mais robusto)
    const csrfToken = btoa(Math.random().toString()).substring(0, 16);

    // Determinar endpoint de acordo com o modo
    const endpoint = mode === "training"
      ? "obrasai-training-chat"
      : "ai-chat-handler";

    // Montar body conforme endpoint
    const body = mode === "training"
      ? {
        message,
        topic: topic || null,
        user_id: userData.user.id,
      }
      : {
        message,
        obra_id: obraId || null,
        user_id: userData.user.id,
      };

    const { data, error } = await supabase.functions.invoke(endpoint, {
      body,
      headers: {
        "x-csrf-token": csrfToken,
      },
    });

    if (error) {
      console.error("Erro ao chamar Edge Function:", error);
      throw new Error(error.message || "Erro ao processar mensagem com IA");
    }

    // A Edge Function retorna o objeto completo da mensagem salva
    if (data?.result) {
      // 📊 Track uso da IA Chat
      await analytics.trackAIUsage(
        mode === "training" ? "training_chat" : "chat",
        {
          user_message: message,
          obra_id: obraId,
          ai_response_length: data.result.resposta_bot?.length || 0,
          conversation_type: mode === "training"
            ? "training"
            : obraId
            ? "contextual_obra"
            : "general_chat",
        },
      );

      return data.result as ChatMessage;
    } else {
      throw new Error("Resposta inválida da IA");
    }
  },

  // AI Insights
  getInsights: async (obraId: string): Promise<AIInsight[]> => {
    const { data, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("obra_id", obraId)
      .order("generated_at", { ascending: false });

    if (error) throw error;
    return data as AIInsight[];
  },

  generateInsight: async (
    obraId: string,
    insightType: string,
    data: Record<string, unknown> = {},
  ) => {
    // TODO: Na implementação real, este método chamaria uma Edge Function
    // que faria o processamento AI e depois salvaria os resultados
    console.log(`Generating ${insightType} insight for obra ${obraId}`);

    // Mock implementation - apenas para demonstração
    const mockInsight = {
      obra_id: obraId,
      insight_type: insightType,
      insight_data: data,
      summary_ptbr: "Este é um resumo gerado automaticamente pelo sistema.",
      // generated_at e created_at serão preenchidos pelo Supabase
    };

    const { data: insertedData, error } = await supabase
      .from("ai_insights")
      .insert(mockInsight)
      .select("*")
      .single();

    if (error) throw error;
    return insertedData;
  },

  // Embeddings
  generateEmbeddings: async (
    obraId: string,
    tipoConteudo: "obra" | "despesas" | "fornecedores" | "todos" = "todos",
  ) => {
    const { data, error } = await supabase.functions.invoke(
      "gerar-embeddings-obra",
      {
        body: {
          obra_id: obraId,
          tipo_conteudo: tipoConteudo,
        },
      },
    );

    if (error) {
      console.error("Erro ao gerar embeddings:", error);
      throw new Error(error.message || "Erro ao gerar embeddings");
    }

    return data;
  },

  // Buscar conhecimento semântico
  searchKnowledge: async (obraId: string, query: string) => {
    // Este método seria usado internamente pela Edge Function de chat
    // mas pode ser útil para outras funcionalidades futuras
    const { data, error } = await supabase
      .rpc("buscar_conhecimento_semantico", {
        p_obra_id: obraId,
        p_query_embedding: query, // Seria o embedding da query
        p_limite: 10,
        p_threshold: 0.7,
      });

    if (error) throw error;
    return data;
  },

  clearMessages: async (obraId?: string | null): Promise<void> => {
    let query = supabase
      .from("chat_messages")
      .delete();

    if (obraId) {
      query = query.eq("obra_id", obraId);
    } else {
      query = query.is("obra_id", null);
    }

    // Adicionar filtro por usuário para segurança
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");

    query = query.eq("usuario_id", userData.user.id);

    const { error } = await query;

    if (error) {
      throw error;
    }
  },
};
