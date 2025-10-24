import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (fid) {
      const user = await db.get(`users:${fid}`);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    return NextResponse.json({ error: 'FID parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, username, displayName, profileImage, balance } = body;

    console.log('POST /api/users - Creating user:', { fid, username, displayName });

    if (!fid || !username || !displayName) {
      console.error('Missing required fields:', { fid, username, displayName });
      return NextResponse.json(
        { error: 'Missing required fields: fid, username, displayName' },
        { status: 400 }
      );
    }

    try {
      const existingUser = await db.get(`users:${fid}`);
      if (existingUser) {
        console.log('User already exists:', fid);
        return NextResponse.json(existingUser);
      }
    } catch (dbError) {
      console.error('Database get error:', dbError);
      // Continue to create user even if get fails
    }

    const newUser = {
      fid,
      username,
      displayName,
      profileImage: profileImage || '',
      balance: balance !== undefined ? balance : 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.set(`users:${fid}`, newUser);
      console.log('User created successfully:', fid);
    } catch (dbError) {
      console.error('Database set error:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: errorMessage 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, balance, displayName, username } = body;

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing required field: fid' },
        { status: 400 }
      );
    }

    const userData = await db.get(`users:${fid}`);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userData as {
      fid: string;
      username: string;
      displayName: string;
      profileImage?: string;
      balance: number;
      createdAt: string;
      updatedAt: string;
    };

    // Update only the fields that are provided
    if (balance !== undefined) {
      user.balance = balance;
    }
    if (displayName !== undefined) {
      user.displayName = displayName;
    }
    if (username !== undefined) {
      user.username = username;
    }
    
    user.updatedAt = new Date().toISOString();

    await db.set(`users:${fid}`, user);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

