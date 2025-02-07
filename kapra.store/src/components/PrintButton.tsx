'use client'
import React from 'react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 print:hidden"
    >
      Print Label
    </button>
  );
} 