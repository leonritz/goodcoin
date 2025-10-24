import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

interface PostData {
  id: string;
  creatorFid: string;
  description: string;
  mediaUrl: string | null;
  mediaType: string | null;
  likesCount: number;
  commentsCount: number;
  donationsReceived: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const creatorFid = searchParams.get('creatorFid');
    const likedByFid = searchParams.get('likedByFid');

    if (postId) {
      const post = await db.get(`posts:${postId}`);
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    if (creatorFid) {
      const allPostIds = await db.smembers('posts:all');
      const posts = await Promise.all(
        allPostIds.map((id) => db.get(`posts:${id}`))
      );
      const userPosts = posts
        .filter((p): p is PostData => p !== null && typeof p === 'object' && 'creatorFid' in p && (p as PostData).creatorFid === creatorFid)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(userPosts);
    }

    if (likedByFid) {
      const allPostIds = await db.smembers('posts:all');
      const likedPosts: PostData[] = [];
      
      for (const postId of allPostIds) {
        const isLiked = await db.sismember(`posts:likes:${postId}`, likedByFid);
        if (isLiked) {
          const post = await db.get(`posts:${postId}`) as PostData | null;
          if (post) likedPosts.push(post);
        }
      }
      
      likedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(likedPosts);
    }

    const allPostIds = await db.smembers('posts:all');
    const posts = await Promise.all(
      allPostIds.map((id) => db.get(`posts:${id}`))
    );
    const validPosts = posts.filter((p): p is PostData => p !== null);
    validPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json(validPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorFid, description, mediaUrl, mediaType } = body;

    if (!creatorFid || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: creatorFid, description' },
        { status: 400 }
      );
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPost = {
      id: postId,
      creatorFid,
      description,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      likesCount: 0,
      commentsCount: 0,
      donationsReceived: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.set(`posts:${postId}`, newPost);
    await db.sadd('posts:all', postId);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, action, userFid, amount } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, action' },
        { status: 400 }
      );
    }

    const post = await db.get(`posts:${postId}`) as PostData | null;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    switch (action) {
      case 'like':
        if (!userFid) {
          return NextResponse.json({ error: 'Missing userFid' }, { status: 400 });
        }
        const isAlreadyLiked = await db.sismember(`posts:likes:${postId}`, userFid);
        if (isAlreadyLiked) {
          return NextResponse.json({ error: 'Already liked' }, { status: 400 });
        }
        await db.sadd(`posts:likes:${postId}`, userFid);
        post.likesCount += 1;
        break;

      case 'unlike':
        if (!userFid) {
          return NextResponse.json({ error: 'Missing userFid' }, { status: 400 });
        }
        const wasLiked = await db.sismember(`posts:likes:${postId}`, userFid);
        if (!wasLiked) {
          return NextResponse.json({ error: 'Not liked' }, { status: 400 });
        }
        await db.srem(`posts:likes:${postId}`, userFid);
        post.likesCount = Math.max(0, post.likesCount - 1);
        break;

      case 'incrementComments':
        post.commentsCount += 1;
        break;

      case 'addDonation':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 });
        }
        post.donationsReceived += amount;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    post.updatedAt = new Date().toISOString();
    await db.set(`posts:${postId}`, post);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

