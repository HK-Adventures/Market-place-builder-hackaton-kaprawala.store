'use client'
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../../../sanity/client';
import { supabase } from '../../../../../lib/supabase';
import { urlFor } from '../../../../../sanity/lib/image';
import React from 'react';

interface Category {
  _id: string;
  name: string;
}

interface ProductImage {
  _key?: string;
  asset: {
    _ref: string;
    _type: 'reference';
  };
  color?: string;
  alt?: string;
  [key: string]: any;  // Add index signature
}

interface EditProductContentProps {
  id: string;
}

function EditProductContent({ id }: EditProductContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0',
    category: '',
    stockQuantity: '0',
    sku: '',
    images: [] as ProductImage[],
    filters: {
      size: [] as string[],
      color: [] as string[]
    },
    colors: [] as string[],
    sizes: [] as string[],
    inStock: true
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newColor, setNewColor] = useState('');
  const [customSize, setCustomSize] = useState('');
  const defaultColors = ['black', 'white', 'blue', 'red', 'green', 'brown', 'gray'];
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchCategories();
    fetchProduct(id);
  }, [id]);

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "category"] | order(name asc) {
        _id,
        name
      }`;
      const data = await client.fetch(query);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      const product = await client.fetch(
        `*[_type == "product" && _id == $id][0]{
          name,
          description,
          price,
          category->{
            _id,
            name
          },
          images,
          colors,
          sizes,
          stockQuantity,
          inStock,
          sku,
          filters
        }`,
        { id: productId }
      );

      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '0',
          category: product.category?._id || '',
          colors: product.colors || [],
          sizes: product.sizes || [],
          stockQuantity: product.stockQuantity?.toString() || '0',
          inStock: product.inStock ?? true,
          images: product.images || [],
          filters: product.filters || { size: [], color: [] },
          sku: product.sku || ''
        });
        setExistingImages(product.images || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current categories:', categories);
    console.log('Current formData:', formData);
  }, [categories, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      await client
        .patch(id)
        .set({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: {
            _type: 'reference',
            _ref: formData.category
          },
          colors: formData.colors,
          sizes: formData.sizes,
          stockQuantity: parseInt(formData.stockQuantity),
          inStock: formData.inStock,
          images: existingImages,
          sku: formData.sku
        })
        .commit();

      router.push('/admin/products');
      alert('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imagePromises = files.map(async (file) => {
        const imageAsset = await client.assets.upload('image', file);
        return {
          _key: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          _type: 'image',
          asset: {
            _type: 'reference' as const,
            _ref: imageAsset._id
          }
        } as ProductImage;
      });

      try {
        const uploadedImages = await Promise.all(imagePromises);
        setExistingImages(prev => [...prev, ...uploadedImages]);
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('Failed to upload some images');
      }
    }
  };

  const handleRemoveExistingImage = (imageKey: string) => {
    setExistingImages(existingImages.filter(img => img._key !== imageKey));
  };

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColor && !formData.colors.includes(newColor.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.toLowerCase()]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const handleAddCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, customSize],
        filters: {
          ...prev.filters,
          size: [...prev.filters.size, customSize]
        }
      }));
      setCustomSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove),
      filters: {
        ...prev.filters,
        size: prev.filters.size.filter(size => size !== sizeToRemove)
      }
    }));
  };

  const handleAddSize = (size: string) => {
    if (!formData.sizes.includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size],
        filters: {
          ...prev.filters,
          size: [...prev.filters.size, size]
        }
      }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (PKR)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => {
                console.log('Selected category:', e.target.value);
                setFormData(prev => ({ ...prev, category: e.target.value }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option 
                  key={category._id} 
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Status</label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">In Stock</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {defaultSizes.map((size) => (
                <button
                  key={`default-size-${size}`}
                  type="button"
                  onClick={() => handleAddSize(size)}
                  disabled={formData.sizes.includes(size)}
                  className={`px-3 py-1 border rounded ${
                    formData.sizes.includes(size) 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Add custom size"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Size
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.sizes.map((size, index) => (
                <div key={`size-${size}-${index}`} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded">
                  <span>{size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {defaultColors.map((color) => (
              <label key={color} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.colors.includes(color)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
                    } else {
                      setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600 capitalize">{color}</span>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Color</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Enter color name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Color
              </button>
            </div>
          </div>

          {formData.colors.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Colors</label>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color, index) => (
                  <div key={`color-${color}-${index}`} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded">
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {existingImages.map((image, index) => (
              <div key={`image-${image._key || index}`} className="relative group">
                <img
                  src={urlFor(image).width(200).height(200).url()}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(image._key!)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            <p className="mt-2 text-sm text-gray-500">
              You can select multiple images at once. Images will be uploaded immediately.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProductContent id={resolvedParams.id} />
    </Suspense>
  );
} 