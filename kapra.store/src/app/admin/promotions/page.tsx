'use client'
import { useState, useEffect } from 'react';
import { client } from '../../../sanity/client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  promoCode?: string;
  discount?: number;
  promoExpiry?: string;
  regularDiscount?: number;
  price: number;
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
  const [saving, setSaving] = useState<string | null>(null);
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
      const data = await client.fetch(`*[_type == "product"]{
        _id,
        name,
        price,
        promoCode,
        discount,
        promoExpiry,
        regularDiscount,
        "price": coalesce(price, 0)
      }`);
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
          discount: updates.discount || null,
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
    if (!confirm('Are you sure you want to remove all discounts?')) return;

    setSaving(productId);
    try {
      await client
        .patch(productId)
        .unset(['promoCode', 'discount', 'promoExpiry', 'regularDiscount'])
        .commit();
      
      setProducts(products.map(product => 
        product._id === productId 
          ? {
              ...product,
              promoCode: undefined,
              discount: undefined,
              promoExpiry: undefined,
              regularDiscount: undefined
            }
          : product
      ));

      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[productId];
        return newChanges;
      });

    } catch (error) {
      console.error('Error removing discounts:', error);
      alert('Failed to remove discounts. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const calculateFinalPrice = (product: Product, pending?: Partial<Product>) => {
    if (typeof product.price !== 'number') {
      return '0.00';
    }

    const basePrice = product.price;
    const regularDiscount = pending?.regularDiscount ?? product.regularDiscount ?? 0;
    const promoDiscount = pending?.discount ?? product.discount ?? 0;
    
    let finalPrice = basePrice;
    
    if (regularDiscount && regularDiscount > 0) {
      finalPrice = finalPrice * (1 - regularDiscount / 100);
    }
    
    if (promoDiscount && promoDiscount > 0) {
      finalPrice = finalPrice * (1 - promoDiscount / 100);
    }
    
    finalPrice = Math.max(0, finalPrice);
    
    return finalPrice.toFixed(2);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Discounts & Promotions</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Discount (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo Discount (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const pending = pendingChanges[product._id];
              const hasChanges = !!pending;
              const isSaving = saving === product._id;

              return (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">PKR {typeof product.price === 'number' ? product.price.toLocaleString() : '0'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={pending?.regularDiscount ?? product.regularDiscount ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        handleChange(product._id, { regularDiscount: value });
                      }}
                      className="border rounded px-2 py-1 w-20"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={isSaving}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={pending?.promoCode ?? product.promoCode ?? ''}
                      onChange={(e) => handleChange(product._id, { promoCode: e.target.value })}
                      className="border rounded px-2 py-1"
                      placeholder="Enter code"
                      disabled={isSaving}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={pending?.discount ?? product.discount ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        handleChange(product._id, { discount: value });
                      }}
                      className="border rounded px-2 py-1 w-20"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={isSaving}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="datetime-local"
                      value={(pending?.promoExpiry ?? product.promoExpiry ?? '').split('.')[0]}
                      onChange={(e) => handleChange(product._id, { promoExpiry: e.target.value })}
                      className="border rounded px-2 py-1"
                      disabled={isSaving}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    PKR {calculateFinalPrice(product, pending).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {hasChanges && (
                      <button
                        onClick={() => handleConfirmChanges(product._id)}
                        disabled={isSaving}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-green-300"
                      >
                        {isSaving ? 'Saving...' : 'Confirm'}
                      </button>
                    )}
                    {(product.regularDiscount || product.promoCode || product.discount) && (
                      <button
                        onClick={() => handleRemoveDiscounts(product._id)}
                        disabled={isSaving}
                        className="text-red-600 hover:text-red-800 disabled:text-red-300 ml-2"
                      >
                        Remove All
                      </button>
                    )}
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