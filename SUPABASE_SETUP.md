# 🔧 Supabase Configuration Guide

## Quick Fix for "supabase not defined" Error

If you're getting a "supabase not defined" error, follow these steps:

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization and create a new project
5. Wait for the project to be set up (takes 1-2 minutes)

### Step 2: Get Your Supabase Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon key** (long string starting with `eyJhbGciOiJ...`)

### Step 3: Configure Environment Variables
1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 4: Set Up Database Tables
1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration files from the `supabase/migrations/` folder:
   - First run: `20250926000001_create_timetable_schema.sql`
   - Then run: `20250926000002_create_rls_policies.sql`

### Step 5: Restart Development Server
```bash
pnpm dev
```

## ✅ Verification
- If configured correctly, you'll see the login form
- If not configured, you'll see a helpful configuration warning
- The error "supabase not defined" should be resolved

## 🚨 Troubleshooting
- Make sure there are no spaces around the `=` in your `.env.local` file
- Verify your Supabase project is active and not paused
- Check that your anon key is the **public anon key**, not the service role key
- Restart your development server after making changes to `.env.local`

## 🔐 Security Note
The anon key is safe to use in client-side code as it's designed for public access with Row Level Security (RLS) policies controlling access.