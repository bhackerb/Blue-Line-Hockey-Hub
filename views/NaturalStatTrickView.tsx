
import React, { useState } from 'react';
import EmbeddedView from '../components/EmbeddedView';

type NSTSubTab = 'games' | 'teams' | 'players';

const NaturalStatTrickView: React.FC = () => {
    const [subTab, setSubTab] = useState<NSTSubTab>('games');

    const tabs: {id: NSTSubTab; label: string; url: string; title: string;}[] = [
        { id: 'games', label: 'Games', url: 'https://www.naturalstattrick.com/games.php', title: 'Natural Stat Trick - Game Scores' },
        { id: 'teams', label: 'Teams', url: 'https://www.naturalstattrick.com/teamtable.php', title: 'Natural Stat Trick - Team Stats' },
        { id: 'players', label: 'Players', url: 'https://www.naturalstattrick.com/playerteams.php', title: 'Natural Stat Trick - Player Stats' },
    ];

    const activeTabData = tabs.find(t => t.id === subTab)!;

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Natural Stat Trick</h2>
                <p className="text-gray-400">
                    Comprehensive underlying metrics and game stats from <a href="https://www.naturalstattrick.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">NaturalStatTrick.com</a>.
                </p>
            </div>

            <div className="mb-6 flex justify-center border-b border-gray-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
                            ${subTab === tab.id
                                ? 'border-blue-500 text-white'
                                : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <EmbeddedView 
                key={subTab}
                src={activeTabData.url} 
                title={activeTabData.title} 
                applyDarkModeFilter={false}
            />
        </div>
    );
};

export default NaturalStatTrickView;
