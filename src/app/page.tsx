'use client';

import Trumpet from '@/components/Trumpet';
import { useEffect, useState } from 'react';

interface ForecastResponse {
    model_prediction: number;
    model_probability?: number;
    latest_features: Record<string, any>;
    error?: string;
    details?: string;
}

export default function InvestmentForecastPage() {
    const [forecast, setForecast] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const FLASK_SERVER_BASE = process.env.NEXT_PUBLIC_FLASK_SERVER_BASE || 'http://localhost:5005';

    async function fetchForecast() {
        try {
            setError(null);
            setLoading(true);
            const res = await fetch(`${FLASK_SERVER_BASE}/api/forecast`);
            if (!res.ok) {
                const errRes = await res.json();
                throw new Error(errRes.error || 'Failed to fetch forecast data.');
            }
            const data: ForecastResponse = await res.json();
            setForecast(data);
        } catch (err: any) {
            console.error('Error fetching forecast:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchForecast();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-[80vw] bg-white p-6">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-blue-900">Market Anomaly Forecast</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Stay ahead of market trends with real-time analysis and predictions
                </p>
            </div>

            {loading && (
                <div className="text-blue-500 text-lg mt-4">Fetching forecast data...</div>
            )}

            {error && (
                <div className="text-red-600 text-lg mt-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {!loading && !error && forecast && (
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">
                            Forecast Results
                        </h2>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-700">Prediction:</span>
                            <span
                                className={`font-bold ${forecast.model_prediction === 1 ? 'text-red-600' : 'text-blue-600'
                                    }`}
                            >
                                {forecast.model_prediction === 1 ? 'Market Crash' : 'No Crash'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg mt-4">
                            <span className="font-medium text-gray-700">Probability of Crash:</span>
                            <span className="font-bold text-gray-800">
                                {forecast.model_probability !== undefined
                                    ? `${(forecast.model_probability * 100).toFixed(2)}%`
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">
                            Latest Feature Values
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                            Feature
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                            Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(forecast.latest_features).map(([key, value], index) => (
                                        <tr
                                            key={index}
                                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                        >
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
                                                {key}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                                                {value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">
                            Details
                        </h2>
                        <div className="text-gray-600"> <Trumpet /></div>
                    </div>
                </div>
            )}
        </div>
    );
}
