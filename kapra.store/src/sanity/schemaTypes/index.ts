import { type SchemaTypeDefinition } from 'sanity'
import product from './product'
import category from './category'
import order from './order'
import customer from './customer'
import promotion from './promotion'
import { deliverySchema } from './delivery'
import promoCode from './promoCode'

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  category,
  order,
  customer,
  promotion,
  deliverySchema,
  promoCode
]
