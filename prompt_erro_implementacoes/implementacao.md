# Implementação da Vectorização da Documentação - ObrasAI

## Status Atual

A infraestrutura para vectorização da documentação está planejada e parcialmente implementada, mas a vectorização dos documentos de treinamento ainda não foi executada. O sistema de IA contextual existe, mas não tem os dados de treinamento processados para funcionar adequadamente.

## Próximos Passos Necessários

### 1. Criar a tabela embeddings_conhecimento no banco de dados

**Objetivo:** Criar a estrutura de dados para armazenar os embeddings dos documentos de treinamento.

**Implementação:**
```sql
-- Criar tabela para armazenar embeddings da documentação
CREATE TABLE embeddings_conhecimento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  documento VARCHAR(255) NOT NULL, -- Nome do documento (ex: 'documentacao_despesas')
  secao VARCHAR(255), -- Seção específica do documento
  conteudo TEXT NOT NULL, -- Texto original do chunk
  embedding VECTOR(1536), -- Embedding OpenAI (1536 dimensões)
  metadata JSONB, -- Metadados adicionais (tags, categoria, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por similaridade
CREATE INDEX ON embeddings_conhecimento USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Criar índice para busca por documento
CREATE INDEX idx_embeddings_conhecimento_documento ON embeddings_conhecimento(documento);

-- Habilitar RLS
ALTER TABLE embeddings_conhecimento ENABLE ROW LEVEL SECURITY;

-- Política RLS para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura de embeddings para usuários autenticados" 
ON embeddings_conhecimento FOR SELECT 
TO authenticated 
USING (true);
```

**Localização:** Executar no Supabase SQL Editor ou via migration.

### 2. Implementar a Edge Function gerar-embeddings-documentacao

**Objetivo:** Criar função serverless para processar documentos e gerar embeddings.

**Implementação:**

**Arquivo:** `supabase/functions/gerar-embeddings-documentacao/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentChunk {
  documento: string;
  secao: string;
  conteudo: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documento, chunks } = await req.json() as {
      documento: string;
      chunks: DocumentChunk[];
    }

    if (!documento || !chunks || !Array.isArray(chunks)) {
      return new Response(
        JSON.stringify({ error: 'Documento e chunks são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    const embeddings = []

    // Processar cada chunk
    for (const chunk of chunks) {
      try {
        // Gerar embedding usando OpenAI
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: chunk.conteudo,
          }),
        })

        if (!embeddingResponse.ok) {
          console.error(`Erro ao gerar embedding para chunk: ${chunk.secao}`, await embeddingResponse.text())
          continue
        }

        const embeddingData = await embeddingResponse.json()
        const embedding = embeddingData.data[0].embedding

        embeddings.push({
          documento: chunk.documento,
          secao: chunk.secao,
          conteudo: chunk.conteudo,
          embedding,
          metadata: chunk.metadata || {}
        })

      } catch (error) {
        console.error(`Erro ao processar chunk ${chunk.secao}:`, error)
        continue
      }
    }

    // Salvar embeddings no banco
    if (embeddings.length > 0) {
      const { error: insertError } = await supabase
        .from('embeddings_conhecimento')
        .insert(embeddings)

      if (insertError) {
        console.error('Erro ao inserir embeddings:', insertError)
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processados: embeddings.length,
        total_chunks: chunks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função gerar-embeddings-documentacao:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Configuração necessária:**
- Adicionar `OPENAI_API_KEY` nas variáveis de ambiente do Supabase
- Deploy da função: `supabase functions deploy gerar-embeddings-documentacao`

### 3. Executar a vectorização inicial dos documentos

**Objetivo:** Processar todos os documentos de treinamento e gerar embeddings.

**Implementação:**

**Arquivo:** `scripts/vectorizar-documentacao.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface DocumentChunk {
  documento: string;
  secao: string;
  conteudo: string;
  metadata?: any;
}

// Função para dividir texto em chunks
function dividirTextoEmChunks(texto: string, tamanhoMaximo: number = 1000): string[] {
  const paragrafos = texto.split('\n\n')
  const chunks: string[] = []
  let chunkAtual = ''

  for (const paragrafo of paragrafos) {
    if (chunkAtual.length + paragrafo.length > tamanhoMaximo && chunkAtual.length > 0) {
      chunks.push(chunkAtual.trim())
      chunkAtual = paragrafo
    } else {
      chunkAtual += (chunkAtual ? '\n\n' : '') + paragrafo
    }
  }

  if (chunkAtual.trim()) {
    chunks.push(chunkAtual.trim())
  }

  return chunks
}

// Função para processar um documento
function processarDocumento(caminhoArquivo: string, nomeDocumento: string): DocumentChunk[] {
  const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8')
  const chunks = dividirTextoEmChunks(conteudo)
  
  return chunks.map((chunk, index) => ({
    documento: nomeDocumento,
    secao: `secao_${index + 1}`,
    conteudo: chunk,
    metadata: {
      arquivo_origem: caminhoArquivo,
      chunk_index: index,
      total_chunks: chunks.length
    }
  }))
}

async function vectorizarDocumentacao() {
  console.log('Iniciando vectorização da documentação...')

  const documentos = [
    {
      arquivo: 'docs/despesas/documentacao_despesas.md',
      nome: 'documentacao_despesas'
    },
    {
      arquivo: 'docs/orcamentoIA/documentacao_orcamento.md',
      nome: 'documentacao_orcamento'
    },
    {
      arquivo: 'docs/obras/documentacao_obras.md',
      nome: 'documentacao_obras'
    },
    {
      arquivo: 'docs/contrato/documentacao_contratoIA.md',
      nome: 'documentacao_contratoIA'
    }
  ]

  for (const doc of documentos) {
    try {
      console.log(`Processando ${doc.nome}...`)
      
      const caminhoCompleto = path.join(process.cwd(), doc.arquivo)
      
      if (!fs.existsSync(caminhoCompleto)) {
        console.warn(`Arquivo não encontrado: ${caminhoCompleto}`)
        continue
      }

      const chunks = processarDocumento(caminhoCompleto, doc.nome)
      console.log(`Gerados ${chunks.length} chunks para ${doc.nome}`)

      // Chamar Edge Function para gerar embeddings
      const { data, error } = await supabase.functions.invoke('gerar-embeddings-documentacao', {
        body: {
          documento: doc.nome,
          chunks
        }
      })

      if (error) {
        console.error(`Erro ao processar ${doc.nome}:`, error)
        continue
      }

      console.log(`✅ ${doc.nome} processado com sucesso:`, data)
      
    } catch (error) {
      console.error(`Erro ao processar ${doc.nome}:`, error)
    }
  }

  console.log('Vectorização concluída!')
}

// Executar se chamado diretamente
if (require.main === module) {
  vectorizarDocumentacao().catch(console.error)
}

export { vectorizarDocumentacao }
```

**Execução:**
```bash
# Instalar dependências se necessário
npm install @supabase/supabase-js

# Executar script
npx tsx scripts/vectorizar-documentacao.ts
```

### 4. Testar a busca semântica

**Objetivo:** Verificar se a busca contextual está funcionando corretamente.

**Implementação:**

**Arquivo:** `scripts/testar-busca-semantica.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarBuscaSemantica() {
  const consultas = [
    'Como criar um orçamento de obra?',
    'Quais são os tipos de despesas em uma obra?',
    'Como funciona o controle de obras?',
    'Documentação sobre contratos de construção'
  ]

  for (const consulta of consultas) {
    console.log(`\n🔍 Testando: "${consulta}"`)
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-contextual', {
        body: {
          message: consulta,
          context_type: 'documentacao'
        }
      })

      if (error) {
        console.error('❌ Erro:', error)
        continue
      }

      console.log('✅ Resposta:', data.response)
      console.log('📚 Contexto encontrado:', data.context_used ? 'Sim' : 'Não')
      
    } catch (error) {
      console.error('❌ Erro na consulta:', error)
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarBuscaSemantica().catch(console.error)
}

export { testarBuscaSemantica }
```

**Execução:**
```bash
npx tsx scripts/testar-busca-semantica.ts
```

## Configurações Necessárias

### Variáveis de Ambiente no Supabase

Adicionar no painel do Supabase (Settings > Edge Functions > Environment Variables):

```
OPENAI_API_KEY=sk-...
```

### Modificações na Edge Function ai-chat-contextual

Atualizar a função para usar a nova tabela `embeddings_conhecimento`:

```typescript
// Buscar contexto relevante
const { data: contextData } = await supabase.rpc('buscar_contexto_conhecimento', {
  query_embedding: queryEmbedding,
  match_threshold: 0.8,
  match_count: 5
})
```

### Função SQL para Busca de Similaridade

```sql
CREATE OR REPLACE FUNCTION buscar_contexto_conhecimento(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  documento text,
  secao text,
  conteudo text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    embeddings_conhecimento.documento,
    embeddings_conhecimento.secao,
    embeddings_conhecimento.conteudo,
    1 - (embeddings_conhecimento.embedding <=> query_embedding) AS similarity
  FROM embeddings_conhecimento
  WHERE 1 - (embeddings_conhecimento.embedding <=> query_embedding) > match_threshold
  ORDER BY embeddings_conhecimento.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Cronograma de Implementação

1. **Dia 1:** Criar tabela e função SQL
2. **Dia 2:** Implementar Edge Function gerar-embeddings-documentacao
3. **Dia 3:** Executar vectorização inicial
4. **Dia 4:** Testar e ajustar busca semântica
5. **Dia 5:** Documentar e finalizar

## Benefícios Esperados

- **IA Contextual Funcional:** Chatbot com conhecimento específico do ObrasAI
- **Respostas Precisas:** Baseadas na documentação oficial
- **Escalabilidade:** Fácil adição de novos documentos
- **Performance:** Busca semântica otimizada

---

**Status:** Pendente de implementação
**Prioridade:** Alta
**Estimativa:** 5 dias de desenvolvimento