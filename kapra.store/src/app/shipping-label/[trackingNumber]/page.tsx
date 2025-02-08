import React from 'react';

import { Metadata } from 'next';
import PrintButton from '@/components/PrintButton';

interface PageProps {
  params: Promise<{ trackingNumber: string }>;
  searchParams?: Promise<any>;
}

export default async function ShippingLabelPage({ 
  params 
}: PageProps) {
  const resolvedParams = await params;
  const trackingNumber = resolvedParams.trackingNumber;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">ALMIRAH STORE</h1>
                <p className="text-gray-600">Shipping Label</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Tracking #: {trackingNumber}</p>
              </div>
            </div>

            {/* Barcode */}
            <div className="border-2 border-black p-4 text-center">
              <p className="font-mono text-lg">{trackingNumber}</p>
              {/* Add actual barcode implementation here */}
            </div>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Address */}
              <div>
                <h2 className="font-semibold mb-2">From:</h2>
                <div className="border p-4 rounded">
                  <p className="font-bold">ALMIRAH STORE</p>
                  <p>123 Fashion Street</p>
                  <p>Lahore, 54000</p>
                  <p>Pakistan</p>
                  <p>Phone: +92 300 1234567</p>
                </div>
              </div>

              {/* To Address */}
              <div>
                <h2 className="font-semibold mb-2">To:</h2>
                <div className="border p-4 rounded">
                  <p className="font-bold">[Customer Name]</p>
                  <p>[Street Address]</p>
                  <p>[City, Postal Code]</p>
                  <p>[Country]</p>
                  <p>Phone: [Customer Phone]</p>
                </div>
              </div>
            </div>

            {/* Package Info */}
            <div>
              <h2 className="font-semibold mb-2">Package Information:</h2>
              <div className="border p-4 rounded space-y-2">
                <p><span className="font-medium">Weight:</span> [Weight] kg</p>
                <p><span className="font-medium">Dimensions:</span> [Length] x [Width] x [Height] cm</p>
                <p><span className="font-medium">Service Type:</span> Standard Delivery</p>
              </div>
            </div>

            {/* Print Button */}
            <div className="text-center">
              <PrintButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ 
  params 
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const trackingNumber = resolvedParams.trackingNumber;

  return {
    title: `Shipping Label - ${trackingNumber}`,
    description: `Shipping label for order ${trackingNumber}`
  };
} 