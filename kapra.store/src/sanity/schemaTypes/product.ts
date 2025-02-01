import { Rule } from '@sanity/types';

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name'
      }
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in PKR'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule: Rule) => rule.required(),
      options: {
        disableNew: false,
        modal: {
          type: 'popup'
        }
      }
    },
    {
      name: 'filters',
      title: 'Filters',
      type: 'object',
      fields: [
        {
          name: 'size',
          title: 'Size',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'XS', value: 'XS' },
              { title: 'S', value: 'S' },
              { title: 'M', value: 'M' },
              { title: 'L', value: 'L' },
              { title: 'XL', value: 'XL' },
              { title: 'XXL', value: 'XXL' },
            ],
          },
        },
        {
          name: 'color',
          title: 'Color',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'Black', value: 'black' },
              { title: 'White', value: 'white' },
              { title: 'Blue', value: 'blue' },
              { title: 'Red', value: 'red' },
              { title: 'Green', value: 'green' },
              { title: 'Brown', value: 'brown' },
              { title: 'Gray', value: 'gray' },
            ],
          },
        },
      ],
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (Rule: Rule) => Rule.required().min(0),
      initialValue: 0,
      description: 'Number of items in stock'
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
      description: 'Automatically managed based on stock quantity',
      readOnly: true,
      options: {
        hidden: true // Hide from Studio UI since it's computed
      }
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
            storeOriginalFilename: true,
            accept: 'image/*'
          },
          fields: [
            {
              name: 'color',
              title: 'Color',
              type: 'string',
              options: {
                list: [
                  { title: 'Black', value: 'black' },
                  { title: 'White', value: 'white' },
                  { title: 'Blue', value: 'blue' },
                  { title: 'Red', value: 'red' },
                  { title: 'Green', value: 'green' },
                  { title: 'Brown', value: 'brown' },
                  { title: 'Gray', value: 'gray' },
                ],
              },
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
              validation: (Rule: Rule) => Rule.required()
            },
            {
              name: 'isPrimary',
              title: 'Primary Image',
              type: 'boolean',
              description: 'Set as primary product image',
              initialValue: false
            }
          ]
        }
      ],
      validation: (rule: Rule) => rule.min(1).required().custom((images: any[]) => {
        const primaryImages = images?.filter(img => img.isPrimary);
        if (!primaryImages || primaryImages.length === 0) {
          return 'At least one image must be set as primary';
        }
        if (primaryImages.length > 1) {
          return 'Only one image can be set as primary';
        }
        return true;
      })
    },
    {
      name: 'regularDiscount',
      title: 'Regular Product Discount',
      type: 'number',
      description: 'Product-specific discount percentage (0-100)',
      validation: (Rule: Rule) => Rule.min(0).max(100),
      initialValue: 0
    },
    {
      name: 'promoCode',
      title: 'Promotion Code',
      type: 'string',
      description: 'Code for cart-wide discount',
      validation: (Rule: Rule) => Rule.custom((promoCode: string, context: any) => {
        if (context.document.promoDiscount && !promoCode) {
          return 'Promo code is required when promo discount is set';
        }
        return true;
      })
    },
    {
      name: 'promoDiscount',
      title: 'Promotion Discount',
      type: 'number',
      description: 'Cart-wide discount percentage (0-100) when promo code is used',
      validation: (Rule: Rule) => Rule.min(0).max(100).custom((promoDiscount: number, context: any) => {
        if (promoDiscount && !context.document.promoCode) {
          return 'Promo code is required when setting a promo discount';
        }
        return true;
      }),
      initialValue: 0
    },
    {
      name: 'promoExpiry',
      title: 'Promotion Expiry Date',
      type: 'datetime',
      description: 'When this promo code expires',
      validation: (Rule: Rule) => Rule.custom((promoExpiry: string, context: any) => {
        if (context.document.promoCode && !promoExpiry) {
          return 'Expiry date is required when promo code is set';
        }
        return true;
      })
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
  hooks: {
    async beforeSave(doc: any) {
      // Update inStock based on stockQuantity
      doc.inStock = doc.stockQuantity > 0;
      return doc;
    }
  }
}; 