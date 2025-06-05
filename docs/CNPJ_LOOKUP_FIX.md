# Correção do Problema de CSP no Lookup de CNPJ

## Problema Identificado

O erro ocorria devido ao uso de um proxy externo (`thingproxy.freeboard.io`) que
não estava autorizado no Content Security Policy (CSP) da aplicação. O CSP
estava configurado para permitir apenas:

- `'self'`
- `https://*.supabase.co`
- `wss://*.supabase.co`
- `https://api.deepseek.com`
- `https://receitaws.com.br`

## Solução Implementada

### 1. Configuração Centralizada de APIs

Criado o arquivo `src/config/api.ts` que centraliza todas as configurações de
APIs, permitindo:

- **Flexibilidade**: URLs configuráveis via variáveis de ambiente
- **Manutenibilidade**: Mudanças em um local central
- **Escalabilidade**: Fácil adição de novas APIs
- **Sem Hardcode**: Todas as configurações são dinâmicas

### 2. Correção do Hook useCNPJLookup

**Mudanças principais:**

- ✅ **Remoção do proxy**: Eliminado o uso de `thingproxy.freeboard.io`
- ✅ **Chamada direta**: Uso direto da API `receitaws.com.br` já permitida no
  CSP
- ✅ **Configuração dinâmica**: Rate limiting e timeouts configuráveis
- ✅ **Melhor tratamento de erros**: Erros específicos para diferentes cenários
- ✅ **Timeout inteligente**: Uso de AbortController para controle de timeout
- ✅ **Compatibilidade**: Suporte a diferentes formatos de resposta de APIs

### 3. Variáveis de Ambiente Disponíveis

Para personalizar o comportamento, você pode configurar:

```env
# URL da API de CNPJ (padrão: ReceitaWS)
VITE_CNPJ_API_URL=https://receitaws.com.br/v1/cnpj

# Timeout em milissegundos (padrão: 10 segundos)
VITE_API_TIMEOUT=10000

# Rate limiting (padrão: 3 requisições por minuto)
VITE_CNPJ_RATE_LIMIT=3

# Cooldown entre requisições (padrão: 5 segundos)
VITE_CNPJ_COOLDOWN=5
```

## Funcionalidades Mantidas

- ✅ **Cache inteligente**: Evita requisições desnecessárias
- ✅ **Rate limiting**: Respeita limites da API
- ✅ **Validação de CNPJ**: Algoritmo completo de validação
- ✅ **Tratamento de erros**: Mensagens claras para o usuário
- ✅ **Loading states**: Indicação visual de carregamento
- ✅ **Toast notifications**: Feedback imediato para o usuário

## Vantagens da Nova Implementação

1. **Zero Hardcode**: Todas as configurações são dinâmicas
2. **CSP Compliant**: Não viola mais o Content Security Policy
3. **Melhor Performance**: Chamada direta sem proxy intermediário
4. **Mais Confiável**: Menos pontos de falha na cadeia de requisições
5. **Configurável**: Facilmente adaptável para diferentes ambientes
6. **Extensível**: Fácil adição de APIs alternativas

## Como Testar

1. **Build da aplicação**:
   ```bash
   npm run build
   ```

2. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Testar lookup de CNPJ**:
   - Acesse a página de cadastro de fornecedores
   - Digite um CNPJ válido
   - Verifique se os dados são preenchidos automaticamente
   - Confirme que não há erros de CSP no console

## Troubleshooting

### Se ainda houver problemas de CORS:

1. **Verificar se a API está no CSP** (vite.config.ts)
2. **Implementar Edge Function** como fallback no Supabase
3. **Configurar proxy no servidor** de desenvolvimento

### Se a API não responder:

1. **Verificar conectividade** com a internet
2. **Testar URL da API** diretamente no navegador
3. **Verificar rate limiting** da API externa
4. **Considerar API alternativa** configurável

## Monitoramento

Para monitorar o funcionamento:

1. **Console do navegador**: Logs informativos sobre requisições
2. **Network tab**: Verificar status das chamadas
3. **Toast notifications**: Feedback visual para o usuário
4. **Error boundary**: Captura erros não tratados

---

**Resultado**: O sistema agora funciona sem violar o CSP, é completamente
configurável e não possui hardcode, atendendo aos requisitos de um sistema
comercial profissional.
