import { NextResponse } from 'next/server';
import { client } from '../../../sanity/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Verify admin authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers }
      );
    }

    // Verify if user is admin
    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403, headers }
      );
    }

    const { orderId, trackingNumber, courier = '17track' } = await request.json();

    if (!orderId || !trackingNumber) {
      return NextResponse.json(
        { error: 'Order ID and tracking number are required' },
        { status: 400, headers }
      );
    }

    // Update order with tracking information
    await client
      .patch(orderId)
      .set({
        status: 'processing',
        tracking: {
          courier,
          trackingNumber,
          shippedAt: new Date().toISOString()
        }
      })
      .commit();

    // Optional: Send shipping notification email to customer
    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        customerInfo,
        orderId
      }`,
      { orderId }
    );

    // You can add email notification logic here
    // await sendShippingNotification(order.customerInfo.email, {
    //   trackingNumber,
    //   orderNumber: order.orderId,
    //   customerName: order.customerInfo.fullName
    // });

    return NextResponse.json(
      { success: true, message: 'Shipment information updated successfully' },
      { headers }
    );
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment information' },
      { status: 500, headers }
    );
  }
}

// GET endpoint to fetch shipment details
export async function GET(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400, headers }
      );
    }

    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        tracking,
        status,
        orderId
      }`,
      { orderId }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers }
      );
    }

    return NextResponse.json(order, { headers });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment information' },
      { status: 500, headers }
    );
  }
} 