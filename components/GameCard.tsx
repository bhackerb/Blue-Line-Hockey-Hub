import React from 'react';
import type { Game, Team } from '../types';

interface GameCardProps {
  game: Game;
  onSelect: () => void;
  isSelected: boolean;
}

const TeamDisplay: React.FC<{ team: Team }> = ({ team }) => {
    const logoUrl = team?.abbrev ? `https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_light.svg` : '';
    return (
        <div className="flex flex-col items-center text-center w-1/3 space-y-2 px-1">
            <img src={logoUrl} alt={team?.name?.default || team?.placeName?.default || 'Team logo'} className="h-16 w-16 md:h-24 md:w-24 object-contain" />
            <span className="font-bold text-base md:text-lg leading-tight">{team?.name?.default || team?.placeName?.default || 'N/A'}</span>
        </div>
    );
};


const GameStatus: React.FC<{ game: Game }> = ({ game }) => {
    let statusText = '';
    let subText = '';

    switch(game.gameState) {
        case 'OFF':
        case 'FINAL':
             statusText = 'Final';
             break;
        case 'LIVE':
        case 'CRIT':
            return (
                <div className="text-center">
                    <div className="text-xl md:text-2xl font-black text-red-400 flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        Live
                    </div>
                </div>
            );
        case 'FUT':
        case 'PRE':
            statusText = new Date(game.startTimeUTC).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
            subText = game.venue?.default || '';
            break;
        default:
            statusText = game.gameState;
    }

  return (
    <div className="text-center">
        <div className="text-xl md:text-2xl font-black text-blue-300">{statusText}</div>
        {subText && <div className="text-xs text-gray-400 truncate">{subText}</div>}
    </div>
  );
};


const GameCard: React.FC<GameCardProps> = ({ game, onSelect, isSelected }) => {
  const cardClasses = `
    w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 flex items-center justify-between text-white
    ring-1 transition-all duration-300 hover:bg-gray-700/60 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
    ${isSelected ? 'ring-blue-500' : 'ring-gray-700/50 hover:ring-blue-500/50'}
  `;

  return (
    <button onClick={onSelect} className={cardClasses} aria-expanded={isSelected} aria-controls={`game-details-${game.id}`}>
      <TeamDisplay team={game.awayTeam} />
      <div className="flex flex-col items-center space-y-1 w-1/3">
        { (game.gameState === 'OFF' || game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'FINAL') ? (
            <div className="flex items-center justify-center space-x-2 md:space-x-4">
                <span className="text-4xl md:text-5xl font-black">{game.awayTeam?.score}</span>
                <span className="text-gray-500 text-2xl font-light">-</span>
                <span className="text-4xl md:text-5xl font-black">{game.homeTeam?.score}</span>
            </div>
        ) : (
            <div className="text-gray-500 text-2xl font-bold">vs</div>
        )}
        <GameStatus game={game} />
      </div>
      <TeamDisplay team={game.homeTeam} />
    </button>
  );
};

export default GameCard;