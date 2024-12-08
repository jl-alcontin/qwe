import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createPaymentMethod, createPaymentIntent } from '../../utils/paymongo';

interface CardPaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

interface CardFormData {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ amount, onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CardFormData>();

  const onSubmit = async (data: CardFormData) => {
    try {
      setIsProcessing(true);

      // Create payment method
      const paymentMethod = await createPaymentMethod({
        type: 'card',
        details: {
          cardNumber: data.cardNumber.replace(/\s/g, ''),
          expMonth: parseInt(data.expMonth),
          expYear: parseInt(data.expYear),
          cvc: data.cvc,
        },
      });

      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        amount,
        currency: 'PHP',
        paymentMethodAllowed: ['card'],
        description: 'Subscription Payment',
      });

      onSuccess(paymentIntent.id);
    } catch (error: any) {
      onError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Card Number</label>
        <input
          type="text"
          {...register('cardNumber', { 
            required: 'Card number is required',
            pattern: {
              value: /^[\d\s]{16,19}$/,
              message: 'Invalid card number'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="1234 5678 9012 3456"
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Month</label>
          <input
            type="text"
            {...register('expMonth', { 
              required: 'Required',
              pattern: {
                value: /^(0[1-9]|1[0-2])$/,
                message: 'Invalid month'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="MM"
          />
          {errors.expMonth && (
            <p className="mt-1 text-sm text-red-600">{errors.expMonth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="text"
            {...register('expYear', { 
              required: 'Required',
              pattern: {
                value: /^20[2-9][0-9]$/,
                message: 'Invalid year'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="YYYY"
          />
          {errors.expYear && (
            <p className="mt-1 text-sm text-red-600">{errors.expYear.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CVC</label>
          <input
            type="text"
            {...register('cvc', { 
              required: 'Required',
              pattern: {
                value: /^\d{3,4}$/,
                message: 'Invalid CVC'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="123"
          />
          {errors.cvc && (
            <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CardPaymentForm;