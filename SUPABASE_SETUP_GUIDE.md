# Supabase Setup Guide

This guide will help you set up Supabase for your timetable application.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub or create an account

## Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `SIH-TimeTable` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

## Step 3: Get Your Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Update Environment Variables

### For Development (.env.local)
Create a `.env.local` file in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Production (.env.production)
Update your `.env.production` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Netlify Deployment
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key

## Step 5: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Run the migration files in this order:

### First Migration (schema.sql)
Copy and paste the content from `supabase/migrations/001_initial_schema.sql`

### Second Migration (RLS policies)
Copy and paste the content from `supabase/migrations/002_rls_policies.sql`

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see all the tables created:
   - profiles
   - departments  
   - subjects
   - classrooms
   - batches
   - timetables
   - time_slots
   - timetable_entries
   - subject_faculty
   - faculty_availability

## Step 7: Test the Application

1. Restart your development server or redeploy to Netlify
2. The configuration warning should disappear
3. You should be able to log in and use all features

## Troubleshooting

### "Failed to fetch" errors
- Double-check your environment variables are correct
- Ensure no trailing slashes in the URL
- Verify the anon key is complete (they're quite long)

### Database connection issues
- Check if migrations ran successfully
- Verify RLS policies are enabled
- Test the connection in Supabase dashboard

### Netlify deployment issues
- Make sure environment variables are set in Netlify dashboard
- Check build logs for any missing dependencies
- Ensure your `.env.production` file is updated

## Need Help?

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Check the database logs in your Supabase dashboard
- Verify your project is not paused (free tier limitation)