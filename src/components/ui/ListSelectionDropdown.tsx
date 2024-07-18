import React, { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import supabase from '@/lib/supabaseClient';

interface ListSelectionDropdownProps {
  selectedList: string;
  setSelectedList: (value: string) => void;
  onAddToList: () => void;
  selectedArticlesCount: number;
  userId: string;
}

interface ListItem {
  id: string;
  name: string;
}

export default function ListSelectionDropdown({ 
  selectedList, 
  setSelectedList, 
  onAddToList, 
  selectedArticlesCount, 
  userId
}: ListSelectionDropdownProps) {
   const [lists, setLists] = useState<Array<{ id: string, name: string }>>([]);
   
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
            .select('id, name')
            .eq('user_id', userId);

        console.log(data);

        if (error) {
          console.error('Error fetching lists:', error);
        } else if (data) { 
            const formattedData: ListItem[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
            }));
            setLists(formattedData);
            if (formattedData) {
                setSelectedList(formattedData[0]?.id ?? '');
            }
        }
        };

  return (
    <div className="flex items-center space-x-2 ml-2">
      <Select value={selectedList} onValueChange={setSelectedList}>
        <SelectTrigger className="w-[200px] rounded-xl">
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectGroup>
            {lists.map(list => (
              <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button 
        onClick={onAddToList} 
        disabled={!selectedList || selectedArticlesCount === 0}
        className="bg-purple-800 text-white px-4 py-2 rounded-xl"
      >
        Add {selectedArticlesCount} article{selectedArticlesCount !== 1 ? 's' : ''} to list
      </Button>
    </div>
  );
};