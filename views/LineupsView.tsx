import React, { useState } from 'react';
import EmbeddedView from '../components/EmbeddedView';

type LineupsSubTab = 'goalies' | 'lines' | 'depth' | 'injuries';

const LineupsView: React.FC = () => {
    const [subTab, setSubTab] = useState<LineupsSubTab>('goalies');

    const tabs: { id: LineupsSubTab; label: string; url: string; title: string; description: string }[] = [
        {
            id: 'goalies',
            label: 'Starting Goalies',
            url: 'https://www.dailyfaceoff.com/starting-goalies',
            title: 'Daily Faceoff - Starting Goalies',
            description: 'Tonight\'s confirmed and projected starting goalies'
        },
        {
            id: 'lines',
            label: 'Line Combos',
            url: 'https://www.dailyfaceoff.com/teams',
            title: 'Daily Faceoff - Team Lines',
            description: 'Current forward lines and defensive pairings for all teams'
        },
        {
            id: 'depth',
            label: 'Depth Charts',
            url: 'https://www.dailyfaceoff.com/depth-charts',
            title: 'Daily Faceoff - Depth Charts',
            description: 'Complete roster depth charts for every NHL team'
        },
        {
            id: 'injuries',
            label: 'Injury Report',
            url: 'https://www.dailyfaceoff.com/teams',
            title: 'Daily Faceoff - Injury Report',
            description: 'Current injury and IR information across the league'
        },
    ];

    const activeTabData = tabs.find(t => t.id === subTab)!;

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Lineups & Rosters</h2>
                <p className="text-gray-400">
                    Data provided by <a href="https://www.dailyfaceoff.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">DailyFaceoff.com</a>.
                </p>
            </div>

            {/* Sub-tabs */}
            <div className="mb-4 flex flex-wrap justify-center gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${subTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Description */}
            <p className="text-center text-gray-500 text-sm mb-4">{activeTabData.description}</p>

            <EmbeddedView
                key={subTab}
                src={activeTabData.url}
                title={activeTabData.title}
            />
        </div>
    );
};

export default LineupsView;