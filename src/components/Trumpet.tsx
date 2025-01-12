'use client';

import { useEffect, useState } from 'react';

const Trumpet = () => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const FLASK_SERVER_BASE = process.env.NEXT_PUBLIC_FLASK_SERVER_BASE || 'http://localhost:5005';

    async function fetchForecastAnalysis() {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${FLASK_SERVER_BASE}/api/forecast-analysis`);

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || 'Failed to fetch forecast analysis.');
            }

            const data = await response.json();
            setExplanation(data.explanation);
        } catch (err: any) {
            console.error('Error fetching forecast analysis:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchForecastAnalysis();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900">Market Forecast Explanation</h1>
            </div>

            {loading && <div className="text-blue-700 text-xl">Fetching forecast explanation...</div>}

            {error && (
                <div className="text-red-600 text-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {explanation && !loading && !error && (
                <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
                    <div className="text-gray-700 leading-relaxed">{explanation}</div>
                </div>
            )}
        </div>
    );
};

export default Trumpet;
