import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import ArticleDialog from './ArticleDialog';
import { ArticleType } from '@/components/articles';
import KeyDetailsDialog from './KeyDetailsDialog';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
};

interface ArticleCardProps {
   article: ArticleType;
   showSource?: boolean;
   last?: boolean;
   single?: boolean;
   onSelect: (articleId: string) => void;
   isSelected?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, showSource = true, last = false, single = false, onSelect, isSelected = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKeyDetailsDialogOpen, setIsKeyDetailsDialogOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const { userId } = useAuth();
  
  const fetchLists = async () => {
    const { data, error } = await supabase.from('lists').select('*');
    if (error) {
      console.error('Error fetching lists:', error);
    } else {
      setLists(data);
    }
  };

  const addToList = async () => {
    if (!selectedList) return;
    
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    const { data, error } = await supabase
      .from('list_articles')
      .insert({ 
        user_id: userId,
        list_id: selectedList, 
        article_id: article.id 
      });
  
    if (error) {
      console.error('Error adding article to list:', error);
    } else {
      console.log('Article added to list successfully');
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <div className={`bg-white overflow-hidden shadow-[0_5px_5px_0px_rgba(0,0,0,0.05)] ${last ? "rounded-b-2xl" : ""} ${single ? "rounded-2xl" : ""} relative`}>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-0.5" onClick={() => onSelect(article.id)}>
          <CheckCircleIcon className="w-3 h-3 text-white" />
        </div>
      )}
      {!isSelected && (
        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-0.5" onClick={() => onSelect(article.id)}>
          <div className="w-3 h-3 bg-white rounded-full border border-purple-500" />
        </div>
      )}
      {showSource && (
        <div className="rounded-t-2xl mb-1.5 px-3 py-4 text-base leading-5 font-medium text-white bg-purple-900 bg-opacity-75 border-b border-gray-200">
          {article.source || 'Unknown Source'}
        </div>
      )}
      <div className={`bg-white overflow-hidden mb-3`}>
        <div className="px-3 py-3 sm:px-5 rounded-t-none">
          <h3 className="text-sm font-semibold text-gray-800 mb-1.5">
            {article.title}
          </h3>
          <p className="text-xs text-gray-600 mb-3">
              {stripHtml(article.content).substring(0, 150)}...
          </p>
          {article.published && (
            <p className="text-xs text-black font-medium mb-1.5">
              <strong>Published on:</strong> {new Date(article.published).toLocaleDateString()}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags && article.tags.map((tag, index) => (
              <span key={index} className="bg-gray-200 px-2.5 py-1 rounded-full font-medium text-xs text-gray-800">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full">
              <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-900 hover:text-purple-700 font-medium mb-1.5 sm:mb-0 text-sm"
              >
                  Read more
              </a>
              <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
                  <button 
                  className="text-white bg-purple-800 hover:bg-purple-700 font-medium px-2.5 py-1.5 rounded-xl flex items-center justify-center transition duration-300 w-full sm:w-auto text-sm"
                  onClick={() => setIsDialogOpen(true)}
                  >
                  <Image
                      src="/images/commonwealth.png"
                      alt="Chat"
                      width={20}
                      height={20}
                      className="mr-1.5"
                  />
                  Chat
                  </button>
                  <button 
                  className="text-white bg-purple-500 hover:bg-purple-400 font-medium px-2.5 py-1.5 rounded-xl transition duration-300 w-full sm:w-auto text-sm"
                  onClick={() => setIsKeyDetailsDialogOpen(true)}
                  >
                  Details
                  </button>
              </div>
          </div>
        </div>
      </div>
      <ArticleDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        article={article}
      />
  
      <KeyDetailsDialog
        open={isKeyDetailsDialogOpen}
        onClose={() => setIsKeyDetailsDialogOpen(false)}
        article={article}
      />
    </div>
  );
};

export default ArticleCard;