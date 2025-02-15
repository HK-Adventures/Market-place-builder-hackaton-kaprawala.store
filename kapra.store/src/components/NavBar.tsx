'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';
import { Menu, MenuItem, MenuButton, MenuItems } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { FiUser } from 'react-icons/fi';
import { cn } from '../lib/utils';
import { User as SupabaseUser } from '@supabase/supabase-js';

type User = SupabaseUser;  // Use the Supabase User type directly instead of extending it

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userState, setUserState] = useState<User | null>(null);
  const { cartItems } = useCart();
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserState(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className={cn(
      'fixed top-4 left-4 right-4 z-50 transition-all duration-300',
      'backdrop-blur-[2px] bg-black/80 supports-[backdrop-filter]:bg-black/80',
      'rounded-2xl mx-auto max-w-7xl font-medium antialiased',
      'text-shadow-sm',
      scrolled ? 'shadow-lg shadow-black/5' : ''
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always visible */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-white">
              KAPRAWALA
            </Link>
          </div>

          {/* Mobile menu button - Updated colors */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/shirts" className="text-gray-200 hover:text-white">
              Shirts
            </Link>
            <Link href="/pants" className="text-gray-200 hover:text-white">
              Pants
            </Link>
            <Link href="/suits" className="text-gray-200 hover:text-white">
              Complete Suits
            </Link>
            <Link href="/kids" className="text-gray-200 hover:text-white">
              Kids
            </Link>
          </div>

          {/* Search, Cart, and Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            
            <Link href="/cart" className="text-gray-200 hover:text-white">
              <span className="relative inline-block">
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </span>
            </Link>

            {/* Profile Dropdown - Updated colors */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center text-gray-200 hover:text-white">
                <FiUser className="w-6 h-6" />
              </MenuButton>

              <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {userState ? (
                  <>
                    <MenuItem>
                      {() => (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <p className="font-medium">{userState.email}</p>
                        </div>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {() => (
                        <Link
                          href="/my-orders"
                          className={`block px-4 py-2 text-sm ${
                            'text-gray-700'
                          }`}
                        >
                          My Orders
                        </Link>
                      )}
                    </MenuItem>
                    {userState.email?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() && (
                      <MenuItem>
                        {() => (
                          <Link
                            href="/admin"
                            className={`block px-4 py-2 text-sm ${
                              'text-gray-700'
                            }`}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </MenuItem>
                    )}
                    <MenuItem>
                      {() => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            'text-gray-700'
                          }`}
                        >
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem>
                      {() => (
                        <Link
                          href="/login"
                          className={`block px-4 py-2 text-sm ${
                            'text-gray-700'
                          }`}
                        >
                          Login
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {() => (
                        <Link
                          href="/register"
                          className={`block px-4 py-2 text-sm ${
                            'text-gray-700'
                          }`}
                        >
                          Register
                        </Link>
                      )}
                    </MenuItem>
                  </>
                )}
              </MenuItems>
            </Menu>
          </div>
        </div>

        {/* Mobile Navigation Menu - Shown when menu is open */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/shirts"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsOpen(false)}
            >
              Shirts
            </Link>
            <Link
              href="/pants"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsOpen(false)}
            >
              Pants
            </Link>
            <Link
              href="/suits"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsOpen(false)}
            >
              Complete Suits
            </Link>
            <Link
              href="/kids"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsOpen(false)}
            >
              Kids
            </Link>
            <Link
              href="/cart"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsOpen(false)}
            >
              Cart ({cartItems.length})
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 