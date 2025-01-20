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
    const fetchProducts = async () => {
      try {
        const result = await client.fetch(`
          *[_type == "product"] {
            _id,
            name,
            price,
            category->{
              _id,
              name
            },
            "image": images[0],
            inStock
          } | order(name asc)
        `);
        console.log('Fetched products:', result); // Debug log
        setProducts(result);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await client.delete(productId);
      setProducts(products.filter(p => p._id !== productId));
      alert('Product deleted successfully');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image && (
              <div className="relative h-48">
                <Image
                  src={urlFor(product.image).url()}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">PKR {product.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-4">
                Category: {product.category?.name || 'Uncategorized'}
              </p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/products/edit/${product._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
            No products found
          </div>
        )}
      </div>
    </div>
  );
} 