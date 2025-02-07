import { client } from '../sanity/client';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { urlFor } from '../sanity/lib/image';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await client.fetch(`*[_type == "product"]`);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <Image 
              src={urlFor(product.image).url()} 
              alt={product.name}
              width={500}
              height={500}
              className="w-full h-auto"
            />
            <button onClick={() => addToCart({ ...product, quantity: 1 })}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;