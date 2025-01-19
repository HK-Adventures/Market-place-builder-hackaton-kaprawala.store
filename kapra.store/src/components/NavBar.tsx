'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Menu } from '@headlessui/react';

// Add User interface
interface User {
  id: string;
  email: string | null;
}

export const NavBar = () => {
  const { cart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || null
      } : null);
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || null
      } : null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#1A1A1A] py-6">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-3xl font-bold tracking-[0.2em] text-[#F8F8F8] hover:text-[#DCD6D0] block text-center transition-colors">
            KAPRA
          </Link>
        </div>
      </div>

      <div className="bg-[#F4F4F4] border-b border-[#E5E5E5]">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-12 text-xs tracking-widest">
              <Link href="/shirts" className="text-[#333333] hover:text-[#1A1A1A] transition-colors">
                SHIRTS
              </Link>
              <Link href="/pants" className="text-[#333333] hover:text-[#1A1A1A] transition-colors">
                PANTS
              </Link>
              <Link href="/suits" className="text-[#333333] hover:text-[#1A1A1A] transition-colors">
                COMPLETE SUITS
              </Link>
              <Link href="/kids" className="text-[#333333] hover:text-[#1A1A1A] transition-colors">
                KIDS
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <Link href="/cart" className="text-[#333333] hover:text-[#1A1A1A] transition-colors relative">
                CART
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-4 bg-[#1A1A1A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>

              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center text-[#333333] hover:text-[#1A1A1A]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Menu.Button>

                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  {user ? (
                    <>
                      <Menu.Item>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          My Profile
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          My Orders
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item>
                        <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Login
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Register
                        </Link>
                      </Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}; 