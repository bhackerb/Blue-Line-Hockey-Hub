
import React, { useState, useEffect } from 'react';
import type { StandingsData, DivisionStandings, TeamRecord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const StandingsTable: React.FC<{division: DivisionStandings}> = ({ division }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-8 ring-1 ring-gray-700/50">
        <h3 className="text-xl font-bold p-4 bg-gray-700/30">{division.divisionName}</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-700/50 text-xs text-gray-300 uppercase tracking-wider">
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
                <tbody>
                    {division.teamRecords.map((team: TeamRecord, index: number) => (
                        <tr key={team.teamName?.default} className={`border-b border-gray-700/50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-transparent'} hover:bg-gray-700/50`}>
                            <td className="px-4 py-2 font-medium text-center">{team.divisionRank}</td>
                            <td className="px-4 py-2 font-semibold">
                                <div className="flex items-center space-x-3">
                                    <img src={`https://assets.nhle.com/logos/nhl/svg/${team.teamAbbrev.default}_light.svg`} alt={`${team.teamName?.default} logo`} className="h-6 w-6 object-contain" />
                                    <span>{team.teamName?.default} {team.clinchIndicator && ` - ${team.clinchIndicator}`}</span>
                                </div>
                            </td>
                            <td className="px-4 py-2 text-center">{team.gamesPlayed}</td>
                            <td className="px-4 py-2 text-center">{team.wins}</td>
                            <td className="px-4 py-2 text-center">{team.losses}</td>
                            <td className="px-4 py-2 text-center">{team.otLosses}</td>
                            <td className="px-4 py-2 font-bold text-center">{team.points}</td>
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
            const originalUrl = 'https://api-web.nhle.com/v1/standings/now';
            const url = `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;

            try {
                const response = await fetch(url).catch(() => {
                     throw new Error('Could not connect to the data proxy. The service may be temporarily unavailable.');
                });

                if (!response.ok) {
                    throw new Error(`The data proxy or NHL API returned an error (status: ${response.status}).`);
                }
                
                const data = await response.json().catch(() => {
                    throw new Error('Failed to parse data from the NHL API. The API may have returned an invalid format.');
                });
                
                const allTeamRecords: any[] = Array.isArray(data.standings) ? data.standings : [];

                // Group teams by conference and then by division from the flat API response
                const groupedData = allTeamRecords.reduce((acc, teamRecord) => {
                    // Defensively check the structure of teamRecord
                    if (!teamRecord || typeof teamRecord !== 'object') {
                        return acc;
                    }

                    const { conferenceName, divisionName, teamName } = teamRecord;

                    // Skip records that aren't in a specific division or are missing essential data
                    if (!conferenceName || !divisionName || !teamName || !teamName.default) {
                        return acc;
                    }

                    if (!acc[conferenceName]) {
                        acc[conferenceName] = {};
                    }
                    if (!acc[conferenceName][divisionName]) {
                        acc[conferenceName][divisionName] = {
                            divisionName: divisionName,
                            conferenceName: conferenceName,
                            teamRecords: [],
                        };
                    }
                    acc[conferenceName][divisionName].teamRecords.push(teamRecord);
                    return acc;
                }, {});
                
                // Convert the nested object into the final structure expected by the component
                const finalStandings: StandingsData = {};
                for (const conferenceName in groupedData) {
                    const divisions = Object.values(groupedData[conferenceName]);
                    
                    // Sort teams within each division by their rank
                    divisions.forEach((division: any) => {
                        division.teamRecords.sort((a: any, b: any) => parseInt(a.divisionRank) - parseInt(b.divisionRank));
                    });

                    // Sort divisions alphabetically (e.g., Atlantic, Central, etc.)
                    divisions.sort((a: any, b: any) => a.divisionName.localeCompare(b.divisionName));

                    finalStandings[conferenceName] = divisions as DivisionStandings[];
                }


                setStandings(finalStandings);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching standings.');
                setStandings(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, []);

    return (
        <div>
            <div className="text-center mb-6">
                 <h2 className="text-3xl font-bold mb-2">NHL League Standings</h2>
                 <p className="text-gray-400">Live standings data from the official NHL API.</p>
            </div>

            {loading && <LoadingSpinner text="Fetching standings..." />}
            {error && <p className="text-center text-red-500 bg-red-900/50 p-4 rounded-lg">{error}</p>}
            
            {/* FIX: Use Object.keys to iterate over standings. This avoids a TypeScript type inference issue with Object.entries on a Record type, which was causing the 'divisions' variable to be typed as 'unknown'. */}
            {standings && Object.keys(standings).sort((a, b) => a.localeCompare(b)).map((conference) => (
                <section key={conference} className="mb-10">
                    <h2 className="text-2xl font-extrabold mb-4 text-center tracking-wide uppercase">{conference} Conference</h2>
                    {standings[conference].map(division => (
                        <StandingsTable key={division.divisionName} division={division} />
                    ))}
                </section>
            ))}
        </div>
    );
};

export default StandingsView;
