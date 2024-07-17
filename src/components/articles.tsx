import React, { useState, useEffect } from "react";
import supabase from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import Masonry from "@mui/lab/Masonry";
import ArticleCard from '@/components/ui/ArticleCard';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingState';

export interface ArticleType {
  title: string;
  content: string;
  url: string;
  source?: string;
  published?: Date;
  author?: string;
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
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Find articles about recent election results",
    "Show me the latest news on foreign policy",
    "Find articles related to healthcare reform",
    "Search for news on economic policies",
    "I want to read about immigration debates"
  ]);
  const [searchLoading, setSearchLoading] = useState(false);

  const refreshDatabase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('processArticles', {
        body: { name: "Functions" }
      });
  
      if (error) throw error;
  
      console.log("Database refresh completed:", data);
      fetchArticles(); // Refresh the articles list
    } catch (error) {
      console.error("Error refreshing database:", error);
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

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const { data, error } = await supabase.functions.invoke('semanticArticlesSearch', {
        body: { query: searchQuery }
      });

      console.log(data)
      console.log(error)

      if (error) throw error;
      setSearchResults(data.results ?? []);
      setSearchLoading(false);
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };

  useEffect(() => {
    console.log("SEARCH RESULTS", searchResults)
  }, [searchResults]);

  const groupedArticles = groupArticlesBySource(searchResults.length > 0 ? searchResults : articles);

  useEffect(() => {
    console.log("GROUPED ARTICLES", groupedArticles)
  }, [groupedArticles]);

  return (
    <div className="flex flex-col items-center justify-center container mx-auto px-4">
      <div className="text-sm p-2 flex justify-center mt-2 mb-4">
        <Button size="xs" className="bg-purple-900 hover:bg-purple-800 py-1 px-3 rounded-2xl" onClick={refreshDatabase}>
          Refresh Database
        </Button>
      </div>
      <div className="flex justify-center mb-8 w-[80%]">
        <Command className="shadow-md border border-gray-200 rounded-xl">
          <CommandInput
            placeholder="Search articles..."
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onInput={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === "") {
                setSearchResults([]);
              } else {
                handleSearch();
              }
            }}
          />
          {showSuggestions ? (
            <CommandList>
              <CommandGroup heading="Suggestions">
                {suggestions.map((suggestion, index) => (
                  <CommandItem key={index} onSelect={() => setSearchQuery(suggestion)}>
                      {suggestion}
                  </CommandItem>
                ))} 
              </CommandGroup>
            </CommandList>
          ) : null}
        </Command>
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        spacing={2}
      >
        {searchQuery.trim() !== "" ? (
          Array.isArray(searchResults) && searchResults.length > 0 ? (
            searchResults.map((article, index) => (
              <ArticleCard 
                last={index === searchResults.length - 1} 
                key={article.id || index} 
                article={article} 
                showSource={true} 
                single={true}
              />
            ))
          ) : searchLoading ? (
            <LoadingSpinner />
          ) : (
            <div>No results found</div>
          )
        ) : (
          Object.entries(groupedArticles).map(([source, sourceArticles]) => (
            <div key={source} className="mb-8 relative rounded-2xl">
              {sourceArticles.map((article, index) => (
                <ArticleCard 
                  last={index === sourceArticles.length - 1} 
                  key={article.id || index} 
                  article={article} 
                  showSource={index === 0} 
                />
              ))}
            </div>
          ))
        )}
      </Masonry>
    </div>
  );
};

export default ArticlesComponent;