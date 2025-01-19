import { defineType } from 'sanity'

export const customerSchema = defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  fields: [
    { name: 'customerId', title: 'Customer ID', type: 'string' },
    { name: 'fullName', title: 'Full Name', type: 'string' },
    { name: 'email', title: 'E-Mail', type: 'string' },
    { name: 'phoneNumber', title: 'Phone Number', type: 'string' },
    { name: 'address', title: 'Address', type: 'string' },
  ],
}) 