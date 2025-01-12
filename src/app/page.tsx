'use client';

import { useEffect, useState } from 'react';

// Chart.js + react-chartjs-2
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register the Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Type for the data we receive from /api/market-data
interface MarketDataResponse {
    symbol: string;
    days: number;
    labels: string[];        // Dates as strings, e.g., ["2023-09-01", "2023-09-02", ...]
    actualPrices: number[];  // Actual stock prices, e.g., [100.34, 101.12, ...]
    predictions: number[];   // Predictions for future prices, e.g., [102.35]
}

export default function HomePage() {
    const [symbol, setSymbol] = useState('AAPL'); // Example stock symbol
    const [days, setDays] = useState(7); // Number of days to fetch
    const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Your Flask server's base URL
    const FLASK_SERVER_BASE = 'http://localhost:5005';

    // Fetch data from the Flask server
    async function fetchMarketData() {
        try {
            setError(null); // Clear previous errors
            setMarketData(null); // Reset market data

            const url = `${FLASK_SERVER_BASE}/api/market-data?symbol=${symbol}&days=${days}`;
            console.log('Fetching:', url);
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Error fetching data: ${res.statusText}`);
            }

            const data: MarketDataResponse = await res.json();
            console.log('Response Data:', data);
            setMarketData(data);
        } catch (err: any) {
            console.error('Error:', err.message);
            setError(err.message);
        }
    }

    // Fetch data on the first render
    useEffect(() => {
        fetchMarketData();
    }, []); // Empty dependency array means it runs once on mount

    // Prepare chart data once we have marketData
    let chartData;
    if (marketData) {
        // Add an extra label for the prediction
        const labelsWithPrediction = [...marketData.labels, 'Next Day'];

        // Extend actual prices with a null placeholder for the prediction
        const actualPricesExtended = [...marketData.actualPrices, null];

        // Add the prediction as the last data point
        const predictionsExtended = Array(marketData.labels.length).fill(null);
        predictionsExtended.push(marketData.predictions[0]); // Add the prediction

        chartData = {
            labels: labelsWithPrediction,
            datasets: [
                {
                    label: `Actual Prices (${marketData.symbol})`,
                    data: actualPricesExtended,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0,0,255,0.2)',
                },
                {
                    label: `Prediction (${marketData.symbol})`,
                    data: predictionsExtended,
                    borderColor: 'red',
                    backgroundColor: 'rgba(255,0,0,0.2)',
                },
            ],
        };
    }

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Stock Market Data for ${symbol.toUpperCase()} (Last ${days} Days)`,
            },
        },
    };

    return (
        <main style={{ padding: '10rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Stock Market Chart</h1>

            {/* Inputs for symbol and days */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: 8 }}>Symbol:</label>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    style={{ marginRight: 16 }}
                />

                <label style={{ marginRight: 8 }}>Days:</label>
                <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    style={{ marginRight: 16 }}
                />

                <button onClick={fetchMarketData}>Fetch Data</button>
            </div>

            {/* Error Message */}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}

            {/* Loading State */}
            {!marketData && !error && <div>Loading data...</div>}

            {/* Chart Display */}
            {marketData && (
                <div style={{ width: '80%', maxWidth: 800 }}>
                    <Line data={chartData!} options={options} />
                </div>
            )}
        </main>
    );
}
