import { NextResponse } from 'next/server';
import { client } from '../../../sanity/client';

export async function POST(request: Request) {
  try {
    const { items, shippingInfo, shippingRate, paymentMethod, total } = await request.json();

    // Create order in Sanity
    const order = await client.create({
      _type: 'order',
      orderDate: new Date().toISOString(),
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod: paymentMethod,
      totalAmount: total,
      customerInfo: {
        fullName: shippingInfo.fullName,
        email: shippingInfo.email,
        phoneNumber: shippingInfo.phoneNumber,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country
      },
      items: items.map((item: any) => ({
        _type: 'orderItem',
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })),
      shipping: {
        cost: shippingRate.cost,
        service: shippingRate.service,
        estimatedDays: shippingRate.estimatedDays
      },
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order._id 
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 