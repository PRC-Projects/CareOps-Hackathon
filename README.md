# CareOps: The AI-Powered Operating System for Service Businesses

<img width="1902" height="935" alt="image" src="https://github.com/user-attachments/assets/3030f852-badf-4e59-a86e-31fc0320ab29" />

**CareOps** is an intelligent, all-in-one SaaS platform designed to replace the fragmented toolset (WhatsApp, Excel, Calendly) used by service businesses like clinics, auto shops, and salons. It unifies bookings, internal comms, and inventory into a single "Operating System" powered by **Google Gemini 1.5 Flash**.

## 🚀 Live Demo
https://careops-platform-hackathon.vercel.app/

## 💡 The Problem
Service businesses struggle with operational chaos:
* **Disconnected Tools:** Booking is on one app, chat on another, inventory on paper.
* **Manual Data Entry:** Staff waste hours typing clinical notes or service logs.
* **Customer Service Lag:** Owners can't reply to every inquiry instantly.

## ⚡ The Solution: AI-First Operations
CareOps introduces a "Smart Layer" over standard business tools:
* **Generative Onboarding:** Enter a business description (e.g., "Dental Clinic"), and the AI generates the entire service menu, pricing, and intake forms automatically.
* **Voice-to-Record Engine:** Staff dictate raw service notes, and the AI transcribes and polishes them into professional records in seconds.
* **Context-Aware Inbox:** The system analyzes chat history to draft smart replies and summarize long threads for the owner.

## 🛠️ Tech Stack

### Core Infrastructure
* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) - Utilizing Server Actions for all mutations.
* **Language:** TypeScript - Strict type safety across the full stack.
* **Database:** PostgreSQL (via [Prisma ORM](https://www.prisma.io/)).
* **Authentication:** [Clerk](https://clerk.com/) - Custom Middleware with RBAC (Role-Based Access Control).

### AI & Intelligence
* **Model:** Google Gemini 1.5 Flash.
* **Audio Processing:** Native MediaRecorder API + Gemini Multimodal capabilities (Audio-to-Text).
* **SDK:** Google Generative AI SDK for Node.js.

### UI & UX
* **Styling:** Tailwind CSS.
* **Components:** Shadcn/ui & Radix Primitives.
* **Animations:** Framer Motion.
* **3D Elements:** Spline / Three.js (Landing Page).

## ✨ Key Features

### 1. 🧠 Intelligent Voice Notes
Instead of typing, mechanics or doctors can speak their findings.
* **Tech:** Captures `Blob` via MediaRecorder -> Sends to Gemini 1.5 Flash -> Returns polished, grammar-corrected text -> Saves to PostgreSQL.

### 2. 💬 Smart Team Inbox
A centralized chat for internal team communication and customer support.
* **Feature:** "Magic Wand" button drafts replies based on the last 10 messages of context.
* **Feature:** "Summarize" button condenses long threads into 3 bullet points.

### 3. 🛡️ Role-Based Access Control (RBAC)
Secure separation of duties.
* **Owners:** Full access to Settings, Staff Management, and Financials.
* **Staff:** Restricted view (My Day, Inbox, Active Jobs only).

### 4. 📅 Dynamic Booking Engine
* **Public Facing:** SEO-optimized booking page for customers.
* **Internal:** Conflict detection and real-time calendar management.

### 5. 📦 Predictive Inventory (Beta)
Tracks stock levels and uses AI to predict low-stock warnings based on service usage patterns.

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* PostgreSQL Database (Local or Neon/Supabase)
* Clerk Account
* Google AI Studio Key

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/your-username/careops-platform.git
    cd careops-platform
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root:
    ```env
    # Database
    DATABASE_URL="postgresql://..."

    # Auth (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

    # AI
    GOOGLE_API_KEY="AIzaSy..."
    ```

4.  **Push Database Schema**
    ```bash
    npx prisma db push
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```bash
├── actions/          # Server Actions (Backend Logic)
│   ├── ai.ts         # Gemini Integration
│   ├── bookings.ts   # Booking CRUD
│   └── ...
├── app/              # Next.js App Router
│   ├── api/          # Route Handlers
│   ├── dashboard/    # Protected App Routes
│   └── page.tsx      # Landing Page
├── components/       # React Components
│   ├── dashboard/    # App-specific UI
│   └── ui/           # Shadcn Reusable UI
├── prisma/           # Database Schema
└── public/           # Static Assets

```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Pritam Roy Choudhury**

* [LinkedIn](https://www.linkedin.com/in/pritam-roy-choudhury/)
* [GitHub](https://github.com/PRC-Projects/CareOps-Hackathon)

---

*Built with ❤️ for the CareOps Hackathon 2026 organized by Humanity Founders*
