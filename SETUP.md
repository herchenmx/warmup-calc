# Warmup Calc — Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** and run the contents of `supabase-setup.sql`
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In **Authentication → Email**, enable "Enable email confirmations" only if you want email verification (optional for dev)

## 2. Local Development

```bash
# Copy the env file and fill in your Supabase values
cp .env.example .env.local
# Edit .env.local with your values

npm run dev
# Open http://localhost:3000
```

## 3. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Next.js

## 4. Supabase Auth Settings (after Vercel deploy)

In Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: add `https://your-app.vercel.app/**`

This is required for magic links to work in production.
