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
  selectedColor?: string;
  selectedSize?: string;
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
}

// Add Product interface
interface Product {
  _id: string;
  name: string;
  price: number;
  stockQuantity: number;
  colors?: string[];
  sizes?: string[];
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
}

// Define the type for the context value
interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isAuthenticated: boolean;
  calculateTotal: () => number;
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
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // First useEffect - mounting and cart loading
  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Second useEffect - cart saving
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, mounted]);

  // Third useEffect - auth handling
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setCart([]);
        localStorage.removeItem('cart');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item._id === product._id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );

      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity >= product.stockQuantity) {
          return prevCart;
        }
        return prevCart.map(item =>
          item._id === product._id && 
          item.selectedSize === size && 
          item.selectedColor === color
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.stockQuantity) }
            : item
        );
      }
      return [...prevCart, {
        _id: product._id,
        name: product.name,
        price: product.price,
        stockQuantity: product.stockQuantity,
        image: product.image,
        quantity,
        selectedSize: size,
        selectedColor: color
      }];
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
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cart,
    cartItems: cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isAuthenticated,
    calculateTotal
  };

  // Render null or provider based on mounted state
  return mounted ? <CartContext.Provider value={value}>{children}</CartContext.Provider> : null;
}; 