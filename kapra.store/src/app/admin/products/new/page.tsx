'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '../../../../sanity/client';
import { supabase } from '../../../../lib/supabase';
import { urlFor } from '../../../../sanity/lib/image';

interface Category {
  _id: string;
  name: string;
}

interface ProductImage {
  _key: string;
  _type: string;
  asset: {
    _type: string;
    _ref: string;
  };
  alt: string;
  isPrimary: boolean;
  [key: string]: any;  // Add index signature to allow additional properties
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    images: [] as File[],
    customSize: '',
    customColor: ''
  });
  const [images, setImages] = useState<ProductImage[]>([]);

  // Available options
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Brown'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const query = `*[_type == "category" && !(_id in path("drafts.**"))] {
        _id,
        name,
        isActive
      } | order(name asc)`;
      const result = await client.fetch(query);
      setCategories(result.filter((cat: any) => cat.isActive !== false));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleAddCustomSize = () => {
    if (formData.customSize && !formData.sizes.includes(formData.customSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, prev.customSize],
        customSize: ''
      }));
    }
  };

  const handleAddCustomColor = () => {
    if (formData.customColor && !formData.colors.includes(formData.customColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, prev.customColor],
        customColor: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Upload images first
      const imagePromises = await Promise.all(
        formData.images.map(async (file) => {
          const imageAsset = await client.assets.upload('image', file);
          return {
            _key: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            _type: 'image',
            asset: {
              _type: 'reference' as const,
              _ref: imageAsset._id
            },
            alt: file.name,
            isPrimary: images.length === 0 // First image is primary by default
          };
        })
      );

      const uploadedImages = await Promise.all(imagePromises);
      setImages(prev => [...prev, ...uploadedImages]);

      // Create product document
      const doc = {
        _type: 'product',
        name: formData.name,
        slug: {
          _type: 'slug',
          current: formData.name.toLowerCase().replace(/\s+/g, '-')
        },
        description: formData.description,
        price: parseFloat(formData.price),
        category: {
          _type: 'reference',
          _ref: formData.category
        },
        images: uploadedImages,
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        sku: formData.sku,
        filters: {
          size: formData.sizes,
          color: formData.colors
        }
      };

      await client.create(doc);
      router.push('/admin/products');
      alert('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          },
          alt: file.name,
          isPrimary: images.length === 0 // First image is primary by default
        };
      });

      try {
        const uploadedImages = await Promise.all(imagePromises);
        setImages(prev => [...prev, ...uploadedImages]);
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('Failed to upload some images');
      }
    }
  };

  const handleRemoveImage = (imageKey: string) => {
    setImages(images.filter(img => img._key !== imageKey));
  };

  const handleSetPrimaryImage = (imageKey: string) => {
    setImages(images.map(img => ({
      ...img,
      isPrimary: img._key === imageKey
    })));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-900 bg-white"
          >
            <option value="" className="text-gray-500">Select a category</option>
            {categories.map(category => (
              <option 
                key={category._id} 
                value={category._id}
                className="text-gray-900"
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price (PKR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {availableSizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`px-4 py-2 rounded ${
                  formData.sizes.includes(size)
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              name="customSize"
              value={formData.customSize}
              onChange={handleChange}
              placeholder="Add custom size"
              className="border rounded-md shadow-sm p-2"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          {formData.sizes.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected sizes: {formData.sizes.join(', ')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {availableColors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorToggle(color)}
                className={`px-4 py-2 rounded ${
                  formData.colors.includes(color)
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              name="customColor"
              value={formData.customColor}
              onChange={handleChange}
              placeholder="Add custom color"
              className="border rounded-md shadow-sm p-2"
            />
            <button
              type="button"
              onClick={handleAddCustomColor}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          {formData.colors.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected colors: {formData.colors.join(', ')}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={image._key} className="relative group">
                <img
                  src={urlFor(image).width(200).height(200).url()}
                  alt={image.alt || `Product image ${index + 1}`}
                  className={`w-full h-32 object-cover rounded-lg ${
                    image.isPrimary ? 'ring-2 ring-blue-500' : ''
                  }`}
                />
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(image._key!)}
                    className={`p-1 rounded-full ${
                      image.isPrimary 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white'
                    }`}
                    title={image.isPrimary ? 'Primary Image' : 'Set as Primary'}
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image._key!)}
                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            <p className="mt-2 text-sm text-gray-500">
              You can select multiple images at once. First uploaded image will be set as primary by default.
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
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
} 