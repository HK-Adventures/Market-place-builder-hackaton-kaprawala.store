import { defineField, defineType, Rule, ValidationContext, SanityDocument, StringRule, NumberRule, DatetimeRule } from 'sanity'


export default defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Promo Code',
      type: 'string',
      validation: (rule: StringRule) => rule.required()
    }),
    defineField({
      name: 'discountType',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage', value: 'percentage' },
          { title: 'Fixed Amount', value: 'fixed' }
        ]
      },
      validation: (rule: StringRule) => rule.required()
    }),
    defineField({
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      validation: (rule: NumberRule) => rule.required().positive()
    }),
    defineField({
      name: 'minPurchase',
      title: 'Minimum Purchase Amount',
      type: 'number',
      description: 'Minimum order amount required to use this promo code (0 for no minimum)',
      initialValue: 0,
      validation: (rule: NumberRule) => rule.min(0)
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: (rule: DatetimeRule) => rule.required()
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      validation: (rule: DatetimeRule) => rule.required().min(rule.valueOfField('startDate'))
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'hasUsageLimit',
      title: 'Limit Number of Uses',
      type: 'boolean',
      initialValue: false,
      description: 'Enable to set a maximum number of times this code can be used'
    }),
    defineField({
      name: 'usageLimit',
      title: 'Usage Limit',
      type: 'number',
      hidden: ({ document }) => !document?.hasUsageLimit,
      validation: (rule: NumberRule) => rule.positive().integer(),
      description: 'Maximum number of times this code can be used'
    }),
    defineField({
      name: 'usageCount',
      title: 'Times Used',
      type: 'number',
      readOnly: true,
      initialValue: 0
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Internal notes about this promo code'
    })
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
    prepare(selection) {
      const { title, discountType, discountValue, isActive, usageCount, usageLimit, hasUsageLimit } = selection
      const usage = hasUsageLimit 
        ? `(${usageCount}/${usageLimit} uses)` 
        : `(${usageCount} uses)`
      
      return {
        title: title.toUpperCase(),
        subtitle: `${discountType === 'percentage' ? `${discountValue}%` : `PKR ${discountValue}`} ${usage} ${!isActive ? '(Inactive)' : ''}`
      }
    }
  }
})