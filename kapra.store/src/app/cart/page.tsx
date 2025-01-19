'use client'
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { urlFor } from '../../sanity/lib/image';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({}); // For input fields

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (productId: string, value: string) => {
    // Always update the input field value
    setQuantities({ ...quantities, [productId]: value });

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const item = cart.find(item => item._id === productId);
      if (item) {
        if (numValue <= item.stockQuantity && numValue > 0) {
          updateQuantity(productId, numValue);
        }
      }
    }
  };

  const handleBlur = (productId: string) => {
    const value = quantities[productId];
    const currentItem = cart.find(item => item._id === productId);
    
    if (!currentItem) return;

    const numValue = parseInt(value);
    
    if (!value || isNaN(numValue) || numValue <= 0) {
      // Reset to current quantity if invalid
      setQuantities({ ...quantities, [productId]: currentItem.quantity.toString() });
    } else if (numValue > currentItem.stockQuantity) {
      // Cap at max stock
      updateQuantity(productId, currentItem.stockQuantity);
      setQuantities({ ...quantities, [productId]: currentItem.stockQuantity.toString() });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link 
            href="/products" 
            className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <div key={item._id} className="flex items-center gap-4 border-b border-gray-200 py-4">
              <img
                src={urlFor(item.image).width(100).height(100).url()}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600">PKR {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                    className="px-3 py-1 border rounded hover:bg-gray-100 text-black bg-white"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantities[item._id] || item.quantity}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    onBlur={() => handleBlur(item._id)}
                    className="w-16 text-center border rounded px-2 py-1 text-black bg-white"
                  />
                  <button
                    onClick={() => updateQuantity(item._id, Math.min(item.stockQuantity, item.quantity + 1))}
                    disabled={item.quantity >= item.stockQuantity}
                    className={`px-3 py-1 border rounded text-black bg-white ${
                      item.quantity >= item.stockQuantity 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">
                    {item.stockQuantity > 0 
                      ? `${item.stockQuantity - item.quantity} left in stock` 
                      : 'Out of stock'}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>PKR {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>PKR {total.toLocaleString()}</span>
            </div>
          </div>
          <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
} 