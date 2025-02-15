import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface PaymentData {
  items: Array<{
    price: number;
    quantity: number;
  }>;
  shipping: number;
  amount: number;
  currency: string;
  paymentMethodType: string;
}

export async function POST(request: Request) {
  try {
    const data: PaymentData = await request.json();

    // Calculate total amount
    const amount = data.items.reduce(
      (sum: number, item: PaymentData['items'][0]) => sum + (item.price * item.quantity),
      0
    ) + data.shipping;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: data.currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 