# 🔐 Acesso Administrativo - ObrasAI 2.2

## 📊 Dashboard de Métricas Executivo

### 🎯 **Propósito**

Dashboard exclusivo para **administradores do sistema ObrasAI** monitorarem
métricas de negócio em tempo real.

### 👥 **Quem pode acessar:**

- ✅ **CEO/Fundador** da ObrasAI
- ✅ **Equipe de gestão** da empresa
- ✅ **Analistas de negócio** internos
- ✅ **Investidores** (acesso limitado)
- ❌ **Usuários finais** (clientes da plataforma)

---

## 🚀 **Como Acessar**

### **URL Direta:**

```
https://obrasai.com/admin/metrics
```

### **Requisitos:**

1. **Login ativo** na plataforma
2. **Permissões administrativas** (a implementar)
3. **Acesso à rede** autorizada

---

## 📈 **Métricas Disponíveis**

### **📊 Visão Geral**

- Total de leads capturados
- Usuários ativos
- Receita mensal (MRR)
- Taxa de conversão

### **🎯 Leads**

- Leads por fonte
- Taxa de conversão por canal
- Qualidade dos leads
- Funil de conversão

### **👥 Usuários**

- Usuários ativos/inativos
- Novos registros
- Taxa de churn
- Retenção por coorte

### **🤖 Produto**

- Uso das funcionalidades IA
- Orçamentos gerados
- Buscas SINAPI
- Uploads de notas fiscais

### **💰 Financeiro**

- MRR/ARR
- CAC (Custo de Aquisição)
- LTV (Lifetime Value)
- Distribuição por planos

---

## 🔧 **Funcionalidades**

### **⚡ Tempo Real**

- Auto-refresh a cada 5 minutos
- Botão de atualização manual
- Timestamp da última atualização

### **📱 Responsivo**

- Interface adaptada para desktop/mobile
- Gráficos otimizados
- Navegação por abas

### **🔒 Segurança**

- Header administrativo com identificação
- Badge de "ACESSO RESTRITO"
- Logout rápido

---

## 🛠️ **Implementação Técnica**

### **Arquivos:**

```
src/pages/admin/MetricsDashboard.tsx  # Dashboard principal
src/services/analyticsApi.ts          # API de métricas
supabase/migrations/analytics_events  # Tabela de eventos
```

### **Rota:**

```typescript
<Route
    path="admin/metrics"
    element={
        <ProtectedRoute>
            <MetricsDashboard />
        </ProtectedRoute>
    }
/>;
```

### **Controle de Acesso (TODO):**

```typescript
// Implementar verificação de role
const isAdmin = user?.role === "admin" || user?.role === "super_admin";
if (!isAdmin) {
    navigate("/dashboard");
    return;
}
```

---

## 🚧 **Próximos Passos**

### **Segurança:**

1. ✅ Rota administrativa criada
2. 🔄 Implementar roles/permissões
3. 🔄 Autenticação 2FA para admins
4. 🔄 Logs de acesso administrativo

### **Funcionalidades:**

1. ✅ Métricas básicas implementadas
2. 🔄 Exportação de relatórios
3. 🔄 Alertas automáticos
4. 🔄 Comparação temporal

### **Monitoramento:**

1. 🔄 Alertas de anomalias
2. 🔄 Notificações por email
3. 🔄 Dashboard mobile app
4. 🔄 Integração com Slack

---

## ⚠️ **Importante**

> **Este dashboard contém informações confidenciais do negócio.**
>
> - Não compartilhar credenciais de acesso
> - Não fazer screenshots de métricas sensíveis
> - Reportar qualquer acesso suspeito
> - Usar apenas para fins autorizados

---

## 📞 **Suporte**

Para questões sobre acesso administrativo:

- **Email:** admin@obrasai.com
- **Slack:** #admin-support
- **Emergência:** +55 11 99999-9999
