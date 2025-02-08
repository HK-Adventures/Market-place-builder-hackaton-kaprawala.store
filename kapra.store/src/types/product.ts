import { Image } from 'sanity'

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: Array<{
    asset: {
      _ref: string;
      _type: string;
    };
  }>;
  category: {
    _id: string;
    name: string;
  };
  stockQuantity: number;
} 