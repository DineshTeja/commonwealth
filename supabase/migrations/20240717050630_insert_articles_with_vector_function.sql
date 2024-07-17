CREATE OR REPLACE FUNCTION insert_article_with_vector(article_data jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO articles (id, title, content, url, source, author, published, embeddings, key_details)
  VALUES (
    (article_data->>'id')::uuid,
    article_data->>'title',
    article_data->>'content',
    article_data->>'url',
    article_data->>'source',
    article_data->>'author',
    (article_data->>'published')::date,
    (article_data->>'embeddings')::vector,
    (article_data->>'key_details')::jsonb
  );
END;
$$ LANGUAGE plpgsql;