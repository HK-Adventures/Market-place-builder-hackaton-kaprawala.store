import React from 'react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import './globals.css';
import LoadingScreen from '../components/LoadingScreen';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white" suppressHydrationWarning>
        <LoadingScreen />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-24">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
