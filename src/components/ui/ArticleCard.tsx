import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import ArticleDialog from './ArticleDialog';
import { ArticleType } from '@/components/articles';
import KeyDetailsDialog from './KeyDetailsDialog';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import AddToListDialog from './AddToListDialog';

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

interface ArticleCardProps {
   article: ArticleType;
   showSource?: boolean;
   last?: boolean;
}
  
const ArticleCard: React.FC<ArticleCardProps> = ({ article, showSource = true, last = false, single = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKeyDetailsDialogOpen, setIsKeyDetailsDialogOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [isAddToListOpen, setIsAddToListOpen] = useState(false);
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
      setIsAddToListOpen(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <div className={`bg-white overflow-hidden shadow-[0_5px_5px_0px_rgba(0,0,0,0.05)] ${last ? "rounded-b-2xl" : ""} ${single ? "rounded-2xl" : ""}`}>
      <AddToListDialog
        open={isAddToListOpen}
        onClose={() => setIsAddToListOpen(false)}
        lists={lists}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        addToList={addToList}
      />

      {showSource && (
        <div className="rounded-t-2xl mb-2 px-4 py-5 text-lg leading-6 font-medium text-white bg-purple-900 bg-opacity-75 border-b border-gray-200">
          {article.source || 'Unknown Source'}
        </div>
      )}
      <div className={`bg-white overflow-hidden mb-4`}>
        <div className="px-4 py-4 sm:px-6 rounded-t-none">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
              {stripHtml(article.content).substring(0, 150)}...
          </p>
          {article.published && (
            <p className="text-sm text-black font-medium mb-2">
              Published on: {new Date(article.published).toLocaleDateString()}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags && article.tags.map((tag, index) => (
              <span key={index} className="bg-gray-200 px-3 py-1.5 rounded-full font-medium text-sm text-gray-800">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full">
              <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-900 hover:text-purple-700 font-medium mb-2 sm:mb-0"
              >
                  Read more
              </a>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button 
                  className="text-white bg-purple-800 hover:bg-purple-700 font-medium px-3 py-2 rounded-xl flex items-center justify-center transition duration-300 w-full sm:w-auto"
                  onClick={() => setIsDialogOpen(true)}
                  >
                  <Image
                      src="/images/commonwealth.png"
                      alt="Chat"
                      width={24}
                      height={24}
                      className="mr-2"
                  />
                  Chat
                  </button>
                  <button 
                  className="text-white bg-purple-500 hover:bg-purple-400 font-medium px-3 py-2 rounded-xl transition duration-300 w-full sm:w-auto"
                  onClick={() => setIsKeyDetailsDialogOpen(true)}
                  >
                  Details
                  </button>
              </div>
          </div>
          <button 
              className="text-white bg-purple-900 hover:bg-purple-700 font-medium px-3 py-2 rounded-xl flex items-center justify-center transition duration-300 w-full mt-4"
              onClick={() => setIsAddToListOpen(true)}
              >
              <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
              Add to List
          </button>
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