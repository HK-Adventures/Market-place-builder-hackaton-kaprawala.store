'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../sanity/client';

interface TopProduct {
  name: string;
  totalSold: number;
  revenue: number;
}

interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalItems: number;
  topProducts: TopProduct[];
}

type TimeFilter = 'today' | '7days' | '30days' | 'year';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  canceledOrders: number;
  totalItems: number;
  recentOrders: Array<{
    _id: string;
    orderId: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    customerInfo: {
      fullName: string;
      email: string;
    };
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user || !isAdmin) {
        router.push('/');
        return;
      }

      try {
        const orders = await client.fetch(`
          *[_type == "order"] | order(orderDate desc) {
            _id,
            orderId,
            orderDate,
            status,
            totalAmount,
            items,
            customerInfo {
              fullName,
              email
            }
          }
        `);

        const stats = {
          totalOrders: orders?.length || 0,
          totalRevenue: orders?.reduce((sum: number, order: any) => 
            sum + (order.totalAmount || 0), 0) || 0,
          pendingOrders: orders?.filter((order: any) => 
            order.status === 'pending')?.length || 0,
          canceledOrders: orders?.filter((order: any) => 
            order.status === 'canceled')?.length || 0,
          totalItems: orders?.reduce((sum: number, order: any) => 
            sum + (order.items?.length || 0), 0) || 0,
          recentOrders: orders?.slice(0, 5) || []
        };

        setStats(stats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user, isAdmin, router]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats?.pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Completed Orders</h3>
          <p className="text-3xl font-bold mt-2">
            {(stats?.totalOrders ?? 0) - (stats?.pendingOrders ?? 0) - (stats?.canceledOrders ?? 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Canceled Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats?.canceledOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">PKR {stats?.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Average Order Value</h3>
          <p className="text-3xl font-bold mt-2">
            PKR {stats?.totalRevenue ? (stats?.totalRevenue / stats?.totalOrders).toLocaleString() : 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Total Items Sold</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalItems?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Conversion Rate</h3>
          <p className="text-3xl font-bold mt-2">
            {stats?.totalOrders && stats?.totalOrders - stats?.pendingOrders - stats?.canceledOrders 
              ? `${Math.round(((stats?.totalOrders - stats?.pendingOrders - stats?.canceledOrders) / stats?.totalOrders) * 100)}%`
              : '0%'
            }
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow mt-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="py-3 px-4">{order.orderId}</td>
                    <td className="py-3 px-4">{order.customerInfo.fullName}</td>
                    <td className="py-3 px-4">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      PKR {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 