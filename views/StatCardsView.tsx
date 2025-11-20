import React from 'react';
import EmbeddedView from '../components/EmbeddedView';

const StatCardsView: React.FC = () => {
    const url = "https://www.hockeystatcards.com/impact";

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Player Impact Scorecards</h2>
                <p className="text-gray-400">
                    Visualizations powered by <a href="https://www.hockeystatcards.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">HockeyStatCards.com</a>.
                </p>
            </div>
            <EmbeddedView src={url} title="Hockey Stat Cards - Player Impact" />
        </div>
    );
};

export default StatCardsView;