import { NextResponse } from 'next/server';
import { client } from '../../../sanity/client';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface OrderData {
  items: OrderItem[];
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingRate: {
    cost: number;
    service: string;
    estimatedDays: number;
  };
  totalAmount: number;
  total: number;
  paymentMethod: string;
}

export async function POST(request: Request) {
  try {
    const data: OrderData = await request.json();
    const { shippingInfo, shippingRate, paymentMethod, total } = data;

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
      items: data.items.map((item: OrderItem) => ({
        _type: 'orderItem',
        productId: item.name,
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