'use client';

import { useState } from 'react';

export default function HomePage() {
  const [features, setFeatures] = useState<number[]>([0, 0, 0]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Call our Next.js API route, which in turn calls the fast server
  async function handlePredict() {
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        const { error, details } = await response.json();
        throw new Error(error + ': ' + details);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Next.js + Fast Server Prediction</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>Feature 1: </label>
        <input
          type="number"
          value={features[0]}
          onChange={(e) =>
            setFeatures([Number(e.target.value), features[1], features[2]])
          }
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Feature 2: </label>
        <input
          type="number"
          value={features[1]}
          onChange={(e) =>
            setFeatures([features[0], Number(e.target.value), features[2]])
          }
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Feature 3: </label>
        <input
          type="number"
          value={features[2]}
          onChange={(e) =>
            setFeatures([features[0], features[1], Number(e.target.value)])
          }
        />
      </div>

      <button onClick={handlePredict}>Predict</button>

      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Prediction Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
