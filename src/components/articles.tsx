"use client";
import React, { useState, useEffect } from "react";
import supabase from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import Masonry from "@mui/lab/Masonry";
import Image from 'next/image';
import ArticleCard from '@/components/ui/ArticleCard';

export interface ArticleType {
  title: string;
  content: string;
  url: string;
  source?: string;
  publish_date?: string;
  tags?: string[];
  keyDetails?: {
    sentiment: number;
    keyMentions: string[];
    bombshellClaims: string[];
    keyStatistics: string[];
    description: string;
    citation: string;
  };
}

const ArticlesComponent = () => {
  const [articlesWithEmbeddings, setArticlesWithEmbeddings] = useState([]);
  const [articles, setArticles] = useState([]);

  const refreshDatabase = async () => {
    try {
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('isolatedScrape', {
        body: { name: "Functions" }
      });

      console.log(scrapeData);

      if (scrapeError) throw scrapeError;

      // const scrapeData = [
      //   'https://www.bbvaopenmind.com/en/articles/the-new-media-s-role-in-politics/', 
      //   'https://www.cnbc.com/2022/09/21/what-another-major-rate-hike-by-the-federal-reserve-means-to-you.html',
      //   // "https://www.usnews.com/news/politics/articles/2024-01-16/population-growth-patterns-paint-grim-picture-for-democrats",
      // ]

      const urls = scrapeData.newsResults.map(story => story.link);

      const { data: processData, error: processError } = await supabase.functions.invoke('processArticles', {
        body: { urls: urls }
      });

      if (processError) throw processError;

      console.log(processData);

      const { articles, embeddings, keyDetails } = processData;
      const mergedData = articles.map((article, index) => ({
        ...article,
        embedding: embeddings[index],
        key_details: keyDetails[index]
      }));

      setArticlesWithEmbeddings(mergedData);

      console.log(mergedData);

      const { data: insertData, error: insertError } = await supabase
        .from('articles')
        .insert(mergedData.map((article: any) => ({
          id: uuidv4(),
          title: article.title,
          content: article.content,
          url: article.url,
          embeddings: JSON.stringify(article.embedding),
          key_details: article.key_details ?? null
        })));

      if (insertError) throw insertError;

      console.log("Database refresh initiated!");
    } catch (error) {
      console.error("Error refreshing database:", error);
      console.log("Failed to refresh database.");
    }
  };

  const breakpointColumnsObj = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 3,
    xl: 3,
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*');

      if (error) throw error;
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const groupArticlesBySource = (articles) => {
    return articles.reduce((acc, article) => {
      const source = article.source || 'Unknown Source';
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(article);
      return acc;
    }, {});
  };

  const groupedArticles = groupArticlesBySource(articles);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-8">
        <button
          onClick={refreshDatabase}
          className="mt-4 text-sm py-1 px-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300"
        >
          Refresh Database
        </button>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        spacing={2}
      >
        {Object.entries(groupedArticles).map(([source, sourceArticles]) => (
          <div key={source} className="mb-8 relative">
            {sourceArticles.map((article, index) => (
              <ArticleCard key={index} article={article} showSource={index===0} />
            ))}
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default ArticlesComponent;
