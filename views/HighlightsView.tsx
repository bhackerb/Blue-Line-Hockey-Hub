import React from 'react';

const HighlightsView: React.FC = () => {
    const externalUrl = 'https://www.youtube.com/results?search_query=Official+NHL+Highlights&sp=EgIIAg%253D%253D';

    return (
        <div className="flex items-center justify-center pt-10 md:pt-16">
            <div className="text-center bg-gray-800/50 rounded-xl shadow-2xl p-8 md:p-12 ring-1 ring-gray-700/50 max-w-2xl mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <h2 className="text-3xl font-bold mb-3 text-white">NHL Game Highlights</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Click the button below to open a live search for the latest official NHL highlights directly on YouTube. This avoids embedding issues and ensures you get the most up-to-date content.
                </p>
                <a 
                    href={externalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 space-x-2"
                    aria-label="Watch NHL highlights on YouTube"
                >
                    <span>Watch on YouTube</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default HighlightsView;