import { defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    { name: 'orderId', title: 'Order ID', type: 'string' },
    { name: 'customerInfo', title: 'Customer Info', type: 'object', fields: [
      { name: 'fullName', title: 'Full Name', type: 'string' },
      { name: 'email', title: 'E-Mail', type: 'string' },
      { name: 'phoneNumber', title: 'Phone Number', type: 'string' },
      { name: 'address', title: 'Address', type: 'string' },
    ]},
    { name: 'productName', title: 'Product Name', type: 'string' },
    { name: 'totalCharges', title: 'Total Charges', type: 'number' },
    { name: 'paymentMethod', title: 'Payment Method', type: 'string' },
    { name: 'status', title: 'Status of Parcel', type: 'string' },
    { name: 'orderDate', title: 'Order Date', type: 'datetime' },
  ],
}) 