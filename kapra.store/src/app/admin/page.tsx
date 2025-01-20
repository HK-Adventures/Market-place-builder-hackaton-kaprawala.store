'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../sanity/client';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const count = await client.fetch(`count(*[_type == "product"])`);
        setProductCount(count);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setPageLoading(false);
      }
    };

    if (!isLoading && user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || pageLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/products" 
          className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-gray-600">Total Products: {productCount}</p>
        </Link>

        <Link href="/admin/promotions" 
          className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Promotions</h2>
          <p className="text-gray-600">Manage product promotions and discounts</p>
        </Link>

        <Link href="/studio" 
          className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Sanity Studio</h2>
          <p className="text-gray-600">Manage content in Sanity Studio</p>
        </Link>
      </div>
    </div>
  );
} 