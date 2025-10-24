import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userFid = searchParams.get('userFid');

    if (!postId || !userFid) {
      return NextResponse.json(
        { error: 'Missing required parameters: postId, userFid' },
        { status: 400 }
      );
    }

    const isLiked = await db.sismember(`posts:likes:${postId}`, userFid);
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
  }
}

