'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../sanity/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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

interface ApiStats {
  total: number;
  change: number;
}

interface SalesData {
  date: string;
  value: number;
}

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
  const { user, isAdmin, isLoading } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalItems: 0,
    topProducts: []
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }

    const fetchOrderSummary = async () => {
      try {
        let dateFilter = '';
        const now = new Date();

        switch (timeFilter) {
          case 'today':
            dateFilter = `&& orderDate >= "${startOfDay(now).toISOString()}" && orderDate <= "${endOfDay(now).toISOString()}"`;
            break;
          case '7days':
            dateFilter = `&& orderDate >= "${startOfDay(subDays(now, 7)).toISOString()}"`;
            break;
          case '30days':
            dateFilter = `&& orderDate >= "${startOfDay(subDays(now, 30)).toISOString()}"`;
            break;
          case 'year':
            dateFilter = `&& orderDate >= "${startOfDay(subDays(now, 365)).toISOString()}"`;
            break;
          default:
            dateFilter = `&& orderDate >= "${startOfDay(subDays(now, 365)).toISOString()}"`;
        }

        const data = await client.fetch(`{
          "totalOrders": count(*[_type == "order" ${dateFilter}]),
          "pendingOrders": count(*[_type == "order" && status == "pending" ${dateFilter}]),
          "completedOrders": count(*[_type == "order" && status == "completed" ${dateFilter}]),
          "canceledOrders": count(*[_type == "order" && status == "cancelled" ${dateFilter}]),
          "orders": *[_type == "order" && status == "completed" ${dateFilter}] {
            totalAmount,
            items[] {
              productId,
              name,
              quantity,
              price
            }
          }
        }`);

        const totalRevenue = data.orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        const totalItems = data.orders.reduce((sum: number, order: any) => sum + (order.items.length || 0), 0);
        const avgOrderValue = data.orders.length ? totalRevenue / data.orders.length : 0;

        const productStats = new Map();
        data.orders.forEach((order: any) => {
          order.items.forEach((item: any) => {
            if (item.productId && item.name) {
              const key = item.productId;
              const currentStats = productStats.get(key) || {
                name: item.name,
                totalSold: 0,
                revenue: 0
              };
              
              currentStats.totalSold += item.quantity || 0;
              currentStats.revenue += (item.price * item.quantity) || 0;
              productStats.set(key, currentStats);
            }
          });
        });

        const topProducts = Array.from(productStats.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map(product => ({
            ...product,
            revenue: Math.round(product.revenue)
          }));

        setOrderSummary({ 
          ...data, 
          totalRevenue,
          avgOrderValue,
          totalItems,
          topProducts 
        });
      } catch (error) {
        console.error('Error fetching order summary:', error);
        setPageLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
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

        const stats: DashboardStats = {
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

    if (!isLoading && user && isAdmin) {
      fetchOrderSummary();
      fetchDashboardStats();
    }
  }, [user, isAdmin, isLoading, router, timeFilter]);

  if (isLoading || pageLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="year">This Year</option>
        </select>
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

      {/* Top Products Table */}
      <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-right py-3 px-4">Units Sold</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">% of Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {orderSummary.topProducts?.map((product, index) => (
                <tr 
                  key={product.name}
                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="text-right py-3 px-4">
                    {product.totalSold.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    PKR {product.revenue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {stats?.totalItems 
                      ? `${Math.round((product.totalSold / stats?.totalItems) * 100)}%`
                      : '0%'
                    }
                  </td>
                </tr>
              ))}
              {(!orderSummary.topProducts || orderSummary.topProducts.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No sales data available for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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