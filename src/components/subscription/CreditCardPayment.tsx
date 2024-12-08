import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

interface CreditCardPaymentProps {
  subscriptionId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreditCardPayment: React.FC<CreditCardPaymentProps> = ({
  subscriptionId,
  amount,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    try {
      // Here you would typically make an API call to your backend to process the payment
      // and create the subscription
      
      // For demo purposes, we'll just simulate a successful payment
      toast.success('Payment successful!');
      onSuccess();
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Credit Card Payment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Amount: ${amount}</span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
            >
              Pay Now
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreditCardPayment;