import React, { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import ListContents from '@/components/ListContents';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Overview from "@/components/ui/Overview";

export type ListType = {
  created_at: string;
  id: string;
  name: string | null;
  updated_at: string | null;
  user_id: string | null;
} 

const ListManager = ({ userId }: { userId: string }) => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    console.log("USERID", userId)
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId);

    console.log(data);

    if (error) {
      console.error('Error fetching lists:', error);
    } else {
      setLists(data);
    }
  };

  const createList = async () => {
    if (!newListName.trim() || !userId) return;

    const { error } = await supabase
      .from('lists')
      .insert({ name: newListName, user_id: userId });

    if (error) {
      console.error('Error creating list:', error);
    } else {
      setNewListName('');
      fetchLists();
    }
  };

  useEffect(() => {
    console.log(lists)
  }, [lists]);

  return (
    <div className="flex flex-col items-start flex-1">
      <div className="flex flex-col items-start mb-4">
        <div className="flex items-start space-x-2 mt-5 mb-4 w-full">
            <Input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter a list name"
              className="w-[500px] shadow-lg"
            />
            <Button className="bg-purple-900 hover:bg-purple-700" onClick={createList}>
            Create List
            </Button>
        </div>
      </div>
        <Tabs className="w-full justify-start" defaultValue="overview">
          <TabsList className="w-full justify-start">
              <TabsTrigger key="overview" value="overview">
                  Overview
              </TabsTrigger>
              {lists.length > 0 && (
                lists.map(list => (
                <TabsTrigger key={list.id} value={list.id}>
                    {list.name}
                </TabsTrigger>
                ))
              )}
          </TabsList>
          <TabsContent className="w-full" value="overview">
            <Overview userId={userId}/>
          </TabsContent>
          {lists.length > 0 && (
            lists.map(list => (
                <TabsContent className="w-full" key={list.id} value={list.id}>
                    <ListContents listId={list.id} userId={userId} />
                </TabsContent>
            ))
          )}
        </Tabs>
    </div>
  );
};

export default ListManager;