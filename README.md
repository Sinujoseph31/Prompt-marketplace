# PromptWithSinu - AI Prompt Marketplace

A full-stack, responsive AI Prompt Marketplace built with Next.js 15 (App Router), Tailwind CSS, and Supabase.

This MVP features a modern, mobile-first design system inspired by premium marketplaces like PromptBase, complete with user authentication, role-based access control, native image uploads, and interactive prompt discoverability.

## ✨ Features

*   **Modern UI/UX:** Clean, high-contrast, edge-to-edge design utilizing Tailwind CSS and `shadcn/ui` components.
*   **Fully Responsive:** Mobile-first architecture ensures the marketplace looks pristine on smartphones, tablets, and ultra-wide desktop monitors.
*   **Role-Based Access Control (RBAC):** Natively managed via Supabase SQL. Supports `buyer`, `seller`, and `admin` roles.
*   **Seller Dashboard:** Approved sellers can submit prompts, configure categories/subcategories, upload multiple native images, select a primary display image, and edit live listings.
*   **Interactive Discoverability:** Live global search bar, continuous-scroll category pills, and auto-generated "Similar Prompts" on detail pages.
*   **Prompt Detail Pages:** Features a scrollable image gallery, a sticky detail sidebar for purchasing/revealing, and a user comments section.
*   **Admin Moderation:** Admins have a dedicated dashboard to approve/reject sellers and prompts, delete spam, and manage users.

## 🚀 Tech Stack

*   **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
*   **Styling:** Tailwind CSS + shadcn/ui
*   **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
*   **Storage:** Supabase Storage (Public Buckets for native image uploads)
*   **Icons:** Lucide React

## 🛠️ Local Setup & Installation

### 1. Supabase Initialization
Before running the application, you need to set up the backend infrastructure on [Supabase](https://supabase.com/).

1. Create a new project in the Supabase Dashboard.
2. Go to the **SQL Editor** in your Supabase project.
3. Open the `supabase_setup.sql` file located in the root of this repository.
4. Copy the entire contents of `supabase_setup.sql` and run it in the SQL Editor. This will automatically provision your tables (`profiles`, `prompts`, `comments`), set up crucial Row Level Security (RLS) policies, and create the automated user triggers.
5. Next, open `storage_setup.sql` and run it in the SQL Editor to create the `prompt-images` storage bucket and its associated public access policies.

### 2. Environment Variables
Create a `.env.local` file in the root of your project and populate it with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_api_key
```

*(You can find these in your Supabase Dashboard under Project Settings > API).*

### 3. Run the Development Server
Install the dependencies and start the local Next.js server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live marketplace!

## 👑 Accessing the Admin Panel

By default, all new sign-ups are assigned the `buyer` role. To access the `/admin` moderation routes, you must elevate an account's privileges.

1. Sign up for an account through the standard `/signup` UI.
2. Go to your Supabase Dashboard > **Table Editor** > `profiles` table.
3. Locate your newly created user row and change the `role` column text from `buyer` to `admin`.
4. Refresh your local application, and you will now have full access to the Admin Dashboard routes.

## 🚢 Deployment (Vercel)

This project is optimized for deployment on Vercel. 

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. **Important:** Remember to add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the **Environment Variables** section in the Vercel deployment settings before building.
4. Deploy!
