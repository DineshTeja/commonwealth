// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

console.log("scheduledScrape (supabase functions)")

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface NewsResult {
  link: string;
}

Deno.serve(async (req) => {
  const searchQuery = "political articles + news + trending";
  const apiUrl = `https://api.scrape-it.cloud/scrape/google?q=${encodeURIComponent(searchQuery)}` + "&tbm=nws&start=5&num=500&when=6d";

  try {
    const scrapeResponse = await axios.get(apiUrl, {
      headers: {
        "x-api-key": "c457e41c-d977-439c-bf8a-e87956f45650",
        "Content-Type": "application/json",
      },
    });
    
    const urls = scrapeResponse.data.newsResults.map((result: NewsResult) => result.link);

    // Call the Python script with the URLs
    const { stdout, stderr } = await execPromise(`python3 news.py '${JSON.stringify(urls)}'`);
    if (stderr) {
      console.error('Error executing Python script:', stderr);
      return new Response(JSON.stringify({ error: stderr }), { status: 500 });
    }

    return new Response(stdout, { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/scheduledScrape' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
