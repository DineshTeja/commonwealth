import Image from 'next/image';
import React, { useState } from 'react';
import ArticleDialog from './ArticleDialog';
import { ArticleType } from '@/components/articles';
import KeyDetailsDialog from './KeyDetailsDialog';

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

interface ArticleCardProps {
   article: ArticleType;
}
  

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKeyDetailsDialogOpen, setIsKeyDetailsDialogOpen] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not Given";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white shadow-lg overflow-hidden rounded-2xl mb-4">
      <h2 className="px-4 py-5 text-lg leading-6 font-medium text-white bg-purple-900 bg-opacity-75 border-b border-gray-200">
        {article.source || 'Unknown Source'}
      </h2>
      <div className="px-4 py-4 sm:px-6">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
            {stripHtml(article.content).substring(0, 150)}...
        </p>
        {article.publish_date && (
          <p className="text-sm text-black font-medium mb-2">
            Published on: {formatDate(article.publish_date)}
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