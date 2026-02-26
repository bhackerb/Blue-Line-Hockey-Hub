
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Game, BoxscoreData, ScoringPlay, Penalty, TeamGameStat, PlayerByGameStats, PlayerGameStat } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const TeamStatsDisplay: React.FC<{ game: Game; stats: TeamGameStat[] }> = ({ game, stats }) => {
    if (!stats || stats.length === 0) return null;

    const categories: Record<string, string> = {
        sog: 'Shots on Goal',
        faceoffWinningPctg: 'Faceoff %',
        powerPlay: 'Power Play',
        pim: 'PIM',
        hits: 'Hits',
        blockedShots: 'Blocked Shots',
        giveaways: 'Giveaways',
        takeaways: 'Takeaways'
    };

    const displayStats = stats.filter(s => categories[s.category] || s.category);

    return (
        <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Team Stats</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-700/50">
                            <th className="pb-2 text-left w-1/3">{game.awayTeam.name.default}</th>
                            <th className="pb-2 text-center w-1/3">Stat</th>
                            <th className="pb-2 text-right w-1/3">{game.homeTeam.name.default}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                        {displayStats.map((stat, idx) => (
                            <tr key={idx} className="hover:bg-gray-700/20">
                                <td className="py-2 text-left font-medium">{stat.awayValue}</td>
                                <td className="py-2 text-center text-gray-400">{categories[stat.category] || stat.category}</td>
                                <td className="py-2 text-right font-medium">{stat.homeValue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PlayerStatsTable: React.FC<{ players: PlayerGameStat[]; type: 'skaters' | 'goalies' }> = ({ players, type }) => {
    const sortedPlayers = [...(players || [])].sort((a, b) => {
        if (type === 'skaters') {
            if (b.points !== a.points) return b.points - a.points;
            return b.goals - a.goals;
        } else {
            return (b.saves || 0) - (a.saves || 0);
        }
    });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm text-left whitespace-nowrap">
                <thead>
                    <tr className="bg-gray-700/40 text-gray-300">
                        <th className="p-2 text-center">#</th>
                        <th className="p-2">Name</th>
                        {type === 'skaters' ? (
                            <>
                                <th className="p-2 text-center">Pos</th>
                                <th className="p-2 text-center font-bold text-white">G</th>
                                <th className="p-2 text-center font-bold text-white">A</th>
                                <th className="p-2 text-center font-bold text-white">P</th>
                                <th className="p-2 text-center">+/-</th>
                                <th className="p-2 text-center">SOG</th>
                                <th className="p-2 text-center">HIT</th>
                                <th className="p-2 text-center">BLK</th>
                                <th className="p-2 text-center">PIM</th>
                                <th className="p-2 text-center">TOI</th>
                            </>
                        ) : (
                            <>
                                <th className="p-2 text-center">SA</th>
                                <th className="p-2 text-center font-bold text-white">S</th>
                                <th className="p-2 text-center">GA</th>
                                <th className="p-2 text-center">SV%</th>
                                <th className="p-2 text-center">PIM</th>
                                <th className="p-2 text-center">TOI</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                    {sortedPlayers.map((p) => (
                        <tr key={p.playerId} className="hover:bg-gray-700/20">
                            <td className="p-2 text-gray-400 text-center w-8">{p.sweaterNumber}</td>
                            <td className="p-2 font-medium">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={p.headshot}
                                        alt={p.name.default}
                                        className="w-8 h-8 rounded-full bg-gray-800 object-cover border border-gray-700/50"
                                        loading="lazy"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://assets.nhle.com/logos/nhl/svg/NHL_light.svg'; }}
                                    />
                                    <span>{p.name.default}</span>
                                </div>
                            </td>
                            {type === 'skaters' ? (
                                <>
                                    <td className="p-2 text-center text-gray-400">{p.positionCode}</td>
                                    <td className={`p-2 text-center ${p.goals > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{p.goals}</td>
                                    <td className={`p-2 text-center ${p.assists > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{p.assists}</td>
                                    <td className={`p-2 text-center ${p.points > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{p.points}</td>
                                    <td className={`p-2 text-center ${p.plusMinus > 0 ? 'text-green-400' : p.plusMinus < 0 ? 'text-red-400' : 'text-gray-500'}`}>{p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}</td>
                                    <td className="p-2 text-center text-gray-400">{p.shots}</td>
                                    <td className="p-2 text-center text-gray-400">{p.hits}</td>
                                    <td className="p-2 text-center text-gray-400">{p.blockedShots}</td>
                                    <td className="p-2 text-center text-gray-400">{p.pim}</td>
                                    <td className="p-2 text-center text-gray-400">{p.toi}</td>
                                </>
                            ) : (
                                <>
                                    <td className="p-2 text-center text-gray-400">{p.shotsAgainst}</td>
                                    <td className="p-2 text-center font-bold text-white">{p.saves}</td>
                                    <td className="p-2 text-center text-gray-400">{p.goalsAgainst}</td>
                                    <td className="p-2 text-center text-gray-400">{p.savePctg}</td>
                                    <td className="p-2 text-center text-gray-400">{p.pim}</td>
                                    <td className="p-2 text-center text-gray-400">{p.toi}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ScoringPlaysDisplay: React.FC<{ plays: ScoringPlay[], game: Game }> = ({ plays, game }) => {
    if (!plays || !Array.isArray(plays) || plays.length === 0) {
        return (
            <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Scoring Summary</h3>
                <p className="text-gray-400 text-center">No goals scored.</p>
            </div>
        );
    }

    const playsByPeriod = plays.reduce((acc, play) => {
        const period = play.period;
        if (!acc[period]) {
            acc[period] = [];
        }
        acc[period].push(play);
        return acc;
    }, {} as Record<number, ScoringPlay[]>);

    const periods = Object.keys(playsByPeriod).map(Number).filter(p => !isNaN(p)).sort((a, b) => a - b);

    const getPeriodName = (period: number) => {
        switch (period) {
            case 1: return '1st Period';
            case 2: return '2nd Period';
            case 3: return '3rd Period';
            case 4: return 'Overtime';
            case 5: return 'Shootout';
            default: return `Period ${period}`;
        }
    };

    return (
        <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Scoring Summary</h3>
            <div className="space-y-6">
                {periods.map(period => (
                    <div key={period}>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 pl-2 border-l-4 border-blue-500">
                            {getPeriodName(period)}
                        </h4>
                        <div className="space-y-3">
                            {(playsByPeriod[period] || []).map((play, index) => (
                                <div key={`${period}-${index}`} className="flex items-center bg-gray-700/30 p-3 rounded-lg border border-gray-700/50">
                                    <div className="flex flex-col items-center justify-center w-20 border-r border-gray-600 pr-3 mr-3">
                                        <span className="text-xl font-bold text-white">{play.timeInPeriod}</span>
                                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                            {play.awayScore !== undefined && play.homeScore !== undefined
                                                ? `${game.awayTeam.abbrev} ${play.awayScore} - ${game.homeTeam.abbrev} ${play.homeScore}`
                                                : ''}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <img
                                                src={`https://assets.nhle.com/logos/nhl/svg/${play.teamAbbrev.default}_light.svg`}
                                                alt={play.teamAbbrev.default}
                                                className="h-6 w-6 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://assets.nhle.com/logos/nhl/svg/NHL_light.svg'; }}
                                            />
                                            <span className="font-bold text-white">{play.goalScorer.name.default}</span>
                                            {play.strength && play.strength.toLowerCase() !== 'ev' && (
                                                <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">{play.strength}</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {play.goalScorer.assists && Array.isArray(play.goalScorer.assists) && play.goalScorer.assists.length > 0 ? (
                                                <span>Assists: {play.goalScorer.assists.map(a => a.name.default).join(', ')}</span>
                                            ) : (
                                                <span>Unassisted</span>
                                            )}
                                        </div>
                                    </div>
                                    {play.highlightClip && (
                                        <a
                                            href={`https://www.nhl.com/video/c-${play.highlightClip}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// FIX: Added the missing PlayerStatsDisplay component.
const PlayerStatsDisplay: React.FC<{ game: Game; stats: PlayerByGameStats }> = ({ game, stats }) => {
    const [activeTeam, setActiveTeam] = useState<'away' | 'home'>('away');

    const currentTeamStats = activeTeam === 'away' ? stats.awayTeam : stats.homeTeam;

    return (
        <div className="bg-gray-800/40 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Player Stats</h3>

            <div className="flex mb-4 bg-gray-700/30 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTeam('away')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${activeTeam === 'away' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    {game.awayTeam.abbrev}
                </button>
                <button
                    onClick={() => setActiveTeam('home')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${activeTeam === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    {game.homeTeam.abbrev}
                </button>
            </div>

            <div className="space-y-8">
                <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 pl-2 border-l-4 border-blue-500">Skaters</h4>
                    <PlayerStatsTable
                        players={[
                            ...(currentTeamStats.forwards || []),
                            ...(currentTeamStats.defense || [])
                        ]}
                        type="skaters"
                    />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 pl-2 border-l-4 border-blue-500">Goalies</h4>
                    <PlayerStatsTable
                        players={currentTeamStats.goalies || []}
                        type="goalies"
                    />
                </div>
            </div>
        </div>
    );
};

const GameDetailsView: React.FC<{ game: Game }> = ({ game }) => {
    const [boxscore, setBoxscore] = useState<BoxscoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiQuickSummary, setAiQuickSummary] = useState('');
    const [loadingAiQuickSummary, setLoadingAiQuickSummary] = useState(false);
    const [aiQuickError, setAiQuickError] = useState<string | null>(null);
    const [highlightVideoId, setHighlightVideoId] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetails = async () => {
            setLoading(true);
            setError(null);
            setBoxscore(null);
            setAiQuickSummary('');
            setAiQuickError(null);
            setHighlightVideoId(null);

            try {
                const apiUrl = `https://corsproxy.io/?https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`;
                const url = apiUrl;
                const landingResponse = await fetch(url);
                if (!landingResponse.ok) throw new Error(`Failed to fetch game data (status: ${landingResponse.status}).`);
                const landingData = await landingResponse.json();

                const scoringPlays: ScoringPlay[] = (Array.isArray(landingData.summary?.scoring) ? landingData.summary.scoring : []).flatMap((periodScoring: any) => {
                    const periodNum = periodScoring.periodDescriptor?.number ?? periodScoring.period ?? 0;
                    return (Array.isArray(periodScoring.goals) ? periodScoring.goals : []).map((goal: any): ScoringPlay => ({
                        period: periodNum,
                        timeInPeriod: goal.timeInPeriod,
                        goalScorer: {
                            name: goal.name,
                            assists: Array.isArray(goal.assists) ? goal.assists : [],
                        },
                        teamAbbrev: goal.teamAbbrev,
                        strength: goal.strength,
                        situationCode: goal.situationCode,
                        highlightClip: goal.highlightClip,
                        video: goal.video,
                        awayScore: goal.awayScore,
                        homeScore: goal.homeScore
                    }));
                });

                const penalties: Penalty[] = (Array.isArray(landingData.summary?.penaltiesByPeriod) ? landingData.summary.penaltiesByPeriod : []).flatMap((periodPenalties: any) => {
                    const periodNum = periodPenalties.periodDescriptor?.number ?? periodPenalties.period ?? 0;
                    return (Array.isArray(periodPenalties.penalties) ? periodPenalties.penalties : []).map((penalty: any): Penalty => ({
                        period: periodNum,
                        timeInPeriod: penalty.timeInPeriod,
                        type: penalty.desc,
                        duration: penalty.duration,
                        committedByPlayer: penalty.name,
                        teamAbbrev: penalty.teamAbbrev,
                    }));
                });

                const mapPlayer = (p: any): PlayerGameStat => ({
                    playerId: p.playerId,
                    name: p.name,
                    headshot: p.headshot || `https://assets.nhle.com/mugs/nhl/latest/${p.playerId}.png`,
                    sweaterNumber: p.sweaterNumber,
                    positionCode: p.positionCode || p.position,
                    goals: p.goals || 0,
                    assists: p.assists || 0,
                    points: p.points || 0,
                    plusMinus: p.plusMinus || 0,
                    toi: p.toi || '0:00',
                    shots: p.sog || 0,
                    hits: p.hits || 0,
                    blockedShots: p.blockedShots || 0,
                    pim: p.pim || 0,
                    saves: p.saves,
                    shotsAgainst: p.shotsAgainst,
                    goalsAgainst: p.goalsAgainst,
                    savePctg: p.savePctg,
                });

                const rawPlayers = landingData.boxscore?.playerByGameStats;
                const playerByGameStats: PlayerByGameStats | undefined = rawPlayers ? {
                    awayTeam: {
                        forwards: Array.isArray(rawPlayers.awayTeam?.forwards) ? rawPlayers.awayTeam.forwards.map(mapPlayer) : [],
                        defense: Array.isArray(rawPlayers.awayTeam?.defense) ? rawPlayers.awayTeam.defense.map(mapPlayer) : [],
                        goalies: Array.isArray(rawPlayers.awayTeam?.goalies) ? rawPlayers.awayTeam.goalies.map(mapPlayer) : [],
                    },
                    homeTeam: {
                        forwards: Array.isArray(rawPlayers.homeTeam?.forwards) ? rawPlayers.homeTeam.forwards.map(mapPlayer) : [],
                        defense: Array.isArray(rawPlayers.homeTeam?.defense) ? rawPlayers.homeTeam.defense.map(mapPlayer) : [],
                        goalies: Array.isArray(rawPlayers.homeTeam?.goalies) ? rawPlayers.homeTeam.goalies.map(mapPlayer) : [],
                    }
                } : undefined;

                const transformedBoxscore: BoxscoreData = {
                    summary: {
                        scoring: scoringPlays,
                        penalties: penalties,
                    },
                    teamGameStats: Array.isArray(landingData.boxscore?.teamGameStats) ? landingData.boxscore.teamGameStats : [],
                    playerByGameStats: playerByGameStats,
                    rosterSpots: Array.isArray(landingData.rosterSpots) ? landingData.rosterSpots : [],
                };
                setBoxscore(transformedBoxscore);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchGameDetails();
    }, [game.id]);

    const generateAiQuickSummary = useCallback(async () => {
        if (!boxscore || !process.env.API_KEY) return;
        setLoadingAiQuickSummary(true);
        setAiQuickError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const scoringSummary = (boxscore.summary.scoring || []).map(p =>
                `P${p.period} ${p.timeInPeriod}: ${p.goalScorer.name.default} (${p.teamAbbrev.default})`
            ).join('\n');

            // Get summary
            const prompt = `Summarize: ${game.awayTeam.name.default} ${game.awayTeam.score} @ ${game.homeTeam.name.default} ${game.homeTeam.score}. Plays:\n${scoringSummary}\nGive 3 short bullet points.`;
            const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiQuickSummary(result.text);

            // Get highlight video
            if (game.gameState === 'FINAL' || game.gameState === 'OFF') {
                const videoPrompt = `Find the official NHL YouTube highlight video for the game between ${game.awayTeam.name.default} and ${game.homeTeam.name.default} on ${game.startTimeUTC}. Return a JSON object with a single property 'videoId' containing the YouTube video ID. If not found, return null for videoId.`;
                const videoResult = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: videoPrompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: { videoId: { type: Type.STRING, nullable: true } }
                        }
                    }
                });
                const parsedVideo = JSON.parse(videoResult.text);
                if (parsedVideo && parsedVideo.videoId) {
                    setHighlightVideoId(parsedVideo.videoId);
                }
            }
        } catch (e: any) {
            setAiQuickError('Summary generation failed.');
        } finally {
            setLoadingAiQuickSummary(false);
        }
    }, [boxscore, game]);

    useEffect(() => {
        if (boxscore && !aiQuickSummary && !loadingAiQuickSummary && !aiQuickError) {
            generateAiQuickSummary();
        }
    }, [boxscore, generateAiQuickSummary, aiQuickSummary, loadingAiQuickSummary, aiQuickError]);

    return (
        <div id={`game-details-${game.id}`} className="bg-gray-900/50 backdrop-blur-md rounded-b-xl -mt-2 p-4 md:p-6 ring-1 ring-blue-500/80 shadow-2xl animate-fade-in-down">
            {loading && <LoadingSpinner text="Loading game details..." />}
            {error && <p className="text-center text-red-500 bg-red-900/50 p-4 rounded-lg">{error}</p>}

            {!loading && !error && boxscore && (
                <div className="space-y-6">
                    {highlightVideoId && (
                        <div className="bg-gray-800/40 rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-700/50">
                            <div className="relative pt-[56.25%]">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${highlightVideoId}`}
                                    title="Game Highlights"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                    <AiQuickSummary summary={aiQuickSummary} loading={loadingAiQuickSummary} error={aiQuickError} />
                    <ScoringPlaysDisplay plays={boxscore.summary.scoring} game={game} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                            {boxscore.teamGameStats && <TeamStatsDisplay game={game} stats={boxscore.teamGameStats} />}
                        </div>
                        <div className="lg:col-span-2">
                            {boxscore.playerByGameStats && <PlayerStatsDisplay game={game} stats={boxscore.playerByGameStats} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AiQuickSummary: React.FC<{ summary: string; loading: boolean; error: string | null; }> = ({ summary, loading, error }) => {
    if (loading) return <div className="bg-gray-800/40 rounded-lg p-6 flex justify-center"><LoadingSpinner text="Analyzing..." /></div>;
    if (error || !summary) return null;
    return (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-center mb-4 text-blue-400">Game Insights</h3>
            <ul className="list-disc list-inside text-gray-300 text-left space-y-2">
                {summary.split('\n').map(item => item.trim()).filter(item => item).map((item, index) => (
                    <li key={index}>{item.replace(/^\s*[\*-]\s*/, '')}</li>
                ))}
            </ul>
        </div>
    );
};

export default GameDetailsView;
