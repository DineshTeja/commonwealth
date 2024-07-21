import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import ReactTextareaAutosize from "react-textarea-autosize";
import { ChevronRightIcon, StopCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import ChatView from "@/components/ui/chatView";
import Image from "next/image";
import supabase from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

interface ArticleDialogProps {
  open: boolean;
  onClose: () => void;
  article: Database['public']['Tables']['articles']['Row'];
}

type Message = {
  id: string;
  text: string;
  timestamp: number;
  sender: "user" | "ai" | "system";
};

function ArticleDialog({ open, onClose, article }: ArticleDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // Load previous messages if any
      // This is a placeholder. You might want to implement this feature later.
      setMessages([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (chatInput.trim() === "") return;
    
    const userMessage: Message = {
      id: uuidv4(),
      text: chatInput,
      timestamp: Date.now(),
      sender: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsAnswering(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatArticle', {
        body: { article, userMessage: chatInput }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: uuidv4(),
        text: data.chatResponse.choices[0].message.content,
        timestamp: Date.now(),
        sender: "ai"
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling chatArticle function:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsAnswering(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md" 
      PaperProps={{ style: { borderRadius: 16 }}}
    >
      <DialogContent>
        <div className="flex flex-col w-full overflow-scroll">
          <div className="flex flex-col items-center justify-center gap-1 p-12 text-center">
            <div className="font-extrabold text-3xl text-slate-800">
              {article.title}
            </div>
            <div className="text-slate-500 font-medium">
              Powered by GPT-3.5
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full">
            {messages.map((message) => (
              <ChatView key={message.id} message={message} />
            ))}
            {isAnswering && (
              <div className="flex justify-center items-center">
                <Image
                  src="/images/commonwealth.png"
                  alt="Loading..."
                  width={75}
                  height={75}
                  className="mb-3 animate-pulse"
                />   
              </div>                         
            )}
          </div>
          <div ref={bottomRef} />
        </div>
        <div className="flex flex-row gap-2 w-full border border-slate-200 rounded-xl bg-white mt-4">
          <ReactTextareaAutosize
            placeholder="Chat with Commonwealth AI"
            value={chatInput}
            disabled={isAnswering}
            onChange={(e) => setChatInput(e.target.value)}
            className="resize-none w-full text-sm p-3 bg-transparent focus:outline-none"
            maxRows={6}
            maxLength={1024}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-full aspect-square rounded-xl transition-all"
            onClick={handleSubmit}
            disabled={isAnswering || chatInput.trim() === ""}
          >
            {isAnswering ? (
              <StopCircleIcon className="text-slate-600" />
            ) : (
              <ChevronRightIcon className="text-purple-400" />
            )}
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <div 
          className="text-white bg-purple-800 hover:bg-purple-400 font-medium px-4 py-2 rounded-xl flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          Close
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default ArticleDialog;