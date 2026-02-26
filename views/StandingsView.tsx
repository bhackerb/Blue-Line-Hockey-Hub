
import React, { useState, useEffect } from 'react';
import type { StandingsData, DivisionStandings, TeamRecord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const StandingsTable: React.FC<{ division: DivisionStandings }> = ({ division }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden mb-8 ring-1 ring-gray-700/50">
        <h3 className="text-xl font-bold p-4 bg-gray-700/30 border-b border-gray-700/50">{division.divisionName}</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-widest">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-center">#</th>
                        <th scope="col" className="px-4 py-3">Team</th>
                        <th scope="col" className="px-4 py-3 text-center">GP</th>
                        <th scope="col" className="px-4 py-3 text-center">W</th>
                        <th scope="col" className="px-4 py-3 text-center">L</th>
                        <th scope="col" className="px-4 py-3 text-center">OT</th>
                        <th scope="col" className="px-4 py-3 text-center">PTS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                    {division.teamRecords.map((team: TeamRecord, index: number) => (
                        <tr key={team.teamAbbrev.default} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-800/10' : 'bg-transparent'} hover:bg-gray-700/40`}>
                            <td className="px-4 py-4 text-center text-gray-400 font-medium">{team.divisionRank}</td>
                            <td className="px-4 py-4">
                                <div className="flex items-center space-x-3">
                                    <img src={`https://assets.nhle.com/logos/nhl/svg/${team.teamAbbrev.default}_light.svg`} alt={team.teamAbbrev.default} className="h-6 w-6 object-contain" />
                                    <span className="font-bold">{team.teamName?.default} {team.clinchIndicator && <span className="text-[10px] ml-1 px-1 bg-green-900/50 text-green-400 rounded ring-1 ring-green-500/30">{team.clinchIndicator}</span>}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-center">{team.gamesPlayed}</td>
                            <td className="px-4 py-4 text-center">{team.wins}</td>
                            <td className="px-4 py-4 text-center">{team.losses}</td>
                            <td className="px-4 py-4 text-center">{team.otLosses}</td>
                            <td className="px-4 py-4 font-black text-center text-blue-400">{team.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const StandingsView: React.FC = () => {
    const [standings, setStandings] = useState<StandingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandings = async () => {
            setLoading(true);
            setError(null);
            const apiUrl = 'https://corsproxy.io/?https://api-web.nhle.com/v1/standings/now';
            const url = apiUrl;

            try {
                const response = await fetch(url).catch(() => { throw new Error('Network connection failed.'); });
                if (!response.ok) throw new Error(`HTTP ${response.status}: API error`);
                const data = await response.json();
                const allTeamRecords: any[] = Array.isArray(data.standings) ? data.standings : [];

                const groupedData = allTeamRecords.reduce((acc, teamRecord) => {
                    const { conferenceName, divisionName } = teamRecord;
                    if (!conferenceName || !divisionName) return acc;
                    if (!acc[conferenceName]) acc[conferenceName] = {};
                    if (!acc[conferenceName][divisionName]) {
                        acc[conferenceName][divisionName] = { divisionName, conferenceName, teamRecords: [] };
                    }
                    acc[conferenceName][divisionName].teamRecords.push(teamRecord);
                    return acc;
                }, {});

                const finalStandings: StandingsData = {};
                for (const conferenceName in groupedData) {
                    const divisions = Object.values(groupedData[conferenceName]);
                    divisions.forEach((div: any) => div.teamRecords.sort((a: any, b: any) => parseInt(a.divisionRank) - parseInt(b.divisionRank)));
                    divisions.sort((a: any, b: any) => a.divisionName.localeCompare(b.divisionName));
                    finalStandings[conferenceName] = divisions as DivisionStandings[];
                }
                setStandings(finalStandings);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Standings unavailable.');
            } finally {
                setLoading(false);
            }
        };
        fetchStandings();
    }, []);

    return (
        <div>
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black mb-3">League Standings</h2>
                <p className="text-gray-400">Battle for the Stanley Cup Playoff seeding.</p>
            </div>
            {loading && <LoadingSpinner text="Crunching numbers..." />}
            {error && <div className="text-center"><p className="inline-block text-red-500 bg-red-900/20 px-6 py-3 rounded-lg border border-red-500/50">{error}</p></div>}

            {standings && Object.keys(standings).sort().map((conf) => (
                <section key={conf} className="mb-12">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700"></span>
                        <span className="uppercase tracking-widest text-indigo-400">{conf} Conference</span>
                        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700"></span>
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {standings[conf].map(division => (
                            <StandingsTable key={division.divisionName} division={division} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default StandingsView;
