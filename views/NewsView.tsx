
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const NewsView: React.FC = () => {
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            if (!process.env.API_KEY) {
                setError('API Key is missing. Cannot fetch news.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Find the 6 most recent and important NHL news articles from the last 24 hours. Return a JSON array of objects with the following properties:
- 'title': The headline of the article.
- 'url': The direct link to the article.
- 'description': A concise one-sentence summary of the article.
- 'imageUrl': A relevant image URL from the article (or a generic NHL image if none found).
- 'source': The name of the news outlet.
- 'publishedAt': The publication date/time in ISO format.`;

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
                                    url: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    imageUrl: { type: Type.STRING },
                                    source: { type: Type.STRING },
                                    publishedAt: { type: Type.STRING }
                                },
                                required: ['title', 'url', 'description', 'imageUrl', 'source', 'publishedAt']
                            }
                        }
                    }
                });

                const parsedArticles = JSON.parse(result.text);
                if (Array.isArray(parsedArticles) && parsedArticles.length > 0) {
                    const articlesWithIds = parsedArticles.map((article: any, index: number) => ({
                        ...article,
                        id: article.url || `news-${index}`
                    }));
                    setDisplayedArticles(articlesWithIds);
                } else {
                    setError('No news found at this time.');
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Failed to load news. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div>
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">The Daily Crease</h2>
                <p className="text-gray-400">Fresh headlines across the NHL world.</p>
            </div>
            {loading && <LoadingSpinner text="Scouting news..." />}
            {error && <div className="text-center mb-6"><p className="inline-block text-red-500 bg-red-900/20 px-6 py-3 rounded-lg border border-red-500/50">{error}</p></div>}

            {!loading && !error && displayedArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedArticles.map(article => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsView;
