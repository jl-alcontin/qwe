import React, { useState } from 'react';
import { X } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import CardPaymentForm from './CardPaymentForm';
import EWalletPayment from './EwalletPayment';
import { toast } from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  amount: number;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subscriptionId,
  amount,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePaymentSuccess = (paymentIntentId?: string) => {
    toast.success('Payment successful!');
    onSuccess();
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setSelectedMethod(null);
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <CardPaymentForm
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );
      case 'gcash':
      case 'grab_pay':
      case 'paymaya':
        return (
          <EWalletPayment
            type={selectedMethod as 'gcash' | 'grab_pay' | 'paymaya'}
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        );
      default:
        return (
          <PaymentMethodSelector onSelect={setSelectedMethod} />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedMethod ? 'Complete Payment' : 'Choose Payment Method'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {selectedMethod && (
            <div className="mb-6">
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-sm text-primary hover:text-primary-hover"
              >
                ← Choose another payment method
              </button>
            </div>
          )}

          {renderPaymentForm()}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;