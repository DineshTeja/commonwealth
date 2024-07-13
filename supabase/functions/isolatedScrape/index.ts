// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { corsHeaders } from '../_shared/cors.ts'
import { extract } from 'npm:@extractus/article-extractor'
import axios from "npm:axios@1.4.0";

console.log(`Function "browser-with-cors" up and running!`)

const options = {
  method: 'GET',
  url: 'https://api.hasdata.com/scrape/google/serp',
  params: {
    q: 'politics',
    lr: [],
    tbm: 'nws',
    deviceType: 'desktop',
    domain: 'google.com',
    gl: 'us',
    hl: 'en',
    tbs: 'qdr:w',
    safe: 'off',
    filter: 1,
    start: null,
    num: 10
  },
  headers: {
    'x-api-key': 'cd1b6b80-97c5-4978-9de2-4d3fc5a910b8',
    'Content-Type': 'application/json'
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    // const searchQuery = "political articles + news + trending";
    // const apiUrl = `https://api.scrape-it.cloud/scrape/google?q=${encodeURIComponent(searchQuery)}&tbm=nws&start=5&num=500&when=6d`;

    // const scrapeResponse = await fetch(apiUrl, {
    //   method: 'GET',
    //   headers: {
    //     "x-api-key": 'cd1b6b80-97c5-4978-9de2-4d3fc5a910b8', //'c457e41c-d977-439c-bf8a-e87956f45650',
    //     "Content-Type": "application/json",
    //   },
    // });

    const { data } = await axios.request(options);

    if (!data) {
      throw new Error('No data returned from the scrape');
    }

    // "04e04c8be28b4fedba659c8e3e84eada"

    // if (!scrapeResponse.ok) {
    //   throw new Error(`HTTP error! status: ${scrapeResponse.status}`);
    // }

    // const scrapeData = await scrapeResponse.json();
    // const urls: string[] = scrapeData.newsResults.map((result) => result.link);

    // const urls = [
    //   "https://www.nytimes.com/2024/01/31/business/media/taylor-swift-fox-trump.html",
    //   "https://www.usnews.com/news/politics/articles/2024-01-16/population-growth-patterns-paint-grim-picture-for-democrats",
    //   "https://www.hrw.org/world-report/2024/country-chapters/philippines",
    //   "https://apnews.com/article/election-right-left-coalition-franco-spain-83cad969eac6cf25ced972357a248e99",
    //   "https://www.nytimes.com/2024/02/29/world/asia/japan-economy-population-politics.html",
    //   "https://www.reuters.com/technology/when-facebook-blocks-news-studies-show-political-risks-that-follow-2024-04-14/"
    // ]

    // const urls = [
    //   'https://www.bbvaopenmind.com/en/articles/the-new-media-s-role-in-politics/', 
    //   'https://www.cnbc.com/2022/09/21/what-another-major-rate-hike-by-the-federal-reserve-means-to-you.html',
    // ]

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/isolatedScrape' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
