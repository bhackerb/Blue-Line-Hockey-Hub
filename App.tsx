
import React, { useState } from 'react';
import Header from './components/Header';
import TabView from './components/TabView';
import ScoresView from './views/ScoresView';
import MoneyPuckView from './views/MoneyPuckView';
import NaturalStatTrickView from './views/NaturalStatTrickView';
import LineupsView from './views/LineupsView';
import StandingsView from './views/StandingsView';
import HighlightsView from './views/HighlightsView';
import StatCardsView from './views/StatCardsView';
import NewsView from './views/NewsView';
import PuckpediaView from './views/PuckpediaView';
import type { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('scores');

  const renderContent = () => {
    switch (activeTab) {
      case 'scores':
        return <ScoresView />;
      case 'news':
        return <NewsView />;
      case 'highlights':
        return <HighlightsView />;
      case 'standings':
        return <StandingsView />;
      case 'statCards':
        return <StatCardsView />;
      case 'moneypuck':
        return <MoneyPuckView />;
      case 'naturalStatTrick':
        return <NaturalStatTrickView />;
      case 'lineups':
        return <LineupsView />;
      case 'puckpedia':
        return <PuckpediaView />;
      default:
        return <ScoresView />;
    }
  };

  return (
    <div className="bg-gray-900/0 text-white min-h-screen font-sans">
      <Header />
      <TabView activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>
       <footer className="text-center p-6 mt-8 border-t border-gray-800/50 text-gray-500 text-sm">
        <p>All data and logos are property of their respective owners. This is an unofficial fan project.</p>
      </footer>
    </div>
  );
};

export default App;
