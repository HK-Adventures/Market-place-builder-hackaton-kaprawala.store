'use client'
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../sanity/lib/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: any[];
  stockQuantity: number;
  category?: {
    name: string;
  };
  description?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = !product.stockQuantity || product.stockQuantity <= 0;

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 relative">
        {isOutOfStock && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 z-10">
            Out of Stock
          </div>
        )}
        <div className="relative h-64 w-full">
          {product.images?.[0] ? (
            <Image
              src={urlFor(product.images[0]).url()}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          {product.category && (
            <p className="text-sm text-gray-500">{product.category.name}</p>
          )}
          <div className="mt-2 flex justify-between items-center">
            <p className="text-lg font-bold text-gray-900">
              PKR {product.price.toLocaleString()}
            </p>
            <p className={`text-sm ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {isOutOfStock ? 'Out of Stock' : `In Stock: ${product.stockQuantity}`}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
} 