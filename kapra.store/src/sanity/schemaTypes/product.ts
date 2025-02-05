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
      }
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (rule: any) => rule.required().min(0)
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'images',
      title: 'Additional Images',
      type: 'array',
      of: [{
        type: 'image',
        options: {
          hotspot: true
        }
      }]
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    },
    {
      name: 'filters',
      title: 'Filters',
      type: 'object',
      fields: [
        {
          name: 'sizes',
          title: 'Available Sizes',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              {title: 'XS', value: 'XS'},
              {title: 'S', value: 'S'},
              {title: 'M', value: 'M'},
              {title: 'L', value: 'L'},
              {title: 'XL', value: 'XL'}
            ]
          }
        },
        {
          name: 'colors',
          title: 'Available Colors',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              {title: 'Black', value: 'Black'},
              {title: 'White', value: 'White'},
              {title: 'Blue', value: 'Blue'},
              {title: 'Green', value: 'Green'},
              {title: 'Gray', value: 'Gray'},
              {title: 'Brown', value: 'Brown'}
            ]
          }
        }
      ]
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (rule: any) => rule.required().min(0)
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category.name',
      media: 'mainImage'
    }
  }
}) 