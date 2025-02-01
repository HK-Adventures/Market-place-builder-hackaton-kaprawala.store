'use client'
import { useState, useEffect } from 'react';
import { client } from '../../../sanity/client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  regularDiscount?: number;  // Product-specific discount
  promoCode?: string;       // Promo code for cart-wide discount
  promoDiscount?: number;   // Discount % when promo code is used
  promoExpiry?: string;     // Promo code expiry
}

interface PendingChanges {
  [key: string]: {
    promoCode?: string;
    discount?: number;
    promoExpiry?: string;
    regularDiscount?: number;
  };
}

export default function AdminPromotions() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState<string | null>(null);
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }
    fetchProducts();
  }, [isAdmin, isLoading, router]);

  const fetchProducts = async () => {
    try {
      const data = await client.fetch(`
        *[_type == "product"] {
          _id,
          name,
          price,
          regularDiscount,
          promoCode,
          promoDiscount,
          promoExpiry
        } | order(name asc)
      `);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (productId: string, updates: Partial<Product>) => {
    setPendingChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...updates
      }
    }));
  };

  const handleConfirmChanges = async (productId: string) => {
    const updates = pendingChanges[productId];
    if (!updates) return;

    setSaving(productId);
    try {
      await client
        .patch(productId)
        .set({
          promoCode: updates.promoCode || null,
          promoDiscount: updates.promoDiscount || null,
          promoExpiry: updates.promoExpiry || null,
          regularDiscount: updates.regularDiscount || null,
        })
        .commit();

      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, ...updates }
          : product
      ));

      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[productId];
        return newChanges;
      });

    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveDiscounts = async (productId: string) => {
    if (!confirm('Are you sure you want to remove all discounts from this product?')) return;

    setSaving(productId);
    try {
      await client
        .patch(productId)
        .unset(['promoCode', 'promoDiscount', 'promoExpiry', 'regularDiscount'])
        .commit();
      
      setProducts(products.map(product => 
        product._id === productId 
          ? {
              ...product,
              promoCode: undefined,
              promoDiscount: undefined,
              promoExpiry: undefined,
              regularDiscount: undefined
            }
          : product
      ));

    } catch (error) {
      console.error('Error removing discounts:', error);
      alert('Failed to remove discounts');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setSaving(productId);
    try {
      await client.delete(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setSaving(null);
    }
  };

  const calculateFinalPrice = (product: Product) => {
    const basePrice = product.price;
    
    // Apply regular product discount first
    let discountedPrice = basePrice;
    if (product.regularDiscount) {
      discountedPrice *= (1 - product.regularDiscount / 100);
    }
    
    // Apply promo discount if code exists and not expired
    if (product.promoCode && product.promoDiscount) {
      const expiryDate = product.promoExpiry ? new Date(product.promoExpiry) : null;
      if (!expiryDate || expiryDate > new Date()) {
        discountedPrice *= (1 - product.promoDiscount / 100);
      }
    }
    
    return Math.max(0, discountedPrice).toFixed(2);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid px-2 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <button
          onClick={() => {/* your create promotion handler */}}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Create Promotion
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Base Price</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Regular Discount</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Promo Code</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Promo Discount</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Promo Expiry</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Final Price</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const pending = pendingChanges[product._id];
              const hasChanges = !!pending;

              return (
                <tr key={product._id}>
                  <td className="px-3 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-3 py-4 whitespace-nowrap">PKR {typeof product.price === 'number' ? product.price.toLocaleString() : '0'}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={pending?.regularDiscount ?? product.regularDiscount ?? ''}
                      onChange={(e) => handleChange(product._id, { regularDiscount: parseFloat(e.target.value) })}
                      className="border rounded px-2 py-1 w-20"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={isSaving === product._id}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={pending?.promoCode ?? product.promoCode ?? ''}
                      onChange={(e) => handleChange(product._id, { promoCode: e.target.value })}
                      className="border rounded px-2 py-1"
                      placeholder="Enter code"
                      disabled={isSaving === product._id}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={pending?.discount ?? product.discount ?? ''}
                      onChange={(e) => handleChange(product._id, { discount: parseFloat(e.target.value) })}
                      className="border rounded px-2 py-1 w-20"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={isSaving === product._id}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="datetime-local"
                      value={(pending?.promoExpiry ?? product.promoExpiry ?? '').split('.')[0]}
                      onChange={(e) => handleChange(product._id, { promoExpiry: e.target.value })}
                      className="border rounded px-2 py-1"
                      disabled={isSaving === product._id}
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap font-medium">
                    PKR {calculateFinalPrice(product).toLocaleString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {pendingChanges[product._id] && (
                        <button
                          onClick={() => handleConfirmChanges(product._id)}
                          disabled={isSaving === product._id}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-green-300"
                        >
                          {isSaving === product._id ? 'Saving...' : 'Save'}
                        </button>
                      )}
                      {(product.regularDiscount || product.promoCode || product.promoDiscount) && (
                        <button
                          onClick={() => handleRemoveDiscounts(product._id)}
                          disabled={isSaving === product._id}
                          className="text-red-600 hover:text-red-800 disabled:text-red-300"
                        >
                          Remove Discounts
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 