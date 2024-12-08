import { toast } from "react-hot-toast";
import { SUBSCRIPTION_FEATURES } from "./subscriptionFeatures";
import { UserSubscription } from "../store/services/subscriptionService";

export const checkSubscriptionLimit = (
  subscription: UserSubscription | undefined,
  feature: keyof typeof SUBSCRIPTION_FEATURES.PREMIUM,
  currentCount: number
): boolean => {
  if (!subscription || subscription.status !== "active") return false;

  const plan =
    subscription.subscription.name.toUpperCase() as keyof typeof SUBSCRIPTION_FEATURES;
  const limit = SUBSCRIPTION_FEATURES[plan][feature];

  if (typeof limit !== "number") {
    throw new Error(`Invalid limit type for feature '${feature}'`);
  }

  return currentCount < limit;
};

export const showUpgradePrompt = (feature: string) => {
  toast.error(
    `You've reached the limit for ${feature}. Upgrade your plan to add more.`,
    {
      duration: 5000,
    }
  );
};
