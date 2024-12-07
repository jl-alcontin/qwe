import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetSubscriptionsQuery,
  useGetCurrentSubscriptionQuery,
  useSubscribeMutation
} from '../store/services/subscriptionService';

const SubscriptionPage = () => {
  const { data: subscriptions } = useGetSubscriptionsQuery();
  const { data: currentSubscription } = useGetCurrentSubscriptionQuery();
  const [subscribe] = useSubscribeMutation();
  const navigate = useNavigate();

  const handleSubscribe = async (subscriptionId: string) => {
    try {
      await subscribe({
        subscriptionId,
        paymentMethod: 'card'
      }).unwrap();
      toast.success('Successfully subscribed!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to subscribe');
    }
  };

  const renderFeature = (included: boolean, feature: string) => (
    <div className="flex items-center space-x-2">
      {included ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      )}
      <span>{feature}</span>
    </div>
  );

  return (
    <div className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose your plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan for your business needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {subscriptions?.map((subscription) => {
            const isCurrentPlan = currentSubscription?.subscription._id === subscription._id;

            return (
              <div
                key={subscription._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {subscription.name.charAt(0).toUpperCase() + subscription.name.slice(1)}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    Perfect for {subscription.name === 'free' ? 'getting started' : 
                               subscription.name === 'basic' ? 'small businesses' : 
                               'growing businesses'}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${subscription.price}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      /{subscription.billingCycle}
                    </span>
                  </p>
                  <button
                    onClick={() => handleSubscribe(subscription._id)}
                    disabled={isCurrentPlan}
                    className={`mt-8 block w-full py-2 px-4 border border-transparent rounded-md text-white text-center font-medium ${
                      isCurrentPlan
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-hover'
                    }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                  </button>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                    What's included
                  </h4>
                  <ul className="mt-6 space-y-4">
                    <li>{renderFeature(true, `Up to ${subscription.maxProducts} products`)}</li>
                    <li>{renderFeature(true, `Up to ${subscription.maxStaff} staff members`)}</li>
                    <li>{renderFeature(true, `Up to ${subscription.maxStores} stores`)}</li>
                    {subscription.features.map((feature) => (
                      <li key={feature}>
                        {renderFeature(true, feature.split('_').join(' ').toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;