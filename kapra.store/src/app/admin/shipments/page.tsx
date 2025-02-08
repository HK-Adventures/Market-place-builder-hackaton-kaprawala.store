'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../sanity/client';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { shippingService } from '../../../lib/shippingService';

interface Tracking {
  trackingNumber: string;
  courier: string;
  shippedAt: string;
  shippingCost: number;
  status?: string;
  estimatedDelivery: string;
  labelUrl?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface OrderDetails {
  orderId: string;
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
  }>;
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
  tracking?: Tracking;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus?: {
    status: string;
    updates: Array<{
      timestamp: string;
      status: string;
      location: string;
    }>;
  };
}

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'processing' | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('shipmentsFilter', filter);
  }, [filter]);

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

      const query = `*[_type == "order" ${filterCondition} && paymentMethod == "cod" && !(_id in path("drafts.**"))] | order(orderDate desc) {
        _id,
        orderId,
        customerInfo,
        orderDate,
        totalAmount,
        items,
        status,
        tracking,
        paymentMethod,
        paymentStatus
      }`;

      const fetchedOrders = await client.fetch(query);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [router, filter]);

  const handleShipment = async (orderId: string) => {
    setProcessingOrder(orderId);
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      console.log('Generating label for order:', order);

      // Generate shipping label
      const labelResponse = await shippingService.generateLabel(
        {
          _id: order._id,
          orderId: order.orderId,
          // customerInfo: order.customerInfo,
          items: order.items
        },
        {
          fullName: order.customerInfo.fullName,
          // email: order.customerInfo.email,
          // phoneNumber: order.customerInfo.phoneNumber,
          address: order.customerInfo.address,
          city: order.customerInfo.city,
          postalCode: order.customerInfo.postalCode,
          country: order.customerInfo.country
        }
      );

      const label = typeof labelResponse === 'string' 
        ? {
            trackingNumber: labelResponse,
            labelUrl: '',
            status: 'pending',
            estimatedDelivery: new Date().toISOString(),
            shippingCost: 0
          }
        : labelResponse;

      // Update order in Sanity
      await client
        .patch(orderId)
        .set({
          status: 'processing',
          tracking: {
            trackingNumber: label.trackingNumber,
            courier: 'pakistan-post',
            shippedAt: new Date().toISOString(),
            labelUrl: label.labelUrl,
            status: label.status,
            estimatedDelivery: label.estimatedDelivery,
            shippingCost: label.shippingCost
          }
        })
        .commit();

      // Download the shipping label PDF
      try {
        const response = await fetch(label.labelUrl);
        if (!response.ok) throw new Error('Failed to download label');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shipping-label-${order.orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (downloadError) {
        console.error('Error downloading label:', downloadError);
        alert('Label generated but download failed. You can access the label from the tracking information.');
      }

      // Refresh orders list
      await fetchOrders();

      alert(`Shipping label generated successfully! Tracking number: ${label.trackingNumber}`);

    } catch (error) {
      console.error('Error generating shipment:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate shipping label. Please try again.');
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

  const fetchShippingStatuses = useCallback(async () => {
    try {
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          if (order.tracking?.trackingNumber) {
            const response = await fetch(
              `/api/shipment?tracking_number=${order.tracking.trackingNumber}&courier=${order.tracking.courier}`
            );
            const data = await response.json();
            return { ...order, shippingStatus: data.tracking_status };
          }
          return order;
        })
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error fetching shipping statuses:', error);
    }
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchShippingStatuses();
  }, [fetchShippingStatuses]);

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
        <h1 className="text-2xl font-bold">Shipments</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'pending' | 'processing' | 'all')}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
          </select>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
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
                  {order.tracking?.shippingCost && (
                    <p className="text-sm text-gray-600">
                      Shipping: PKR {order.tracking.shippingCost.toLocaleString()}
                    </p>
                  )}
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
                      <span className="font-medium">
                        {order.tracking?.status || 'Pending'}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Estimated Delivery: </span>
                      <span className="font-medium">
                        {format(new Date(order.tracking.estimatedDelivery), 'PPP')}
                      </span>
                    </p>
                    {order.shippingStatus && (
                      <p>
                        <span className="text-gray-600">Current Location: </span>
                        <span className="font-medium">{order.shippingStatus.status}</span>
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
                    <button
                      onClick={() => {
                        if (!order.tracking?.trackingNumber) return;
                        handleMarkAsHandedOver(order._id, order.tracking.trackingNumber);
                      }}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Handed Over
                    </button>
                  </div>

                  {order.shippingStatus && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Tracking Updates</h5>
                      <div className="space-y-2">
                        {order.shippingStatus.updates.map((update, index) => (
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
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleShipment(order._id)}
                    disabled={processingOrder === order._id}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {processingOrder === order._id ? 'Processing...' : 'Generate Shipping Label'}
                  </button>
                </div>
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