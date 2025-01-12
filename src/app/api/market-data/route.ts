// app/api/market-data/route.ts
import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = 'http://localhost:5005';
// Adjust to your actual Python host/port

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'AAPL';
  const days = searchParams.get('days') ?? '1wk';

  // Proxy to the Python server
  const url = `${PYTHON_SERVER_URL}?symbol=${symbol}&days=${days}`;
  console.log('Fetching:', url);
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Python server error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
