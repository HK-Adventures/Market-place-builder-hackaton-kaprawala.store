'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { client } from '../../sanity/client';

interface OrderDetails {
  _id: string;
  orderId: string;
  orderDate: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const order = await client.fetch(
          `*[_type == "order" && _id == $orderId][0]{
            _id,
            orderId,
            orderDate,
            status,
            paymentMethod,
            paymentStatus,
            totalAmount,
            customerInfo,
            items
          }`,
          { orderId }
        );

        if (!order) {
          throw new Error('Order not found');
        }

        setOrderDetails(order);
        clearCart();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, router, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
          <Link 
            href="/" 
            className="text-black underline hover:text-gray-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. We'll send you shipping confirmation soon.
            </p>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(orderDetails.orderDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">
                  {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  PKR {orderDetails.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
            <div className="space-y-2">
              <p>{orderDetails.customerInfo.fullName}</p>
              <p>{orderDetails.customerInfo.address}</p>
              <p>{orderDetails.customerInfo.city}, {orderDetails.customerInfo.postalCode}</p>
              <p>{orderDetails.customerInfo.country}</p>
              <p>Phone: {orderDetails.customerInfo.phoneNumber}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                    {item.selectedSize && ` (${item.selectedSize})`}
                    {item.selectedColor && ` - ${item.selectedColor}`}
                  </span>
                  <span>PKR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <Link
              href="/my-orders"
              className="block w-full text-center bg-black text-white py-3 rounded-lg hover:bg-gray-800"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="block w-full text-center bg-white text-black border border-black py-3 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 