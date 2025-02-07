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
  totalAmount: number;
}

interface Customer {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  addresses: Array<{
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }>;
  orders: Order[];
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchCustomers = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const query = `*[_type == "customer"] | order(createdAt desc) {
        _id,
        email,
        fullName,
        phoneNumber,
        addresses,
        "orders": *[_type == "order" && references(^._id)] {
          _id,
          orderId,
          orderDate,
          status,
          totalAmount
        },
        createdAt,
        updatedAt
      }`;

      const fetchedCustomers = await client.fetch(query);
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.email?.toLowerCase() || '').includes(searchLower) ||
      (customer.fullName?.toLowerCase() || '').includes(searchLower) ||
      (customer.phoneNumber || '').includes(searchTerm)
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{customer.fullName}</h3>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Customer since: {format(new Date(customer.createdAt), 'PP')}</p>
                  <p>Total Orders: {customer.orders.length}</p>
                </div>
              </div>

              {customer.addresses.length > 0 && (
                <div className="border-t border-gray-200 py-4">
                  <h4 className="font-medium mb-2">Addresses</h4>
                  <div className="grid gap-4">
                    {customer.addresses.map((address, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <p>{address.address}</p>
                        <p>{address.city}, {address.postalCode}</p>
                        <p>{address.country}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customer.orders.length > 0 && (
                <div className="border-t border-gray-200 py-4">
                  <h4 className="font-medium mb-2">Recent Orders</h4>
                  <div className="space-y-2">
                    {customer.orders.map((order) => (
                      <div key={order._id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">#{order.orderId}</span>
                          <span className="text-gray-600"> - {format(new Date(order.orderDate), 'PP')}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="ml-2">PKR {order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
} 