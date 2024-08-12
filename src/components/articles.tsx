import React, { useState, useEffect } from "react";
import supabase from '@/lib/supabaseClient';
import Masonry from "@mui/lab/Masonry";
import ArticleCard from '@/components/ui/ArticleCard';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingState';
import ListSelectionDropdown from "@/components/ui/ListSelectionDropdown";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Database } from '@/lib/database.types';

export interface ArticleType {
  id: string;
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

const ArticlesComponent = ({ userId }: { userId: string }) => {
  const [articles, setArticles] = useState<Database['public']['Tables']['articles']['Row'][]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Database['public']['Tables']['articles']['Row'][]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = [
    "Find articles about recent election results",
    "Show me the latest news on foreign policy",
    "Find articles related to healthcare reform",
    "Search for news on economic policies",
    "I want to read about immigration debates"
  ];
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState('');
  // const [lists, setLists] = useState([]);

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
      setArticles(data as any);    
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const groupArticlesBySource = (articles: Database['public']['Tables']['articles']['Row'][]) => {
    return articles.reduce<Record<string, Database['public']['Tables']['articles']['Row'][]>>((acc, article) => {
      const source = article.source || 'Unknown Source';
      acc[source] = acc[source] || [];
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

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId) 
        : [...prev, articleId]
    );
  };

  const handleAddToList = async () => {
    if (!selectedList || selectedArticles.length === 0) return;

    try {
      const { error } = await supabase
        .from('list_articles')
        .insert(selectedArticles.map(articleId => ({
          user_id: userId,
          list_id: selectedList,
          article_id: articleId
        } as any)));

      if (error) throw error;

      console.log('Articles added to list successfully');
      setSelectedArticles([]);
      setSelectedList('');
    } catch (error) {
      console.error('Error adding articles to list:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center container mx-auto px-4">
      <div className="flex justify-between items-center mb-8 w-[100%]">
        <Button 
          onClick={refreshDatabase} 
          className="bg-purple-800 text-white px-4 py-2 rounded-xl mx-3"
        >
           <ArrowPathIcon className="w-4 h-4" />
        </Button>
        <Command className="shadow-md border border-gray-200 rounded-xl">
          <CommandInput
            placeholder="Search articles..."
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              const value = e.currentTarget.value;
              setSearchQuery(value);
              if (value === "") {
                setSearchResults([]);
              } else {
                handleSearch();
              }
            }}
          />
          {showSuggestions ? (
            <CommandList className="w-full mt-1 bg-white shadow-lg rounded-xl">
              <CommandEmpty>No results found.</CommandEmpty>
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
        <ListSelectionDropdown
          selectedList={selectedList}
          setSelectedList={setSelectedList}
          onAddToList={handleAddToList}
          selectedArticlesCount={selectedArticles.length}
          userId={userId}
        />
      </div>
      <Masonry
        columns={breakpointColumnsObj}
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
                isSelected={selectedArticles.includes(article.id)}
                onSelect={() => handleArticleSelect(article.id)}
              />
            ))
          ) : searchLoading ? (
            <LoadingSpinner />
          ) : (
            <div>No results found</div>
          )
        ) : (
          // Object.entries(groupedArticles).map(([source, sourceArticles]) => (
          //   <div key={source} className="mb-8 relative rounded-2xl">
          //     {sourceArticles.map((article, index) => (
          //       <ArticleCard 
          //         last={index === sourceArticles.length - 1} 
          //         key={article.id || index} 
          //         article={article} 
          //         showSource={index === 0} 
          //         isSelected={selectedArticles.includes(article.id)}
          //         onSelect={() => handleArticleSelect(article.id)}
          //       />
          //     ))}
          //   </div>
          // ))
          articles.map((article, index) => (
            <ArticleCard 
              key={article.id || index} 
              article={article} 
              showSource={true} 
              single={true}
              onSelect={handleArticleSelect}
              isSelected={selectedArticles.includes(article.id)}
            />
          ))
        )}
      </Masonry>
    </div>
  );
};

export default ArticlesComponent;