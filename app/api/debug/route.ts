import { NextResponse } from 'next/server';
import { minikitConfig } from '../../../minikit.config';

export async function GET() {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      BASE_URL: process.env.BASE_URL,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    },
    computedRootUrl: minikitConfig.miniapp.homeUrl,
    manifest: minikitConfig,
    timestamp: new Date().toISOString(),
  });
}
