import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userFid = searchParams.get('userFid');

    if (!postId) {
      return NextResponse.json({ error: 'postId required' }, { status: 400 });
    }

    // Get flag count
    const flaggers = await db.smembers(`posts:flags:${postId}`);
    const flagCount = flaggers.length;

    // Check if specific user has flagged
    if (userFid) {
      const hasFlagged = await db.sismember(`posts:flags:${postId}`, userFid);
      return NextResponse.json({ flagCount, hasFlagged });
    }

    return NextResponse.json({ flagCount });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userFid, action } = body;

    if (!postId || !userFid) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, userFid' },
        { status: 400 }
      );
    }

    const flagKey = `posts:flags:${postId}`;

    if (action === 'flag') {
      // Check if already flagged
      const alreadyFlagged = await db.sismember(flagKey, userFid);
      if (alreadyFlagged) {
        return NextResponse.json({ error: 'Already flagged' }, { status: 400 });
      }

      // Add flag
      await db.sadd(flagKey, userFid);

      // Get updated count
      const flaggers = await db.smembers(flagKey);
      const flagCount = flaggers.length;

      // Update post with flag count
      const post = await db.get(`posts:${postId}`) as { flagCount?: number } | null;
      if (post) {
        post.flagCount = flagCount;
        await db.set(`posts:${postId}`, post);
      }

      return NextResponse.json({ success: true, flagCount });
    } else if (action === 'unflag') {
      // Remove flag
      const wasFlagged = await db.sismember(flagKey, userFid);
      if (!wasFlagged) {
        return NextResponse.json({ error: 'Not flagged' }, { status: 400 });
      }

      await db.srem(flagKey, userFid);

      // Get updated count
      const flaggers = await db.smembers(flagKey);
      const flagCount = flaggers.length;

      // Update post with flag count
      const post = await db.get(`posts:${postId}`) as { flagCount?: number } | null;
      if (post) {
        post.flagCount = flagCount;
        await db.set(`posts:${postId}`, post);
      }

      return NextResponse.json({ success: true, flagCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing flag:', error);
    return NextResponse.json({ error: 'Failed to process flag' }, { status: 500 });
  }
}

