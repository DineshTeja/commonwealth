// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("Hello from Functions!");

import { corsHeaders } from "../_shared/cors.ts";
import { extract } from "npm:@extractus/article-extractor";
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

console.log(`Function "browser-with-cors" up and running!`);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  const body = await req.json();
  const urls = body.urls;

  function truncateToMaxTokens(text, maxTokens = 8192) {
    const tokens = text.split(/\s+/); 
    if (tokens.length > maxTokens) {
      return tokens.slice(0, maxTokens).join(" ");
    }
    return text;
  }

  try {
    const articles = [];
    const embeddings = [];
    const keyDetails = [];
    for (const url of urls) {
      try {
        const article = await extract(url);
        articles.push(article);

        const embeddingsResponse = await openai.embeddings.create({
          model: "text-embedding-3-large",
          input: truncateToMaxTokens(article.description),
        });

        console.log("Embeddings Generated for:", article.title);

        embeddings.push(embeddingsResponse.data[0].embedding);

        const { data: keyDetailsData, error: keyDetailsError } = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/keyDetails`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({ article }),
          }
        ).then(res => res.json());

        if (keyDetailsError) {
          console.error("Error generating key details:", keyDetailsError);
        } else {
          console.log("Key details generated for:", article.title);
          keyDetails.push(keyDetailsData);
        }
      } catch (error) {
        console.error("Error processing URL:", url);
        continue;
      }
    }

    return new Response(JSON.stringify({ articles, embeddings, keyDetails }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
