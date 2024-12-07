import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Subscription from '../models/subscriptionModel.js';
import UserSubscription from '../models/userSubscriptionModel.js';

const router = express.Router();

// Get all available subscriptions
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current user's subscription
router.get('/current', protect, async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user._id,
      status: 'active'
    }).populate('subscription');
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Subscribe to a plan
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscriptionId, paymentMethod } = req.body;

    // Cancel any existing active subscription
    await UserSubscription.updateMany(
      { user: req.user._id, status: 'active' },
      { status: 'cancelled' }
    );

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (subscription.billingCycle === 'yearly' ? 12 : 1));

    const userSubscription = await UserSubscription.create({
      user: req.user._id,
      subscription: subscriptionId,
      status: 'active',
      startDate: new Date(),
      endDate,
      paymentMethod,
      autoRenew: true
    });

    res.status(201).json(await userSubscription.populate('subscription'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel subscription
router.post('/cancel', protect, async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;