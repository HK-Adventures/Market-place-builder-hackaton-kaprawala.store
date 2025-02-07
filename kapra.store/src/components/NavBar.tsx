'use client'
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import { Menu } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { FiUser } from 'react-icons/fi';
import { cn } from '../lib/utils';

// Add User interface
interface User {
  id: string;
  email: string | null;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const [userState, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUserState(session?.user ? {
          id: session.user.id,
          email: session.user.email || null
        } : null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUserState(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUserState(session?.user ? {
          id: session.user.id,
          email: session.user.email || null
        } : null);
      } else if (event === 'SIGNED_OUT') {
        setUserState(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserState(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Shipping Policy', href: '/shipping-policy' },
    { name: 'Return Policy', href: '/return-policy' },
    { name: 'FAQ', href: '/faqs' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Store Locator', href: '/store-locator' },
    { name: 'Careers', href: '/careers' },
  ];

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
              KAPRA
            </Link>
          </div>

          {/* Mobile menu button - Updated colors */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
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
              <Menu.Button className="flex items-center text-gray-200 hover:text-white">
                <FiUser className="w-6 h-6" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {userState ? (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <p className="font-medium">{userState.email}</p>
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-orders"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          My Orders
                        </Link>
                      )}
                    </Menu.Item>
                    {userState.email?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/admin"
                            className={`block px-4 py-2 text-sm ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </>
                ) : (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/login"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          Login
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/register"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          Register
                        </Link>
                      )}
                    </Menu.Item>
                  </>
                )}
              </Menu.Items>
            </Menu>
          </div>
        </div>

        {/* Mobile Navigation Menu - Shown when menu is open */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/shirts"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shirts
            </Link>
            <Link
              href="/pants"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pants
            </Link>
            <Link
              href="/suits"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Complete Suits
            </Link>
            <Link
              href="/kids"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kids
            </Link>
            <Link
              href="/cart"
              className="block px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cart ({cartItems.length})
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 