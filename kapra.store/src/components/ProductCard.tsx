'use client'
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../sanity/lib/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  images?: Array<{
    asset: {
      _ref: string;
      _type: string;
    }
  }>;
  image?: {
    asset: {
      _ref: string;
      _type: string;
    }
  };
  stockQuantity: number;
  description?: string;
  category?: {
    name: string;
  };
  colors?: Array<{ name: string; stockQuantity: number }>;
  sizes?: Array<{ name: string; stockQuantity: number }>;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product._id}`}>
      <div className="group relative h-[450px] w-full transition-all duration-300 hover:z-10">
        <div className="absolute w-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl">
          {/* Image Container */}
          <div className="relative h-[350px] w-full">
            {product.images?.[0] || product.image ? (
              <Image
                src={urlFor(product.images?.[0] || product.image || { asset: { _ref: '', _type: 'reference' } }).url()}
                alt={product.name}
                fill
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Info Container */}
          <div className="p-4">
            <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
            
            {/* Price */}
            <div className="mt-2">
              {product.salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    PKR {product.salePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    PKR {product.regularPrice?.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-medium text-gray-900">
                  PKR {product.regularPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description - Visible on hover */}
            {product.description && (
              <div className="mt-2 h-0 overflow-hidden text-sm text-gray-500 transition-all duration-300 group-hover:h-auto">
                <p className="line-clamp-2">{product.description}</p>
              </div>
            )}

            {/* Colors and Sizes - Visible on hover */}
            <div className="mt-2 max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-[200px]">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-700">Colors: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {product.colors.map((color) => (
                      <span
                        key={color.name}
                        className="inline-block rounded-full px-2 py-1 text-xs bg-gray-100"
                      >
                        {color.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-700">Sizes: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {product.sizes.map((size) => (
                      <span
                        key={size.name}
                        className="inline-block rounded-full px-2 py-1 text-xs bg-gray-100"
                      >
                        {size.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 