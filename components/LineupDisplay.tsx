
import React from 'react';
import type { Game, LineupData, Player, TeamLineup } from '../types';

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
    <div className="flex items-center space-x-3 bg-gray-700/50 p-2 rounded-md">
        <img src={player.headshot} alt={`${player.firstName?.default || ''} ${player.lastName?.default || ''}`} className="h-12 w-12 rounded-full bg-gray-600 object-cover" />
        <div>
            <p className="font-bold">{player.firstName?.default} {player.lastName?.default}</p>
            <p className="text-sm text-gray-400">#{player.sweaterNumber} | {player.positionCode}</p>
        </div>
    </div>
);

const TeamLineupDisplay: React.FC<{ team: TeamLineup, teamName?: string }> = ({ team, teamName }) => (
    <div className="space-y-6">
        <h4 className="text-xl font-bold text-center">{teamName || 'N/A'}</h4>
        <div>
            <h5 className="font-bold text-lg mb-3 text-gray-300 border-b-2 border-gray-600 pb-2">Forwards</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {team.forwards.map(player => <PlayerCard key={player.id} player={player} />)}
            </div>
        </div>
         <div>
            <h5 className="font-bold text-lg mb-3 text-gray-300 border-b-2 border-gray-600 pb-2">Defense</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {team.defense.map(player => <PlayerCard key={player.id} player={player} />)}
            </div>
        </div>
    </div>
);

const LineupDisplay: React.FC<{ game: Game; data: LineupData }> = ({ game, data }) => {
    const awayStartingGoalie = data.awayTeam.goalies[0];
    const homeStartingGoalie = data.homeTeam.goalies[0];

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 ring-1 ring-blue-500/50">
            <h2 className="text-2xl font-bold text-center mb-6">Lineups: {game.awayTeam?.name?.default} @ {game.homeTeam?.name?.default}</h2>
            
            <section className="mb-8">
                <h3 className="text-xl font-bold text-center mb-4">Starting Goalies</h3>
                <div className="flex flex-col md:flex-row justify-around items-center gap-6">
                    {awayStartingGoalie ? (
                        <div className="flex flex-col items-center text-center">
                            <img src={awayStartingGoalie.headshot} alt={awayStartingGoalie.lastName?.default} className="h-24 w-24 rounded-full border-2 border-gray-600 mb-2" />
                            <p className="font-bold">{awayStartingGoalie.firstName?.default} {awayStartingGoalie.lastName?.default}</p>
                            <p className="text-sm text-gray-400">{game.awayTeam?.name?.default}</p>
                        </div>
                    ) : <p>Not Announced</p>}

                     <div className="text-gray-500 text-2xl font-bold">VS</div>

                    {homeStartingGoalie ? (
                         <div className="flex flex-col items-center text-center">
                            <img src={homeStartingGoalie.headshot} alt={homeStartingGoalie.lastName?.default} className="h-24 w-24 rounded-full border-2 border-gray-600 mb-2" />
                            <p className="font-bold">{homeStartingGoalie.firstName?.default} {homeStartingGoalie.lastName?.default}</p>
                            <p className="text-sm text-gray-400">{game.homeTeam?.name?.default}</p>
                        </div>
                    ) : <p>Not Announced</p>}
                </div>
            </section>

            <hr className="border-gray-700 my-6"/>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TeamLineupDisplay team={data.awayTeam} teamName={game.awayTeam?.name?.default} />
                <TeamLineupDisplay team={data.homeTeam} teamName={game.homeTeam?.name?.default} />
            </section>
        </div>
    );
};

export default LineupDisplay;