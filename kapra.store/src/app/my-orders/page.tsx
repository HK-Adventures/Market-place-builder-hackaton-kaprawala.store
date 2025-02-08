'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { client } from '../../sanity/client';
import { format, addMinutes, isBefore, parseISO, addHours, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Order {
  _id: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
  tracking?: {
    courier: string;
    trackingNumber: string;
    shippedAt: string;
  };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get('highlight');
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login?redirectTo=/my-orders');
          return;
        }

        const query = `*[_type == "order" && customerInfo.email == $email] | order(orderDate desc) {
          _id,
          orderDate,
          totalAmount,
          status,
          paymentMethod,
          paymentStatus,
          customerInfo,
          items,
          _createdAt,
          _updatedAt,
          "rawStatus": status,
          tracking
        }`;

        const fetchedOrders = await client.fetch(query, {
          email: session.user.email
        });

        // Filter out cancelled orders older than 10 minutes
        const visibleOrders = fetchedOrders.filter(shouldShowOrder);
        
        setOrders(visibleOrders);
        setFilteredOrders(visibleOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Handle search
  useEffect(() => {
    const searchResults = orders
      .filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(shouldShowOrder);
      
    setFilteredOrders(searchResults);
  }, [searchTerm, orders]);

  const canCancelOrder = (order: Order) => {
    try {
      const orderDate = parseISO(order.orderDate);
      const twentyFourHoursAfterOrder = addHours(orderDate, 24);
      const now = new Date();

      const isWithinCancelWindow = isBefore(now, twentyFourHoursAfterOrder);
      const hasValidStatus = ['pending', 'processing'].includes(order.status?.toLowerCase() || '');
      const isNotCancelled = order.status !== 'cancelled';

      // Detailed debugging
      console.log('Order details:', {
        orderId: order._id,
        orderDate: orderDate.toISOString(),
        cancelWindowEnd: twentyFourHoursAfterOrder.toISOString(),
        currentTime: now.toISOString(),
        status: order.status,
        checks: {
          isWithinCancelWindow,
          hasValidStatus,
          isNotCancelled,
          finalResult: isWithinCancelWindow && hasValidStatus && isNotCancelled
        }
      });

      return isWithinCancelWindow && hasValidStatus && isNotCancelled;
    } catch (error) {
      console.error('Error in canCancelOrder:', error, {
        orderDate: order.orderDate,
        status: order.status,
        order: order
      });
      return false;
    }
  };

  const shouldShowOrder = (order: Order) => {
    if (order.status !== 'cancelled') return true;
    
    try {
      const orderDate = parseISO(order.orderDate);
      const tenMinutesAfterOrder = addMinutes(orderDate, 10);
      const now = new Date();
      
      // Show cancelled orders only within 10 minutes of cancellation
      return isBefore(now, tenMinutesAfterOrder);
    } catch (error) {
      console.error('Error checking order visibility:', error);
      return true; // Show order if there's an error checking
    }
  };

  // Add this function to handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingOrder(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirectTo=/my-orders');
        return;
      }

      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      // Update both orders and filteredOrders
      const updateOrders = (prevOrders: Order[]) =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: 'cancelled' }
            : order
        );

      setOrders(updateOrders);
      setFilteredOrders(updateOrders);

      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error instanceof Error ? error.message : 'Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
          <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No orders found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  highlightedOrderId === order._id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-medium">{order._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {(item.selectedSize || item.selectedColor) && (
                            <span className="text-gray-600">
                              {' '}
                              ({item.selectedSize}
                              {item.selectedColor && `, ${item.selectedColor}`})
                            </span>
                          )}
                          <span className="text-gray-600"> x{item.quantity}</span>
                        </div>
                        <span>PKR {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600">Status: </span>
                      <span className="font-medium capitalize">{order.status}</span>
                      {order.status === 'cancelled' && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Will be hidden in {
                            formatDistanceToNow(addMinutes(parseISO(order.orderDate), 10))
                          })
                        </span>
                      )}
                    </div>
                    
                    {order.tracking?.trackingNumber && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Track:</span>
                        <Link
                          href={`https://track.aftership.com/tcs-pakistan/${order.tracking.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          {order.tracking.trackingNumber}
                          <svg 
                            className="w-4 h-4 ml-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                            />
                          </svg>
                        </Link>
                      </div>
                    )}

                    {order.tracking?.shippedAt && (
                      <div className="text-sm text-gray-600">
                        Shipped: {format(parseISO(order.tracking.shippedAt), 'MMM dd, yyyy')}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Payment: </span>
                        <span className="font-medium capitalize">{order.paymentStatus}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Total: </span>
                        <span className="font-semibold">
                          PKR {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrder === order._id}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:text-red-400"
                        >
                          {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Shipping Details</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.customerInfo.fullName}</p>
                    <p>{order.customerInfo.address}</p>
                    <p>{order.customerInfo.phoneNumber}</p>
                    <p>{order.customerInfo.email}</p>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mt-2">
                    <div>Order Date: {new Date(order.orderDate).toLocaleString()}</div>
                    <div>Status: {order.status}</div>
                    <div>Can Cancel: {canCancelOrder(order) ? 'Yes' : 'No'}</div>
                  </div>
                )}

                {order.status !== 'cancelled' && order.tracking?.trackingNumber && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Updates</h4>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`https://track.aftership.com/tcs-pakistan/${order.tracking.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Track Order
                        <svg 
                          className="ml-2 -mr-1 h-4 w-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                      </Link>
                      <span className="text-sm text-gray-500">
                        Tracking Number: {order.tracking.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 