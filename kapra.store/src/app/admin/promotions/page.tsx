'use client'
import React, { useState, useEffect } from 'react';
import { client } from '../../../sanity/client';
import { format } from 'date-fns';

interface Promotion {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
}

interface EditingPromotion {
  _id: string;
  code: string;
  discountValue: number;
  startDate: string;
  endDate: string;
}

interface PromotionFormData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  isUnlimited: boolean;
  minPurchase: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PromotionFormData>({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isUnlimited: false,
    minPurchase: '0'
  });
  const [editingPromo, setEditingPromo] = useState<EditingPromotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    const filtered = promotions.filter(promo => 
      promo.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPromotions(filtered);
  }, [searchQuery, promotions]);

  const fetchPromotions = async () => {
    try {
      const data = await client.fetch(`
        *[_type == "promotion"] | order(startDate desc) {
          _id,
          code,
          discountType,
          discountValue,
          minPurchase,
          startDate,
          endDate,
          isActive,
          usageCount,
          usageLimit
        }
      `);
      setPromotions(data);
      setFilteredPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (promoId: string, currentStatus: boolean) => {
    try {
      await client
        .patch(promoId)
        .set({ isActive: !currentStatus })
        .commit();
      
      setPromotions(promotions.map(promo => 
        promo._id === promoId 
          ? { ...promo, isActive: !currentStatus }
          : promo
      ));
    } catch (error) {
      console.error('Error toggling promotion status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.create({
        _type: 'promotion',
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        usageLimit: formData.isUnlimited ? null : Number(formData.usageLimit),
        isActive: true,
        usageCount: 0
      });
      
      setShowForm(false);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isUnlimited: false,
        minPurchase: '0'
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo({
      _id: promo._id,
      code: promo.code,
      discountValue: promo.discountValue,
      startDate: promo.startDate,
      endDate: promo.endDate
    });
  };

  const handleSave = async () => {
    if (!editingPromo) return;

    try {
      await client
        .patch(editingPromo._id)
        .set({
          code: editingPromo.code,
          discountValue: editingPromo.discountValue,
          startDate: editingPromo.startDate,
          endDate: editingPromo.endDate
        })
        .commit();

      setEditingPromo(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
    }
  };

  const handleCancel = () => {
    setEditingPromo(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : 'Create New Promotion'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search promotions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 border rounded-lg px-4 py-2"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Promo Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Value {formData.discountType === 'percentage' ? '(%)' : '(PKR)'}
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
                min="0"
                max={formData.discountType === 'percentage' ? "100" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Purchase Amount (PKR)
              </label>
              <input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                min="0"
                placeholder="0 for no minimum"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isUnlimited}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isUnlimited: e.target.checked,
                    usageLimit: e.target.checked ? '' : formData.usageLimit 
                  })}
                  className="rounded"
                />
                <span>Unlimited Usage</span>
              </label>
            </div>
            {!formData.isUnlimited && (
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                  required={!formData.isUnlimited}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Create Promotion
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPromotions.map((promo) => (
              <tr key={promo._id} className={!promo.isActive ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingPromo?._id === promo._id ? (
                    <input
                      type="text"
                      value={editingPromo.code}
                      onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{promo.code}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingPromo?._id === promo._id ? (
                    <input
                      type="number"
                      value={editingPromo.discountValue}
                      onChange={(e) => setEditingPromo({ ...editingPromo, discountValue: Number(e.target.value) })}
                      className="border rounded px-2 py-1 w-20"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {promo.discountType === 'percentage' 
                        ? `${promo.discountValue}%`
                        : `PKR ${promo.discountValue.toLocaleString()}`
                      }
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingPromo?._id === promo._id ? (
                    <div className="space-y-2">
                      <input
                        type="datetime-local"
                        value={editingPromo.startDate.split('.')[0]}
                        onChange={(e) => setEditingPromo({ ...editingPromo, startDate: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                      <input
                        type="datetime-local"
                        value={editingPromo.endDate.split('.')[0]}
                        onChange={(e) => setEditingPromo({ ...editingPromo, endDate: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-900">
                        {format(new Date(promo.startDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {format(new Date(promo.endDate), 'MMM d, yyyy')}
                      </div>
                    </>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {promo.usageCount} / {promo.usageLimit || '∞'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    promo.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingPromo?._id === promo._id ? (
                    <div className="space-x-2">
                      <button 
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEdit(promo)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(promo._id, promo.isActive)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      promo.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                        : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    {promo.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 