# 🤖 Widget de IA - Configuração e Uso

## 📋 **Visão Geral**

O Widget de IA do ObrasAI fornece insights automáticos sobre métricas de negócio
e permite conversação interativa com uma IA especializada em gestão de obras.

---

## 🎯 **Funcionalidades do Widget**

### **📊 Análises Disponíveis:**

- **Taxa de Conversão:** Análise de leads vs usuários
- **Churn Rate:** Identificação de problemas de retenção
- **LTV/CAC Ratio:** Eficiência de marketing
- **Adoção de IA:** Uso das funcionalidades inteligentes
- **Crescimento:** Tendências e oportunidades

### **🎨 Interface:**

- **Botão Flutuante:** Canto inferior direito
- **Widget Expansível:** 500px de altura quando aberto
- **Minimizável:** Para não atrapalhar a visualização
- **Auto-refresh:** Análise automática quando métricas mudam

### **🔄 Estados:**

- **Carregando:** Spinner durante análise
- **Sucesso:** Insights coloridos por prioridade
- **Erro:** Fallback para análises mock
- **Vazio:** Botão para analisar métricas

### **💬 Chat Interativo**

- **Conversação em tempo real** com IA especializada
- **Contexto automático** das métricas atuais
- **Respostas inteligentes** mesmo sem OpenAI API
- **Interface de chat moderna** com histórico

---

## 🚀 **Como Usar**

### **1. Acessar Dashboard**

```
http://localhost:8082/admin/metrics
```

### **2. Ativar Widget**

- Clique no botão roxo flutuante (🤖)
- O widget se expandirá automaticamente

### **3. Analisar Métricas**

- A análise é automática quando o widget abre
- Use o botão ↻ para nova análise
- Minimize com o botão ⊟ se necessário

### **4. Interpretar Insights**

#### **🎨 Tipos de Insight:**

- 🟢 **Success:** Métricas saudáveis
- 🟡 **Warning:** Atenção necessária
- 🔴 **Danger:** Problemas críticos
- 🔵 **Info:** Informações gerais

#### **⚡ Prioridades:**

- **High:** Ação imediata necessária
- **Medium:** Monitorar de perto
- **Low:** Manter o bom trabalho

### **Abas Disponíveis**

#### 📊 Insights

- Análise automática das métricas
- Botão "Analisar Métricas" para refresh manual
- Cards com recomendações específicas

#### 💬 Chat

- Digite perguntas sobre suas métricas
- Exemplos de perguntas:
  - "Como está minha taxa de conversão?"
  - "O que posso fazer para reduzir o churn?"
  - "Meu LTV/CAC está bom?"
  - "Como aumentar o uso da IA?"

---

## 🛠️ **Implementação Técnica**

### **Arquivos Criados:**

```
src/services/aiInsightsApi.ts      # Serviço de IA
src/components/admin/AIInsightsWidget.tsx  # Widget React
```

### **Integração:**

```typescript
// No MetricsDashboard.tsx
import { AIInsightsWidget } from "@/components/admin/AIInsightsWidget";

<AIInsightsWidget
    metrics={metrics}
    isVisible={aiWidgetVisible}
    onToggle={() => setAiWidgetVisible(!aiWidgetVisible)}
/>;
```

### **Prompt de Análise:**

O sistema envia para a OpenAI:

- Todas as métricas atuais
- Contexto do negócio (SaaS de construção)
- Solicitação de insights estruturados
- Foco em ações práticas

---

## 🔒 **Segurança e Privacidade**

### **✅ Boas Práticas:**

- API key nunca exposta no código
- Dados enviados apenas quando necessário
- Fallback para modo offline
- Logs de erro sem dados sensíveis

### **📊 Dados Enviados:**

- Métricas agregadas (números)
- Não inclui dados pessoais
- Não inclui informações de usuários
- Apenas KPIs de negócio

---

## 🚧 **Modo Fallback (Sem API Key)**

Se a OpenAI API não estiver configurada, o widget funciona com:

### **Análises Mock:**

- Taxa de conversão vs benchmarks
- Churn rate vs metas
- LTV/CAC ratio vs padrões SaaS
- Adoção de funcionalidades

### **Insights Inteligentes:**

- Baseados em regras de negócio
- Comparação com métricas padrão
- Recomendações práticas
- Priorização automática

---

## 📈 **Exemplos de Insights**

### **🟡 Warning - Taxa de Conversão Baixa**

```
Sua conversão está em 8.5%, abaixo da média de SaaS (15%).
💡 Recomendação: Otimize o onboarding e melhore a qualificação de leads.
```

### **🔴 Danger - Churn Elevado**

```
Churn de 7.2% indica problemas de retenção.
💡 Recomendação: Implemente programa de sucesso do cliente e melhore o produto.
```

### **🟢 Success - LTV/CAC Saudável**

```
Ratio de 4.2x está acima do ideal (3x+).
💡 Recomendação: Continue investindo nos canais que estão convertendo bem.
```

---

## 🔧 **Troubleshooting**

### **Widget não aparece:**

- Verifique se está na rota `/admin/metrics`
- Confirme se o usuário está logado
- Verifique console por erros

### **Análise não funciona:**

- Confirme a OPENAI_API_KEY no .env
- Verifique se reiniciou o servidor
- Teste com dados mock primeiro

### **Insights vazios:**

- Verifique se há métricas carregadas
- Tente o botão de refresh manual
- Verifique logs de erro no console

### **🚨 Erro de Content Security Policy (CSP):**

```
Refused to connect to 'https://api.openai.com/v1/chat/completions' 
because it violates the following Content Security Policy directive
```

**✅ Solução Aplicada:** O domínio `https://api.openai.com` foi adicionado ao
CSP no arquivo `index.html`:

```html
<!-- Antes -->
connect-src 'self' https://*.supabase.co wss://*.supabase.co
https://ottodevsystem.app.n8n.cloud https://api.deepseek.com

<!-- Depois -->
connect-src 'self' https://*.supabase.co wss://*.supabase.co
https://ottodevsystem.app.n8n.cloud https://api.deepseek.com
https://api.openai.com
```

**🔄 Se o erro persistir:**

1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Reinicie o servidor: `npm run dev`
3. Verifique se o arquivo `index.html` foi atualizado

---

## 💰 **Custos da OpenAI**

### **Estimativa de Uso:**

- **Modelo:** GPT-3.5-turbo
- **Tokens por análise:** ~500-800
- **Custo por análise:** ~$0.001-0.002
- **Uso mensal estimado:** <$5

### **Otimizações:**

- Cache de análises por 5 minutos
- Análise apenas quando métricas mudam
- Fallback para modo offline
- Limite de requests por hora

---

## 🎉 **Resultado**

O Widget de IA transforma dados brutos em insights acionáveis, ajudando a:

- **Identificar problemas** antes que se tornem críticos
- **Descobrir oportunidades** de crescimento
- **Otimizar métricas** com recomendações práticas
- **Tomar decisões** baseadas em dados inteligentes

**Acesse agora:** `http://localhost:8082/admin/metrics` e clique no botão 🤖!
