import Ably from 'ably/promises';
import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }
  const ably = new Ably.Rest(apiKey);
  const tokenRequestData = await ably.auth.createTokenRequest({ clientId: 'tester-client-id' });
  return NextResponse.json(tokenRequestData);
}
