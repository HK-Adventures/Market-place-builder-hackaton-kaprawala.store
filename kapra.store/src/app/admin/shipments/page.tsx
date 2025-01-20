'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../sanity/client';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { shippingService } from '../../../lib/shippingService';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  items: OrderItem[];
  status: string;
  tracking?: {
    trackingNumber: string;
    courier: string;
    shippedAt: string;
  };
}

interface ShippingStatus {
  status: string;
  estimatedDelivery: string;
  currentLocation?: string;
  updates: Array<{
    timestamp: string;
    status: string;
    location: string;
  }>;
}

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'processing' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingStatuses, setShippingStatuses] = useState<Record<string, ShippingStatus>>({});
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      let filterCondition = '';
      if (filter === 'pending') {
        filterCondition = '&& status == "pending"';
      } else if (filter === 'processing') {
        filterCondition = '&& status == "processing"';
      }

      const query = `*[_type == "order" ${filterCondition} && paymentStatus != "failed"] | order(orderDate desc) {
        _id,
        orderId,
        customerInfo,
        orderDate,
        totalAmount,
        items,
        status,
        tracking
      }`;

      const fetchedOrders = await client.fetch(query);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipment = async (orderId: string) => {
    setProcessingOrder(orderId);
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;

      // Generate shipping label
      const shippingLabel = await shippingService.generateLabel(order);

      // Update order with shipping information
      await client
        .patch(orderId)
        .set({
          status: 'processing',
          tracking: {
            trackingNumber: shippingLabel.trackingNumber,
            labelUrl: shippingLabel.labelUrl,
            shippedAt: new Date().toISOString(),
            estimatedDelivery: shippingLabel.estimatedDelivery,
            status: shippingLabel.status,
          },
        })
        .commit();

      fetchOrders();
    } catch (error) {
      console.error('Error generating shipping label:', error);
      alert('Failed to generate shipping label');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleMarkAsHandedOver = async (orderId: string, trackingNumber: string) => {
    try {
      await shippingService.markAsHandedOver(trackingNumber);
      
      await client
        .patch(orderId)
        .set({
          'tracking.status': 'in_transit',
          'tracking.handedOverAt': new Date().toISOString(),
        })
        .commit();

      fetchOrders();
    } catch (error) {
      console.error('Error marking as handed over:', error);
      alert('Failed to mark as handed over');
    }
  };

  const fetchShippingStatuses = async () => {
    const ordersWithTracking = orders.filter(order => order.tracking?.trackingNumber);
    
    for (const order of ordersWithTracking) {
      try {
        const status = await shippingService.getShipmentStatus(order.tracking.trackingNumber);
        setShippingStatuses(prev => ({
          ...prev,
          [order._id]: status,
        }));
      } catch (error) {
        console.error('Error fetching shipping status:', error);
      }
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      fetchShippingStatuses();
    }
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.orderId?.toLowerCase() || '').includes(searchLower) ||
      (order.customerInfo?.fullName?.toLowerCase() || '').includes(searchLower) ||
      (order.customerInfo?.email?.toLowerCase() || '').includes(searchLower) ||
      (order.tracking?.trackingNumber?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Shipments</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search shipments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="all">All Orders</option>
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
                      'bg-gray-100 text-gray-800'
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

              {order.tracking ? (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping Information</h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <span className="text-gray-600">Tracking Number: </span>
                      <span className="font-medium">{order.tracking.trackingNumber}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Status: </span>
                      <span className="font-medium">{shippingStatuses[order._id]?.status || order.tracking.status}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Estimated Delivery: </span>
                      <span className="font-medium">
                        {format(new Date(shippingStatuses[order._id]?.estimatedDelivery || order.tracking.estimatedDelivery), 'PPP')}
                      </span>
                    </p>
                    {shippingStatuses[order._id]?.currentLocation && (
                      <p>
                        <span className="text-gray-600">Current Location: </span>
                        <span className="font-medium">{shippingStatuses[order._id].currentLocation}</span>
                      </p>
                    )}
                    <div className="mt-2">
                      <a
                        href={order.tracking.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Shipping Label
                      </a>
                    </div>
                    {order.tracking.status === 'ready' && (
                      <button
                        onClick={() => handleMarkAsHandedOver(order._id, order.tracking.trackingNumber)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark as Handed Over
                      </button>
                    )}
                  </div>

                  {shippingStatuses[order._id]?.updates && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Tracking Updates</h5>
                      <div className="space-y-2">
                        {shippingStatuses[order._id].updates.map((update, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{update.status}</p>
                            <p className="text-gray-600">
                              {format(new Date(update.timestamp), 'PPP p')} - {update.location}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                order.status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleShipment(order._id)}
                      disabled={processingOrder === order._id}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {processingOrder === order._id ? 'Processing...' : 'Generate Shipping Label'}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
            No shipments found
          </div>
        )}
      </div>
    </div>
  );
} 