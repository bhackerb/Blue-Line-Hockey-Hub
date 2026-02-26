import React from 'react';
import EmbeddedView from '../components/EmbeddedView';

const LineupsView: React.FC = () => {
    const url = "https://www.dailyfaceoff.com/starting-goalies";

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Starting Goalies</h2>
                <p className="text-gray-400">
                    Data provided by <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">DailyFaceoff.com</a>.
                </p>
            </div>
            <EmbeddedView src={url} title="Daily Faceoff - Starting Goalies" />
        </div>
    );
};

export default LineupsView;