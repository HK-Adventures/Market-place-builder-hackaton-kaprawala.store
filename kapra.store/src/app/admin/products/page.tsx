'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../sanity/client';
import { supabase } from '../../../lib/supabase';
import Image from 'next/image';
import { urlFor } from '../../../sanity/lib/image';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  mainImage: {
    asset: {
      _ref: string;
    };
  };
  image: any;
  images: Array<{
    _key: string;
    asset: {
      _ref: string;
      _type: 'reference';
    };
  }>;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  filters: {
    size: string[];
    color: string[];
  };
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const query = `*[_type == "product"] | order(name asc) {
        _id,
        name,
        price,
        stockQuantity,
        "category": category->{
          name
        },
        images
      }`;
      const data = await client.fetch(query);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "category"] | order(name asc) {
        _id,
        name
      }`;
      const data = await client.fetch(query);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await client.delete(productId);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (product.name?.toLowerCase() || '').includes(searchLower) ||
      (product.description?.toLowerCase() || '').includes(searchLower) ||
      (product.category?.name?.toLowerCase() || '').includes(searchLower) ||
      (product.sku?.toLowerCase() || '').includes(searchLower)
    );

    const matchesCategory = categoryFilter === 'all' || product.category?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-2xl font-semibold">Products</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <Link 
            href="/studio/desk/product;new" 
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-center"
          >
            Add New Product
          </Link>
        </div>
      </div>

      <div className="mb-8 w-full sm:w-48">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Status</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="sm:hidden text-xs text-gray-500 mt-1">{product.category?.name}</div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{product.category?.name}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">PKR {product.price.toLocaleString()}</div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stockQuantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-4">
                    <Link 
                      href={`/studio/desk/product;${product._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 