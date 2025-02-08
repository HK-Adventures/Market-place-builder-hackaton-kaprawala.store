import { defineType, Rule } from 'sanity';

interface PromoCodeDocument {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
}

export default defineType({
  name: 'promoCode',
  title: 'Promo Code',
  type: 'document',
  fields: [
    {
      name: 'code',
      title: 'Code',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      validation: (rule: Rule) => rule.required().min(0)
    },
    {
      name: 'minPurchase',
      title: 'Minimum Purchase Amount',
      type: 'number',
      validation: (rule: Rule) => rule.min(0)
    },
    {
      name: 'dateStart',
      title: 'Valid From',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'dateEnd',
      title: 'Valid Until',
      type: 'datetime',
      initialValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      validation: (rule: Rule) => rule.required()
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
});