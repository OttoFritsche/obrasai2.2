---
description: 
globs: 
alwaysApply: true
---
# 🧠 Regras Específicas do Projeto ObrasAI

**Sempre fale em português brasileiro.**

## 🎯 Objetivo do Projeto

Desenvolver e manter o **ObrasAI** como uma plataforma completa de gestão de
obras com foco em **captura inteligente de leads**, automação de processos e
integração com sistemas externos. O sistema deve ser escalável, modular e de
alta qualidade, priorizando a simplicidade e eficiência.

## 📌 Princípios Fundamentais ObrasAI

### 🚀 **Simplicidade Primeiro**

- **KISS (Keep It Simple, Stupid):** Sempre preferir soluções simples e diretas
- **Funcionalidade sobre complexidade:** Priorizar que funcione bem antes de
  otimizar
- **Fluxos lineares:** Especialmente em n8n, evitar complexidade desnecessária
- **UX intuitiva:** Interface e chatbot devem ser autoexplicativos

### **Stack Tecnológica Principal**

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Database + Edge Functions + Auth + RLS)
- **Automação:** n8n (captura de leads, integrações, notificações)
- **Chatbot:** React component integrado na landing page
- **Integrações:** Google Sheets, Gmail, WhatsApp (futuro)

### **🚨 Regra Crítica de Arquitetura**

- **Limite de Tamanho de Arquivos:** Arquivos não devem exceder **400-500 linhas de código**. Arquivos maiores devem ser **obrigatoriamente refatorados** em módulos menores para facilitar manutenção, legibilidade e evitar complexidade excessiva. Aplicar princípio da responsabilidade única.

## 🗄️ **Arquitetura de Dados**

### **Estrutura de Leads (Tabela Principal)**

```sql
CREATE TABLE leads (
  email VARCHAR(255) PRIMARY KEY,
  nome VARCHAR(255),
  telefone VARCHAR(255),
  empresa VARCHAR(255),
  cargo VARCHAR(255),
  interesse VARCHAR(100),
  origem VARCHAR(100),
  data_lead TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Princípios de Dados**

- **Email como chave primária:** Evita duplicatas naturalmente
- **Campos obrigatórios mínimos:** Apenas email é obrigatório
- **Origem sempre rastreada:** Para análise de performance de canais
- **Timestamp automático:** Para análise temporal dos leads

## 🔄 **Fluxos de Automação Padrão**

### **Fluxo Principal: Captura de Leads**

```
Chatbot → Webhook n8n → Preparar Dados → Google Sheets → Supabase → Email Notificação
```

### **Diretrizes para Fluxos n8n**

1. **Máximo 5-6 nós por fluxo:** Manter simplicidade
2. **Tratamento de erro em cada nó crítico:** Especialmente integrações externas
3. **Mapeamento explícito de dados:** Sem referências complexas entre nós
4. **Logs detalhados:** Para debugging e monitoramento
5. **Fallbacks simples:** Backup no Google Sheets se Supabase falhar

## 🛡️ **Segurança e Compliance**

### **LGPD e Proteção de Dados**

- **Consentimento explícito:** Chatbot deve informar sobre coleta de dados
- **Finalidade específica:** Dados coletados apenas para contato comercial
- **Retenção controlada:** Política clara de retenção de dados de leads
- **Direito ao esquecimento:** Capacidade de remover dados a pedido

### **Segurança Técnica**

- **RLS obrigatório:** Todas as tabelas devem ter Row Level Security
- **Validação dupla:** Frontend (UX) + Backend (segurança)
- **Tokens seguros:** Variáveis de ambiente para todas as integrações
- **Logging de acesso:** Auditoria de quem acessa quais dados

## 🎨 **Padrões de Interface (Frontend)**

### **Chatbot Landing Page**

- **Design mobile-first:** Maioria dos leads vem de mobile
- **Carregamento rápido:** Otimização para performance
- **Campos mínimos:** Apenas o essencial para não afugentar leads
- **Feedback imediato:** Confirmação visual de envio
- **Tratamento de erro gracioso:** Mensagens amigáveis para problemas

### **Dashboard Admin (Futuro)**

- **Componentes shadcn/ui:** Manter consistência visual
- **Responsivo:** Funcionar bem em desktop e tablet
- **Filtros intuitivos:** Busca e filtro de leads por origem, data, etc.
- **Métricas claras:** KPIs visuais e de fácil compreensão

## 🔌 **Integração e APIs**

### **Webhook Patterns**

- **URL padrão:** `/webhook/{modulo}-{acao}` (ex: `/webhook/leads-capture`)
- **Timeout configurado:** Máximo 30 segundos
- **Retry policy:** 3 tentativas com backoff exponencial
- **Status codes claros:** 200 (sucesso), 400 (erro cliente), 500 (erro
  servidor)

### **Edge Functions Supabase**

- **Resposta padronizada:** Sempre JSON com `success`, `data`, `error`
- **Validação de entrada:** Zod ou similar para validar payloads
- **Error handling:** Try-catch com logging detalhado
- **CORS configurado:** Apenas para domínios autorizados

## 📊 **Monitoramento e Analytics**

### **Métricas Chave**

- **Taxa de conversão do chatbot:** Visitantes → Leads
- **Origem dos leads:** Qual canal traz mais leads qualificados
- **Taxa de erro das automações:** Sucesso dos fluxos n8n
- **Tempo de resposta:** Webhook e Edge Functions

### **Alertas Críticos**

- **Falha na captura de leads:** Sistema principal não pode falhar
- **Erro nas automações:** n8n workflows parados
- **Problemas de integração:** Google Sheets, Gmail inacessíveis
- **Volume anômalo:** Muitos leads ou muito poucos (possível problema)

## 🧪 **Estratégia de Testes**

### **Testes Manuais (Prioridade)**

1. **Fluxo completo de lead:** Chatbot → Email recebido
2. **Teste de diferentes origens:** Web, mobile, diferentes navegadores
3. **Teste de campos obrigatórios:** Validações funcionando
4. **Teste de duplicatas:** Mesmo email não duplica

### **Testes Automatizados (Futuro)**

- **Cypress para chatbot:** Teste E2E do fluxo principal
- **Jest para funções utilitárias:** Validações, formatações
- **Postman para APIs:** Edge Functions e webhooks

## 📈 **Escalabilidade e Performance**

### **Preparação para Crescimento**

- **Indexação de tabelas:** Índices em campos de busca frequente
- **Cache estratégico:** React Query para dados que mudam pouco
- **CDN para assets:** Otimização de carregamento de imagens
- **Database pooling:** Configuração adequada do Supabase

### **Otimizações Específicas**

- **Lazy loading:** Componentes pesados carregam sob demanda
- **Debounce em buscas:** Evitar queries excessivas
- **Paginação:** Listas de leads paginadas
- **Compressão de imagens:** WebP quando possível

## 🔄 **Processo de Desenvolvimento**

### **Git Workflow**

- **Branches:** `feature/`, `fix/`, `hotfix/`
- **Commits semânticos:** `feat:`, `fix:`, `docs:`, `refactor:`
- **Pull Requests:** Code review obrigatório
- **Hotfixes:** Para problemas críticos em produção

### **Deploy Strategy**

- **Staging environment:** Testes antes da produção
- **Zero downtime:** Deploys sem interrupção do serviço
- **Rollback plan:** Capacidade de voltar versão anterior rapidamente
- **Feature flags:** Para funcionalidades em desenvolvimento

## 🎯 **Roadmap Técnico**

### **Fase 1: MVP (Atual)**

- ✅ Chatbot funcional
- ✅ Captura de leads básica
- ✅ Integração Google Sheets
- ✅ Notificação por email
- 🔄 Integração Supabase

### **Fase 2: Melhorias (Q1 2025)**

- 📋 Dashboard admin
- 📋 Filtros e busca de leads
- 📋 Analytics básico
- 📋 WhatsApp integration
- 📋 CRM integration

### **Fase 3: Escalabilidade (Q2 2025)**

- 📋 IA para qualificação de leads
- 📋 Multi-tenancy
- 📋 API pública
- 📋 Mobile app

## 🤖 **Diretrizes para IA Assistente**

### **Ao Desenvolver**

1. **Sempre confirmar antes de deletar:** Código, arquivos ou configurações
2. **Explicar o "porquê":** Não apenas o "como", mas justificar decisões
3. **Contexto ObrasAI:** Exemplos sempre relacionados a gestão de obras
4. **Simplicidade first:** Preferir solução simples que funciona
5. **Testar o fluxo completo:** Sempre validar end-to-end

### **Ao Debuggar**

1. **Identificar a origem:** Chatbot, n8n, Supabase, etc.
2. **Logs detalhados:** Pedir logs específicos para diagnóstico
3. **Teste isolado:** Testar cada componente separadamente
4. **Fallback strategy:** Sempre ter plano B para funcionalidades críticas

### **Ao Refatorar**

1. **Manter funcionalidade:** Não quebrar o que funciona
2. **Documentar mudanças:** Explicar impacto e benefícios
3. **Teste após mudança:** Validar que tudo ainda funciona
4. **Commit atômico:** Uma mudança lógica por commit

---

## 📝 **Conclusão**

O **ObrasAI** deve ser desenvolvido com foco na **simplicidade, confiabilidade e
escalabilidade**. Cada decisão técnica deve considerar o impacto no usuário
final (empresa de obras buscando leads) e na operação do negócio (captura
eficiente de leads qualificados).

**Lembre-se:** _É melhor ter uma solução simples que funciona 100% do tempo do
que uma solução complexa que funciona 90% do tempo._

---

_Última atualização: 2024-12-27_ _Versão: 1.0.0_
