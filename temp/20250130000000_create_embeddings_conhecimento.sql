-- Criação da tabela embeddings_conhecimento
CREATE TABLE IF NOT EXISTS embeddings_conhecimento (
  id BIGSERIAL PRIMARY KEY,
  documento TEXT NOT NULL,
  secao TEXT,
  conteudo TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por similaridade
CREATE INDEX IF NOT EXISTS idx_embeddings_conhecimento_embedding 
ON embeddings_conhecimento 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índice para busca por documento
CREATE INDEX IF NOT EXISTS idx_embeddings_conhecimento_documento 
ON embeddings_conhecimento (documento);

-- Habilitar RLS
ALTER TABLE embeddings_conhecimento ENABLE ROW LEVEL SECURITY;

-- Política para leitura (usuários autenticados)
CREATE POLICY "Usuários autenticados podem ler embeddings" 
ON embeddings_conhecimento 
FOR SELECT 
TO authenticated 
USING (true);

-- Política para inserção (usuários autenticados)
CREATE POLICY "Usuários autenticados podem inserir embeddings" 
ON embeddings_conhecimento 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Função para buscar contexto por similaridade
CREATE OR REPLACE FUNCTION buscar_contexto_conhecimento(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
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
    1 - (embeddings_conhecimento.embedding <=> query_embedding) as similarity
  FROM embeddings_conhecimento
  WHERE 1 - (embeddings_conhecimento.embedding <=> query_embedding) > match_threshold
  ORDER BY embeddings_conhecimento.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;