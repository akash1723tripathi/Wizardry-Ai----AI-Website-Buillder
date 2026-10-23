import Stripe from 'stripe';
import prisma from './prisma.js';

export const APP_ID = 'wizardry-ai';

let stripeClient: Stripe | null = null;
export const getStripe = () => {
      if (!stripeClient) {
            if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
            stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
      }
      return stripeClient;
};

export type FulfillResult = 'credited' | 'already_credited' | 'not_found';

// Credits a paid transaction exactly once. The webhook and the success-page check can both
// call this, Stripe retries webhooks, and requests can race; the conditional update below
// only matches while isPaid is still false, so only one caller can ever add the credits.
export const fulfillTransaction = async (transactionId: string): Promise<FulfillResult> => {
      return prisma.$transaction(async (tx) => {
            const claimed = await tx.transaction.updateMany({
                  where: { id: transactionId, isPaid: false },
                  data: { isPaid: true },
            });

            if (claimed.count === 0) {
                  const existing = await tx.transaction.findUnique({ where: { id: transactionId } });
                  return existing ? 'already_credited' : 'not_found';
            }

            const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: transactionId } });
            await tx.user.update({
                  where: { id: transaction.userId },
                  data: { credits: { increment: transaction.credits } },
            });
            return 'credited';
      });
};

// Only sessions created by this app, fully paid, are ever fulfilled
export const getPaidTransactionId = (session: Stripe.Checkout.Session) => {
      const metadata = session.metadata || {};
      if (metadata.appId !== APP_ID || !metadata.transactionId) return null;
      if (session.payment_status !== 'paid') return null;
      return metadata.transactionId;
};
