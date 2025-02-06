import { defineType } from 'sanity'

export default defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  fields: [
    {
      name: 'code',
      title: 'Promo Code',
      type: 'string',
      validation: (rule: any) => rule.required()
    },
    {
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage', value: 'percentage' },
          { title: 'Fixed Amount', value: 'fixed' }
        ]
      },
      validation: (rule: any) => rule.required()
    },
    {
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      validation: (rule: any) => 
        rule.required().positive()
        .custom((value: number, context: any) => {
          if (context.document.discountType === 'percentage' && value > 100) {
            return 'Percentage cannot be greater than 100'
          }
          return true
        })
    },
    {
      name: 'minPurchase',
      title: 'Minimum Purchase Amount',
      type: 'number',
      description: 'Minimum order amount required to use this promo code (0 for no minimum)',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: (rule: any) => rule.required()
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      validation: (rule: any) => 
        rule.required()
        .min(rule.valueOfField('startDate'))
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'hasUsageLimit',
      title: 'Limit Number of Uses',
      type: 'boolean',
      initialValue: false,
      description: 'Enable to set a maximum number of times this code can be used'
    },
    {
      name: 'usageLimit',
      title: 'Usage Limit',
      type: 'number',
      hidden: ({ document }) => !document?.hasUsageLimit,
      validation: (rule: any) => rule.positive().integer(),
      description: 'Maximum number of times this code can be used'
    },
    {
      name: 'usageCount',
      title: 'Times Used',
      type: 'number',
      readOnly: true,
      initialValue: 0
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Internal notes about this promo code'
    }
  ],
  preview: {
    select: {
      title: 'code',
      discountType: 'discountType',
      discountValue: 'discountValue',
      isActive: 'isActive',
      usageCount: 'usageCount',
      usageLimit: 'usageLimit',
      hasUsageLimit: 'hasUsageLimit'
    },
    prepare({ title, discountType, discountValue, isActive, usageCount, usageLimit, hasUsageLimit }) {
      const usage = hasUsageLimit 
        ? `(${usageCount}/${usageLimit} uses)` 
        : `(${usageCount} uses)`;
      
      return {
        title: title.toUpperCase(),
        subtitle: `${discountType === 'percentage' ? `${discountValue}%` : `PKR ${discountValue}`} ${usage} ${!isActive ? '(Inactive)' : ''}`
      }
    }
  }
}) 