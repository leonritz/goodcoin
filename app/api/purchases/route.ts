import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv';

interface PurchaseData {
  id: string;
  userFid: string;
  amount: number;
  paymentAmount: string;
  paymentCurrency: 'ETH' | 'USDC';
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userFid = searchParams.get('userFid');

    if (!userFid) {
      return NextResponse.json({ error: 'userFid parameter required' }, { status: 400 });
    }

    const allPurchaseIds = await db.smembers('purchases:all');
    const purchases = await Promise.all(
      allPurchaseIds.map((id) => db.get(`purchases:${id}`))
    );

    const userPurchases = purchases
      .filter((purchase): purchase is PurchaseData => 
        purchase !== null && 
        typeof purchase === 'object' && 
        'userFid' in purchase && 
        (purchase as PurchaseData).userFid === userFid
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(userPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userFid, amount, paymentAmount, paymentCurrency, transactionHash } = body;

    // Validation
    if (!userFid || !amount || !paymentAmount || !paymentCurrency) {
      return NextResponse.json(
        { error: 'Missing required fields: userFid, amount, paymentAmount, paymentCurrency' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!['ETH', 'USDC'].includes(paymentCurrency)) {
      return NextResponse.json({ error: 'Invalid payment currency' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.get(`users:${userFid}`) as UserData | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create purchase record
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const purchase: PurchaseData = {
      id: purchaseId,
      userFid,
      amount,
      paymentAmount,
      paymentCurrency,
      transactionHash,
      status: 'completed', // Mark as completed since payment was already made
      createdAt: new Date().toISOString(),
    };

    // Update user balance
    user.balance += amount;
    user.updatedAt = new Date().toISOString();

    // Save to database
    await Promise.all([
      db.set(`users:${userFid}`, user),
      db.set(`purchases:${purchaseId}`, purchase),
      db.sadd('purchases:all', purchaseId),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully purchased ${amount} Goodcoins`,
        purchase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}

