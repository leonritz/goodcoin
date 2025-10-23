import { NextResponse } from 'next/server';
import { minikitConfig } from '../../../minikit.config';

/**
 * Farcaster Mini App Manifest
 * Must be served at /.well-known/farcaster.json
 */
export async function GET() {
  return NextResponse.json({
    accountAssociation: minikitConfig.accountAssociation,
    ...minikitConfig.miniapp,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
