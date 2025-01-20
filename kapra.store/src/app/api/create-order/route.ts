import { NextResponse } from 'next/server';
import { client } from '../../../sanity/client';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

export async function POST(request: Request) {
  try {
    const { items, shippingInfo, total, userId } = await request.json();

    // Validate required fields
    if (!items?.length || !shippingInfo || !total || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD${Date.now()}`;

    const order = {
      _type: 'order',
      orderNumber,
      customer: {
        _type: 'reference',
        _ref: userId
      },
      items: items.map((item: OrderItem) => ({
        _type: 'orderItem',
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })),
      shippingInfo: {
        _type: 'shippingInfo',
        ...shippingInfo
      },
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const result = await client.create(order);

    if (!result?._id) {
      throw new Error('Failed to create order in Sanity');
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 