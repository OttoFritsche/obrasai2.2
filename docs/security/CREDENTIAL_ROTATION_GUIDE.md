# 🔐 Guia de Rotação de Credenciais - ObrasAI

## ⚠️ AÇÃO URGENTE NECESSÁRIA

**Status:** Credenciais expostas detectadas em 01/07/2025  
**Prioridade:** CRÍTICA  
**Responsável:** Equipe DevOps/Segurança  

## 🚨 Credenciais Comprometidas Identificadas

### 1. Supabase
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (REVOGAR)
- **Anonymous Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (REVOGAR)
- **Database Password:** `Consig+Mira123#` (ALTERAR)

### 2. APIs Externas
- **OpenAI API Key:** `sk-proj-DqE4xiUXFZBeCH_V9...` (REVOGAR)
- **DeepSeek API Key:** `sk-dd3c62196e5246b4902f20c7aec36864` (REVOGAR)

### 3. Pagamentos
- **Stripe Secret Key:** `sk_test_51RIrj2PfkzlpDql6...` (REVOGAR)

### 4. Criptografia
- **JWT Secret:** `9147f03f01c7ea78e584723d...` (REGENERAR)
- **Encryption Key:** `c903ff5752c2986b201b6eb3...` (REGENERAR)

## 📋 Checklist de Rotação de Credenciais

### ✅ Ações Imediatas Completadas
- [x] Arquivo `temp/vectorizar-documentacao.js` removido
- [x] Template `.env.example` criado
- [x] Verificado que `.env` está no `.gitignore`

### 🔄 Ações de Rotação Pendentes

#### 1. Supabase (PRIORIDADE MÁXIMA)
- [ ] Acessar [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Ir para Settings > API
- [ ] Regenerar Service Role Key
- [ ] Regenerar Anonymous Key
- [ ] Alterar senha do banco de dados
- [ ] Atualizar `.env` local com novas credenciais
- [ ] Atualizar variáveis de ambiente em produção

#### 2. OpenAI
- [ ] Acessar [OpenAI API Keys](https://platform.openai.com/api-keys)
- [ ] Revogar key atual: `sk-proj-DqE4xiUXFZBeCH_V9...`
- [ ] Gerar nova API key
- [ ] Atualizar em todas as Edge Functions que usam OpenAI
- [ ] Verificar logs de uso para atividade suspeita

#### 3. DeepSeek
- [ ] Acessar painel DeepSeek
- [ ] Revogar key atual: `sk-dd3c62196e5246b4902f20c7aec36864`
- [ ] Gerar nova API key
- [ ] Atualizar configurações

#### 4. Stripe
- [ ] Acessar [Stripe Dashboard](https://dashboard.stripe.com)
- [ ] Ir para Developers > API keys
- [ ] Revogar key atual: `sk_test_51RIrj2PfkzlpDql6...`
- [ ] Gerar nova Secret Key
- [ ] Atualizar webhook secrets se necessário
- [ ] Verificar transações para atividade suspeita

#### 5. Chaves de Criptografia
- [ ] Regenerar JWT Secret (usar ferramenta segura)
- [ ] Regenerar Encryption Key (32 bytes hex)
- [ ] **ATENÇÃO:** Dados criptografados com a chave antiga precisarão ser migrados

## 🛠️ Comandos para Gerar Novas Chaves

```bash
# JWT Secret (256 bits)
openssl rand -hex 32

# Encryption Key (256 bits)
openssl rand -hex 32

# Ou usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔍 Auditoria Pós-Rotação

### Verificações Obrigatórias
- [ ] Testar todas as funcionalidades críticas
- [ ] Verificar logs de acesso para atividade suspeita
- [ ] Confirmar que aplicação funciona com novas credenciais
- [ ] Executar testes automatizados
- [ ] Verificar integrações externas (Stripe, APIs)

### Monitoramento Contínuo
- [ ] Configurar alertas para tentativas de acesso não autorizado
- [ ] Implementar rotação automática de credenciais
- [ ] Configurar audit logs para todas as operações sensíveis
- [ ] Estabelecer processo de rotação regular (a cada 90 dias)

## 📊 Análise de Impacto

### Sistemas Afetados
- ✅ Frontend (Vite/React) - usa variáveis VITE_*
- ✅ Edge Functions - usa env vars do Supabase
- ⚠️ Scripts Python - usa credenciais diretas do .env
- ⚠️ Sistemas de produção - verificar se usam mesmas credenciais

### Dados em Risco
- Dados de usuários no Supabase
- Informações de pagamento (Stripe)
- Conversas de IA e insights gerados
- Documentos e plantas baixas analisadas

## 🚀 Prevenção Futura

### Implementar Imediatamente
1. **Secrets Manager:** Usar AWS Secrets Manager ou similar
2. **Rotação Automática:** Configurar rotação a cada 90 dias
3. **Pre-commit Hooks:** Bloquear commit de credenciais
4. **Audit Logging:** Registrar todos os acessos a recursos sensíveis
5. **Princípio do Menor Privilégio:** Limitar permissões ao mínimo necessário

### Processo de Desenvolvimento
1. Usar `.env.example` como template
2. Nunca commitar arquivo `.env`
3. Usar credenciais diferentes para dev/staging/prod
4. Revisar código para credenciais hardcoded antes do deploy
5. Implementar testes de segurança no CI/CD

## 📞 Contatos de Emergência

- **DevOps Lead:** [definir contato]
- **Security Team:** [definir contato]
- **Supabase Support:** support@supabase.com
- **Stripe Support:** support@stripe.com

---

**⏰ Prazo para Completar:** 24 horas  
**Última Atualização:** 01/07/2025  
**Status:** 🔴 EM ANDAMENTO