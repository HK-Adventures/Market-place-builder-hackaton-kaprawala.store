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
      validation: (rule: any) => rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (rule: any) => rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
      validation: (rule: any) => rule.required().min(1)
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule: any) => rule.required()
    },
    {
      name: 'regularPrice',
      title: 'Regular Price',
      type: 'number',
      validation: (rule: any) => rule.required().positive()
    },
    {
      name: 'salePrice',
      title: 'Sale Price',
      type: 'number',
      validation: (rule: any) => rule.positive(),
      description: 'Leave empty if not on sale'
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (rule: any) => rule.required().min(0)
    },
    {
      name: 'colors',
      title: 'Available Colors',
      type: 'array',
      validation: (rule: any) => rule.min(0),
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
            validation: (rule: any) => rule.required().min(0)
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
            validation: (rule: any) => rule.required()
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
            validation: (rule: any) => rule.required().min(0)
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
      }]
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
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