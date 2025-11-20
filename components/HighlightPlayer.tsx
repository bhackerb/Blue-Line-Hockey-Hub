import React from 'react';
import type { Game, Highlight } from '../types';

const HighlightCard: React.FC<{ highlight: Highlight }> = ({ highlight }) => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden ring-1 ring-gray-700">
        <div className="aspect-video">
            <video
                key={highlight.videoUrl}
                width="100%"
                height="100%"
                controls
                preload="metadata"
                src={highlight.videoUrl}
                className="w-full h-full bg-black rounded-t-lg"
            >
                Your browser does not support the video tag.
            </video>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-lg">{highlight.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{highlight.description}</p>
        </div>
    </div>
);


const HighlightPlayer: React.FC<{ game: Game; highlights: Highlight[] }> = ({ game, highlights }) => {
    return (
        <div className="space-y-6 bg-gray-800/50 rounded-xl p-4 md:p-6">
            <div className="text-center">
                 <h2 className="text-3xl font-bold mb-2">Goal Highlights</h2>
                 <p className="text-gray-400">{game.awayTeam?.name?.default || 'Away Team'} @ {game.homeTeam?.name?.default || 'Home Team'}</p>
            </div>
            
            {highlights.length === 0 ? (
                <div className="text-center text-gray-400 mt-8 bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-2xl font-bold mb-2">No Goal Highlights Available</h3>
                    <p>There are currently no goal highlights for this game. This can happen for recently concluded games; please check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {highlights.map(h => <HighlightCard key={h.id} highlight={h} />)}
                </div>
            )}
        </div>
    );
};

export default HighlightPlayer;