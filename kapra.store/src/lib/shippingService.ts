// Mock shipping service for development
const AFTERSHIP_API_KEY = process.env.NEXT_PUBLIC_AFTERSHIP_API_KEY;
const AFTERSHIP_API_URL = 'https://api.aftership.com/v4';

import { client } from '../sanity/client';

export interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  estimatedDelivery: string;
  status: string;
  shippingCost: number;
}

export interface CustomerInfo {
  city: string;
  postalCode: string;
}

export interface CartItem {
  quantity: number;
  price: number;
}

export interface ShippingRate {
  cost: number;
  currency: string;
  estimatedDays: number;
  service: string;
}

export interface TrackingRequest {
  tracking_number: string;
  carrier_code: string;
  title: string;
  logistics_channel: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_number: string;
  order_date: string;
  destination_country: string;
  destination_state: string;
  destination_city: string;
  destination_zip: string;
  destination_address: string;
  shipping_date: string;
}

// Add proper types for API responses
interface ShippingResponse {
  success: boolean;
  trackingNumber: string;
  labelUrl: string;
  status: string;
  estimatedDelivery: string;
  shippingCost: number;
}

interface TrackingResponse {
  status: string;
  location?: string;
  timestamp?: string;
  message?: string;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderDetails {
  _id: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  location?: string;
}

export const shippingService = {
  calculateShippingCost: async ({ customerInfo, items }: { 
    customerInfo: CustomerInfo, 
    items: CartItem[] 
  }): Promise<ShippingRate> => {
    try {
      // Basic shipping calculation logic
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const baseShippingCost = 200; // Base shipping cost in PKR
      
      // Calculate shipping cost based on city
      let cityCost = 0;
      const cityLower = customerInfo.city.toLowerCase();
      
      if (cityLower === 'karachi') {
        cityCost = 100;
      } else if (['lahore', 'islamabad', 'rawalpindi'].includes(cityLower)) {
        cityCost = 200;
      } else {
        cityCost = 300;
      }

      // Calculate final shipping cost
      const shippingCost = baseShippingCost + cityCost + (totalItems - 1) * 50;

      // Estimated delivery days based on city
      let estimatedDays = 3;
      if (cityLower === 'karachi') {
        estimatedDays = 1;
      } else if (['lahore', 'islamabad', 'rawalpindi'].includes(cityLower)) {
        estimatedDays = 2;
      }

      return {
        cost: shippingCost,
        currency: 'PKR',
        estimatedDays,
        service: 'Standard Delivery'
      };
    } catch (error) {
      console.error('Error calculating shipping:', error);
      // Return default shipping rate if calculation fails
      return {
        cost: 300,
        currency: 'PKR',
        estimatedDays: 3,
        service: 'Standard Delivery'
      };
    }
  },

  generateLabel: async (_orderDetails: OrderDetails, _shippingInfo: ShippingInfo): Promise<ShippingResponse> => {
    // Mock implementation
    return {
      success: true,
      trackingNumber: `PKT${Date.now()}`,
      labelUrl: 'https://example.com/label.pdf',
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      shippingCost: 300
    };
  },

  // Helper method to calculate shipping rate
  async calculateShippingRate(orderData: any): Promise<number> {
    try {
      const rate = await this.calculateShippingCost({
        customerInfo: orderData.customerInfo,
        items: orderData.items
      });
      return rate.cost;
    } catch (error) {
      console.error('Error calculating shipping rate:', error);
      // Return a default rate if calculation fails
      return 250; // Default shipping cost in PKR
    }
  },

  getTrackingStatus: async (trackingNumber: string): Promise<TrackingInfo> => {
    // Mock implementation
    return {
      trackingNumber,
      status: 'in_transit',
      location: 'Local Sorting Facility'
    };
  },

  markAsHandedOver: async (_trackingNumber: string): Promise<void> => {
    // Mock implementation
    return Promise.resolve();
  },

  // Helper method to extract date from tracking number
  extractDateFromTracking(trackingNumber: string): number {
    const parts = trackingNumber.split('-');
    return parseInt(parts[2], 36);
  }
};

export const generateTrackingNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `KS-${year}${month}${day}-${random}`;
};

export const generateShippingLabel = async (order: any) => {
  try {
    if (!order?._id) {
      throw new Error('Invalid order data');
    }

    const trackingNumber = generateTrackingNumber();

    // Create tracking in AfterShip
    const aftershipResponse = await fetch(`${AFTERSHIP_API_URL}/trackings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'aftership-api-key': AFTERSHIP_API_KEY!
      },
      body: JSON.stringify({
        tracking: {
          tracking_number: trackingNumber,
          slug: 'tcs-pk',
          title: `Order ${order.orderId}`,
          customer_name: order.customerInfo?.fullName || '',
          emails: [order.customerInfo?.email || ''],
          smses: [order.customerInfo?.phoneNumber || '']
        }
      })
    });

    if (!aftershipResponse.ok) {
      throw new Error('Failed to create tracking in AfterShip');
    }

    // Update order in Sanity
    const updatedOrder = await client
      .patch(order._id)
      .set({
        tracking: {
          _type: 'tracking',
          trackingNumber: trackingNumber,
          courier: 'TCS',
          shippedAt: new Date().toISOString()
        }
      })
      .commit();

    if (!updatedOrder) {
      throw new Error('Failed to update order with tracking info');
    }

    return trackingNumber;
  } catch (error) {
    console.error('Error generating shipping label:', error);
    throw new Error('Failed to generate shipping label');
  }
}; 