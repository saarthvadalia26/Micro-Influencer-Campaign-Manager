# Micro-Influencer Campaign Manager

A full-stack web application for managing micro-influencer campaigns end-to-end.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database / Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @hello-pangea/dnd
- **Notifications**: Sonner (toasts) + Supabase Realtime

## Setup Instructions

### 1. Install Node.js

Download from [nodejs.org](https://nodejs.org) (LTS recommended).

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run `supabase/schema.sql` to create all tables, triggers, and RLS policies
3. In **Storage**, create a public bucket named `content-drafts`
4. Enable **Realtime** for the `content_drafts` table (Database → Replication)

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in **Supabase Dashboard → Settings → API**.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### Dashboard — Kanban Health Board
- 5-column pipeline: Outreach → Product Sent → Content Pending → Live → Paid
- Drag & drop cards to update status (persists to Supabase)
- Summary stats: active campaigns, influencers engaged, budget metrics

### Campaigns
- Create, edit, view campaigns with budget + date tracking
- Add influencers from your directory to campaigns
- Auto-generated unique Creator Portal link per influencer
- Real-time notifications when new content is submitted

### Influencer Directory
- Full CRUD for influencer profiles
- Social handles (Instagram, TikTok, YouTube)
- Stats: followers, engagement rate, rate/post
- Campaign history per influencer

### Creator Portal (`/portal/[token]`)
- **No login required** — accessible via unique token link
- Shows campaign brief and product tracking
- Drag & drop file upload (image/video) to Supabase Storage
- Caption draft textarea
- Submit for brand review → re-upload if revision requested

### Content Review (Brand Side)
- Preview uploaded images/videos in-app
- Approve ✅ or Request Revision ✏️ with feedback

### ROI Calculator
- Inputs: Total Spend, Total Views, Total Engagements
- Outputs: CPM, CPE, color-coded Efficiency Score (Green/Yellow/Red)
- Saves to `campaign_analytics` table

## Folder Structure

```
app/
  (auth)/login/          — Login page
  (auth)/signup/         — Signup page
  (dashboard)/           — Protected dashboard routes
    page.tsx             — Kanban board
    campaigns/           — Campaign list + detail
    influencers/         — Influencer directory + profiles
    settings/            — Profile settings
  portal/[token]/        — Public creator portal
components/
  kanban/                — KanbanBoard, KanbanColumn, KanbanCard
  campaigns/             — Forms, dialogs, content review
  influencers/           — Forms, dialogs
  portal/                — Upload form, portal content
  roi-calculator/        — ROI Calculator
  ui/                    — Shadcn UI components
lib/
  supabase/              — Client, server, types
  validations/           — Zod schemas
  hooks/                 — Realtime hooks
  utils.ts               — Utilities
supabase/
  schema.sql             — Full database schema
```
👨‍💻 Author
Saarth Vadalia - GitHub
