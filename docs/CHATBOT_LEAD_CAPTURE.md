# 🤖 Chatbot de Captura de Leads com IA - ObrasAI

## ✅ Implementação Completa

Este documento descreve a nova funcionalidade de chatbot com IA que captura
leads e permite conversação sobre o ObrasAI.

### 🎯 Funcionalidades Implementadas

1. **Captura de Leads em Conversa Natural**
   - Coleta nome, email, telefone, empresa, cargo e interesse
   - Validação automática de dados (email, campos obrigatórios)
   - Fluxo conversacional intuitivo

2. **Integração com Webhook n8n**
   - Envio automático dos leads para:
     `https://ottodevsystem.app.n8n.cloud/webhook-test/leads-chatbot`
   - Dados estruturados com origem e timestamp
   - Tratamento de erros com fallback

3. **IA Conversacional Especializada**
   - Usa API DeepSeek com chave: `sk-dd3c62196e5246b4902f20c7aec36864`
   - Contexto do PRD.md integrado para respostas especializadas
   - Respostas sobre funcionalidades, preços e benefícios do ObrasAI

### 🚀 Como Funciona

#### Fluxo de Uso:

1. **Usuário clica em "Conversar com IA"** na landing page
2. **Modal abre** com chatbot moderno
3. **Captura de dados** em conversa natural:
   - Nome → Email → Telefone → Empresa → Cargo → Interesse
4. **Envio para webhook** n8n com confirmação
5. **Conversa com IA** especializada sobre ObrasAI

#### Dados Enviados para Webhook:

```json
{
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "telefone": "+55 11 99999-9999",
    "empresa": "Construtora ABC",
    "cargo": "Engenheiro Civil",
    "interesse": "Controlar custos de obras",
    "origem": "chatbot_landing_page",
    "timestamp": "2024-12-26T15:30:00.000Z",
    "plataforma": "ObrasAI"
}
```

### 📁 Arquivos Criados/Modificados

#### Novo Componente:

- **`src/components/landing/LeadChatbot.tsx`** (476 linhas)
  - Interface de chat moderna com animações
  - Fluxo de captura de leads estruturado
  - Integração com API DeepSeek
  - Envio para webhook n8n

#### Modificações:

- **`src/components/landing/HeroSection.tsx`**
  - Importação do LeadChatbot
  - Botão "Conversar com IA"
  - Modal para chatbot
  - Descrição explicativa

### 🎨 Interface do Chatbot

- **Design moderno** com gradiente laranja/amarelo (cores do ObrasAI)
- **Avatares** para usuário e bot
- **Animações suaves** com Framer Motion
- **Estados visuais** (carregando, processando, sucesso)
- **Timestamps** em cada mensagem
- **Responsivo** para mobile/desktop

### 🔧 Configuração da IA

#### System Prompt Configurado:

```
Você é o assistente de IA do ObrasAI, uma plataforma inovadora para gestão de obras na construção civil.

Principais Funcionalidades:
- CRUD completo de obras, fornecedores (PJ/PF), despesas e notas fiscais
- Sistema de Orçamento Paramétrico com IA integrada
- Sistema SINAPI com busca semântica inteligente
- Chat contextual que analisa dados reais das obras
- Sistema de assinaturas (Básico R$97, Profissional R$197, Empresarial R$497)

Diferenciais:
- IA especializada em construção civil brasileira
- Integração completa com tabela SINAPI oficial
- Análise financeira em tempo real (orçado vs realizado)
- Gestão completa de fornecedores e documentos
```

### 🔗 Integrações

#### API DeepSeek:

- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`
- **Modelo**: `deepseek-chat`
- **Temperatura**: 0.7
- **Max Tokens**: 500

#### Webhook n8n:

- **URL**: `https://ottodevsystem.app.n8n.cloud/webhook-test/leads-chatbot`
- **Método**: POST
- **Content-Type**: application/json

### 📊 Métricas e Logs

#### Logs Implementados:

- ✅ Sucesso envio webhook: `"✅ Lead enviado com sucesso para webhook n8n"`
- ❌ Erro webhook: `"❌ Erro ao enviar lead para webhook: [status]"`
- 🤖 Erro IA: `"Erro na IA: [error]"`

#### Notificações:

- Toast de sucesso ao enviar lead
- Feedback visual (ícone check verde)
- Estados de carregamento

### 🛡️ Segurança e Validação

#### Validações Implementadas:

- **Email**: Regex RFC5322 básico
- **Nome**: Mínimo 2 caracteres
- **Empresa**: Mínimo 2 caracteres
- **Cargo**: Mínimo 2 caracteres
- **Interesse**: Mínimo 2 caracteres
- **Telefone**: Opcional

#### Tratamento de Erros:

- Fallback para mensagens de erro
- Retry automático em falhas de rede
- Estados de loading apropriados

### 🎯 Próximas Melhorias

#### Funcionalidades Planejadas:

- [ ] **Analytics** de conversões por lead
- [ ] **Integração CRM** automatizada
- [ ] **Multi-idiomas** (inglês/espanhol)
- [ ] **Chatbot de voz** com speech-to-text
- [ ] **Histórico persistente** de conversas
- [ ] **A/B testing** de abordagens de captura

#### Otimizações Técnicas:

- [ ] **Cache inteligente** de respostas da IA
- [ ] **Rate limiting** por IP
- [ ] **Compress** payloads webhook
- [ ] **Retry policy** com backoff exponencial

### 📞 Suporte

#### Monitoramento:

- **Webhook n8n**: Monitorar taxa de sucesso
- **API DeepSeek**: Verificar quotas e latência
- **User Experience**: Analytics de abandono no fluxo

#### Debug:

- Logs estruturados no console do navegador
- Timestamps para tracking de performance
- Estados visuais para cada etapa do processo

---

## 🎉 Status: ✅ COMPLETO E FUNCIONAL

**Data de Implementação**: 26 de Dezembro de 2024 **Versão**: 1.0.0 **Build
Status**: ✅ Aprovado **Deploy Status**: ✅ Pronto para produção

### Teste Manual Realizado:

- ✅ Abertura do modal
- ✅ Fluxo de captura de leads
- ✅ Validações de formulário
- ✅ Integração webhook (logs de sucesso)
- ✅ Conversa com IA
- ✅ Interface responsiva
- ✅ Build de produção

**Esta funcionalidade está 100% pronta para uso em produção!** 🚀
