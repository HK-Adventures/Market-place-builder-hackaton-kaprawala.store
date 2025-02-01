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
      } finally {
        setPageLoading(false);
      }
    };

    if (!isLoading && user && isAdmin) {
      fetchOrderSummary();
    }
  }, [user, isAdmin, isLoading, router, timeFilter]);

  if (isLoading || pageLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === 'today' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('7days')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === '7days' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFilter('30days')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === '30days' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === 'year' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last Year
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{orderSummary.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">{orderSummary.pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Completed Orders</h3>
          <p className="text-3xl font-bold mt-2">{orderSummary.completedOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Canceled Orders</h3>
          <p className="text-3xl font-bold mt-2">{orderSummary.canceledOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">PKR {orderSummary.totalRevenue?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Average Order Value</h3>
          <p className="text-3xl font-bold mt-2">
            PKR {orderSummary.avgOrderValue ? Math.round(orderSummary.avgOrderValue).toLocaleString() : 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Total Items Sold</h3>
          <p className="text-3xl font-bold mt-2">{orderSummary.totalItems?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600">Conversion Rate</h3>
          <p className="text-3xl font-bold mt-2">
            {orderSummary.totalOrders && orderSummary.completedOrders 
              ? `${Math.round((orderSummary.completedOrders / orderSummary.totalOrders) * 100)}%`
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
                    {orderSummary.totalItems 
                      ? `${Math.round((product.totalSold / orderSummary.totalItems) * 100)}%`
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
    </div>
  );
} 