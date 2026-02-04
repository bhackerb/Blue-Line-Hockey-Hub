import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface EmbeddedViewProps {
  src: string;
  title: string;
  applyDarkModeFilter?: boolean;
}

const EmbeddedView: React.FC<EmbeddedViewProps> = ({ src, title, applyDarkModeFilter = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  const iframeClasses = `w-full h-[75vh] rounded-md border-0 relative z-10 ${applyDarkModeFilter ? 'bg-white filter invert(1) hue-rotate(180deg)' : ''}`;

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setLoadTimeout(false);
  }, [src]);

  // Set a timeout for iframe loading - some sites block embedding silently
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, src]);

  const getExternalUrl = (embedSrc: string): string => {
    if (!embedSrc.startsWith('https://www.youtube.com')) {
      return embedSrc;
    }
    try {
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
    } catch {
      return embedSrc;
    }
    return embedSrc;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadTimeout(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const externalUrl = getExternalUrl(src);

  // Show fallback UI if there's an error or timeout
  const showFallback = hasError || loadTimeout;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-2 md:p-4 relative min-h-[80vh] ring-1 ring-gray-700/50">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-sm text-blue-400 hover:underline"
        >
          <span>Open in new tab</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </a>
      </div>

      {/* Loading state */}
      {isLoading && !showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-0 rounded-lg">
          <LoadingSpinner text="Loading content..." />
        </div>
      )}

      {/* Fallback UI when embedding fails or times out */}
      {showFallback && (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-900/50 rounded-lg">
          <div className="text-center p-8 max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">External Content</h3>
            <p className="text-gray-400 mb-6">
              {hasError
                ? "This content couldn't be embedded due to site restrictions."
                : "This content is taking longer than expected to load."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors space-x-2"
              >
                <span>Open {new URL(src).hostname}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
              {loadTimeout && !hasError && (
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setLoadTimeout(false);
                  }}
                  className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Continue Waiting
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Iframe - hidden when showing fallback */}
      <iframe
        src={src}
        title={title}
        className={iframeClasses}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ display: (isLoading || showFallback) ? 'none' : 'block' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

export default EmbeddedView;