import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface EmbeddedViewProps {
  src: string;
  title: string;
  applyDarkModeFilter?: boolean;
}

const EmbeddedView: React.FC<EmbeddedViewProps> = ({ src, title, applyDarkModeFilter = true }) => {
  const [isLoading, setIsLoading] = useState(true);

  const iframeClasses = `w-full h-[75vh] rounded-md border-0 relative z-10 ${applyDarkModeFilter ? 'bg-white filter invert(1) hue-rotate(180deg)' : ''}`;

  const getExternalUrl = (embedSrc: string): string => {
    if (!embedSrc.startsWith('https://www.youtube.com')) {
      return embedSrc;
    }
    try {
      // The embed URL might not be a valid full URL for the constructor,
      // so we parse the list and listType from the string.
      const listMatch = embedSrc.match(/[?&]list=([^&]+)/);
      const listTypeMatch = embedSrc.match(/[?&]listType=([^&]+)/);
      
      const listId = listMatch ? listMatch[1] : null;
      const listType = listTypeMatch ? listTypeMatch[1] : null;

      if (listId) {
        if (listType === 'search') {
          return `https://www.youtube.com/results?search_query=${listId}`;
        }
        return `https://www.youtube.com/playlist?list=${listId}`;
      }
    } catch (e) {
      // Fallback for any parsing errors
      return embedSrc;
    }
    return embedSrc;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-2 md:p-4 relative min-h-[80vh] ring-1 ring-gray-700/50">
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-xl font-bold">{title}</h3>
            <a href={getExternalUrl(src)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-sm text-blue-400 hover:underline">
                <span>Open in new tab</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
            </a>
        </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-0">
          <LoadingSpinner text="Loading content..."/>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        className={iframeClasses}
        onLoad={() => setIsLoading(false)}
        style={{ display: isLoading ? 'none' : 'block' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default EmbeddedView;