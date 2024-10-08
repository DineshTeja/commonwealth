// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const body = await req.json();
  const { tags, listId } = body;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  function validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string' ? value : '';
      case 'boolean':
        return typeof value === 'boolean' ? value : false;
      case 'number':
        return typeof value === 'number' ? value : 0;
      case 'date':
        return new Date(value).toString() !== 'Invalid Date' ? new Date(value).toISOString() : new Date().toISOString();
      case 'jsonb':
        try {
          return typeof value === 'object' ? value : JSON.parse(value);
        } catch {
          return {};
        }
      default:
        return value;
    }
  }

  try {
    // Fetch article IDs from the list_articles table
    const { data: listArticles, error: listArticlesError } = await supabase
      .from('list_articles')
      .select('article_id')
      .eq('list_id', listId);

    if (listArticlesError) {
      throw listArticlesError;
    }

    const articleIds = listArticles.map((item) => item.article_id);

    // Fetch articles from the articles table using the article IDs
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .in('id', articleIds);

    if (fetchError) {
      throw fetchError;
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const results = [];

    for (const article of articles) {
      const prompt = `
        Extract the following variables from the article content:
        Variables: ${tags.map(tag => `[Name: ${tag.name}, Type: ${tag.type}, Structure: ${tag.structure}]`).join('; ')}
        Article Content: ${article.content}
        Respond with a JSON object containing the extracted variables.
      `;

      const chatResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that extracts variables from article content.' },
          { role: 'user', content: prompt },
        ],
      });

      let extractedContent = chatResponse.choices[0].message.content.trim();

      if (extractedContent.startsWith('```json')) {
        extractedContent = extractedContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      }

      let extractedData = JSON.parse(extractedContent);

      extractedData = tags.reduce((acc, tag) => {
        const value = extractedData[tag.name];
        if (tag.structure === 'array') {
          if (Array.isArray(value)) {
            acc[tag.name] = value.map(item => validateType(item, tag.type));
          } else {
            acc[tag.name] = [];
          }
        } else {
          acc[tag.name] = validateType(value, tag.type);
        }
        return acc;
      }, {});

      results.push({ title: article.title, content: article.content, url: article.url, source: article.source, key_details: article.key_details, author: article.author, published: article.published, extractedData });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error extracting content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/extractContent' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
