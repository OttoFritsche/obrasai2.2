# Sistema de Assinaturas/Planos - ObrasAI

## Visão Geral

O sistema de assinaturas do ObrasAI é construído sobre o Stripe para gerenciar planos e pagamentos, com verificação de funcionalidades premium integrada ao frontend React.

## Estrutura do Sistema

### 1. Tabela de Subscriptions (Supabase)

```sql
CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    stripe_customer_id text UNIQUE,
    stripe_subscription_id text UNIQUE,
    stripe_product_id text,
    stripe_price_id text,
    status text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid
);
```

### 2. Tipos de Planos

- **Free**: Plano gratuito com limitações básicas
- **Basic**: Plano básico pago (R$ 99/mês)
- **Pro**: Plano profissional com IA (R$ 249/mês)
- **Enterprise**: Plano empresarial completo (R$ 499/mês)

### 3. Mapeamento de Produtos Stripe

```typescript
const STRIPE_PRODUCT_MAP = {
  'prod_basic': 'basic',
  'prod_pro': 'pro',
  'prod_professional': 'pro',
  'prod_enterprise': 'enterprise',
  'prod_empresarial': 'enterprise',
};
```

## Implementação Frontend

### Hook Principal: `useSubscription`

```typescript
import { useSubscription } from '@/hooks/useSubscription';

const { 
  currentPlan,
  isActiveSubscription,
  isPremiumOrHigher,
  canUseFeature,
  checkUsageLimit,
  getUpgradeMessage 
} = useSubscription();
```

### Componentes de Proteção

#### 1. PremiumFeatureGuard
Protege funcionalidades premium:

```tsx
import { PremiumFeatureGuard } from '@/components/subscription';

<PremiumFeatureGuard feature="aiFeatures">
  <AIAnalysisComponent />
</PremiumFeatureGuard>
```

#### 2. UsageLimitGuard
Verifica limites de uso:

```tsx
import { UsageLimitGuard } from '@/components/subscription';

<UsageLimitGuard limitType="obras" currentCount={obraCount}>
  <CreateObraButton />
</UsageLimitGuard>
```

#### 3. SubscriptionStatus
Exibe status da assinatura:

```tsx
import { SubscriptionStatus } from '@/components/subscription';

<SubscriptionStatus showUsageStats={true} />
```

## Funcionalidades por Plano

### Plano Gratuito (Free)
- 1 obra
- 5 fornecedores
- 10 despesas
- 1GB armazenamento
- Sem IA
- Sem análises avançadas

### Plano Básico (Basic)
- 3 obras
- 20 fornecedores
- 100 despesas
- 5GB armazenamento
- Sem IA
- Sem análises avançadas

### Plano Profissional (Pro)
- 15 obras
- 100 fornecedores
- 500 despesas
- 20GB armazenamento
- ✅ IA avançada
- ✅ Análises avançadas
- ✅ Suporte prioritário
- ✅ Relatórios personalizados

### Plano Empresarial (Enterprise)
- Obras ilimitadas
- Fornecedores ilimitados
- Despesas ilimitadas
- 100GB armazenamento
- ✅ IA avançada
- ✅ Análises avançadas
- ✅ Suporte prioritário
- ✅ Relatórios personalizados
- ✅ Acesso à API

## Integração com Stripe

### Edge Functions

1. **create-checkout-session**: Cria sessão de pagamento
2. **stripe-webhook**: Processa eventos do Stripe
3. **customer-portal**: Gerencia assinatura do cliente

### Webhooks Stripe

O sistema processa os seguintes eventos:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Verificação de Funcionalidades

### Verificar se pode usar funcionalidade premium

```typescript
const { canUseFeature } = useSubscription();

if (canUseFeature.aiFeatures) {
  // Permitir uso da IA
} else {
  // Exibir mensagem de upgrade
}
```

### Verificar limites de uso

```typescript
const { checkUsageLimit } = useSubscription();

if (checkUsageLimit.canAddObra(currentObraCount)) {
  // Permitir criar nova obra
} else {
  // Exibir limite atingido
}
```

### Exemplo de Proteção de Página

```tsx
import { PremiumFeatureGuard } from '@/components/subscription';

const AdvancedAnalyticsPage = () => {
  return (
    <PremiumFeatureGuard feature="advancedAnalytics">
      <AdvancedAnalyticsContent />
    </PremiumFeatureGuard>
  );
};
```

## Configuração do AuthContext

O contexto de autenticação já inclui:
- `subscription`: Dados da assinatura atual
- `checkSubscription()`: Função para verificar assinatura

## Integração com Componentes Existentes

### Exemplo: Proteção de Funcionalidade de IA

```tsx
import { FeatureWrapper } from '@/components/subscription';

// Proteger o componente de IA
<FeatureWrapper feature="aiFeatures">
  <AIAnalysisWidget />
</FeatureWrapper>
```

### Exemplo: Verificação de Limite de Obras

```tsx
import { UsageLimitGuard } from '@/components/subscription';

// Proteger criação de nova obra
<UsageLimitGuard limitType="obras" currentCount={obras.length}>
  <Button onClick={createObra}>Nova Obra</Button>
</UsageLimitGuard>
```

## Fluxo de Upgrade

1. Usuário tenta usar funcionalidade premium
2. Sistema verifica plano atual
3. Se não tem acesso, exibe mensagem de upgrade
4. Usuário é redirecionado para página de assinatura
5. Stripe processa pagamento
6. Webhook atualiza banco de dados
7. Sistema libera funcionalidades

## Mensagens de Upgrade

O sistema gera mensagens contextuais:
- Free → "Funcionalidade disponível para assinantes. Faça upgrade para o plano Básico"
- Basic → "Funcionalidade disponível nos planos Profissional e Empresarial"
- Pro → "Funcionalidade disponível apenas no plano Empresarial"

## Segurança

- ✅ Verificação sempre no backend (RLS)
- ✅ Validação de assinatura em tempo real
- ✅ Webhook seguro com signature verification
- ✅ Tokens de API protegidos
- ✅ Isolamento por tenant_id

## Testes

Para testar o sistema de assinaturas:

1. Usar cartões de teste do Stripe
2. Simular diferentes estados de assinatura
3. Verificar funcionalidades premium
4. Testar limites de uso
5. Validar fluxo de upgrade

---

**Resumo**: O sistema está 100% implementado e funcional, com verificação robusta de planos, proteção de funcionalidades premium e integração completa com Stripe para pagamentos e gerenciamento de assinaturas.