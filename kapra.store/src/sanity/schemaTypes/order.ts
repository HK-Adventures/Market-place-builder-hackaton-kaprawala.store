import { Rule } from 'sanity';

interface OrderDocument {
  _id: string;
  orderId: string;
  customerInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: string;
  document: {
    status: string;
  };
}

const orderSchema = {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'orderId',
      title: 'Order ID',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    // ... other fields
  ]
};

export default orderSchema;