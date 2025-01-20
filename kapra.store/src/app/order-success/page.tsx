'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    if (cart.length > 0) {
      router.push('/');
    }
    // Get order ID from URL parameters
    const id = searchParams.get('orderId');
    if (id) {
      setOrderId(id);
    }
  }, [cart, router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          
          {/* Order Number */}
          {orderId && (
            <div className="bg-gray-100 rounded-md py-2 px-4 mb-4 inline-block">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-mono text-lg font-semibold">{orderId}</p>
            </div>
          )}

          <p className="text-gray-600 mb-8">
            Thank you for your purchase. We'll send you an email confirmation shortly.
          </p>

          {/* Order Details */}
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                You'll receive an order confirmation email with your order details
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                We'll process your order and prepare it for shipping
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                Once shipped, we'll send you tracking information
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                Your order will arrive within 3-5 business days
              </li>
            </ul>
          </div>

          {/* Save Order Number */}
          {orderId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Important: Save your order number
              </p>
              <p className="text-sm text-blue-600">
                Please save your order number for future reference. You'll need it to track your order or contact support.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href={`/my-orders${orderId ? `?highlight=${orderId}` : ''}`}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-sm text-gray-600">
            <p>
              Having trouble with your order?{' '}
              <Link 
                href={`/contact${orderId ? `?orderId=${orderId}` : ''}`} 
                className="text-black font-medium hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 