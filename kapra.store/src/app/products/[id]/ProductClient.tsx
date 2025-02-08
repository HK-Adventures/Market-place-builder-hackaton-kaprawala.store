'use client'
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { urlFor } from '../../../sanity/lib/image';
import { Image as SanityImage } from 'sanity';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  regularPrice: number;
  salePrice?: number;
  images: SanityImage[];
  stockQuantity: number;
  colors?: Array<{
    name: string;
    stockQuantity: number;
  }>;
  sizes?: Array<{
    name: string;
    stockQuantity: number;
  }>;
}

interface ProductClientProps {
  product: Product;
}

export function ProductClient({ product }: ProductClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images[0],
      quantity,
      selectedSize,
      selectedColor,
      stockQuantity: product.stockQuantity
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-96 w-full">
            <Image
              src={urlFor(product.images[selectedImage]).url()}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-24 w-full ${
                  selectedImage === index ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <Image
                  src={urlFor(image).url()}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>

          <div className="space-y-2">
            <p className="text-2xl font-bold">
              {product.salePrice ? (
                <>
                  <span className="text-red-500">PKR {product.salePrice}</span>
                  <span className="ml-2 text-gray-400 line-through">
                    PKR {product.regularPrice}
                  </span>
                </>
              ) : (
                <span>PKR {product.regularPrice}</span>
              )}
            </p>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Color</p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-4 py-2 border rounded ${
                      selectedColor === color.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="space-y-2">
            <p className="font-medium">Quantity</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 