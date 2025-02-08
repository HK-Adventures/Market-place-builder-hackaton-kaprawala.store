'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../../components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const COD_LIMIT = 5000; // 5,000 PKR limit for Cash on Delivery

interface ShippingInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingRate {
  cost: number;
  currency: string;
  estimatedDays: number;
  service: string;
}

interface CheckoutSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);

  const calculateTotal = () => {
    if (checkoutSummary) {
      return checkoutSummary.total;
    }
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = shippingRate?.cost || 0;
    return subtotal + shipping;
  };

  const isCODAvailable = calculateTotal() <= COD_LIMIT;

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (cart.length === 0) {
          router.push('/cart');
          return;
        }

        const storedShippingInfo = sessionStorage.getItem('shippingInfo');
        const storedShippingRate = sessionStorage.getItem('shippingRate');
        const storedCheckoutSummary = sessionStorage.getItem('checkoutSummary');

        if (!storedShippingInfo || !storedShippingRate || !storedCheckoutSummary) {
          router.push('/checkout');
          return;
        }

        const parsedShippingInfo = JSON.parse(storedShippingInfo);
        const parsedShippingRate = JSON.parse(storedShippingRate);
        const parsedCheckoutSummary = JSON.parse(storedCheckoutSummary);
        
        setShippingInfo(parsedShippingInfo);
        setShippingRate(parsedShippingRate);
        setCheckoutSummary(parsedCheckoutSummary);

        if (paymentMethod === 'card') {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cart,
              shipping: parsedShippingRate.cost,
              discount: parsedCheckoutSummary.discount,
            }),
          });

          const data = await response.json();
          setClientSecret(data.clientSecret);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing payment page:', err);
        setError('Failed to load payment information');
        setLoading(false);
      }
    };

    initializePage();
  }, [cart, router, paymentMethod]);

  const handleCODOrder = async () => {
    try {
      setProcessingOrder(true);
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          shippingInfo,
          shippingRate,
          paymentMethod: 'cod',
          total: calculateTotal(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Clear cart and stored data
      clearCart();
      sessionStorage.removeItem('shippingInfo');
      sessionStorage.removeItem('shippingRate');
      sessionStorage.removeItem('checkoutSummary');

      // Redirect to success page with order ID
      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
      setProcessingOrder(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear cart and stored data
    clearCart();
    sessionStorage.removeItem('shippingInfo');
    sessionStorage.removeItem('shippingRate');
    sessionStorage.removeItem('checkoutSummary');
    
    router.push('/order-success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="card"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-4 w-4"
                  disabled={processingOrder}
                />
                <label htmlFor="card">Credit/Debit Card</label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="cod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  disabled={!isCODAvailable || processingOrder}
                  className="h-4 w-4"
                />
                <label 
                  htmlFor="cod" 
                  className={!isCODAvailable ? 'text-gray-400' : ''}
                >
                  Cash on Delivery
                  {!isCODAvailable && (
                    <span className="text-red-500 text-sm ml-2">
                      (Not available for orders above PKR {COD_LIMIT.toLocaleString()})
                    </span>
                  )}
                </label>
              </div>
            </div>

            {paymentMethod === 'card' && clientSecret && shippingInfo && shippingRate && (
              <div className="mt-6">
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: { theme: 'stripe' },
                  }}
                >
                  <CheckoutForm 
                    shippingInfo={shippingInfo}
                    shippingRate={shippingRate}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="mt-6">
                <button
                  onClick={handleCODOrder}
                  disabled={processingOrder}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {processingOrder ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>PKR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {checkoutSummary?.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>PKR {shippingRate?.cost.toLocaleString()}</span>
                </div>
                {checkoutSummary?.discount && checkoutSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- PKR {checkoutSummary.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>PKR {calculateTotal().toLocaleString()}</span>
                </div>
                {checkoutSummary?.promoCode && (
                  <div className="mt-2 text-sm text-green-600">
                    Promo code applied: {checkoutSummary.promoCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 