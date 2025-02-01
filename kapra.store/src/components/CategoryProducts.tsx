'use client'
import { useState, useEffect } from 'react';
import { client } from '../sanity/client';
import ProductCard from './ProductCard';
import { FiFilter } from 'react-icons/fi';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: any[];
  category: {
    _id: string;
    name: string;
  };
  stockQuantity: number;
  regularDiscount?: number;
}

interface CategoryProductsProps {
  categoryName: string;
}

interface PriceRange {
  min: string;
  max: string;
}

interface FilterState {
  priceRange: PriceRange;
  sortBy: string;
  inStock: boolean;
}

export default function CategoryProducts({ categoryName }: CategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: '0', max: '10000' },
    sortBy: 'featured',
    inStock: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "product" && lower(category->name) == lower($categoryName)] {
          _id,
          name,
          price,
          description,
          stockQuantity,
          images,
          regularDiscount,
          "category": category->{
            _id,
            name
          }
        }`;

        console.log('Fetching products for category:', categoryName);
        const productsData = await client.fetch(query, { 
          categoryName: categoryName.toLowerCase() 
        });
        console.log('Fetched products with stock:', productsData);

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const applyFilters = () => {
    let filtered = [...products];

    // Convert string values to numbers for comparison
    const minPrice = Number(filters.priceRange.min) || 0;
    const maxPrice = Number(filters.priceRange.max) || Infinity;

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= minPrice && 
      product.price <= maxPrice
    );

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stockQuantity > 0);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b._id).getTime() - new Date(a._id).getTime());
        break;
      case 'discount':
        filtered.sort((a, b) => (b.regularDiscount || 0) - (a.regularDiscount || 0));
        break;
    }

    setFilteredProducts(filtered);
    setShowFilters(false);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    // Ensure value is always a string and non-negative
    const sanitizedValue = value === '' ? '0' : value.replace(/^-/, '');
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: sanitizedValue
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <FiFilter />
          Filter & Sort
        </button>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Filter & Sort</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-1/2 border rounded-lg px-3 py-2"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-1/2 border rounded-lg px-3 py-2"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="inStock">In Stock Only</label>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="w-1/2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 