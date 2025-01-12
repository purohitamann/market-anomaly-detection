// app/api/predict/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FAST_SERVER_URL = `${process.env.FAST_SERVER_URL}/api/predict` || 'http://localhost:8000'; 


export async function POST(req: NextRequest) {
  try {
    // Parse request body from Next.js
    const body = await req.json();

    // Forward the request to your fast server
    const response = await fetch(FAST_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Return the error if the fast server fails
      return NextResponse.json(
        { error: 'Fast server error', details: await response.text() },
        { status: response.status },
      );
    }

    // Parse the fast server’s response and return to the client
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Unexpected error', details: error.message },
      { status: 500 },
    );
  }
}
