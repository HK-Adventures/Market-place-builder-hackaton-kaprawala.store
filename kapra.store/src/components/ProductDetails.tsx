'use client'
import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '../sanity/lib/image';
import { useCart } from '../context/CartContext';
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

export default function ProductDetails({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0]?.name || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0]?.name || ''
  );
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color');
      return;
    }
    
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.salePrice || product.regularPrice,
      image: product.images[0],
      selectedColor,
      selectedSize,
      quantity: 1,
      stockQuantity: product.stockQuantity
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={urlFor(product.images[selectedImage]).url()}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {/* Thumbnail Gallery */}
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-black' : ''
                }`}
              >
                <Image
                  src={urlFor(image).url()}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          {/* Price */}
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {product.salePrice ? (
                <>
                  <span className="text-red-600">
                    PKR {product.salePrice.toLocaleString()}
                  </span>
                  <span className="ml-2 text-gray-500 line-through text-lg">
                    PKR {product.regularPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                <span>PKR {product.regularPrice.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedColor === color.name
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedSize === size.name
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-4 mb-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={decrementQuantity}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 