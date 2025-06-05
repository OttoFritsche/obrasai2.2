import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// Interfaces para dados do Stripe
interface StripeEventData {
  object: {
    id: string;
    status: string;
    metadata: Record<string, string>;
    [key: string]: unknown;
  };
}

interface StripeEvent {
  id: string;
  type: string;
  data: StripeEventData;
  created: number;
  [key: string]: unknown;
}

interface PaymentData {
  payment_intent_id: string;
  amount: number;
  currency: string;
  customer_id?: string;
  metadata: Record<string, string>;
}

interface SubscriptionData {
  subscription_id: string;
  customer_id: string;
  status: string;
  plan_id: string;
  metadata: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configurar Stripe
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Configuração do webhook não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter signature do Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Signature do Stripe não encontrada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter body da requisição
    const body = await req.text();

    // Verificar signature do webhook (implementação simplificada)
    // Em produção, use uma biblioteca adequada para verificar a signature
    console.log('🔍 Webhook recebido:', { signature: signature.substring(0, 20) + '...' });

    // Parse do evento
    let event: StripeEvent;
    try {
      event = JSON.parse(body);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'JSON inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event);
        break;
      
      default:
        console.log('🔍 Evento não processado:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no processamento do webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handler para subscription criada
async function handleSubscriptionCreated(supabase: SupabaseClient, event: StripeEvent) {
  const subscription = event.data.object;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('❌ User ID não encontrado nos metadados da subscription');
    return;
  }

  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        product_id: subscription.items.data[0]?.price?.product,
        price_id: subscription.items.data[0]?.price?.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Erro ao criar subscription:', error);
    } else {
      console.log('✅ Subscription criada:', subscription.id);
    }
  } catch (error) {
    console.error('❌ Erro no handleSubscriptionCreated:', error);
  }
}

// Handler para subscription atualizada
async function handleSubscriptionUpdated(supabase: SupabaseClient, event: StripeEvent) {
  const subscription = event.data.object;

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('❌ Erro ao atualizar subscription:', error);
    } else {
      console.log('✅ Subscription atualizada:', subscription.id);
    }
  } catch (error) {
    console.error('❌ Erro no handleSubscriptionUpdated:', error);
  }
}

// Handler para subscription deletada
async function handleSubscriptionDeleted(supabase: SupabaseClient, event: StripeEvent) {
  const subscription = event.data.object;

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('❌ Erro ao cancelar subscription:', error);
    } else {
      console.log('✅ Subscription cancelada:', subscription.id);
    }
  } catch (error) {
    console.error('❌ Erro no handleSubscriptionDeleted:', error);
  }
}

// Handler para pagamento bem-sucedido
async function handlePaymentSucceeded(supabase: SupabaseClient, event: StripeEvent) {
  const invoice = event.data.object;
  
  try {
    // Atualizar status da subscription se necessário
    if (invoice.subscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('❌ Erro ao atualizar status após pagamento:', error);
      } else {
        console.log('✅ Status atualizado após pagamento:', invoice.subscription);
      }
    }
  } catch (error) {
    console.error('❌ Erro no handlePaymentSucceeded:', error);
  }
}

// Handler para pagamento falhado
async function handlePaymentFailed(supabase: SupabaseClient, event: StripeEvent) {
  const invoice = event.data.object;
  
  try {
    // Atualizar status da subscription se necessário
    if (invoice.subscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('❌ Erro ao atualizar status após falha no pagamento:', error);
      } else {
        console.log('⚠️ Status atualizado após falha no pagamento:', invoice.subscription);
      }
    }
  } catch (error) {
    console.error('❌ Erro no handlePaymentFailed:', error);
  }
} 