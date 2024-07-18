import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import supabase from '@/lib/supabaseClient';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExtractedContentTable from "@/components/ui/ExtractedContentTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClockIcon } from "lucide-react";
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ListType } from '@/components/ui/ListManager';
import { Database } from '@/lib/database.types';

const ExtractionForm = ({ userId }: { userId: string }) => {
  const [inputText, setInputText] = useState('');
  const [lists, setLists] = useState<ListType[]>([]);
  const [selectedList, setSelectedList] = useState('');
  const [variables, setVariables] = useState<Array<{name: string, type: "string" | "boolean" | "number" | "date" | "jsonb", structure: "single" | "array"}>>([{name: "", type: "string", structure: "single"}]);
  const [extractedContent, setExtractedContent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [extractions, setExtractions] = useState<Database['public']['Tables']['extractions']['Row'][]>([]);
  const [generatedVariables, setGeneratedVariables] = useState(false);
  const [manualAddVariable, setManualAddVariable] = useState(false);
  
  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase.from('lists').select('*');
      if (error) {
        console.error('Error fetching lists:', error);
      } else {
        setLists(data);
      }
    };

    const fetchExtractions = async () => {
      const { data, error } = await supabase.from('extractions').select('*');
      if (error) {
        console.error('Error fetching extractions:', error);
      } else {
        setExtractions(data);
      }
    };

    fetchLists();
    fetchExtractions();
  }, []);

  const detectAndStoreVariables = async () => {
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
      setGeneratedVariables(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const extractContent = async () => {
    setLoadingContent(true);
  
    try {
      const { data: extractData, error: extractError } = await supabase.functions.invoke('extractContent', {
        body: { tags: variables, listId: selectedList }
      });
  
      if (extractError) {
        console.error('Error extracting content:', extractError);
      } else {
        console.log('Extracted content:', extractData.results);
        setExtractedContent(extractData.results);
        await saveExtraction();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const saveExtraction = async () => {
    try {
      const { error } = await supabase.from('extractions').insert({
        list_id: selectedList,
        inputText,
        extractedContent,
        variables: JSON.stringify(variables),
        user_id: userId
      });

      if (error) {
        console.error('Error saving extraction:', error);
      } else {
        console.log('Extraction saved successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleVariableChange = (index: number, change: keyof typeof variables[0], value: string) => {
    setVariables((prevVariables) => {
      return prevVariables.map((variable, i) => {
        if (i === index) {
          return { ...variable, [change]: value };
        }
        return variable;
      });
    });
  };

  const handleDeleteVariable = (index: number) => {
    setVariables((prevVariables) => prevVariables.filter((_, i) => i !== index));
  };

  const handleAddBlankVariable = () => {
    setVariables([...variables, {name: "", type: "string", structure: "single"}]);
    setManualAddVariable(true);
  };

  const handleExtractionSelect = async (extractionId: string) => {
    const { data, error } = await supabase.from('extractions').select('*').eq('id', extractionId).single();
    if (error) {
      console.error('Error fetching extraction:', error);
    } else {
      setInputText(data.inputText ?? '');
      setSelectedList(data.list_id ?? '');
      setVariables(typeof data.variables === 'string' ? JSON.parse(data.variables) : []);
      setExtractedContent(data.extractedContent);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4 px-12 pt-3 pb-1 w-full">
      <div className="grid justify-center items-center gap-1.5 mt-2 text-left w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Previous History <ClockIcon className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[600px]">
            <DropdownMenuLabel>Previous Extractions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup>
              {extractions.length > 0 ? (
                extractions.map(extraction => (
                  <DropdownMenuRadioItem key={extraction.id} value={extraction.id} onClick={() => handleExtractionSelect(extraction.id)} className="flex justify-between items-center">
                    <div className="flex flex-col mt-1">
                      <span className="text-left">{extraction.inputText?.substring(0, 40) ?? ''}...</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                      {(typeof extraction.variables === 'string' ? JSON.parse(extraction.variables) : []).map((variable: any, index: number) => (
                        <Badge key={index} variant="outline">{variable.name}</Badge>
                      ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">{new Date(extraction.created_at).toLocaleDateString()}</p>
                  </DropdownMenuRadioItem>
                ))
              ) : (
                <DropdownMenuRadioItem value="none" disabled>No previous extractions</DropdownMenuRadioItem>
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid w-full gap-1.5 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-base bg-purple-100 space-x-2 p-1 px-3">
            Extraction List
            {selectedList.trim() !== "" ? (
            <div className="bg-purple-500 rounded-full p-0.5 ml-2">
              <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
          ): null}
          </Badge>
        </div>      
       <div className="font-semibold border-[0.5px] border-purple-900 rounded-xl p-1 w-full">
        <Select value={selectedList} onValueChange={setSelectedList}>
          <SelectTrigger className="w-full font-light">
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
      </div>
      <div className="grid w-full gap-1.5 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-base bg-purple-100 space-x-2 p-1 px-3">
            Describe your request below
            {generatedVariables ? (
            <div className="bg-purple-500 rounded-full p-0.5 ml-2">
              <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
          ): null}
          </Badge>
        </div>  
        <Textarea
          placeholder="Ex: I want to get sentiment, key topics, and funny statements for memes from these articles' text..."
          id="message-2"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Your message will be translated into a natural language query that will be used to extract information from the selected list as structured data that you can export.
        </p>
      </div>
      <Button variant="secondary" onClick={detectAndStoreVariables} className="shadow-md w-full">
        Generate Variables
      </Button>
      <div className="flex flex-wrap gap-2 mt-4 w-full">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-base bg-purple-100 space-x-2 p-1 px-3">
            Variables
            {(variables.length > 0 && manualAddVariable)? (
            <div className="bg-purple-500 rounded-full p-0.5 ml-2">
              <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
          ): null}
          </Badge>
        </div>  
        {variables.map((variable, index) => (
          <div key={index} className="flex items-center gap-2 w-full">
            <Input
              value={variable.name}
              onChange={(e) => handleVariableChange(index, "name", e.target.value)}
              className="text-md px-3 py-1 w-[90%]"
              placeholder="Ex: sentiment"
            />
            <Select value={variable.type} onValueChange={(value) => handleVariableChange(index, "type", value)} defaultValue="string">
              <SelectTrigger className="w-[10%] font-medium text-blue-500">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="w-[10%]">
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="jsonb">Jsonb</SelectItem>
              </SelectContent>
            </Select>
            <Select value={variable.structure} onValueChange={(value) => handleVariableChange(index, "structure", value)} defaultValue="single">
              <SelectTrigger className="w-[10%] font-medium text-blue-500">
                <SelectValue placeholder="Structure" />
              </SelectTrigger>
              <SelectContent className="w-[10%]">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteVariable(index)}
              className="text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-100 w-[10%] shadow-md"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={handleAddBlankVariable} className="shadow-md w-full">
          Add Variable
        </Button>
      </div>
      <Button onClick={extractContent} className="bg-purple-900 hover:bg-purple-800 w-full shadow-md">
        Extract Content
      </Button>
      {loadingContent && (
        <div className="mt-4 w-full flex flex-col items-center">
          <Label className="mb-3 text-lg" htmlFor="message-2">Computing and extracting content...</Label>
          <div className="animate-spin">
            <Image
              src="/images/commonwealth.png"
              alt="Loading"
              width={75}
              height={75}
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-4 w-full">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-base bg-purple-100 space-x-2 p-1 px-3">
            Extracted Content
              {(extractedContent && !loadingContent)? (
            <div className="bg-purple-500 rounded-full p-0.5 ml-2">
              <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
          ): null}
          </Badge>
        </div> 
        {(extractedContent && !loadingContent) ? ( 
          <Tabs className="w-full justify-start" defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
            </TabsContent>
            <TabsContent value="table">
              <ExtractedContentTable extractedContent={extractedContent} />
            </TabsContent>
            <TabsContent value="json">
              <div className="mt-4 w-full">
                <Label className="mb-3 text-base" htmlFor="message-2">Extracted Content</Label>
                <pre className="bg-gray-100 p-4 mt-2 rounded-lg overflow-auto whitespace-pre-wrap break-words">
                {JSON.stringify(
                    extractedContent.map((article: { content: string }) => ({
                      ...article,
                      content: article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content
                    })),
                    null,
                    2
                  )}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        ): (
        <div className="mt-4 w-full flex flex-col items-center">
          <div className="text-gray-800 font-medium text-base flex items-center justify-center bg-gray-100 border border-gray-300 rounded-md p-4 w-full">
              No Content Extracted
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ExtractionForm;