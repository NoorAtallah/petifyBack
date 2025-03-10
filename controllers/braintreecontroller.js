const braintree = require('braintree');
const Subscription = require('../models/subscription');
require('dotenv').config();

// Setup Braintree gateway
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// Controller to generate Braintree token
exports.generateToken = async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.send({ clientToken: response.clientToken });
  } catch (err) {
    res.status(500).send({ error: 'Failed to generate client token' });
  }
};

// Controller to handle payment and subscription
exports.processPayment = async (req, res) => {
  const { paymentMethodNonce, amount, userId, plan } = req.body;

  // Check if required fields are provided
  if (!paymentMethodNonce || !amount || !userId || !plan) {
    return res.status(400).send({ success: false, message: 'Missing required information' });
  }

  try {
    // Check if the user already has an active subscription
    const existingSubscription = await Subscription.findOne({ user: userId, isActive: true });
    if (existingSubscription) {
      return res.status(400).send({ success: false, message: 'User already has an active subscription' });
    }

    // Process the payment through Braintree
    const result = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: paymentMethodNonce,
      options: { submitForSettlement: true },
    });

    if (result.success) {
      // Calculate endDate based on the plan
      const startDate = new Date();
      let endDate;

      if (plan === 'monthly') {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30); // Add 30 days for a monthly plan
      } else if (plan === 'weekly') {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7); // Add 7 days for a weekly plan
      }

      // Payment successful, now save the subscription with the amount and endDate
      const newSubscription = new Subscription({
        user: userId,
        plan: plan,
        amount: amount,  // Save the amount in the subscription
        createdAt: startDate,
        endDate: endDate, // Save the calculated endDate
        isActive: true
      });

      await newSubscription.save();

      res.send({ 
        success: true, 
        transactionId: result.transaction.id,
        subscription: {
          plan: plan,
          amount: amount, // Include the amount in the response
          startDate: newSubscription.createdAt,
          endDate: newSubscription.endDate, // Include the end date in the response
          subscriptionId: newSubscription._id
        },
        message: 'Payment processed and subscription saved successfully'
      });
    } else {
      res.status(500).send({ success: false, message: result.message });
    }
  } catch (err) {
    console.error('Error processing payment or saving subscription:', err);
    res.status(500).send({ success: false, message: 'Payment processing or subscription saving failed' });
  }
};


// Controller to check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscription = await Subscription.findOne({ user: userId, isActive: true });
    if (subscription) {
      res.send({ 
        isSubscribed: true, 
        plan: subscription.plan, 
        subscriptionId: subscription._id,
        endDate: subscription.endDate // Include the endDate in the response
      });
    } else {
      res.send({ isSubscribed: false });
    }
  } catch (err) {
    console.error('Error checking subscription status:', err);
    res.status(500).send({ success: false, message: 'Failed to check subscription status' });
  }
};


