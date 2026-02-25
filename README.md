# Prompt Marketplace (Phase 1)

A scalable multi-category AI prompt marketplace built with Next.js App Router, Tailwind CSS, and Supabase.

## Features
- **User Authentication**: Secure Sign Up & Login with Supabase Auth.
- **Roles**: Buyers, Sellers, and Admins.
- **Prompt Submission**: Approved sellers can easily submit their prompts (pending review).
- **Public Listings**: View approved prompts categorized neatly. Reveal prompt contents dynamically.
- **Admin Dashboard**: Approving sellers, reviewing prompts, and moderation.
- **Security**: Robust Row Level Security (RLS) policies protecting user and prompt data.

## Getting Started

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and copy/paste everything from `supabase_setup.sql` and run it. This creates all tables, triggers, and Row Level Security policies.
3. Obtain your Project URL and Anon Key from **Project Settings > API**.

### 2. Environment Variables
Edit the `.env.local` file in the root of the project with your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
Install project dependencies if you haven't already:
```bash
npm install
```

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Roles & Testing

- **Buyer**: The default role when you sign up.
- **Admin**: To test admin features, sign up normally, then go to your Supabase Table Editor (`profiles` table), find your row, and change `role` to `admin`. Refresh the app and you will see the Admin Panel.
- **Seller**: As an admin, you can upgrade buyers to sellers via the Admin Panel. Approved sellers will see a "Submit Prompt" button.

## Deployment
This app can be deployed easily on [Vercel](https://vercel.com). Make sure to add the Supabase URL and Anon Key to Vercel's Environment Variables during deployment.
