import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import LoadingSpinner from '../components/LoadingSpinner';

interface HighlightVideo {
    title: string;
    videoId: string;
}

const HighlightsView: React.FC = () => {
    const [videos, setVideos] = useState<HighlightVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHighlights = async () => {
            if (!process.env.API_KEY) {
                setError('API Key is missing. Cannot fetch highlights.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Find the 6 most recent official NHL game highlight videos on YouTube from the last 24 hours. Return a JSON array of objects with 'title' and 'videoId'.`;

                const result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    videoId: { type: Type.STRING }
                                },
                                required: ['title', 'videoId']
                            }
                        }
                    }
                });

                const parsedVideos = JSON.parse(result.text);
                if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
                    setVideos(parsedVideos);
                } else {
                    setError('No highlights found at this time.');
                }
            } catch (err) {
                console.error('Error fetching highlights:', err);
                setError('Failed to load highlights. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchHighlights();
    }, []);

    return (
        <div className="pt-6">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Latest Highlights</h2>
                <p className="text-gray-400">Catch up on the best action from around the league.</p>
            </div>

            {loading && <LoadingSpinner text="Scouting highlights..." />}

            {error && (
                <div className="text-center mb-6">
                    <p className="inline-block text-red-500 bg-red-900/20 px-6 py-3 rounded-lg border border-red-500/50">{error}</p>
                </div>
            )}

            {!loading && !error && videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-700/50 transition-transform hover:scale-[1.02]">
                            <div className="relative pt-[56.25%]">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${video.videoId}`}
                                    title={video.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg line-clamp-2 text-white">{video.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HighlightsView;