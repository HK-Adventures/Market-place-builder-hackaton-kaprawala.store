import { Metadata } from 'next';
import { ProductClient } from './ProductClient';
import { client } from '../../../sanity/client';
import { Image as SanityImage } from 'sanity';

interface ProductParams {
  params: {
    id: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  regularPrice: number;
  images: SanityImage[];
  stockQuantity: number;
  category?: string;
  colors?: Array<{ name: string; stockQuantity: number }>;
  sizes?: Array<{ name: string; stockQuantity: number }>;
  salePrice?: number;
}

export default async function ProductPage({ params }: ProductParams) {
  const product: Product = await client.fetch(`*[_type == "product" && _id == $id][0]`, { 
    id: params.id 
  });
  return <ProductClient product={product} />;
}

export async function generateMetadata({ params }: ProductParams): Promise<Metadata> {
  const resolvedParams = params;
  const product: Product = await client.fetch(`*[_type == "product" && _id == $id][0]`, { 
    id: resolvedParams.id 
  });
  return {
    title: product?.name ?? 'Product',
    description: product?.description ?? 'Product description'
  };
} 