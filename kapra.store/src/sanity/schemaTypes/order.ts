import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({
      name: 'orderId',
      title: 'Order ID',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'orderDate',
      title: 'Order Date',
      type: 'datetime',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Paid', value: 'paid' },
          { title: 'Failed', value: 'failed' }
        ]
      }
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          { title: 'Card', value: 'card' },
          { title: 'Cash on Delivery', value: 'cod' }
        ]
      }
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number'
    }),
    defineField({
      name: 'customerInfo',
      title: 'Customer Information',
      type: 'object',
      fields: [
        { name: 'fullName', type: 'string', title: 'Full Name' },
        { name: 'email', type: 'string', title: 'Email' },
        { name: 'phoneNumber', type: 'string', title: 'Phone Number' },
        { name: 'address', type: 'string', title: 'Address' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'postalCode', type: 'string', title: 'Postal Code' },
        { name: 'country', type: 'string', title: 'Country' }
      ]
    }),
    defineField({
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'productId', type: 'string', title: 'Product ID' },
          { name: 'name', type: 'string', title: 'Product Name' },
          { name: 'quantity', type: 'number', title: 'Quantity' },
          { name: 'price', type: 'number', title: 'Price' },
          { name: 'selectedSize', type: 'string', title: 'Selected Size' },
          { name: 'selectedColor', type: 'string', title: 'Selected Color' }
        ]
      }]
    }),
    defineField({
      name: 'shipping',
      title: 'Shipping Information',
      type: 'object',
      fields: [
        { name: 'cost', type: 'number', title: 'Shipping Cost' },
        { name: 'service', type: 'string', title: 'Shipping Service' },
        { name: 'estimatedDays', type: 'number', title: 'Estimated Days' }
      ]
    }),
    defineField({
      name: 'tracking',
      title: 'Tracking Information',
      type: 'object',
      fields: [
        { name: 'number', type: 'string', title: 'Tracking Number' },
        { name: 'courier', type: 'string', title: 'Courier Service' },
        { name: 'createdAt', type: 'datetime', title: 'Created At' }
      ]
    })
  ]
});