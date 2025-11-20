import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import type { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ARTICLES_PER_PAGE = 6;

// Define a type for the raw, unenriched articles from the RSS feed
type RawArticle = {
    title: string;
    link: string;
    pubDate: string;
    source: string;
};

const NewsView: React.FC = () => {
    const [allRawArticles, setAllRawArticles] = useState<RawArticle[]>([]);
    const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const enrichArticles = useCallback(async (articlesToEnrich: RawArticle[]): Promise<Article[]> => {
        if (articlesToEnrich.length === 0) return [];
        
        if (!process.env.API_KEY) {
            throw new Error("API key is not configured. Cannot enrich news articles.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
        You are an expert NHL news editor. For each of the following articles, provide a concise one-sentence summary and a direct URL to a high-quality, relevant image.

        **Image Rules:**
        1. First, try to find a direct URL to a high-quality, relevant image for the article (.jpg, .png, .webp).
        2. If a specific article image cannot be found, analyze the text for a specific NHL team. If a team is the main subject, use that team's logo URL in the format: \`https://assets.nhle.com/logos/nhl/svg/TEAM_ABBREVIATION_light.svg\`.
        3. If no specific article image or team logo can be found, use the default NHL league logo URL: \`https://assets.nhle.com/logos/nhl/svg/NHL_light.svg\`.
        4. The "imageUrl" field must never be empty or null.

        Article list:
        ${JSON.stringify(articlesToEnrich.map(a => ({ title: a.title, source: a.source })), null, 2)}

        Return ONLY a JSON array of objects, where each object corresponds to an article and contains "summary" and "imageUrl" keys.
        `;

        try {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                imageUrl: { type: Type.STRING }
                            },
                             required: ['summary', 'imageUrl']
                        }
                    }
                }
            });
            
            const enrichedData = JSON.parse(result.text);

            return articlesToEnrich.map((rawArticle, index) => ({
                id: rawArticle.link,
                url: rawArticle.link,
                title: rawArticle.title,
                description: enrichedData[index]?.summary || '',
                imageUrl: enrichedData[index]?.imageUrl || `https://assets.nhle.com/logos/nhl/svg/NHL_light.svg`,
                publishedAt: rawArticle.pubDate,
                source: rawArticle.source,
            }));
        } catch(e: any) {
            // Check for specific API error messages
            if (e.message?.includes('429')) {
                throw new Error('You exceeded your current quota for the Gemini API. Please check your plan and billing details.');
            }
             if (e.message?.includes('API key not valid')) {
                throw new Error('The Gemini API key is not valid. Please check your configuration.');
            }
            throw new Error('The AI news model failed to return a valid response.');
        }

    }, []);

    const fetchInitialNews = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const rssUrl = 'https://news.google.com/rss/search?q=nhl&hl=en-US&gl=US&ceid=US:en';
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
            
            const response = await fetch(proxyUrl).catch(() => {
                throw new Error('Could not connect to the news proxy. The service may be temporarily unavailable.');
            });
            
            if (!response.ok) {
                throw new Error(`The news proxy returned an error (status: ${response.status}).`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const items = Array.from(xmlDoc.querySelectorAll("item"));

            const rawArticles: RawArticle[] = items.map(item => ({
                title: item.querySelector("title")?.textContent || '',
                link: item.querySelector("link")?.textContent || '',
                pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                source: item.querySelector("source")?.textContent || 'Google News',
            }));

            const allowedSourceIdentifiers = ['nhl.com', 'the athletic', 'new york times', 'espn', 'tsn', 'sportsnet', 'the hockey news'];
            const filteredRawArticles = rawArticles.filter(article => {
                const sourceLower = article.source.toLowerCase();
                return allowedSourceIdentifiers.some(identifier => sourceLower.includes(identifier));
            });

            if (filteredRawArticles.length === 0) {
                 setDisplayedArticles([]);
                 setAllRawArticles([]);
                 setHasMore(false);
                 return;
            }

            setAllRawArticles(filteredRawArticles);
            setHasMore(filteredRawArticles.length > ARTICLES_PER_PAGE);

            const initialArticlesToEnrich = filteredRawArticles.slice(0, ARTICLES_PER_PAGE);
            const finalArticles = await enrichArticles(initialArticlesToEnrich);
            setDisplayedArticles(finalArticles);
            setCurrentPage(0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching news.');
            setDisplayedArticles([]);
        } finally {
            setLoading(false);
        }
    }, [enrichArticles]);

    useEffect(() => {
        fetchInitialNews();
    }, [fetchInitialNews]);
    
    const handleLoadMore = async () => {
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        const start = nextPage * ARTICLES_PER_PAGE;
        const end = start + ARTICLES_PER_PAGE;
        
        try {
            const articlesToEnrich = allRawArticles.slice(start, end);
            const newArticles = await enrichArticles(articlesToEnrich);
            
            setDisplayedArticles(prev => [...prev, ...newArticles]);
            setCurrentPage(nextPage);
            setHasMore(allRawArticles.length > end);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load more articles.');
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                 <h2 className="text-3xl font-bold mb-2">Latest NHL News</h2>
                 <p className="text-gray-400">Top headlines sourced from Google News and enriched by AI.</p>
            </div>
            {loading && <LoadingSpinner text="Fetching latest headlines..." />}
            {error && <p className="text-center text-red-500 bg-red-900/50 p-4 rounded-lg">{error}</p>}
            
            {!loading && !error && displayedArticles.length === 0 && (
                <div className="text-center text-gray-400 mt-8 bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-2xl font-bold mb-2">No Articles Found</h3>
                    <p>No recent articles were found from the curated list of sources.</p>
                </div>
            )}
            
            {!loading && !error && displayedArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedArticles.map(article => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}

            {!loading && !error && hasMore && (
                 <div className="flex justify-center mt-8">
                    <button 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                    >
                        {loadingMore ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsView;