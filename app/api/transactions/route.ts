import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

interface TransactionData {
  id: string;
  fromFid: string;
  toFid: string;
  amount: number;
  postId: string;
  createdAt: string;
  // New fields for token transfers
  transactionType?: 'virtual' | 'token' | 'purchase';
  tokenAmount?: string;
  tokenSymbol?: string;
  ethAmount?: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  status?: 'pending' | 'confirmed' | 'failed';
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
    const { 
      fromFid, 
      toFid, 
      amount, 
      postId, 
      transactionType = 'virtual',
      tokenAmount,
      tokenSymbol,
      ethAmount,
      txHash,
      fromAddress,
      toAddress,
      status = 'confirmed'
    } = body;

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

    // No virtual balance updates - only real token transfers

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction: TransactionData = {
      id: transactionId,
      fromFid,
      toFid,
      amount,
      postId,
      createdAt: new Date().toISOString(),
      transactionType,
      tokenAmount,
      tokenSymbol,
      ethAmount,
      txHash,
      fromAddress,
      toAddress,
      status,
    };

    // Update post donations received
    post.donationsReceived += amount;
    post.updatedAt = new Date().toISOString();

    // Save transaction and post data
    await Promise.all([
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

