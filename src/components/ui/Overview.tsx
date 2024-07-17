import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const StatItem = ({ label, value }) => (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="font-semibold text-purple-800">{value}</span>
    </div>
);

export default function Overview({ userId }) {
    const [listStats, setListStats] = useState([]);

  useEffect(() => {
    fetchListStats();
  }, []);

  const fetchListStats = async () => {
    if (!userId) return;

    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId.userId);

    if (listsError) {
      console.error('Error fetching lists:', listsError);
      return;
    }

    const statsPromises = lists.map(async (list) => {
      const { data: articles, error: articlesError } = await supabase
        .from('list_articles')
        .select('article_id')
        .eq('list_id', list.id);

      if (articlesError) {
        console.error('Error fetching articles:', articlesError);
        return null;
      }

      const articleIds = articles.map(a => a.article_id);

      const { data: articleDetails, error: detailsError } = await supabase
        .from('articles')
        .select('*')
        .in('id', articleIds);

      if (detailsError) {
        console.error('Error fetching article details:', detailsError);
        return null;
      }

      const sources = [...new Set(articleDetails.map(a => a.source))];
      const authors = [...new Set(articleDetails.map(a => a.author).filter(Boolean))];
      const citations = articleDetails.flatMap(a => a.key_details?.citation || []);
      const bombshellClaims = articleDetails.flatMap(a => a.key_details?.bombshellClaims || []);

      return {
        listId: list.id,
        listName: list.name,
        articleCount: articleDetails.length,
        sources,
        authors,
        citations,
        bombshellClaims
      };
    });

    const stats = await Promise.all(statsPromises);
    setListStats(stats.filter(Boolean));
  };

  const deleteList = async (listId) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    // Delete list_article mappings
    const { error: listArticlesError } = await supabase
      .from('list_articles')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId.userId);
  
    if (listArticlesError) {
      console.error('Error deleting list articles:', listArticlesError);
      return;
    }
  
    // Delete the list
    const { error: listError } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId.userId);
  
    if (listError) {
      console.error('Error deleting list:', listError);
    } else {
      console.log('List deleted successfully');
      // Refresh the list stats after deletion
      fetchListStats();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listStats.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-purple-100">
                    <div className="flex justify-between items-center w-full">
                        <CardTitle className="text-lg font-semibold text-purple-800">{stat.listName}</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteList(stat.listId)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                <div className="space-y-2">
                    <StatItem label="Articles" value={stat.articleCount} />
                    <StatItem label="Unique Sources" value={stat.sources.length} />
                    <StatItem label="Unique Authors" value={stat.authors.length} />
                    <StatItem label="Citations" value={stat.citations.length} />
                    <StatItem label="Bombshell Claims" value={stat.bombshellClaims.length} />
                </div>
                {stat.sources.length > 0 && (
                    <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Top Sources:</h4>
                    <div className="flex flex-wrap gap-1">
                        {stat.sources.slice(0, 3).map((source, i) => (
                        <span key={i} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            {source}
                        </span>
                        ))}
                    </div>
                    </div>
                )}
                </CardContent>
            </Card>
        ))}
    </div>
  );
};