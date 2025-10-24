import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint to check if a wallet address has a verified Farcaster account
 * This avoids CORS issues when calling Warpcast API from the browser
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter required' },
        { status: 400 }
      );
    }

    // Call Warpcast API from server-side (no CORS issues)
    const response = await fetch(
      `https://api.warpcast.com/v2/verifications?address=${address}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If Warpcast returns an error, return null data (no Farcaster account found)
      return NextResponse.json({ farcasterData: null });
    }

    const data = await response.json();
    
    // Extract Farcaster data if available
    if (data.result?.verifications && data.result.verifications.length > 0) {
      const verification = data.result.verifications[0];
      return NextResponse.json({
        farcasterData: {
          fid: verification.fid?.toString(),
          username: verification.username || null,
          displayName: verification.displayName || null,
        },
      });
    }

    // No Farcaster account found for this address
    return NextResponse.json({ farcasterData: null });
  } catch (error) {
    console.error('Error fetching Farcaster verification:', error);
    // Return null data instead of error so authentication can continue
    return NextResponse.json({ farcasterData: null });
  }
}

