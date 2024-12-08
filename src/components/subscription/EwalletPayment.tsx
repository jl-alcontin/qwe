import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createSource, getSourceStatus } from '../../utils/paymongo';

interface EWalletPaymentProps {
  type: 'gcash' | 'grab_pay' | 'paymaya';
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const EWalletPayment: React.FC<EWalletPaymentProps> = ({ type, amount, onSuccess, onError }) => {
  const [sourceData, setSourceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const source = await createSource(amount, type);
        setSourceData(source);
        
        // Open the checkout URL in a new window
        if (source.attributes.redirect.checkout_url) {
          window.open(source.attributes.checkout_url, '_blank');
        }

        // Start polling for payment status
        const pollInterval = setInterval(async () => {
          const status = await getSourceStatus(source.id);
          if (status.attributes.status === 'chargeable') {
            clearInterval(pollInterval);
            onSuccess();
          } else if (status.attributes.status === 'expired' || status.attributes.status === 'cancelled') {
            clearInterval(pollInterval);
            onError('Payment failed or expired');
          }
        }, 3000);

        return () => clearInterval(pollInterval);
      } catch (error: any) {
        onError(error.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [type, amount, onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  if (!sourceData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to initialize payment. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg inline-block">
        <QRCodeSVG value={sourceData.attributes.redirect.checkout_url} size={200} />
      </div>
      
      <div className="space-y-2">
        <p className="text-lg font-medium">Amount: ₱{amount.toFixed(2)}</p>
        <p className="text-gray-600">
          Scan the QR code or click the button below to complete your payment
        </p>
      </div>

      <a
        href={sourceData.attributes.redirect.checkout_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
      >
        Open Payment Page
      </a>

      <p className="text-sm text-gray-500">
        Don't close this window. It will automatically update once payment is complete.
      </p>
    </div>
  );
};

export default EWalletPayment;