'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Image as SanityImage } from 'sanity';

// Define the type for cart items
interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: SanityImage;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  stockQuantity: number;
}

// Add Product interface
// interface Product { ... }

// Define the type for the context value
interface CartContextType {
  cart: CartItem[];
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isAuthenticated: boolean;
  calculateTotal: () => number;
  mounted: boolean;
}

// Create the context with a default value
const CartContext = createContext<CartContextType>({
  cart: [],
  cartItems: [],
  addToCart: (_item) => {},
  removeFromCart: (_itemId) => {},
  updateQuantity: (_itemId, _quantity) => {},
  clearCart: () => {},
  isAuthenticated: false,
  calculateTotal: () => 0,
  mounted: false
});

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

  const addToCart = (item: CartItem) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to cart');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(i => i._id === item._id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);

      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity >= item.stockQuantity) {
          return prevCart;
        }
        return prevCart.map(i =>
          i._id === item._id && 
          i.selectedSize === item.selectedSize && 
          i.selectedColor === item.selectedColor
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stockQuantity) }
            : i
        );
      }
      return [...prevCart, { ...item }];
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
    calculateTotal,
    mounted
  };

  // Render null or provider based on mounted state
  return mounted ? <CartContext.Provider value={value}>{children}</CartContext.Provider> : null;
}; 