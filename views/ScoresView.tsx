
import React, { useState, useEffect, useCallback } from 'react';
import type { Game } from '../types';
import DateNavigator from '../components/DateNavigator';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import GameDetailsView from './GameDetailsView';

const ScoresView: React.FC = () => {
    const [date, setDate] = useState(new Date());
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

    const handleGameSelect = (gameId: number) => {
        setSelectedGameId(prevId => prevId === gameId ? null : gameId);
    };

    const formatDateForAPI = (d: Date) => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const fetchGames = useCallback(async (isRefresh = false) => {
        if (!isRefresh) {
            setLoading(true);
            setGames([]);
            setSelectedGameId(null);
        }
        setError(null);
        
        const formattedDate = formatDateForAPI(date);
        const apiUrl = `https://api-web.nhle.com/v1/schedule/${formattedDate}`;
        const url = apiUrl;

        try {
            const response = await fetch(url).catch(() => {
                throw new Error('Network error: Could not reach the NHL API.');
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setGames([]);
                    return;
                }
                 throw new Error(`The NHL API returned an error (status: ${response.status}).`);
            }
            
            const data = await response.json().catch(() => {
                throw new Error('Failed to parse schedule data. The API response was invalid.');
            });

            const dayData = data.gameWeek?.find((day: any) => day.date === formattedDate);
            const dailyGames = Array.isArray(dayData?.games) ? dayData.games : [];
            
            setGames(dailyGames);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching games.');
            setGames([]);
        } finally {
            if (!isRefresh) {
                setLoading(false);
            }
        }
    }, [date]);

    useEffect(() => {
        fetchGames(false);
    }, [fetchGames]);
    
    useEffect(() => {
        const hasLiveGames = games.some(game => game.gameState === 'LIVE' || game.gameState === 'CRIT');

        if (hasLiveGames) {
            const intervalId = setInterval(() => {
                fetchGames(true);
            }, 15000);

            return () => clearInterval(intervalId);
        }
    }, [games, fetchGames]);

    return (
        <div>
            <DateNavigator date={date} setDate={setDate} />
            {loading && <LoadingSpinner />}
            {error && <div className="text-center mb-6"><p className="inline-block text-red-500 bg-red-900/20 px-6 py-3 rounded-lg border border-red-500/50">{error}</p></div>}
            {!loading && !error && games.length === 0 && (
                 <div className="text-center text-gray-400 mt-8 bg-gray-800/30 p-12 rounded-xl border border-gray-700/50">
                    <h3 className="text-2xl font-bold mb-2">No Games Scheduled</h3>
                    <p>There are no games scheduled for this date.</p>
                </div>
            )}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {games.map(game => (
                    <React.Fragment key={game.id}>
                        <GameCard 
                            game={game} 
                            onSelect={() => handleGameSelect(game.id)}
                            isSelected={selectedGameId === game.id}
                        />
                         {selectedGameId === game.id && (
                            <div className="lg:col-span-2">
                                <GameDetailsView game={game} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ScoresView;
