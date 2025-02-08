'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../sanity/client';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';

interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
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
  tracking?: {
    trackingNumber: string;
    courier: string;
    shippedAt: string;
  };
}

// Add type for filter state
type OrderStatus = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      let filterCondition = '';
      if (filter !== 'all') {
        filterCondition = `&& status == "${filter}"`;
      }

      const query = `*[_type == "order" ${filterCondition}] | order(orderDate desc) {
        _id,
        orderId,
        orderDate,
        status,
        paymentStatus,
        paymentMethod,
        totalAmount,
        customerInfo,
        items,
        tracking
      }`;

      const fetchedOrders = await client.fetch(query);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.orderId?.toLowerCase() || '').includes(searchLower) ||
      (order.customerInfo?.fullName?.toLowerCase() || '').includes(searchLower) ||
      (order.customerInfo?.email?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order #{order.orderId}
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(order.orderDate), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">PKR {order.totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Payment: {order.paymentMethod.toUpperCase()} - {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 my-4">
                <h4 className="font-medium mb-2">Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">{order.customerInfo.fullName}</p>
                    <p className="text-gray-600">{order.customerInfo.email}</p>
                    <p className="text-gray-600">{order.customerInfo.phoneNumber}</p>
                  </div>
                  <div className="text-gray-600">
                    <p>{order.customerInfo.address}</p>
                    <p>{order.customerInfo.city}, {order.customerInfo.postalCode}</p>
                    <p>{order.customerInfo.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {(item.selectedSize || item.selectedColor) && (
                          <span className="text-gray-600">
                            {' '}({item.selectedSize}
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

              {order.tracking && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tracking Information</h4>
                  <div className="text-sm">
                    <p>
                      <span className="text-gray-600">Tracking Number: </span>
                      <span className="font-medium">{order.tracking.trackingNumber}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Shipped At: </span>
                      <span className="font-medium">
                        {format(new Date(order.tracking.shippedAt), 'PPP')}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end space-x-2">
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
} 