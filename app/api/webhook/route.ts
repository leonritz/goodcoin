import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint for Farcaster miniapp events
 * This receives notifications when users interact with your miniapp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook event (for development)
    console.log('Received webhook:', JSON.stringify(body, null, 2));
    
    // Handle different event types
    const { event, data } = body;
    
    switch (event) {
      case 'miniapp.install':
        console.log('User installed miniapp:', data);
        break;
      
      case 'miniapp.uninstall':
        console.log('User uninstalled miniapp:', data);
        break;
      
      case 'miniapp.open':
        console.log('User opened miniapp:', data);
        break;
      
      default:
        console.log('Unknown event type:', event);
    }
    
    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ 
      success: true,
      message: 'Webhook received'
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Still return 200 to prevent retries
    return NextResponse.json({ 
      success: false,
      error: 'Invalid webhook payload'
    }, { status: 200 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Goodcoin webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}

