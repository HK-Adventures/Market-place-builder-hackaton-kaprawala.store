'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../../../sanity/client';
import { supabase } from '../../../../../lib/supabase';
import Image from 'next/image';
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
  };
  alt?: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const id = React.use(Promise.resolve(params.id));
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stockQuantity: '0',
    inStock: true,
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as any[]
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newColor, setNewColor] = useState('');
  const defaultColors = ['black', 'white', 'blue', 'red', 'green', 'brown', 'gray'];

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "category"] {
        _id,
        name
      } | order(name asc)`;
      const result = await client.fetch(query);
      setCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
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
          inStock
        }`,
        { id }
      );

      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category?._id || '',
          colors: product.colors || [],
          sizes: product.sizes || [],
          stockQuantity: product.stockQuantity || 0,
          inStock: product.inStock || false
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

      // Upload new images if any
      const newImageAssets = await Promise.all(
        newImages.map(async (file) => {
          const imageAsset = await client.assets.upload('image', file);
          return {
            _type: 'image',
            asset: {
              _type: "reference",
              _ref: imageAsset._id
            }
          };
        })
      );

      // Combine existing and new images
      const updatedImages = [...existingImages, ...newImageAssets];

      // Update product document
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
          inStock: formData.inStock,
          stockQuantity: parseInt(formData.stockQuantity),
          sku: formData.sku,
          filters: {
            size: formData.sizes,
            color: formData.colors
          },
          image: updatedImages[0] || null, // Set first image as main image
          images: updatedImages
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
          <div className="grid grid-cols-3 gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <label key={size} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sizes.includes(size)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                    } else {
                      setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
          
          {/* Default color options */}
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

          {/* Custom color input */}
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

          {/* Selected colors display */}
          {formData.colors.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Colors</label>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
                  >
                    <span className="capitalize">{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {existingImages.map((image, index) => (
              <div key={image._key} className="relative group">
                <div className="relative h-32 w-full">
                  <Image
                    src={urlFor(image).width(200).height(200).url()}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(image._key!)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-700">Add New Images</label>
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
              hover:file:bg-blue-100"
          />
          {newImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">New images to upload:</p>
              <div className="grid grid-cols-4 gap-4">
                {Array.from(newImages).map((file, index) => (
                  <div key={index} className="relative h-32">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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