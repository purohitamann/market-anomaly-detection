
import { NextResponse } from 'next/server';

const PYTHON_SERVER_URL = process.env.NEXT_PUBLIC_FLASK_SERVER_BASE|| 'http://localhost:5005';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'AAPL';
  const days = searchParams.get('days') ?? '1wk';


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
