import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { extractHtml, generateCompletion, GENERATION_FAILED_MESSAGE, looksLikeHtml } from "../config/openAi.js";
import { isPlanId, PLANS, CREDITS_PER_GENERATION } from "../config/plans.js";
import { APP_ID, fulfillTransaction, getPaidTransactionId, getStripe } from "../lib/payments.js";

// Get user Credits
export const getUserCredits = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }
            // Fetch user credits from database
            const user = await prisma.user.findUnique({
                  where: { id: UserId }
            })

            res.json({ credits: user?.credits });
      } catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//To create new projects
export const createUserProjects = async (req: Request, res: Response) => {
      const UserId = req.UserId;
      let charged = false;
      try {
            const { initial_prompt } = req.body;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            if (!initial_prompt || typeof initial_prompt !== 'string' || initial_prompt.trim().length < 10) {
                  return res.status(400).json({ message: "Describe your website in at least 10 characters" })
            }

            // Spend the credits atomically: the update only matches while the balance covers it,
            // so two simultaneous requests can't both pass a separate balance check
            const spend = await prisma.user.updateMany({
                  where: { id: UserId, credits: { gte: CREDITS_PER_GENERATION } },
                  data: { credits: { decrement: CREDITS_PER_GENERATION }, totalCreation: { increment: 1 } }
            })

            if (spend.count === 0) {
                  return res.status(403).json({ message: "Insufficient credits" })
            }
            charged = true;

            //Create a new project
            const project = await prisma.websiteProject.create({
                  data: {
                        name: initial_prompt.length > 50 ? initial_prompt.substring(0, 45) + '...' : initial_prompt,
                        initial_prompt,
                        userId: UserId
                  }
            })

            await prisma.conversation.create({
                  data: {
                        role: 'user',
                        content: initial_prompt,
                        projectId: project.id
                  }
            })

            // Respond now; the builder polls the project while the site is generated in the background
            res.json({ projectId: project.id });
            void generateInitialWebsite(project.id, UserId, initial_prompt);

      } catch (error: any) {
            console.log(error.code || error.message);
            if (charged && UserId) {
                  await prisma.user.update({
                        where: { id: UserId },
                        data: { credits: { increment: CREDITS_PER_GENERATION } }
                  }).catch(() => {})
            }
            res.status(500).json({ message: error.message })
      }
}

// Runs after the response has been sent, so it must never touch `res` and must always
// finish with either saved code or a recorded failure (plus a refund)
const generateInitialWebsite = async (projectId: string, userId: string, initialPrompt: string) => {
      try {
            //Enhance User prompt (optional: if no model answers, build from the user's own words)
            const enhancedPrompt = await generateCompletion([
                  {
                        role: "system",
                        content: `
                        You are a prompt enhancement specialist. Take the user's request and expand it into a detailed, comprehensive prompt that will help an AI system generate a complete website.

                        Enhance this prompt by:
                        1. Adding specific design details (layout, color scheme, typography).
                        2. Including functional requirements (navigation, interactivity, responsiveness).
                        3. Specifying content elements (text, images, multimedia).
                        4. Considering user experience (ease of use, accessibility).
                        5. Making sure the prompt is clear and unambiguous.
                        6. Including modern web design trends and best practices.

                        Return ONLY the enhanced prompt. Nothing else. Make it detailed but concise (2-3 paragraphs max).`
                  }, {
                        role: "user",
                        content: initialPrompt
                  }
            ], { maxTokens: 2000 }).catch(() => null)

            if (enhancedPrompt) {
                  await prisma.conversation.create({
                        data: {
                              role: 'assistant',
                              content: `I have enhanced your prompt to : ${enhancedPrompt}`,
                              projectId
                        }
                  })
            }

            await prisma.conversation.create({
                  data: {
                        role: 'assistant',
                        content: `Generating your website with the enhanced prompt..`,
                        projectId
                  }
            })

            //Generate website code
            const rawCode = await generateCompletion([
                  {
                        role: 'system',
                        content: `
                        You are an expert web developer. Create a complete, production-ready, single-page website based on the user's request.

                        CRITICAL REQUIREMENTS:
                        - You MUST output valid HTML ONLY, starting with <!DOCTYPE html> and ending with </html>.
                        - Use Tailwind CSS for ALL styling
                        - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                        - Use Tailwind utility classes extensively for styling, animations, and responsiveness
                        - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
                        - Use modern, beautiful design with great UX using Tailwind classes
                        - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
                        - Use Tailwind animations and transitions (animate-*, transition-*)
                        - Include all necessary meta tags
                        - Use Google Fonts CDN if needed for custom fonts
                        - Use placeholder images from https://placehold.co/600x400
                        - Make sure all buttons, cards, and components use Tailwind styling

                        Do NOT include markdown, explanations, notes, or code fences.`
                  }, {
                        role: 'user',
                        content: enhancedPrompt || initialPrompt
                  }
            ], { maxTokens: 16000, accept: looksLikeHtml })

            const code = extractHtml(rawCode);

            //create version for the project
            const version = await prisma.version.create({
                  data: {
                        code,
                        description: "Initial version",
                        projectId
                  }
            })

            await prisma.conversation.create({
                  data: {
                        role: 'assistant',
                        content: `Your website has been generated successfully! You can preview it, and request any changes.`,
                        projectId
                  }
            })

            await prisma.websiteProject.update({
                  where: { id: projectId },
                  data: {
                        current_code: code,
                        current_version_index: version.id
                  }
            })
      } catch (error: any) {
            console.log('Website generation failed:', error.code || error.message);
            try {
                  await prisma.conversation.create({
                        data: {
                              role: 'assistant',
                              content: `${GENERATION_FAILED_MESSAGE}. ${error.message || ''} Your ${CREDITS_PER_GENERATION} credits have been refunded.`,
                              projectId
                        }
                  })
                  await prisma.user.update({
                        where: { id: userId },
                        data: { credits: { increment: CREDITS_PER_GENERATION } }
                  })
            } catch (cleanupError: any) {
                  console.log('Failed to record generation failure:', cleanupError.message);
            }
      }
}

//Controller to get a single user project
export const getUserProject = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const { projectId }  = req.params;
            const project = await prisma.websiteProject.findUnique({
                  where: { id: projectId as string, userId: UserId },
                  include: {
                        conversation: {
                              orderBy: { timestamp: 'asc' }
                        },
                        versions: {
                              orderBy: { timestamp: 'asc' }
                        }
                  }
            })

            res.json({ project });

      } catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}


//Controller to get all user projects
export const getUserProjects = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const projects = await prisma.websiteProject.findMany({
                  where: { userId: UserId },
                  orderBy: {
                        updatedAt: 'desc'
                  }
            })

            res.json({ projects });
      } catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

//To toggle project publish
export const togglePublish = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const { projectId } = req.params;
            const project = await prisma.websiteProject.findUnique({
                  where: { id: projectId as string, userId: UserId }
            })

            if (!project) {
                  return res.status(404).json({ message: "Project not found" })
            }

            if (!project.isPublished && !project.current_code) {
                  return res.status(400).json({ message: "Wait for your website to finish generating before publishing it" })
            }

            const updated = await prisma.websiteProject.update({
                  where: { id: projectId as string },
                  data: { isPublished: !project.isPublished }
            })

            res.json({
                  isPublished: updated.isPublished,
                  message: updated.isPublished ? "Published to the community" : "Removed from the community"
            });
      } catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}


//Controller function to purchase credits
export const purchaseCredits = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const { planId } = req.body;
            if (!isPlanId(planId)) {
                  return res.status(404).json({ message: "Plan not found" })
            }
            const plan = PLANS[planId];

            // Stripe redirects back to the page that started checkout
            const origin = (req.headers.origin as string) || process.env.TRUSTED_ORIGINS?.split(',')[0]?.trim();

            const transaction = await prisma.transaction.create({
                  data: {
                        userId: UserId,
                        planId,
                        amount: plan.amount,
                        credits: plan.credits,
                  }
            })

            const session = await getStripe().checkout.sessions.create({
                  success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                  cancel_url: `${origin}/pricing`,
                  client_reference_id: UserId,
                  line_items: [
                        {
                              price_data: {
                                    currency: 'usd',
                                    product_data: { name: `Wizardry AI ${plan.name} - ${plan.credits} credits` },
                                    unit_amount: Math.round(plan.amount * 100)
                              },
                              quantity: 1
                        }
                  ],
                  mode: 'payment',
                  metadata: {
                        transactionId: transaction.id,
                        userId: UserId,
                        appId: APP_ID
                  },
                  expires_at: Math.floor(Date.now() / 1000) + (30 * 60)
            }, {
                  // A retried request for the same transaction can never open a second checkout
                  idempotencyKey: `checkout-${transaction.id}`
            });

            res.json({ payment_link: session.url });

      } catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}

// Called by the payment success page. Stripe webhooks can't reach localhost without the
// Stripe CLI, and can arrive late in production, so the page asks Stripe directly too.
// Both paths share fulfillTransaction, which credits each transaction only once.
export const verifyPayment = async (req: Request, res: Response) => {
      try {
            const UserId = req.UserId;
            if (!UserId) {
                  return res.status(401).json({ message: "Unauthorized" })
            }

            const { sessionId } = req.body;
            if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
                  return res.status(400).json({ message: "Missing checkout session" })
            }

            const session = await getStripe().checkout.sessions.retrieve(sessionId);
            if (session.metadata?.userId !== UserId) {
                  return res.status(404).json({ message: "Payment not found" })
            }

            const transactionId = getPaidTransactionId(session);
            const user = await prisma.user.findUnique({ where: { id: UserId }, select: { credits: true } });

            if (!transactionId) {
                  return res.json({ status: 'pending', credits: user?.credits ?? 0 });
            }

            const result = await fulfillTransaction(transactionId);
            const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
            const updated = await prisma.user.findUnique({ where: { id: UserId }, select: { credits: true } });

            res.json({
                  status: result === 'not_found' ? 'not_found' : 'paid',
                  creditsAdded: transaction?.credits ?? 0,
                  credits: updated?.credits ?? 0,
            });
      } catch (error: any) {
            console.log(error.code || error.message);
            res.status(500).json({ message: error.message })
      }
}
