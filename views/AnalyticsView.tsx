import React, { useState } from 'react';
import EmbeddedView from '../components/EmbeddedView';

type AnalyticsSubTab = 'games' | 'rankings' | 'lines';

const AnalyticsView: React.FC = () => {
    const [subTab, setSubTab] = useState<AnalyticsSubTab>('games');

    const tabs: {id: AnalyticsSubTab; label: string; url: string; title: string;}[] = [
        { id: 'games', label: 'Games', url: 'https://moneypuck.com/index.html', title: 'MoneyPuck - Games' },
        { id: 'rankings', label: 'Power Rankings', url: 'https://moneypuck.com/power.htm', title: 'MoneyPuck - Power Rankings' },
        { id: 'lines', label: 'Lines', url: 'https://moneypuck.com/lines.htm', title: 'MoneyPuck - Lines' },
    ];

    const activeTabData = tabs.find(t => t.id === subTab)!;

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Advanced NHL Analytics</h2>
                <p className="text-gray-400">
                    In-depth stats and models from <a href="https://moneypuck.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">MoneyPuck.com</a>.
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

export default AnalyticsView;