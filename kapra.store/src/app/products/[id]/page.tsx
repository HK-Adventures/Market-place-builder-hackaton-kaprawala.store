import { Metadata } from 'next';
import { ProductClient } from './ProductClient';
import { client } from '../../../sanity/client';
import { Image as SanityImage } from 'sanity';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<any>;
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

export default async function ProductPage({ 
  params 
}: PageProps) {
  const resolvedParams = await params;
  const product: Product = await client.fetch(`*[_type == "product" && _id == $id][0]`, { 
    id: resolvedParams.id 
  });
  return <ProductClient product={product} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product: Product = await client.fetch(`*[_type == "product" && _id == $id][0]`, { 
    id: resolvedParams.id 
  });
  return {
    title: product?.name ?? 'Product',
    description: product?.description ?? 'Product description'
  };
} 