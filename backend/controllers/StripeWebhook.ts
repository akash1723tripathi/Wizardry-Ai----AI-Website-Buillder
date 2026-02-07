import { request,response, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';

export const stripWebhook = async (req: Request, res: Response) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
      
      if (endpointSecret) {
            let event;
            const signature = request.headers['stripe-signature'] as string;
            try {
                  event = stripe.webhooks.constructEvent(
                        request.body,
                        signature,
                        endpointSecret
                  );
            } catch (error:any) {
                  console.log(`⚠️ Webhook signature verification failed.`, error.message);
                  return response.sendStatus(400);
            }

            switch (event.type) {
                  case 'payment_intent.succeeded':
                        const paymentIntent = event.data.object;
                        const sessionList = await stripe.checkout.sessions.list({
                              payment_intent: paymentIntent.id,
                        })
                        const session = sessionList.data[0];
                        const {transactionId, appId} = session.metadata as { transactionId: string, appId: string };
                        if(appId === 'wizardry-ai' && transactionId){ 
                              const transaction = await prisma.transaction.update({
                                    where: { id: transactionId },
                                    data: { isPaid: true }
                              })

                              //Add the credits
                              await prisma.user.update({
                                    where:{id: transaction.userId},
                                    data:{credits: {increment: transaction.credits}}
                              })
                        }
                        break;

                  default:
                        console.log(`Unhandled event type ${event.type}`);
            }
            res.json({ received: true });
      }
}
