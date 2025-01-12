'use client';

import { useEffect, useState } from 'react';

interface ForecastResponse {
    symbol: string;
    model_prediction: number;
    model_probability?: number;
    latest_features: Record<string, any>;
    error?: string;
    details?: string;
}

export default function ForecastPage() {
    const [forecast, setForecast] = useState<ForecastResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Set your Flask server's base URL here.
    // For local development, this might be something like 'http://localhost:5000'
    // If using ngrok, replace it with the public URL provided by ngrok.
    const FLASK_SERVER_BASE = 'http://localhost:5005';

    useEffect(() => {
        async function fetchForecast() {
            try {
                const res = await fetch(`${FLASK_SERVER_BASE}/api/forecast`);
                if (!res.ok) {
                    // Try to parse the error JSON
                    const errorRes = await res.json();
                    throw new Error(errorRes.error || "Failed to fetch forecast");
                }
                const data: ForecastResponse = await res.json();
                setForecast(data);
            } catch (err: any) {
                console.error("Error fetching forecast:", err);
                setError(err.message);
            }
        }
        fetchForecast();
    }, []);

    return (
        <main style={{ padding: '1rem' }}>
            <h1>Investment Forecast</h1>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}
            {!forecast && !error && <div>Loading forecast...</div>}
            {forecast && (
                <div>
                    <h2>Forecast Result</h2>
                    <p>
                        <strong>Model Prediction:</strong>{" "}
                        {forecast.model_prediction === 1 ? "Crash" : "No Crash"}
                    </p>
                    {forecast.model_probability !== undefined && (
                        <p>
                            <strong>Probability of Crash:</strong> {forecast.model_probability.toFixed(2)}
                        </p>
                    )}
                    <h3>Latest Feature Values</h3>
                    <pre>{JSON.stringify(forecast.latest_features, null, 2)}</pre>
                </div>
            )}
        </main>
    );
}
