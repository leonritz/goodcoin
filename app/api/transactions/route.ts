import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

interface TransactionData {
  id: string;
  fromFid: string;
  toFid: string;
  amount: number;
  postId: string;
  createdAt: string;
}

interface UserData {
  fid: string;
  username: string;
  displayName: string;
  profileImage: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface PostData {
  id: string;
  creatorFid: string;
  description: string;
  donationsReceived: number;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('userFid');
    const postId = searchParams.get('postId');
    const type = searchParams.get('type');

    if (postId) {
      const allTxIds = await db.smembers('transactions:all');
      const transactions = await Promise.all(
        allTxIds.map((id) => db.get(`transactions:${id}`))
      );
      const postTransactions = transactions
        .filter((tx): tx is TransactionData => tx !== null && typeof tx === 'object' && 'postId' in tx && (tx as TransactionData).postId === postId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(postTransactions);
    }

    if (userFid) {
      const allTxIds = await db.smembers('transactions:all');
      const transactions = await Promise.all(
        allTxIds.map((id) => db.get(`transactions:${id}`))
      );

      let userTransactions = transactions.filter((tx): tx is TransactionData => tx !== null);

      if (type === 'sent') {
        userTransactions = userTransactions.filter((tx) => tx.fromFid === userFid);
      } else if (type === 'received') {
        userTransactions = userTransactions.filter((tx) => tx.toFid === userFid);
      } else {
        userTransactions = userTransactions.filter(
          (tx) => tx.fromFid === userFid || tx.toFid === userFid
        );
      }

      userTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json(userTransactions);
    }

    return NextResponse.json({ error: 'userFid or postId parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromFid, toFid, amount, postId } = body;

    if (!fromFid || !toFid || !amount || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields: fromFid, toFid, amount, postId' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (fromFid === toFid) {
      return NextResponse.json({ error: 'Cannot donate to yourself' }, { status: 400 });
    }

    const donor = await db.get(`users:${fromFid}`) as UserData | null;
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    const recipient = await db.get(`users:${toFid}`) as UserData | null;
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const post = await db.get(`posts:${postId}`) as PostData | null;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (donor.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id: transactionId,
      fromFid,
      toFid,
      amount,
      postId,
      createdAt: new Date().toISOString(),
    };

    donor.balance -= amount;
    donor.updatedAt = new Date().toISOString();
    recipient.balance += amount;
    recipient.updatedAt = new Date().toISOString();

    post.donationsReceived += amount;
    post.updatedAt = new Date().toISOString();

    await Promise.all([
      db.set(`users:${fromFid}`, donor),
      db.set(`users:${toFid}`, recipient),
      db.set(`posts:${postId}`, post),
      db.set(`transactions:${transactionId}`, transaction),
      db.sadd('transactions:all', transactionId),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Donation successful',
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

