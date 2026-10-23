import { Request, Response } from 'express';
import Stripe from 'stripe';
import { fulfillTransaction, getPaidTransactionId, getStripe } from '../lib/payments.js';

export const stripWebhook = async (req: Request, res: Response) => {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
            console.log('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not set');
            return res.status(500).json({ message: 'Webhook not configured' });
      }

      let event: Stripe.Event;
      try {
            event = getStripe().webhooks.constructEvent(
                  req.body,
                  req.headers['stripe-signature'] as string,
                  endpointSecret
            );
      } catch (error: any) {
            console.log(`⚠️ Webhook signature verification failed.`, error.message);
            return res.status(400).json({ message: 'Invalid signature' });
      }

      try {
            switch (event.type) {
                  // Card payments are paid when the session completes; async methods
                  // (bank debits) report payment later in async_payment_succeeded
                  case 'checkout.session.completed':
                  case 'checkout.session.async_payment_succeeded': {
                        const transactionId = getPaidTransactionId(event.data.object);
                        if (transactionId) {
                              const result = await fulfillTransaction(transactionId);
                              console.log(`Stripe ${event.type}: transaction ${transactionId} ${result}`);
                        }
                        break;
                  }
                  default:
                        break;
            }
            res.json({ received: true });
      } catch (error: any) {
            // A 500 makes Stripe retry later, which is safe because fulfillment is idempotent
            console.log('Stripe webhook handling failed:', error.message);
            res.status(500).json({ message: 'Webhook handling failed' });
      }
}
