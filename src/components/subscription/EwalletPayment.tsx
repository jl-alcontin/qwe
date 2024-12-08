import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createSource, getSourceStatus } from '../../utils/paymongo';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

interface EWalletPaymentProps {
  type: 'gcash' | 'grab_pay' | 'paymaya';
  amount: number;
  onSuccess: (sourceId: string) => void;
  onError: (error: string) => void;
}

const EWalletPayment: React.FC<EWalletPaymentProps> = ({ type, amount, onSuccess, onError }) => {
  const [sourceData, setSourceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const source = await createSource(amount, type);
        setSourceData(source);
        
        if (source.attributes.redirect.checkout_url) {
          // Open in the same window to maintain session
          window.location.href = source.attributes.redirect.checkout_url;
        }

        // Start polling for payment status
        const interval = setInterval(async () => {
          try {
            const status = await getSourceStatus(source.id);
            if (status.attributes.status === 'chargeable') {
              clearInterval(interval);
              toast.success('Payment successful!');
              onSuccess(source.id); // Pass the source ID to handle subscription update
            } else if (status.attributes.status === 'expired' || status.attributes.status === 'cancelled') {
              clearInterval(interval);
              toast.error('Payment failed or expired');
              onError('Payment failed or expired');
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 3000);

        setPollInterval(interval);
      } catch (error: any) {
        onError(error.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
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
      {isDevelopment && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Development Mode</p>
              <p className="text-sm text-blue-600 mt-1">
                You'll be redirected to PayMongo's test payment page. Click "Authorize Test Payment" to simulate a successful payment.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg inline-block">
        <QRCodeSVG value={sourceData.attributes.redirect.checkout_url} size={200} />
      </div>
      
      <div className="space-y-2">
        <p className="text-lg font-medium">Amount: ₱{amount.toFixed(2)}</p>
        <p className="text-gray-600">
          {isDevelopment 
            ? 'Click the button below to proceed to the test payment page'
            : 'Scan the QR code or click the button below to complete your payment'
          }
        </p>
      </div>

      <a
        href={sourceData.attributes.redirect.checkout_url}
        className="inline-block py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
      >
        {isDevelopment ? 'Go to Test Payment Page' : 'Open Payment Page'}
      </a>

      <p className="text-sm text-gray-500">
        Don't close this window. It will automatically update once payment is complete.
      </p>
    </div>
  );
};

export default EWalletPayment;