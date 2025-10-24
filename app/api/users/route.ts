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

    if (!fid || !username || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields: fid, username, displayName' },
        { status: 400 }
      );
    }

    const existingUser = await db.get(`users:${fid}`);
    if (existingUser) {
      return NextResponse.json(existingUser);
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

    await db.set(`users:${fid}`, newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, balance } = body;

    if (!fid || balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: fid, balance' },
        { status: 400 }
      );
    }

    const user = await db.get(`users:${fid}`) as { balance: number; updatedAt: string } | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.balance = balance;
    user.updatedAt = new Date().toISOString();

    await db.set(`users:${fid}`, user);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

