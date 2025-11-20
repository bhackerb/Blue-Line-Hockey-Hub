import React, { useState, useEffect } from 'react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when the article prop changes
  useEffect(() => {
    setImageError(false);
  }, [article.imageUrl]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const PlaceholderContent = () => (
      <div className="w-full h-48 bg-gray-700/50 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
        </svg>
      </div>
  );

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden ring-1 ring-gray-700/50 hover:ring-blue-500/50 hover:scale-105 transform transition-all duration-300 ease-in-out group"
    >
      <div className="relative">
        {imageError || !article.imageUrl ? (
            <PlaceholderContent />
        ) : (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-48 object-cover"
              onError={() => setImageError(true)}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white text-lg font-bold group-hover:underline">
            {article.title}
          </h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-400 text-sm mb-3 h-10 overflow-hidden">{article.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="truncate pr-2">{article.source}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
};

export default ArticleCard;