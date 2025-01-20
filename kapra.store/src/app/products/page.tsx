'use client'
import { useState, useEffect } from 'react';
import { client } from '../../sanity/client';
import ProductCard from '../../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: any[];
  category: {
    _id: string;
    name: string;
  };
  description?: string;
  stockQuantity?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products and categories with proper references
        const [productsData, categoriesData] = await Promise.all([
          client.fetch(`
            *[_type == "product"] {
              _id,
              name,
              price,
              description,
              stockQuantity,
              images,
              "category": category->{
                _id,
                name
              }
            }
          `),
          client.fetch(`
            *[_type == "category"] {
              _id,
              name
            } | order(name asc)
          `)
        ]);

        console.log('Fetched products:', productsData);
        console.log('Fetched categories:', categoriesData);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on category reference
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category?._id === selectedCategory);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
} 