-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- documents: one row per uploaded file
CREATE TABLE documents (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename   TEXT        NOT NULL,
  file_size  INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- chunks: text pieces with embeddings
-- text-embedding-004 outputs 768 dimensions by default
CREATE TABLE chunks (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id  UUID    NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content      TEXT    NOT NULL,
  embedding    vector(768),
  chunk_index  INTEGER NOT NULL,
  -- generated tsvector column for keyword search (no manual updates needed)
  fts          tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- vector similarity index
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- full-text search index
CREATE INDEX ON chunks USING GIN (fts);

-- Row Level Security: users can only touch their own data
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_documents"
  ON documents FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_chunks"
  ON chunks FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- match_chunks: hybrid search (70% vector + 30% keyword)
-- filtered to the calling user's documents only
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding  vector(768),
  query_text       TEXT,
  match_count      INT     DEFAULT 10,
  user_id_filter   UUID    DEFAULT NULL
)
RETURNS TABLE (
  id           UUID,
  document_id  UUID,
  content      TEXT,
  chunk_index  INTEGER,
  filename     TEXT,
  similarity   FLOAT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.chunk_index,
    d.filename,
    -- blend vector cosine similarity with BM25-style keyword rank
    (
      0.7 * (1 - (c.embedding <=> query_embedding))
      + 0.3 * ts_rank(c.fts, websearch_to_tsquery('english', query_text))
    )::FLOAT AS similarity
  FROM  chunks    c
  JOIN  documents d ON c.document_id = d.id
  WHERE d.user_id = COALESCE(user_id_filter, auth.uid())
    -- exclude low-similarity chunks early
    AND (1 - (c.embedding <=> query_embedding)) > 0.3
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
