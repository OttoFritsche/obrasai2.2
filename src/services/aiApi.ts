
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  id: string;
  usuario_id: string;
  obra_id?: string | null;
  mensagem: string;
  resposta_bot: string | null;
  created_at: string;
};

export type AIInsight = {
  id: string;
  obra_id: string;
  insight_type: string;
  insight_data: any;
  summary_ptbr: string | null;
  generated_at: string;
  created_at: string;
};

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
    
    if (error) throw error;
    return data as ChatMessage[];
  },

  sendMessage: async (message: string, obraId?: string | null): Promise<ChatMessage> => {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        usuario_id: userData.user.id,
        mensagem: message,
        obra_id: obraId || null
      })
      .select("*")
      .single();
    
    if (error) throw error;
    return data as ChatMessage;
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

  generateInsight: async (obraId: string, insightType: string, data: any = {}) => {
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
  }
};
