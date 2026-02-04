import React, { useState } from 'react';
import EmbeddedView from '../components/EmbeddedView';

type AnalyticsSource = 'moneypuck' | 'naturalstattrick' | 'hockeyviz';
type MoneyPuckSubTab = 'games' | 'rankings' | 'lines';
type NaturalStatTrickSubTab = 'teams' | 'players' | 'lines';
type HockeyVizSubTab = 'teams' | 'players' | 'games';

const AnalyticsView: React.FC = () => {
    const [source, setSource] = useState<AnalyticsSource>('moneypuck');
    const [mpSubTab, setMpSubTab] = useState<MoneyPuckSubTab>('games');
    const [nstSubTab, setNstSubTab] = useState<NaturalStatTrickSubTab>('teams');
    const [hvSubTab, setHvSubTab] = useState<HockeyVizSubTab>('teams');

    const sources: { id: AnalyticsSource; label: string; description: string }[] = [
        { id: 'moneypuck', label: 'MoneyPuck', description: 'Expected goals, win probability, and betting analytics' },
        { id: 'naturalstattrick', label: 'Natural Stat Trick', description: 'On-ice shot metrics, Corsi, Fenwick, and zone stats' },
        { id: 'hockeyviz', label: 'HockeyViz', description: 'Visual analytics and heat maps' },
    ];

    const moneyPuckTabs: { id: MoneyPuckSubTab; label: string; url: string; title: string }[] = [
        { id: 'games', label: 'Games', url: 'https://moneypuck.com/index.html', title: 'MoneyPuck - Games' },
        { id: 'rankings', label: 'Power Rankings', url: 'https://moneypuck.com/power.htm', title: 'MoneyPuck - Power Rankings' },
        { id: 'lines', label: 'Lines', url: 'https://moneypuck.com/lines.htm', title: 'MoneyPuck - Lines' },
    ];

    const naturalStatTrickTabs: { id: NaturalStatTrickSubTab; label: string; url: string; title: string }[] = [
        { id: 'teams', label: 'Team Stats', url: 'https://www.naturalstattrick.com/teamtable.php', title: 'Natural Stat Trick - Team Stats' },
        { id: 'players', label: 'Player Stats', url: 'https://www.naturalstattrick.com/playerteams.php?stdoi=std', title: 'Natural Stat Trick - Player Stats' },
        { id: 'lines', label: 'Line Stats', url: 'https://www.naturalstattrick.com/linestats.php', title: 'Natural Stat Trick - Line Stats' },
    ];

    const hockeyVizTabs: { id: HockeyVizSubTab; label: string; url: string; title: string }[] = [
        { id: 'teams', label: 'Team Charts', url: 'https://hockeyviz.com/teams', title: 'HockeyViz - Team Charts' },
        { id: 'players', label: 'Player Charts', url: 'https://hockeyviz.com/players', title: 'HockeyViz - Player Charts' },
        { id: 'games', label: 'Game Charts', url: 'https://hockeyviz.com/games', title: 'HockeyViz - Game Charts' },
    ];

    const getActiveView = () => {
        switch (source) {
            case 'moneypuck': {
                const activeTab = moneyPuckTabs.find(t => t.id === mpSubTab)!;
                return { tabs: moneyPuckTabs, activeTab, setSubTab: setMpSubTab, currentSubTab: mpSubTab };
            }
            case 'naturalstattrick': {
                const activeTab = naturalStatTrickTabs.find(t => t.id === nstSubTab)!;
                return { tabs: naturalStatTrickTabs, activeTab, setSubTab: setNstSubTab, currentSubTab: nstSubTab };
            }
            case 'hockeyviz': {
                const activeTab = hockeyVizTabs.find(t => t.id === hvSubTab)!;
                return { tabs: hockeyVizTabs, activeTab, setSubTab: setHvSubTab, currentSubTab: hvSubTab };
            }
        }
    };

    const activeView = getActiveView();
    const activeSource = sources.find(s => s.id === source)!;

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Advanced NHL Analytics</h2>
                <p className="text-gray-400">
                    In-depth statistics and models from multiple analytics sources.
                </p>
            </div>

            {/* Source Selector */}
            <div className="mb-4 flex flex-wrap justify-center gap-2">
                {sources.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSource(s.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${source === s.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Source Description */}
            <p className="text-center text-gray-500 text-sm mb-4">{activeSource.description}</p>

            {/* Sub-tabs for the selected source */}
            <div className="mb-6 flex justify-center border-b border-gray-700">
                {activeView.tabs.map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => activeView.setSubTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
                            ${activeView.currentSubTab === tab.id
                                ? 'border-blue-500 text-white'
                                : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <EmbeddedView
                key={`${source}-${activeView.currentSubTab}`}
                src={activeView.activeTab.url}
                title={activeView.activeTab.title}
                applyDarkModeFilter={false}
            />
        </div>
    );
};

export default AnalyticsView;