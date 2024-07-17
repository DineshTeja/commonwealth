// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("Hello from Functions!");

import { corsHeaders } from "../_shared/cors.ts";
import { extract } from "npm:@extractus/article-extractor";
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'

console.log(`Function "browser-with-cors" up and running!`);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  try {
    // Call isolatedScrape
    const scrapeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/isolatedScrape`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ name: "Functions" }),
      }
    );
    
    if (!scrapeResponse.ok) {
      throw new Error(`HTTP error! status: ${scrapeResponse.status}`);
    }
    
    const scrapeData = await scrapeResponse.json();

    console.log(scrapeData)
    
    if (!scrapeData) {
      throw new Error('No data returned from the scrape');
    }
    
    const urls = scrapeData.newsResults.map(result => result.link);

    function truncateToMaxTokens(text, maxTokens = 8192) {
      const tokens = text.split(/\s+/); 
      if (tokens.length > maxTokens) {
        return tokens.slice(0, maxTokens).join(" ");
      }
      return text;
    }

    const processedArticles = [];

    for (const url of urls) {
      try {
        const article = await extract(url);

        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-large",
          input: truncateToMaxTokens(article.description),
        });

        const embedding = embeddingResponse.data[0].embedding;

        const keyDetailsResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/keyDetails`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({ article }),
          }
        );

        const keyDetailsData = await keyDetailsResponse.json();
        if (keyDetailsData.error) throw keyDetailsData.error;

        const processedArticle = {
          id: uuidv4(),
          title: article.title,
          content: article.content,
          url: url,
          source: article.source,
          author: article.author,
          published: article.published,
          embeddings: embedding.toString(),
          key_details: keyDetailsData
        };

        const { error: insertError } = await supabase
        .rpc('insert_article_with_vector', {
          article_data: {
            ...processedArticle,
            embeddings: processedArticle.embeddings.split(',').map(Number)
          }
        });
        
        if (insertError) throw insertError;

        processedArticles.push(processedArticle);
        console.log(`Processed and saved article: ${article.title}`);
      } catch (error) {
        console.error("Error processing URL:", url, error);
      }
    }

    return new Response(JSON.stringify({ processedArticles }), {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("Error in processArticles:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers,
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/processArticles' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
