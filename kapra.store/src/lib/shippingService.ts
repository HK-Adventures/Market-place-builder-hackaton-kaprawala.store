const SHIPPING_API_KEY = 'col4lrcz-ymwi-dt6b-216q-u8orznvt5vll';
const API_BASE_URL = 'https://api.shipping-service.com/v1'; // Replace with actual API base URL

interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  estimatedDelivery: string;
  status: string;
}

export const shippingService = {
  async generateLabel(orderData: {
    customerInfo: {
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      phoneNumber: string;
    };
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }): Promise<ShippingLabel> {
    try {
      const response = await fetch(`${API_BASE_URL}/labels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SHIPPING_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: {
            name: orderData.customerInfo.fullName,
            address: orderData.customerInfo.address,
            city: orderData.customerInfo.city,
            postalCode: orderData.customerInfo.postalCode,
            phone: orderData.customerInfo.phoneNumber,
          },
          parcel: {
            items: orderData.items.map(item => ({
              description: item.name,
              quantity: item.quantity,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate shipping label');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating shipping label:', error);
      throw error;
    }
  },

  async getShipmentStatus(trackingNumber: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${SHIPPING_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get shipment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting shipment status:', error);
      throw error;
    }
  },

  async markAsHandedOver(trackingNumber: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${trackingNumber}/handover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SHIPPING_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark shipment as handed over');
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking shipment as handed over:', error);
      throw error;
    }
  },
}; 