import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { useCreatePaymentIntentMutation, useVerifyPaymentMutation } from '../../store/services/paymentService';

interface GcashPaymentProps {
  subscriptionId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const GcashPayment: React.FC<GcashPaymentProps> = ({
  subscriptionId,
  amount,
  onSuccess,
  onCancel,
}) => {
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const result = await createPaymentIntent({ amount, subscriptionId }).unwrap();
        setPaymentIntentId(result.id);
      } catch (error) {
        toast.error('Failed to initialize payment. Please try again.');
      }
    };

    initializePayment();
  }, [amount, subscriptionId, createPaymentIntent]);

  const handleVerifyPayment = async () => {
    if (!paymentIntentId) {
      toast.error('Payment not initialized. Please try again.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyPayment({ paymentIntentId }).unwrap();
      
      if (result.status === 'paid') {
        toast.success('Payment verified successfully!');
        onSuccess();
      } else {
        toast.error('Payment not completed. Please try again.');
      }
    } catch (error) {
      toast.error('Payment verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isCreatingIntent || !paymentIntentId) {
    return <div>Initializing payment...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">GCash Payment</h3>
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <QRCodeSVG value={`https://api.paymongo.com/v1/sources/${paymentIntentId}`} size={200} />
        </div>
        <p className="text-center text-gray-600">
          Scan the QR code using your GCash app to complete the payment
        </p>
        <div className="text-lg font-semibold">Amount: ₱{amount}</div>
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GcashPayment;

