import axios from 'axios';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_PUBLIC_KEY = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY;
const PAYMONGO_SECRET_KEY = import.meta.env.VITE_PAYMONGO_SECRET_KEY;
const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

interface PaymentMethodData {
  type: 'gcash' | 'grab_pay' | 'paymaya' | 'card';
  details?: {
    cardNumber?: string;
    expMonth?: number;
    expYear?: number;
    cvc?: string;
  };
}

interface PaymentIntentData {
  amount: number;
  currency: string;
  paymentMethodAllowed: string[];
  description: string;
}

export const createSource = async (amount: number, type: 'gcash' | 'grab_pay' | 'paymaya') => {
  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/sources`,
      {
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            currency: 'PHP',
            type,
            redirect: {
              success: `${window.location.origin}/subscription?status=success&amount=${amount}`,
              failed: `${window.location.origin}/subscription?status=failed&amount=${amount}`,
            },
            billing: {
              name: IS_DEVELOPMENT ? 'Test User' : undefined,
              email: IS_DEVELOPMENT ? 'test@example.com' : undefined,
              phone: IS_DEVELOPMENT ? '09123456789' : undefined,
            },
            description: IS_DEVELOPMENT 
              ? 'Test payment - Choose "Authorize Test Payment" to simulate success'
              : 'Subscription Payment',
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating source:', error);
    throw error;
  }
};

export const getSourceStatus = async (sourceId: string) => {
  try {
    const response = await axios.get(
      `${PAYMONGO_API_URL}/sources/${sourceId}`,
      {
        headers: {
          Authorization: `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error checking source status:', error);
    throw error;
  }
};

export const createPaymentMethod = async (data: PaymentMethodData) => {
  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/payment_methods`,
      {
        data: {
          attributes: {
            type: data.type,
            details: data.details,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

export const createPaymentIntent = async (data: PaymentIntentData) => {
  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/payment_intents`,
      {
        data: {
          attributes: {
            amount: Math.round(data.amount * 100),
            payment_method_allowed: data.paymentMethodAllowed,
            payment_method_options: {
              card: { request_three_d_secure: 'any' },
            },
            currency: data.currency,
            description: IS_DEVELOPMENT 
              ? 'Test payment - Development Mode'
              : data.description,
            statement_descriptor: 'POS System Subscription',
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const getPaymentIntentStatus = async (paymentIntentId: string) => {
  try {
    const response = await axios.get(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error checking payment intent status:', error);
    throw error;
  }
};