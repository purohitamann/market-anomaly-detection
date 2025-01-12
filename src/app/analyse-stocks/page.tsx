'use client';

import { useEffect, useState } from 'react';
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
import InvestmentForecastPage from '../page';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


interface MarketDataResponse {
    symbol: string;
    days: number;
    labels: string[];
    actualPrices: number[];
    predictions: number[];
}

export default function HomePage() {
    const [symbol, setSymbol] = useState('AAPL');
    const [days, setDays] = useState(7);
    const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const FLASK_SERVER_BASE = process.env.NEXT_PUBLIC_FLASK_SERVER_BASE || 'http://localhost:5005';

    async function fetchMarketData() {
        try {
            setError(null);
            setMarketData(null);

            const url = `${FLASK_SERVER_BASE}/api/market-data?symbol=${symbol}&days=${days}`;
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Error fetching data: ${res.statusText}`);
            }

            const data: MarketDataResponse = await res.json();
            setMarketData(data);
        } catch (err: any) {
            setError(err.message);
        }
    }

    useEffect(() => {
        fetchMarketData();
    }, []);

    let chartData;
    if (marketData) {
        const labelsWithPrediction = [...marketData.labels, 'Next Day'];
        const actualPricesExtended = [...marketData.actualPrices, null];
        const predictionsExtended = Array(marketData.labels.length).fill(null);
        predictionsExtended.push(marketData.predictions[0]);

        chartData = {
            labels: labelsWithPrediction,
            datasets: [
                {
                    label: `Actual Prices (${marketData.symbol})`,
                    data: actualPricesExtended,
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                },
                {
                    label: `Prediction (${marketData.symbol})`,
                    data: predictionsExtended,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                },
            ],
        };
    }

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: {
                display: true,
                text: `Stock Market Data for ${symbol.toUpperCase()} (Last ${days} Days)`,
            },
        },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-[80vw] bg-white p-6">

            <p className="text-4xl font-bold text-blue-900 mb-6">Find Stock Market Data</p>
            <div className="flex items-center space-x-4 mb-6">
                <div className="flex flex-col">
                    <label className="text-lg mb-1 text-gray-700">Symbol</label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        className="border border-gray-300 rounded px-4 py-2 text-black"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-lg mb-1 text-gray-700">Days</label>
                    <input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="border border-gray-300 rounded px-4 py-2 text-black"
                    />
                </div>
                <button
                    onClick={fetchMarketData}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
                >
                    Fetch Data
                </button>
            </div>
            {error && <div className="text-red-600 text-lg mt-4">{error}</div>}
            {!marketData && !error && <div className="text-blue-500 text-lg mt-4">Loading data...</div>}
            {marketData && (
                <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
                    <Line data={chartData!} options={options} />
                </div>
            )}
        </div>
    );
}
