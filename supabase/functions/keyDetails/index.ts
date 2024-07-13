// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

console.log("Hello from generateArticleDetails function!")
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await req.json();

  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const prompt = `
    Analyze the following article and generate a JSON object with these key details:
    1. sentiment: Rate the political sentiment on a scale from -10 (far left) to 10 (far right)
    2. keyMentions: List of important people, organizations, or events mentioned
    3. bombshellClaims: Any significant or controversial claims made in the article
    4. keyStatistics: Important numerical data or statistics mentioned
    5. description: A brief summary of the article
    6. citation: Proper citation for the article

    Article Title: ${body.article.title}
    Article Source: ${body.article.source}
    Article URL: ${body.article.url}
    Article Content: ${body.article.content}

    Respond only with the JSON object, no additional text.
  `;

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes news articles and generates structured data." },
        { role: "user", content: prompt }
      ],
    });

    let keyDetailsString = chatResponse.choices[0].message.content.trim();

    if (keyDetailsString.startsWith('```json')) {
      keyDetailsString = keyDetailsString.replace(/^```json\n/, '').replace(/\n```$/, '');
    }  

    const keyDetails = JSON.parse(keyDetailsString);

    // Update the article in the database with the new keyDetails
    const { data, error } = await supabase
      .from('articles')
      .update({ key_details: keyDetails })
      .eq('url', body.article.url);

    if (error) throw error;

    return new Response(JSON.stringify({ keyDetails }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating article details:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generateArticleDetails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"article": {"title": "Your Article Title", "source": "Article Source", "url": "https://example.com/article", "content": "Your article content here..."}}'

*/