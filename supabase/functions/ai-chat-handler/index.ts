
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, obra_id, user_id } = await req.json();

    // Verificar se os parâmetros necessários foram fornecidos
    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Mensagem e ID do usuário são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO: Integrar com serviço de Chatbot AI (Python API ou outro)
    // Aqui é onde você faria a chamada para o serviço de IA
    
    // Por enquanto, vamos apenas retornar uma resposta simples
    const botResponse = "Isso é apenas uma resposta de placeholder. Em breve, esta função será integrada com um modelo de IA para fornecer respostas mais úteis.";

    // Inserir a mensagem e resposta no banco de dados
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        usuario_id: user_id,
        obra_id: obra_id || null,
        mensagem: message,
        resposta_bot: botResponse,
      })
      .select('*')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ result: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat-handler function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
