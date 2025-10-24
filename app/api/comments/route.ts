import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');

    if (commentId) {
      const comment = await db.get(`comments:${commentId}`);
      if (!comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
      return NextResponse.json(comment);
    }

    if (postId) {
      const commentIds = await db.lrange(`comments:post:${postId}`, 0, -1);
      const comments = await Promise.all(
        commentIds.map((id: string) => db.get(`comments:${id}`))
      );
      const validComments = comments.filter((c: unknown): c is { createdAt: string } => c !== null);
      validComments.sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return NextResponse.json(validComments);
    }

    return NextResponse.json({ error: 'postId or commentId parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, creatorFid, text } = body;

    if (!postId || !creatorFid || !text || !text.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, creatorFid, text' },
        { status: 400 }
      );
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newComment = {
      id: commentId,
      postId,
      creatorFid,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    await db.set(`comments:${commentId}`, newComment);
    await db.lpush(`comments:post:${postId}`, commentId);

    const post = await db.get(`posts:${postId}`) as { commentsCount: number; updatedAt: string } | null;
    if (post) {
      post.commentsCount += 1;
      post.updatedAt = new Date().toISOString();
      await db.set(`posts:${postId}`, post);
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

