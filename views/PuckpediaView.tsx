import React from 'react';
import EmbeddedView from '../components/EmbeddedView';

const PuckpediaView: React.FC = () => {
    const url = "https://puckpedia.com/";

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Puckpedia</h2>
                <p className="text-gray-400">
                    The ultimate source for NHL salary cap, contracts, and transaction information, provided by <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Puckpedia.com</a>.
                </p>
            </div>
            <EmbeddedView 
                src={url} 
                title="Puckpedia - NHL Salary Cap and Contracts" 
                applyDarkModeFilter={false}
            />
        </div>
    );
};

export default PuckpediaView;