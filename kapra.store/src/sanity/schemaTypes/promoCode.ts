export default {
  name: 'promoCode',
  title: 'Promo Code',
  type: 'document',
  fields: [
    {
      name: 'code',
      title: 'Code',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'discountPercentage',
      title: 'Discount Percentage',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100)
    },
    {
      name: 'discountAmount',
      title: 'Discount Amount',
      type: 'number',
      validation: (Rule: any) => Rule.min(0)
    },
    {
      name: 'minimumPurchase',
      title: 'Minimum Purchase Amount',
      type: 'number',
      validation: (Rule: any) => Rule.min(0)
    },
    {
      name: 'dateStart',
      title: 'Valid From',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'dateEnd',
      title: 'Valid Until',
      type: 'datetime',
      initialValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    }
  ]
}; 