// Mock shipping service for development
const TRACKINGMORE_API_KEY = process.env.NEXT_PUBLIC_TRACKINGMORE_API_KEY;
const TRACKINGMORE_API_URL = 'https://api.trackingmore.com/v4';

interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  estimatedDelivery: string;
  status: string;
  shippingCost: number;
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
  async calculateShippingCost(orderData: {
    customerInfo: {
      city: string;
      postalCode: string;
    };
    items: Array<{
      quantity: number;
    }>;
  }): Promise<ShippingRate> {
    try {
      // First try the API
      try {
        const response = await fetch(`${TRACKINGMORE_API_URL}/rates/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Tracking-Api-Key': TRACKINGMORE_API_KEY!,
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            origin_country_code: 'PK',
            origin_postal_code: '54000', // Lahore
            destination_country_code: 'PK',
            destination_postal_code: orderData.customerInfo.postalCode,
            destination_city: orderData.customerInfo.city,
            weight: 1.0, // in kg
            length: 30, // in cm
            width: 20,  // in cm
            height: 10, // in cm
            category: 'clothing',
            declared_value: 100, // in USD
            quantity: orderData.items.reduce((sum, item) => sum + item.quantity, 0)
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Shipping rate response:', data);

        const standardRate = data.data.rates.find((rate: any) => 
          rate.service_level === 'standard' || rate.service_level === 'regular'
        ) || data.data.rates[0];

        return {
          cost: standardRate.total_charge,
          currency: standardRate.currency,
          estimatedDays: standardRate.estimated_days,
          service: standardRate.service_level
        };
      } catch (apiError) {
        console.error('API Error:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      // Return calculated cost based on distance and items
      const baseRate = 150; // Base shipping rate in PKR
      const itemsCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
      const itemRate = itemsCount * 20; // 20 PKR per item

      // Calculate distance-based rate (simplified)
      let distanceRate = 0;
      const city = orderData.customerInfo.city.toLowerCase();
      if (city === 'lahore') {
        distanceRate = 50;
      } else if (['karachi', 'islamabad', 'rawalpindi'].includes(city)) {
        distanceRate = 200;
      } else {
        distanceRate = 150;
      }

      const totalCost = baseRate + itemRate + distanceRate;

      return {
        cost: totalCost,
        currency: 'PKR',
        estimatedDays: city === 'lahore' ? 1 : 3,
        service: 'standard'
      };
    }
  },

  async generateLabel(orderData: {
    orderId: string;
    customerInfo: {
      fullName: string;
      email: string;
      phoneNumber: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    items: Array<any>;
  }): Promise<ShippingLabel> {
    try {
      // Generate tracking number via TrackingMore API
      const response = await fetch(`${TRACKINGMORE_API_URL}/trackings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Tracking-Api-Key': TRACKINGMORE_API_KEY!,
        },
        body: JSON.stringify({
          tracking_number: `KP${orderData.orderId}${Date.now().toString(36)}`,
          carrier_code: 'pakistan-post',
          title: `Order ${orderData.orderId}`,
          customer_name: orderData.customerInfo.fullName,
          customer_email: orderData.customerInfo.email,
          customer_phone: orderData.customerInfo.phoneNumber,
          destination_country: 'Pakistan',
          destination_city: orderData.customerInfo.city,
          destination_address: orderData.customerInfo.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate tracking number');
      }

      const data = await response.json();
      const trackingNumber = data.data.tracking_number;

      return {
        trackingNumber,
        labelUrl: `/shipping-label/${trackingNumber}`,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready',
        shippingCost: await this.calculateShippingRate(orderData)
      };
    } catch (error) {
      console.error('Error generating shipping label:', error);
      throw error;
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
  private extractDateFromTracking(trackingNumber: string): number {
    const parts = trackingNumber.split('-');
    return parseInt(parts[2], 36);
  }
}; 