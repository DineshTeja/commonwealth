import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const StatItem = ({ label, value }: { label: string, value: number }) => (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="font-semibold text-purple-800">{value}</span>
    </div>
);

type ListStatsType = {
    listId: string;
    listName: string | null;
    articleCount: number;
    sources: string[];
    authors: string[];
    citations: string[];
    bombshellClaims: string[];
} | null;

export default function Overview({ userId }: { userId: string }) {
    const [listStats, setListStats] = useState<ListStatsType[]>([]);

  useEffect(() => {
    fetchListStats();
  }, []);

  const fetchListStats = async () => {
    if (!userId) return;

    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId);

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
      const citations = articleDetails.flatMap(a => (a.key_details as Record<string, any>)?.[`citation`] ?? []);
      const bombshellClaims = articleDetails.flatMap(a => (a.key_details as Record<string, any>)?.[`bombshellClaims`] ?? []);

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
    setListStats(stats.filter((stat): stat is ListStatsType => stat !== null));
  };

  const deleteList = async (listId: string) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    // Delete list_article mappings
    const { error: listArticlesError } = await supabase
      .from('list_articles')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId);
  
    if (listArticlesError) {
      console.error('Error deleting list articles:', listArticlesError);
      return;
    }
  
    // Delete the list
    const { error: listError } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId);
  
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
                        <CardTitle className="text-lg font-semibold text-purple-800">{stat?.listName ?? 'Untitled'}</CardTitle>                        
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteList(stat?.listId ?? '')}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                <div className="space-y-2">
                    <StatItem label="Articles" value={stat?.articleCount ?? 0} />
                    <StatItem label="Unique Sources" value={stat?.sources.length ?? 0} />
                    <StatItem label="Unique Authors" value={stat?.authors.length ?? 0} />
                    <StatItem label="Citations" value={stat?.citations.length ?? 0} />
                    <StatItem label="Bombshell Claims" value={stat?.bombshellClaims.length ?? 0} />
                </div>
                {(stat?.sources?.length ?? 0) > 0 && (
                    <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Top Sources:</h4>
                    <div className="flex flex-wrap gap-1">
                        {stat?.sources.slice(0, 3).map((source, i) => (
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