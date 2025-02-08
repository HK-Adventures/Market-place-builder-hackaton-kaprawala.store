import { defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: rule => rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: rule => rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: rule => rule.required()
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
      validation: rule => rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: rule => rule.required(),
      options: {
        disableNew: false
      }
    },
    {
      name: 'regularPrice',
      title: 'Regular Price',
      type: 'number',
      validation: rule => rule.min(0)
    },
    {
      name: 'salePrice',
      title: 'Sale Price',
      type: 'number',
      validation: rule => rule.min(0)
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: rule => rule.required().min(0)
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: rule => rule.required().min(0)
    },
    {
      name: 'colors',
      title: 'Available Colors',
      type: 'array',
      validation: rule => {
        return rule.custom(colors => {
          if (!colors || !colors.length) return true;
          return true;
        });
      },
      of: [{
        type: 'object',
        name: 'colorVariant',
        fields: [
          {
            name: 'name',
            title: 'Color Name',
            type: 'string',
            options: {
              list: [
                { title: 'Black', value: 'Black' },
                { title: 'White', value: 'White' },
                { title: 'Blue', value: 'Blue' },
                { title: 'Red', value: 'Red' },
                { title: 'Green', value: 'Green' },
                { title: 'Yellow', value: 'Yellow' },
                { title: 'Brown', value: 'Brown' },
                { title: 'Gray', value: 'Gray' },
                { title: 'Navy', value: 'Navy' },
                { title: 'Beige', value: 'Beige' },
                { title: 'Custom Color', value: 'custom' }
              ]
            }
          },
          {
            name: 'customColorName',
            title: 'Custom Color Name',
            type: 'string',
            hidden: ({ parent }: { parent: { name: string } }) => parent?.name !== 'custom'
          },
          {
            name: 'stockQuantity',
            title: 'Stock Quantity',
            type: 'number',
            validation: rule => rule.required().min(0)
          }
        ]
      }]
    },
    {
      name: 'sizes',
      title: 'Available Sizes',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'name',
            title: 'Size Name',
            type: 'string',
            validation: rule => rule.required()
          },
          {
            name: 'measurements',
            title: 'Measurements',
            type: 'string',
            description: 'Optional measurements for this size'
          },
          {
            name: 'stockQuantity',
            title: 'Stock Quantity for this Size',
            type: 'number',
            validation: rule => rule.required().min(0)
          }
        ],
        preview: {
          select: {
            title: 'name',
            measurements: 'measurements',
            stock: 'stockQuantity'
          },
          prepare({ title, measurements, stock }) {
            return {
              title: `${title} (${stock} in stock)`,
              subtitle: measurements || ''
            }
          }
        }
      }],
      validation: (rule, context) => {
        return rule.custom((sizes) => {
          if (!sizes || !sizes.length) return true;
          return true;
        });
      }
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      validation: (rule, context) => {
        return rule.required();
      }
    }
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category.name',
      media: 'images.0'
    },
    prepare({ title, category, media }) {
      return {
        title,
        subtitle: category,
        media
      }
    }
  }
}) 