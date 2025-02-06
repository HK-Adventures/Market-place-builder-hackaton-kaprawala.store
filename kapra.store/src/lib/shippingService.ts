// Mock shipping service for development
const AFTERSHIP_API_KEY = process.env.NEXT_PUBLIC_AFTERSHIP_API_KEY;
const AFTERSHIP_API_URL = 'https://api.aftership.com/v4';

import { client } from '../sanity/client';

interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  estimatedDelivery: string;
  status: string;
  shippingCost: number;
}

interface CustomerInfo {
  city: string;
  postalCode: string;
}

interface CartItem {
  quantity: number;
  price: number;
}

interface ShippingRate {
  cost: number;
  currency: string;
  estimatedDays: number;
  service: string;
}

interface TrackingRequest {
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

  async generateLabel(order: { _id: string; customerInfo: any; items: any[] }): Promise<string> {
    try {
      const trackingNumber = `KS${Date.now().toString(36)}`;

      // Create tracking in AfterShip
      await fetch(`${AFTERSHIP_API_URL}/trackings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'aftership-api-key': AFTERSHIP_API_KEY!
        },
        body: JSON.stringify({
          tracking: {
            tracking_number: trackingNumber,
            slug: 'tcs-pk', // TCS Pakistan courier
            title: `Order ${order._id}`,
            order_id: order._id,
            customer_name: order.customerInfo.fullName,
            emails: [order.customerInfo.email],
            smses: [order.customerInfo.phoneNumber]
          }
        })
      });

      // Update order with tracking info
      await client
        .patch(order._id)
        .set({
          tracking: {
            trackingNumber,
            courier: 'TCS',
            shippedAt: new Date().toISOString()
          }
        })
        .commit();

      return trackingNumber;
    } catch (error) {
      console.error('Error generating shipping label:', error);
      throw new Error('Failed to generate shipping label');
    }
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

  async getShipmentStatus(trackingNumber: string) {
    // Mock shipping statuses based on time passed
    const orderDate = this.extractDateFromTracking(trackingNumber);
    const now = new Date().getTime();
    const hoursPassed = (now - orderDate) / (1000 * 60 * 60);

    let status, updates;

    if (hoursPassed < 24) {
      status = 'pending';
      updates = [{
        timestamp: new Date(orderDate).toISOString(),
        status: 'Order Received',
        location: 'Processing Center'
      }];
    } else if (hoursPassed < 48) {
      status = 'in_transit';
      updates = [
        {
          timestamp: new Date(orderDate).toISOString(),
          status: 'Order Received',
          location: 'Processing Center'
        },
        {
          timestamp: new Date(orderDate + 24*60*60*1000).toISOString(),
          status: 'In Transit',
          location: 'Local Shipping Facility'
        }
      ];
    } else {
      status = 'delivered';
      updates = [
        {
          timestamp: new Date(orderDate).toISOString(),
          status: 'Order Received',
          location: 'Processing Center'
        },
        {
          timestamp: new Date(orderDate + 24*60*60*1000).toISOString(),
          status: 'In Transit',
          location: 'Local Shipping Facility'
        },
        {
          timestamp: new Date(orderDate + 48*60*60*1000).toISOString(),
          status: 'Delivered',
          location: 'Destination'
        }
      ];
    }

    return {
      status,
      estimatedDelivery: new Date(orderDate + 5*24*60*60*1000).toISOString(),
      currentLocation: updates[updates.length - 1].location,
      updates
    };
  },

  async markAsHandedOver(trackingNumber: string) {
    // Mock successful handover
    return {
      success: true,
      status: 'in_transit',
      handedOverAt: new Date().toISOString()
    };
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