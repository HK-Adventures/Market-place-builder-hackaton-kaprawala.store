'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { client } from '../../../sanity/client';
import { supabase } from '../../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../../components/CheckoutForm';
import { generateShippingLabel } from '../../../lib/shippingService';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ShippingInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  area: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PromoCode {
  discount: number;
  promoCode: string;
  promoExpiry: string;
  productId: string;
}

interface CustomerInfo {
  _id?: string;
  _type: string;
  email: string | undefined;
  fullName: string;
  phoneNumber: string;
  defaultShipping?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt?: string;
}

interface ShippingRate {
  cost: number;
  currency: string;
  estimatedDays: number;
  service: string;
}

interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

const PaymentForm = ({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) => {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cardElement, setCardElement] = useState<any>(null);

  useEffect(() => {
    const setupStripe = async () => {
      const stripe = await stripePromise;
      if (!stripe) return;

      const elements = stripe.elements();
      const card = elements.create('card');
      card.mount('#card-element');
      setCardElement(card);

      // Handle real-time validation errors
      card.on('change', (event: any) => {
        setError(event.error ? event.error.message : '');
      });
    };

    setupStripe();

    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <div id="card-element" className="p-2 border rounded bg-white"></div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={processing}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    area: '',
    city: '',
    postalCode: '',
    country: 'Pakistan'
  });
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [storedShippingInfo, setStoredShippingInfo] = useState<ShippingInfo | null>(null);
  const [storedShippingRate, setStoredShippingRate] = useState<ShippingRate | null>(null);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const customer = await client.fetch(
          `*[_type == "customer" && email == $email][0]{
            _id,
            fullName,
            email,
            phoneNumber,
            defaultShipping
          }`,
          { email: session.user.email }
        );

        if (customer) {
          setCustomerInfo(customer);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    console.log('Current cart:', cart); // Debug cart contents
  }, [cart]);

  useEffect(() => {
    const shippingInfoStr = sessionStorage.getItem('shippingInfo');
    const shippingRateStr = sessionStorage.getItem('shippingRate');

    if (!shippingInfoStr || !shippingRateStr || cart.length === 0) {
      router.push('/checkout');
      return;
    }

    const parsedShippingInfo = JSON.parse(shippingInfoStr);
    const parsedShippingRate = JSON.parse(shippingRateStr);
    
    setStoredShippingInfo(parsedShippingInfo);
    setStoredShippingRate(parsedShippingRate);

    const createPaymentIntent = async () => {
      try {
        // Calculate total amount including shipping
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = parsedShippingRate.cost;
        const total = subtotal + shipping;

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId: searchParams.get('orderId')
          }),
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [cart, router, searchParams]);

  useEffect(() => {
    const summary = sessionStorage.getItem('checkoutSummary');
    if (summary) {
      setCheckoutSummary(JSON.parse(summary));
    }
  }, []);

  const calculateTotal = () => {
    if (checkoutSummary) {
      return checkoutSummary.total;
    }
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const initializePayment = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          orderId: Math.random().toString(36).substring(7), // Generate a simple order ID
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  const handlePaymentSuccess = async () => {
    await handlePlaceOrder('paid');
  };

  const handlePlaceOrder = async (paymentStatus: 'pending' | 'paid' = 'pending') => {
    try {
      setLoading(true);

      // Create order first
      const orderData = {
        _type: 'order',
        orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
        customer: {
          _type: 'reference',
          _ref: customerInfo?._id
        },
        customerInfo: {
          fullName: customerInfo?.fullName,
          email: customerInfo?.email,
          phoneNumber: customerInfo?.phoneNumber,
          address: customerInfo?.defaultShipping?.address || '',
          city: customerInfo?.defaultShipping?.city || '',
          postalCode: customerInfo?.defaultShipping?.postalCode || '',
          country: customerInfo?.defaultShipping?.country || ''
        },
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        totalAmount: calculateTotal(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        status: 'pending',
        orderDate: new Date().toISOString()
      };
      const order = await client.create(orderData);

      // Generate shipping label
      try {
        const trackingNumber = await generateShippingLabel(order);
        console.log('Generated tracking number:', trackingNumber);
      } catch (labelError) {
        console.error('Failed to generate shipping label:', labelError);
        // Continue with order placement even if label generation fails
      }

      // Update stock quantities for each item
      for (const item of cart) {
        await client
          .patch(item._id)
          .set({
            stockQuantity: item.stockQuantity - item.quantity,
            [`colors[name == "${item.selectedColor}"].stockQuantity`]: item.selectedColor ? 
              item.stockQuantity - item.quantity : undefined,
            [`sizes[name == "${item.selectedSize}"].stockQuantity`]: item.selectedSize ? 
              item.stockQuantity - item.quantity : undefined
          })
          .commit();
      }

      // Clear cart and redirect
      clearCart();
      sessionStorage.removeItem('shippingInfo');
      sessionStorage.removeItem('shippingRate');
      router.push(`/order-success?orderId=${order._id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !storedShippingInfo || !storedShippingRate) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Order Summary</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor && ` | Color: ${item.selectedColor}`}
                      </p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>PKR {checkoutSummary?.subtotal?.toLocaleString() ?? '0'}</span>
                    </div>
                    {checkoutSummary?.discount && checkoutSummary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-PKR {checkoutSummary.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>PKR {checkoutSummary?.shippingCost?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>PKR {checkoutSummary?.total?.toLocaleString() ?? '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="form-radio"
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value as 'card');
                      initializePayment();
                    }}
                    className="form-radio"
                  />
                  <span>Credit/Debit Card</span>
                </label>
              </div>

              {paymentMethod === 'card' && clientSecret && (
                <div className="mt-4">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      shippingInfo={storedShippingInfo}
                      shippingRate={storedShippingRate}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <button
                  onClick={() => handlePlaceOrder('pending')}
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 