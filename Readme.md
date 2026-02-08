# 🚀 Wizardry AI: The Future of Web Development

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue?style=for-the-badge)


**Turn your wildest ideas into fully functional, responsive websites in seconds.**

The **Wizardry AI** is a revolutionary full-stack platform that democratizes web development. Powered by state-of-the-art Large Language Models (LLMs) via **OpenRouter**, this application allows users to generate production-ready websites simply by describing them in plain English. Beyond generation, it features a sophisticated **No-Code/Low-Code Editor**, allowing granular control over every DOM element, style, and layout—bridging the gap between AI automation and human creativity.

Designed with a scalable **PERN Stack** (PostgreSQL, Express, React, Node.js) and integrated with **Stripe** for monetization, this project represents a complete SaaS solution ready for the real world.

---

## 🌟 Key Features

### 🧠 **Generative AI Core**
* **Prompt-to-Website Engine**: Transforms natural language inputs into complex, multi-section HTML/CSS structures using advanced prompt engineering and context-aware AI models.
* **AI-Powered Iterations**: Don't like a section? Simply ask the AI to "change the navbar to dark mode" or "replace the hero image," and watch the code update instantly.
* **Version Control System**: Built-in rollback functionality allows users to travel back in time to previous iterations of their design, ensuring no creative experiment is ever lost.

### 🎨 **Advanced Visual Editor**
* **Interactive DOM Manipulation**: Click any element on the generated preview to open a powerful property editor.
* **Granular Styling Control**: Manually tweak padding, margins, colors, fonts, and Tailwind classes without touching a line of code.
* **Real-time Preview**: See changes instantly with a split-screen view offering Desktop, Tablet, and Mobile viewports.

### 💼 **SaaS & Community Features**
* **Credit-Based Economy**: Integrated **Stripe** payment gateway allows users to purchase credits for generating and updating projects.
* **Authentication System**: Secure user management (Sign Up/Login) powered by **Better-Auth**.
* **Public Community Showcase**: Users can publish their creations to a community gallery, fostering inspiration and collaboration.
* **Source Code Export**: One-click download of the generated project as a clean, deployable `index.html` file.

---

## 🛠️ Tech Stack

This project leverages a modern, high-performance stack designed for scalability and developer experience.

### **Frontend**
* **React (Vite)**: For lightning-fast development and optimized production builds.
* **TypeScript**: Ensuring type safety and code reliability across the entire codebase.
* **Tailwind CSS**: For rapid, utility-first styling and responsive design.
* **Shadcn UI**: For accessible, high-quality UI components.
* **Lucide React**: For beautiful, consistent iconography.


### **Backend**
* **Node.js & Express**: A robust, event-driven architecture handling API requests and AI orchestration.
* **PostgreSQL (Neon DB)**: A serverless, scalable relational database for storing user data, projects, and transaction history.
* **Prisma ORM**: For type-safe database access and schema management.
* **Better-Auth**: For secure, uncompromising authentication flows.

### **AI & Third-Party Services**
* **OpenRouter API**: Accessing top-tier LLMs (like GLM-4, Claude 3.5, or Llama 3) for code generation.
* **Stripe**: Secure payment processing for the credit system.
* **Render**: Production deployment environment.

---

## 🏗️ Architecture & Workflow

1.  **User Input**: The user enters a prompt (e.g., "Build a portfolio for a photographer").
2.  **Prompt Enhancement**: The backend intercepts the prompt and uses an LLM to "enhance" it, adding technical details and design constraints to ensure high-quality output.
3.  **Code Generation**: The enhanced prompt is fed into a coding-specialized LLM, which streams back semantic HTML and Tailwind CSS.
4.  **Database Transaction**: The generated code, user credits, and project metadata are securely stored in PostgreSQL via Prisma.
5.  **Live Rendering**: The frontend dynamically renders the raw code in a sandboxed iframe, providing an instant preview.
6.  **Iterative Refinement**: Subsequent user prompts or manual edits trigger database updates and re-renders, creating a seamless feedback loop.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* Node.js (v18+)
* PostgreSQL (Local or Neon DB connection string)
* Stripe Account (for payments)
* OpenRouter API Key (for AI generation)

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/akash1723tripathi/AI-Website-Buillder.git](https://github.com/akash1723tripathi/AI-Website-Buillder.git)
    cd AI-Website-Buillder
    ```

2.  **Setup Backend and Start **
    ```bash
    cd backend
    npm install
    npx prisma generate
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

### Environment Variables

Create a `.env` file in the **backend** directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@host:port/dbname"
BETTER_AUTH_SECRET="your_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"
AI_API_KEY="your_openrouter_api_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
TRUSTED_ORIGINS="http://localhost:5173"
```

Create a `.env` file in the *frontend** directory:
```env
VITE_BASE_URL="http://localhost:3000"
```
---

Made with ❤️ by Akash Tripathi

