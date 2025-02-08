import { NextResponse } from 'next/server';
import { client } from '../../../sanity/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { addHours, isBefore } from 'date-fns';

export async function POST(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Create a Supabase client for the route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401, headers }
      );
    }

    // Parse request body
    const { orderId } = await request.json();

    // Fetch the order
    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId && customerInfo.email == $email][0]`,
      {
        orderId,
        email: user.email
      }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404, headers }
      );
    }

    // Check if order can be cancelled (within 24 hours of placing)
    const orderDate = new Date(order.orderDate);
    const twentyFourHoursAfterOrder = addHours(orderDate, 24);
    const now = new Date();

    if (!isBefore(now, twentyFourHoursAfterOrder)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled after 24 hours' },
        { status: 400, headers }
      );
    }

    if (!['pending', 'processing'].includes(order.status.toLowerCase())) {
      return NextResponse.json(
        { error: `Order cannot be cancelled in ${order.status} status` },
        { status: 400, headers }
      );
    }

    // Cancel the order
    await client
      .patch(orderId)
      .set({ 
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      })
      .commit();

    console.log('Order cancelled successfully');
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500, headers }
    );
  }
} 