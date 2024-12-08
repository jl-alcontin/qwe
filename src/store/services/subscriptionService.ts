import { api } from '../api';

export interface Subscription {
  _id: string;
  name: 'free' | 'basic' | 'premium';
  features: string[];
  maxProducts: number;
  maxStaff: number;
  maxStores: number;
  price: number;
  billingCycle: 'monthly' | 'yearly';
}

export interface UserSubscription {
  _id: string;
  user: string;
  subscription: Subscription;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  paymentDetails?: {
    paymentId?: string;
    amount?: number;
    status?: string;
  };
}

export interface SubscribeRequest {
  subscriptionId: string;
  paymentMethod: string;
  paymentDetails?: {
    paymentId?: string;
    amount?: number;
    status?: string;
  };
}

export const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<Subscription[], void>({
      query: () => 'subscriptions',
      providesTags: ['Subscriptions'],
    }),
    getCurrentSubscription: builder.query<UserSubscription, void>({
      query: () => 'subscriptions/current',
      providesTags: ['CurrentSubscription'],
    }),
    subscribe: builder.mutation<UserSubscription, SubscribeRequest>({
      query: (data) => ({
        url: 'subscriptions/subscribe',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CurrentSubscription'],
    }),
    cancelSubscription: builder.mutation<void, void>({
      query: () => ({
        url: 'subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['CurrentSubscription'],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetCurrentSubscriptionQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;