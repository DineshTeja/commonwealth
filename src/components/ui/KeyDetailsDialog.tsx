import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import supabase from '@/lib/supabaseClient';
import { ArticleType } from '@/components/articles';
import Image from "next/image";

interface KeyDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  article: ArticleType;
}

interface KeyDetails {
  sentiment: number;
  keyMentions: string[];
  bombshellClaims: string[];
  keyStatistics: string[];
  description: string;
  citation: string;
}

function KeyDetailsDialog({ open, onClose, article }: KeyDetailsDialogProps) {
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchKeyDetails();
    }
  }, [open, article.url]);

  const fetchKeyDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('key_details')
        .eq('url', article.url)
        .limit(1)
        .single();
  
      if (error) throw error;
  
      if (!data.key_details) {
        const { data: keyDetailsData, error: keyDetailsError } = await supabase.functions.invoke('keyDetails', {
          body: { article }
        });
  
        if (keyDetailsError) throw keyDetailsError;
  
        setKeyDetails(keyDetailsData.keyDetails);
      } else {
        setKeyDetails(data.key_details);
      }
    } catch (error) {
      console.error("Error fetching or generating key details:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              Key Details: {article.title}
            </div>
            <div className="text-slate-500 font-medium">
              Powered by GPT-3.5
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Image
                src="/images/commonwealth.png"
                alt="Loading..."
                width={75}
                height={75}
                className="mb-3 animate-pulse"
              />
            </div>
          ) : keyDetails ? (
            <div className="flex flex-col gap-6 w-full">
              <DetailSection title="Sentiment" content={`Political leaning: ${keyDetails.sentiment ?? 'N/A'} (-10 far left, 10 far right)`} />
              <DetailSection title="Key Mentions" content={keyDetails.keyMentions} />
              <DetailSection title="Bombshell Claims" content={keyDetails.bombshellClaims} />
              <DetailSection title="Key Statistics" content={keyDetails.keyStatistics} />
              <DetailSection title="Description" content={keyDetails.description} />
              <DetailSection title="Citation" content={keyDetails.citation} />
            </div>
          ) : (
            <p className="text-center text-slate-600">No key details available for this article.</p>
          )}
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

function DetailSection({ title, content }: { title: string; content: string | string[] | Record<string, any> }) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
        {Array.isArray(content) ? (
          <ul className="list-disc pl-5">
            {content.length > 0 ? content.map((item, index) => (
              <li key={index} className="text-slate-600">{item}</li>
            )) : (
              <li className="text-slate-600">No {title.toLowerCase()} available</li>
            )}
          </ul>
        ) : typeof content === 'object' ? (
          <ul className="list-disc pl-5">
            {Object.entries(content).map(([key, value], index) => (
              <li key={index} className="text-slate-600">{key}: {value}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600">{content || `No ${title.toLowerCase()} available`}</p>
        )}
      </div>
    );
  }

export default KeyDetailsDialog;