-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS match_articles(vector, float, int);

-- Matches articles using vector similarity search on embeddings
CREATE OR REPLACE FUNCTION match_articles(query_embedding vector(1536), similarity_threshold float)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  url text,
  source text,
  author text,
  published date,
  key_details jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    articles.id,
    articles.title,
    articles.content,
    articles.url,
    articles.source,
    articles.author,
    articles.published,
    articles.key_details,
    1 - (articles.embeddings <#> query_embedding) AS similarity
  FROM articles
  WHERE 1 - (articles.embeddings <#> query_embedding) > similarity_threshold
  ORDER BY articles.embeddings <#> query_embedding;
END;
$$;