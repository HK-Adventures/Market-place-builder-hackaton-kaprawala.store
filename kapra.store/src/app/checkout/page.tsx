'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { shippingService } from '../../lib/shippingService';

interface ShippingInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  area: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingRate {
  cost: number;
  currency: string;
  estimatedDays: number;
  service: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    area: '',
    city: '',
    postalCode: '',
    country: 'Pakistan'
  });
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Calculate shipping cost when postal code and city are entered
  useEffect(() => {
    const calculateShipping = async () => {
      if (shippingInfo.city && shippingInfo.postalCode) {
        setCalculatingShipping(true);
        try {
          const rate = await shippingService.calculateShippingCost({
            customerInfo: {
              city: shippingInfo.city,
              postalCode: shippingInfo.postalCode
            },
            items: cart
          });
          setShippingRate(rate);
        } catch (error) {
          console.error('Error calculating shipping:', error);
        } finally {
          setCalculatingShipping(false);
        }
      }
    };

    calculateShipping();
  }, [shippingInfo.city, shippingInfo.postalCode, cart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return (
      shippingInfo.fullName &&
      shippingInfo.email &&
      shippingInfo.phoneNumber &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.postalCode
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Store both shipping info and shipping rate in session storage
      sessionStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
      sessionStorage.setItem('shippingRate', JSON.stringify(shippingRate));
      router.push('/checkout/payment');
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push('/products')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={shippingInfo.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address *
              </label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area *
              </label>
              <input
                type="text"
                name="area"
                value={shippingInfo.area}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="e.g., DHA Phase 1, Gulberg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={shippingInfo.country}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            {/* Shipping Cost Display */}
            {calculatingShipping ? (
              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <p className="text-center text-gray-600">Calculating shipping cost...</p>
              </div>
            ) : shippingRate && (
              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Shipping Cost:</span>
                    <span>PKR {shippingRate.cost.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Estimated Delivery:</span>
                    <span>{shippingRate.estimatedDays} days</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Service Level:</span>
                    <span className="capitalize">{shippingRate.service}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>PKR {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
                </p>
                {shippingRate && (
                  <p className="flex justify-between">
                    <span>Shipping:</span>
                    <span>PKR {shippingRate.cost.toLocaleString()}</span>
                  </p>
                )}
                <div className="border-t pt-2 mt-2">
                  <p className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                      PKR {(
                        cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
                        (shippingRate?.cost || 0)
                      ).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 