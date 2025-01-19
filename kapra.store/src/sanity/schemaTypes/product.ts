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
      type: 'string',
      options: {
        list: [
          { title: 'Shirts', value: 'shirts' },
          { title: 'Pants', value: 'pants' },
          { title: 'Complete Suits', value: 'suits' },
          { title: 'Kids', value: 'kids' },
        ],
      },
      validation: (rule: Rule) => rule.required(),
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
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (rule: Rule) => rule.required().min(0),
      initialValue: 0,
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
            }
          ]
        }
      ],
      validation: (rule: Rule) => rule.min(1).required(),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
}; 