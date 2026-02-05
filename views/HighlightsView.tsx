import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

interface VideoHighlight {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    publishedDate: string;
    videoUrl: string;
    gameId?: number;
}

interface HighlightCategory {
    id: string;
    label: string;
}

const HighlightsView: React.FC = () => {
    const [highlights, setHighlights] = useState<VideoHighlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoHighlight | null>(null);
    const [category, setCategory] = useState<string>('all');

    const categories: HighlightCategory[] = [
        { id: 'all', label: 'All Highlights' },
        { id: 'goals', label: 'Goals' },
        { id: 'saves', label: 'Saves' },
        { id: 'hits', label: 'Hits' },
    ];

    const fetchHighlights = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch recent games to get their highlights
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            // Try to get yesterday's games for highlights (today's games may not have highlights yet)
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayFormatted = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

            const scheduleUrl = `https://corsproxy.io/?${encodeURIComponent(`https://api-web.nhle.com/v1/schedule/${yesterdayFormatted}`)}`;
            const scheduleResponse = await fetch(scheduleUrl);

            if (!scheduleResponse.ok) {
                throw new Error('Failed to fetch schedule data');
            }

            const scheduleData = await scheduleResponse.json();
            const dayData = scheduleData.gameWeek?.find((day: any) => day.date === yesterdayFormatted) ||
                           scheduleData.gameWeek?.[0];

            const games = dayData?.games || [];

            // Fetch landing data for each game to get highlights
            const highlightPromises = games.slice(0, 6).map(async (game: any) => {
                try {
                    const landingUrl = `https://corsproxy.io/?${encodeURIComponent(`https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`)}`;
                    const landingResponse = await fetch(landingUrl);

                    if (!landingResponse.ok) return [];

                    const landingData = await landingResponse.json();

                    // Extract highlights from the landing data
                    const gameHighlights: VideoHighlight[] = [];

                    // Check for game recap/condensed game video
                    if (landingData.summary?.gameVideo) {
                        const gameVideo = landingData.summary.gameVideo;
                        if (gameVideo.condensedGame) {
                            gameHighlights.push({
                                id: `condensed-${game.id}`,
                                title: `${game.awayTeam?.abbrev || 'Away'} @ ${game.homeTeam?.abbrev || 'Home'} - Condensed Game`,
                                description: `Full game condensed highlights`,
                                thumbnail: gameVideo.condensedGame.thumbnail?.src || `https://assets.nhle.com/logos/nhl/svg/NHL_light.svg`,
                                duration: gameVideo.condensedGame.duration || '',
                                publishedDate: game.startTimeUTC,
                                videoUrl: `https://www.nhl.com/video/c-${gameVideo.condensedGame.id || game.id}`,
                                gameId: game.id
                            });
                        }
                        if (gameVideo.threeMinRecap) {
                            gameHighlights.push({
                                id: `recap-${game.id}`,
                                title: `${game.awayTeam?.abbrev || 'Away'} @ ${game.homeTeam?.abbrev || 'Home'} - 3 Min Recap`,
                                description: `Three minute game recap`,
                                thumbnail: gameVideo.threeMinRecap.thumbnail?.src || `https://assets.nhle.com/logos/nhl/svg/NHL_light.svg`,
                                duration: '3:00',
                                publishedDate: game.startTimeUTC,
                                videoUrl: `https://www.nhl.com/video/c-${gameVideo.threeMinRecap.id || game.id}`,
                                gameId: game.id
                            });
                        }
                    }

                    // Extract scoring play highlights
                    const scoringPlays = landingData.summary?.scoring || [];
                    scoringPlays.forEach((period: any) => {
                        (period.goals || []).forEach((goal: any, idx: number) => {
                            if (goal.highlightClip) {
                                gameHighlights.push({
                                    id: `goal-${game.id}-${period.periodDescriptor?.number || 0}-${idx}`,
                                    title: `${goal.name?.default || 'Goal'} - ${goal.teamAbbrev?.default || 'Team'}`,
                                    description: `Goal scored at ${goal.timeInPeriod} in period ${period.periodDescriptor?.number || '?'}`,
                                    thumbnail: goal.headshot || `https://assets.nhle.com/logos/nhl/svg/${goal.teamAbbrev?.default || 'NHL'}_light.svg`,
                                    duration: '',
                                    publishedDate: game.startTimeUTC,
                                    videoUrl: `https://www.nhl.com/video/c-${goal.highlightClip}`,
                                    gameId: game.id
                                });
                            }
                        });
                    });

                    return gameHighlights;
                } catch {
                    return [];
                }
            });

            const allHighlights = (await Promise.all(highlightPromises)).flat();

            // If no highlights from API, create fallback highlights linking to NHL.com
            if (allHighlights.length === 0) {
                const fallbackHighlights: VideoHighlight[] = games.map((game: any) => ({
                    id: `game-${game.id}`,
                    title: `${game.awayTeam?.abbrev || 'Away'} @ ${game.homeTeam?.abbrev || 'Home'}`,
                    description: `Game highlights - ${game.awayTeam?.score || 0} - ${game.homeTeam?.score || 0}`,
                    thumbnail: `https://assets.nhle.com/logos/nhl/svg/${game.homeTeam?.abbrev || 'NHL'}_light.svg`,
                    duration: '',
                    publishedDate: game.startTimeUTC,
                    videoUrl: `https://www.nhl.com/gamecenter/${game.id}`,
                    gameId: game.id
                }));
                setHighlights(fallbackHighlights);
            } else {
                setHighlights(allHighlights);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch highlights');
            setHighlights([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHighlights();
    }, [fetchHighlights]);

    const filteredHighlights = highlights.filter(h => {
        if (category === 'all') return true;
        if (category === 'goals') return h.id.includes('goal-') || h.title.toLowerCase().includes('goal');
        if (category === 'saves') return h.title.toLowerCase().includes('save');
        if (category === 'hits') return h.title.toLowerCase().includes('hit');
        return true;
    });

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">NHL Highlights</h2>
                <p className="text-gray-400">
                    Latest game recaps and play highlights from the NHL.
                </p>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${category === cat.id
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading && <LoadingSpinner text="Loading highlights..." />}

            {error && (
                <div className="text-center">
                    <p className="text-red-500 bg-red-900/50 p-4 rounded-lg mb-4">{error}</p>
                    <a
                        href="https://www.nhl.com/video"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Watch on NHL.com
                    </a>
                </div>
            )}

            {/* Selected Video Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="bg-gray-800 rounded-xl max-w-4xl w-full p-4 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold mb-4 pr-8">{selectedVideo.title}</h3>
                        <p className="text-gray-400 mb-4">{selectedVideo.description}</p>
                        <a
                            href={selectedVideo.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>Watch on NHL.com</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Highlights Grid */}
            {!loading && !error && filteredHighlights.length === 0 && (
                <div className="text-center text-gray-400 mt-8 bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-2xl font-bold mb-2">No Highlights Available</h3>
                    <p className="mb-4">Check back later for new highlights or visit NHL.com directly.</p>
                    <a
                        href="https://www.nhl.com/video"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Browse NHL Videos
                    </a>
                </div>
            )}

            {!loading && !error && filteredHighlights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredHighlights.map(highlight => (
                        <div
                            key={highlight.id}
                            onClick={() => setSelectedVideo(highlight)}
                            className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group"
                        >
                            <div className="relative aspect-video bg-gray-900">
                                <img
                                    src={highlight.thumbnail}
                                    alt={highlight.title}
                                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://assets.nhle.com/logos/nhl/svg/NHL_light.svg'; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-red-600 rounded-full p-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                                {highlight.duration && (
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                        {highlight.duration}
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-white mb-1 line-clamp-2">{highlight.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2">{highlight.description}</p>
                                {highlight.publishedDate && (
                                    <p className="text-gray-500 text-xs mt-2">{formatDate(highlight.publishedDate)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* External Link */}
            <div className="mt-8 text-center">
                <a
                    href="https://www.nhl.com/video"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors space-x-1"
                >
                    <span>Browse all videos on NHL.com</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default HighlightsView;