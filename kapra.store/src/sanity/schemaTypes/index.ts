import { type SchemaTypeDefinition } from 'sanity'
import productSchema from './product'
import { orderSchema } from './order'
import { customerSchema } from './customer'
import { deliverySchema } from './delivery'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productSchema, orderSchema, customerSchema, deliverySchema],
}
