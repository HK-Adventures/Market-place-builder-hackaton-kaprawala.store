import { client } from '../../sanity/client';
import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { urlFor } from '../../sanity/lib/image';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  images?: Array<{
    asset: {
      _ref: string;
      _type: string;
    }
  }>;
  stockQuantity: number;
  category?: {
    name: string;
  };
  colors?: Array<{ name: string; stockQuantity: number }>;
  sizes?: Array<{ name: string; stockQuantity: number }>;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await client.fetch(`*[_type == "product"]`);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <Link 
              key={product._id}
              href={`/products/${product._id}`}
              className="group relative"
            >
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                {product.images && product.images[0] && (
                  <Image
                    src={urlFor(product.images[0]).url()}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                )}
              </div>

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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;