import { NextResponse } from 'next/server';
import { client } from '../../../sanity/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const AFTERSHIP_API_KEY = process.env.AFTERSHIP_API_KEY;
const AFTERSHIP_API_URL = 'https://api.aftership.com/v4';

export async function POST(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'aftership-api-key': AFTERSHIP_API_KEY!
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
    if (authError || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers }
      );
    }

    const { orderId, trackingNumber, courier = 'pakistan-post' } = await request.json();

    // Create tracking in AfterShip
    const trackingResponse = await fetch(`${AFTERSHIP_API_URL}/trackings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'aftership-api-key': AFTERSHIP_API_KEY!
      },
      body: JSON.stringify({
        tracking: {
          tracking_number: trackingNumber,
          slug: courier,
          title: `Order ${orderId}`,
          order_id: orderId
        }
      })
    });

    if (!trackingResponse.ok) {
      throw new Error('Failed to create tracking in AfterShip');
    }

    // Update order in Sanity
    await client
      .patch(orderId)
      .set({
        status: 'shipped',
        tracking: {
          trackingNumber,
          courier,
          shippedAt: new Date().toISOString()
        }
      })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking_number');
    const courier = searchParams.get('courier') || 'pakistan-post';

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${AFTERSHIP_API_URL}/trackings/${courier}/${trackingNumber}`,
      {
        headers: {
          'aftership-api-key': AFTERSHIP_API_KEY!
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tracking information');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
} 