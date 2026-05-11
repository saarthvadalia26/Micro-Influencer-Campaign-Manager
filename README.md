# 🚀 Micro-Influencer Campaign Manager

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

A comprehensive, enterprise-grade platform designed to streamline micro-influencer campaign management. From outreach and negotiation to content approval and ROI tracking, this tool provides a centralized hub for brands to scale their influencer marketing efforts.

## ✨ Key Features

### 📋 Campaign & Pipeline Management
*   **Dynamic Kanban Board**: Visualize your influencer pipeline through a 5-stage workflow: *Outreach → Negotiation → Content Pending → Live → Paid*.
*   **Drag-and-Drop Workflow**: Powered by `@hello-pangea/dnd` for smooth, real-time status updates.
*   **Centralized Tracking**: Monitor budgets, dates, and influencer assignments across multiple active campaigns.

### 👤 Advanced Influencer Directory
*   **Robust Profiles**: Detailed influencer profiles including social handles (Instagram, TikTok, YouTube), niche classification, and historical performance.
*   **Stats Engine**: Real-time tracking of follower counts, engagement rates, and average cost-per-post.
*   **Campaign History**: Automatic tracking of every influencer's past involvement and performance within your brand.

### 🎨 Creator Portal (White-Label Experience)
*   **Token-Based Access**: Secure, password-less links for influencers to access their specific campaign briefs.
*   **Content Upload Pipeline**: Seamless drag-and-drop file uploads (images/videos) directly to Supabase Storage.
*   **Feedback Loop**: Integrated revision request system allowing brands to provide feedback and creators to re-upload content.

### 📊 Analytics & ROI Dashboard
*   **Automated ROI Calculator**: Instant calculation of CPM (Cost Per Mille), CPE (Cost Per Engagement), and overall Efficiency Scores.
*   **Financial Overview**: Track total spend, remaining budget, and payment statuses.
*   **Automated Screenshots**: Integrated with ScreenshotOne API to capture live posts automatically for proof of delivery.

## 🛠️ Technology Stack

*   **Core**: Next.js 15 (App Router), TypeScript, React 19
*   **Authentication**: Supabase Auth (SSR)
*   **Database**: PostgreSQL via Supabase with RLS (Row Level Security)
*   **Storage**: Supabase Storage for high-resolution media handling
*   **UI/UX**: Tailwind CSS, Shadcn UI, Framer Motion for micro-animations
*   **Forms**: React Hook Form + Zod for strict type-safe validation
*   **Performance**: Request-level caching and optimized database projections

## 🚀 Getting Started

### Prerequisites
*   Node.js 18.x or higher
*   Supabase Account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/saarthvadalia26/Micro-Influencer-Campaign-Manager.git
    cd Micro-Influencer-Campaign-Manager
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Supabase Setup**:
    *   Create a new project at [supabase.com](https://supabase.com).
    *   Run the provided `supabase/schema.sql` in the SQL Editor.
    *   Create a storage bucket named `content-drafts` and set its privacy to public.
    *   Enable Realtime for the `content_drafts` table.

4.  **Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    SCREENSHOT_API_KEY=your_screenshot_one_api_key
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Dashboard & Portal)
├── components/           # UI Components (Kanban, ROI, Forms)
├── lib/                  # Utilities (Supabase client, Helpers, Hooks)
├── supabase/             # Database migrations and schema
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## ⚡ Performance Optimizations
This project implements several advanced performance patterns:
*   **Memoized Auth**: Cached `getUser` calls to prevent redundant network requests during server-side rendering.
*   **Lean Projections**: All database queries are optimized to fetch only required columns, significantly reducing the JSON payload size.
*   **Parallel Fetching**: Leveraging `Promise.all` for concurrent data fetching in complex dashboard views.

## 👨‍💻 Author
**Saarth Vadalia**
*   GitHub: [@saarthvadalia26](https://github.com/saarthvadalia26)

---
*Built with ❤️ for the creator economy.*