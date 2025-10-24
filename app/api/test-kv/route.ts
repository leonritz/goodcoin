import { NextResponse } from 'next/server';
import { db } from '@/lib/kv';

export async function GET() {
  try {
    // Try to set a test value
    const testKey = 'test:connection';
    const testValue = { timestamp: new Date().toISOString(), test: 'KV is working!' };
    
    await db.set(testKey, testValue);
    
    // Try to get it back
    const result = await db.get(testKey);
    
    // Clean up
    await db.del(testKey);
    
    return NextResponse.json({
      success: true,
      message: 'KV store is connected and working!',
      test: result,
      environment: {
        hasKV_URL: !!process.env.KV_REST_API_URL,
        hasKV_TOKEN: !!process.env.KV_REST_API_TOKEN,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('KV test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasKV_URL: !!process.env.KV_REST_API_URL,
        hasKV_TOKEN: !!process.env.KV_REST_API_TOKEN,
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}

