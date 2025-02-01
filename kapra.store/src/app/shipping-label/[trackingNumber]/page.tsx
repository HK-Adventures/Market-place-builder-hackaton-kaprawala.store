'use client'
import { useState, useEffect, Suspense } from 'react';
import { client } from '../../../sanity/client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ShippingLabelData {
  orderId: string;
  trackingNumber: string;
  customerInfo: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phoneNumber: string;
  };
  orderDate: string;
}

function ShippingLabelContent({ trackingNumber }: { trackingNumber: string }) {
  const [labelData, setLabelData] = useState<ShippingLabelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabelData = async () => {
      try {
        if (!trackingNumber) {
          throw new Error('No tracking number provided');
        }

        const data = await client.fetch(`
          *[_type == "order" && tracking.trackingNumber == $trackingNumber][0]{
            _id,
            orderId,
            orderDate,
            customerInfo,
            tracking
          }
        `, { trackingNumber });

        if (!data) {
          throw new Error('Label not found');
        }

        setLabelData({
          ...data,
          trackingNumber: data.tracking.trackingNumber
        });
      } catch (error) {
        console.error('Error fetching label data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabelData();
  }, [trackingNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!labelData) {
    return <div>Label not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-md print:shadow-none">
        {/* Shipping Label Header */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">KAPRA STORE</h1>
              <p className="text-gray-600">Shipping Label</p>
            </div>
            <button 
              onClick={handlePrint}
              className="bg-black text-white px-4 py-2 rounded print:hidden"
            >
              Print Label
            </button>
          </div>
        </div>

        {/* Tracking Information */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-semibold">Tracking Number</h2>
              <p className="text-lg">{labelData.trackingNumber}</p>
            </div>
            <div className="qr-code">
              <QRCodeSVG 
                value={`https://kapra.store/track/${labelData.trackingNumber}`} 
                size={100}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Order Date: {new Date(labelData.orderDate).toLocaleDateString()}
          </p>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Ship To:</h2>
          <div className="border p-4 rounded">
            <p className="font-bold">{labelData.customerInfo.fullName}</p>
            <p>{labelData.customerInfo.address}</p>
            <p>{labelData.customerInfo.city}, {labelData.customerInfo.postalCode}</p>
            <p>Phone: {labelData.customerInfo.phoneNumber}</p>
          </div>
        </div>

        {/* From Address */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">From:</h2>
          <div className="border p-4 rounded">
            <p className="font-bold">KAPRA STORE</p>
            <p>123 Fashion Street</p>
            <p>Lahore, 54000</p>
            <p>Pakistan</p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="text-sm text-gray-600">
          <p>Please handle with care</p>
          <p>Keep away from heat and moisture</p>
        </div>
      </div>
    </div>
  );
}

export default function ShippingLabelPage({ params }: { params: { trackingNumber: string } }) {
  const trackingNumber = React.use(Promise.resolve(params.trackingNumber));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShippingLabelContent trackingNumber={trackingNumber} />
    </Suspense>
  );
} 