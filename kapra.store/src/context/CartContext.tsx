'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Define the type for cart items
interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  filters?: {
    size?: string[];
    color?: string[];
  };
}

// Add Product interface
interface Product {
  _id: string;
  name: string;
  price: number;
  stockQuantity: number;
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  filters?: {
    size?: string[];
    color?: string[];
  };
}

// Define the type for the context value
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// CartProvider component
export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Handle auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setCart([]);
        localStorage.removeItem('cart'); // Clear cart from localStorage on logout
      } else if (event === 'SIGNED_IN') {
        // Restore cart from localStorage if exists
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    });

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setCart([]);
        localStorage.removeItem('cart');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity >= product.stockQuantity) {
          return prevCart;
        }
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stockQuantity) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId
          ? { ...item, quantity: Math.min(quantity, item.stockQuantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}; 