import React from 'react';
import type { Tab } from '../types';

interface TabViewProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabView: React.FC<TabViewProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'scores', label: 'Scores' },
    { id: 'news', label: 'News' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'standings', label: 'Standings' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'statCards', label: 'Stat Cards' },
    { id: 'lineups', label: 'Lineups & Goalies' },
    { id: 'puckpedia', label: 'Puckpedia' },
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-lg sticky top-0 z-20 border-y border-gray-700/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="relative flex items-center justify-center h-16">
            {/* FIX: React's style prop requires camelCase for CSS properties like 'msOverflowStyle' and does not support pseudo-elements like '::-webkit-scrollbar'. */}
            <div className="w-full overflow-x-auto whitespace-nowrap" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                <div className="flex items-baseline justify-center space-x-2 md:space-x-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800
                        ${
                        activeTab === tab.id
                          ? 'text-white'
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                      aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default TabView;