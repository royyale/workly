# Workly — Day 1 setup

This gets you from zero to a live, working chat-API end-to-end. Do these in order.

## 1. Install dependencies
```
cd workly-app
npm install
```

## 2. Create your Supabase project
1. Go to https://supabase.com, create a new project (free tier is fine).
2. Once it's ready: Project Settings > API — copy the **Project URL** and the
   **service_role** key (not the anon key — the API route needs full access).
3. Go to SQL Editor > New query, paste in everything from `supabase/schema.sql`,
   and run it. This creates your 3 tables and seeds one demo business.

## 3. Get your Anthropic API key
Go to https://console.anthropic.com, create a key under API Keys.

## 4. Set your environment variables
```
cp .env.example .env.local
```
Open `.env.local` and paste in the 3 values from steps 2 and 3.

## 5. Run it locally
```
npm run dev
```
Open http://localhost:3000 — you should see the test chat page talking to
"Luxe Studio" (the seeded demo business). Ask it "what are your hours?" —
if it answers correctly, your full stack (Next.js -> Supabase -> Claude) works.

## 6. Push to GitHub
```
git init
git add .
git commit -m "Day 1: Workly scaffold"
gh repo create workly-app --private --source=. --push
```
(If you don't have the `gh` CLI, just create a repo on github.com and follow
the push instructions it gives you.)

## 7. Deploy to Vercel
1. Go to https://vercel.com, "Add New Project", import your GitHub repo.
2. In the Vercel project settings > Environment Variables, add the same 3
   variables from your `.env.local`.
3. Deploy. You'll get a live URL — that's your real, working product, day one.

## What you've proven by end of Day 1
- A real business record drives the assistant's answers (not hardcoded text)
- Every conversation gets logged to `conversations` (this powers Day 4's dashboard)
- You have a live URL you can already show someone, even before the widget
  and dashboard exist

## Tomorrow (Day 2)
Build the actual embeddable floating-bubble widget that wraps this same
`/api/chat` route, so it can be dropped onto any real business's website.
