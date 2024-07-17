import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import supabase from '@/lib/supabaseClient';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ExtractionForm = () => {
  const [inputText, setInputText] = useState('');
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [extractedContent, setExtractedContent] = useState(null);

  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase.from('lists').select('*');
      if (error) {
        console.error('Error fetching lists:', error);
      } else {
        setLists(data);
      }
    };

    fetchLists();
  }, []);

  const handleSubmit = async () => {
    console.log("User input:", inputText);
    console.log("Selected list:", selectedList);
  
    try {
      const { data: detectData, error: detectError } = await supabase.functions.invoke('detectVariables', {
        body: { query: inputText }
      });
  
      if (detectError) {
        console.error('Error detecting variables:', detectError);
        return;
      }
  
      const variables = detectData.variables;
      setVariables(variables);
  
      const { data: extractData, error: extractError } = await supabase.functions.invoke('extractContent', {
        body: { tags: variables, listId: selectedList }
      });
  
      if (extractError) {
        console.error('Error extracting content:', extractError);
      } else {
        console.log('Extracted content:', extractData.results);
        setExtractedContent(extractData.results);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 px-12 pt-12 pb-1 w-full">
      <div className="font-semibold border-[0.5px] border-purple-900 rounded-xl p-1 w-full">
        <Select value={selectedList} onValueChange={setSelectedList}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a list to extract information from..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {lists.map(list => (
                <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid w-full gap-1.5 mt-2">
        <Label className="mb-1 text-base" htmlFor="message-2">Describe your request below</Label>
        <Textarea
          placeholder="Ex: I want to get sentiment, key topics, and funny statements for memes from these articles text..."
          id="message-2"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Your message will be translated into a natural language query that will be used to extract information from the selected list as structured data that you can export.
        </p>
      </div>
      <Button onClick={handleSubmit} className="bg-purple-900 hover:bg-purple-800 w-full">
        Generate
      </Button>
      <div className="flex flex-wrap gap-2 mt-4">
        {variables.map((variable, index) => (
            <Badge key={index} variant="outline" className="text-md px-3 py-1">
            {variable}
            </Badge>
        ))}
      </div>
      {extractedContent && (
        <div className="mt-4 w-full">
          <h3 className="text-lg font-semibold">Extracted Content:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(extractedContent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ExtractionForm;