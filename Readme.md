# 🚀 Wizardry AI: The Future of Web Development

[![CI](https://github.com/akash1723tripathi/Wizardry-Ai----AI-Website-Buillder/actions/workflows/ci.yml/badge.svg)](https://github.com/akash1723tripathi/Wizardry-Ai----AI-Website-Buillder/actions/workflows/ci.yml)
![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue?style=for-the-badge)

**Turn your ideas into fully functional, responsive websites in minutes.**

**Wizardry AI** is a full-stack platform that lets anyone build a website by describing it in plain English. Large Language Models accessed through **OpenRouter** write the site as a single HTML page styled with Tailwind CSS. You then refine it by chatting with the AI, editing elements visually, or restoring an earlier version, and publish it to a public community gallery.

It is built on the **PERN stack** (PostgreSQL, Express, React, Node.js) with **Stripe** for buying credits.

---

## 🌟 Key Features

### 🧠 **Generative AI Core**

* **Prompt-to-website**: Describe a site and the AI writes a complete, responsive HTML page with Tailwind CSS.
* **Chat to change it**: Ask for edits like "make the hero darker" or "add a pricing section" and the page is rewritten.
* **Version history**: Every generation is saved as a version you can preview or restore.
* **Reliable generation**: Requests go through a chain of fallback models with automatic retries. If generation still fails, the user sees why and the credits are refunded.

### 🎨 **Builder**

* **Click-to-edit**: Select any element in the preview to change its text, spacing, colours and font size.
* **Device preview**: Switch between desktop, tablet and phone viewports.
* **Live progress**: See which stage generation is at, and how long it has been running.
* **Export**: Download the site as a single `index.html` file.

### 🌍 **Community**

* **Publish**: One click shares a site in the public community gallery, shown on the home page and at `/community`.
* **Public pages**: Each published site has its own page at `/view/:id`, showing who built it.
* **Safe rendering**: Community sites run in a sandboxed iframe without same-origin access, so a published page cannot act on the visitor's account.

### 💳 **Credits & Payments**

* **Credits**: Every new website and every change costs **5 credits**. New accounts start with **20 free**, and credits never expire.
* **Plans**: One-time packs, **Pro: $5 for 50 credits** and **Plus: $49 for 500 credits**.
* **Stripe Checkout**: Payments are confirmed both by webhook and from the success page. Each payment is credited exactly once, even if Stripe retries the webhook.
* **Authentication**: Email and password accounts powered by **Better Auth**.

---

## 🛠️ Tech Stack

### **Frontend**

* **React 18 + Vite** with **TypeScript**
* **Tailwind CSS** for styling, with a few **Radix UI**/shadcn components (dropdown menu, avatar)
* **Framer Motion** and **Lenis** for motion and smooth scrolling
* **Lucide React** icons
* **GradientASCII** (React Bits) WebGL background on the hero

### **Backend**

* **Node.js & Express 5**
* **PostgreSQL** (works with Neon) through **Prisma ORM**
* **Better Auth** for sessions
* **Stripe** for payments

### **AI**

* **OpenRouter** through the OpenAI SDK. By default it uses free models, which you can change with `AI_MODELS`.

---

## 🏗️ How It Works

1. **Prompt**: The user describes a website. 5 credits are deducted in a single atomic database update, so simultaneous requests can never overdraw the balance.
2. **Enhancement**: An LLM expands the prompt into a detailed design brief. This step is optional; if it fails, generation continues with the original prompt.
3. **Generation**: A model writes the complete HTML document in the background while the builder shows progress. Answers that are cut off or are not a full HTML page are rejected, and the next model is tried.
4. **Storage**: The code is saved in PostgreSQL as the project's current version. If every model fails, the failure is recorded in the chat and the credits are refunded.
5. **Refinement**: Chat requests and visual edits create new versions, and any version can be restored.
6. **Publishing**: Published sites appear in the community gallery and on their own public page.

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+
* A PostgreSQL database (local or a Neon connection string)
* An OpenRouter API key
* A Stripe account in test mode (only needed for buying credits)

### 1. Clone the repository

```bash
git clone https://github.com/akash1723tripathi/Wizardry-Ai----AI-Website-Buillder.git
cd Wizardry-Ai----AI-Website-Buillder
```

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/dbname"

BETTER_AUTH_SECRET="a-long-random-string"
BETTER_AUTH_URL="http://localhost:3000"
# Comma-separated origins allowed to call the API (the frontend dev server)
TRUSTED_ORIGINS="http://localhost:5173"

# OpenRouter key (the variable name comes from the OpenAI SDK used to call it)
OPENAI_API_KEY="sk-or-..."
# Optional: comma-separated OpenRouter models to try in order
# AI_MODELS="cohere/north-mini-code:free,nvidia/nemotron-3.5-lightning:free"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Create `frontend/.env`:

```env
VITE_BASEURL="http://localhost:3000"
```

### 3. Start the backend

```bash
cd backend
npm install
npx prisma migrate deploy   # create the database tables
npx prisma generate         # generate the Prisma client
npm run dev                 # http://localhost:3000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### Stripe webhooks

Credits are confirmed from the payment success page, so purchases work locally without any webhook setup. In production, add a webhook endpoint pointing to `https://<your-api>/api/stripe` with these events:

* `checkout.session.completed`
* `checkout.session.async_payment_succeeded`

To test webhooks locally, use the [Stripe CLI](https://docs.stripe.com/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/stripe
```

---

## 🧪 Checks & CI

GitHub Actions runs on every pull request and on every push to `main`:

| Job | What it runs |
| --- | --- |
| Frontend build | `npm ci` then `npm run build`, which type-checks before bundling |
| Backend type check | `npm ci`, `npx prisma generate`, then `npx tsc --noEmit` |

Run the same checks locally:

```bash
(cd frontend && npm run build)
(cd backend && npx tsc --noEmit -p .)
```

---

## 📁 Project Structure

```text
backend/
  config/       AI model chain (openAi.ts) and credit plans (plans.ts)
  controllers/  Projects, revisions, users, payments and the Stripe webhook
  lib/          Better Auth, Prisma client and payment fulfilment
  prisma/       Database schema and migrations
  routes/       /api/user and /api/project routes
frontend/
  src/pages/        Home, builder (Projects), community, public view, pricing, auth
  src/components/   Landing sections, builder panels, community cards, navbar
  src/lib/          Auth client, plans, generation state and community helpers
```

---

Made with ❤️ by Akash Tripathi
