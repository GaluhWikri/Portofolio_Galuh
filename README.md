# 🎨 Portfolio Website - Galuh Wikri Ramadhan

Modern portfolio website built with Next.js 15, featuring Supabase integration, on-demand revalidation, and stunning animations.

## ✨ Features

- 🚀 **Next.js 15** with App Router & TypeScript
- 💾 **Supabase Integration** for dynamic content (projects & skills)
- ⚡ **ISR (Incremental Static Regeneration)** for instant loading
- 🔄 **On-Demand Revalidation** for real-time updates
- 🎭 **Framer Motion** animations
- 📱 **Fully Responsive** design
- 🎨 **Modern UI** with glassmorphism effects

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REVALIDATE_SECRET=dev123  # Change in production!
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🔄 Data Update System

### Automatic Revalidation (ISR)
- **Development:** Updates every 30 seconds
- **Production:** Updates every 1 hour

### Manual Revalidation (On-Demand) ⚡

Update data instantly without redeploying:

**Via Browser:**
```
http://localhost:3000/api/revalidate?secret=dev123
```

**Via curl:**
```bash
curl http://localhost:3000/api/revalidate?secret=dev123
```

**Via POST (for Webhooks):**
```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"dev123","path":"/"}'
```

### 🔗 Supabase Webhook Setup (Optional)

For automatic updates when data changes in Supabase:

1. Go to Supabase Dashboard → Database → Webhooks
2. Create new webhook for `projects` or `skills` table
3. Set URL: `https://yourdomain.com/api/revalidate`
4. Method: `POST`
5. Payload:
   ```json
   {
     "secret": "your_secret_here",
     "path": "/"
   }
   ```

## 📁 Project Structure

```
portofolio/
├── app/
│   ├── api/
│   │   ├── revalidate/     # On-demand revalidation endpoint
│   │   └── github/         # GitHub stats API
│   ├── components/         # React components
│   ├── ClientHomePage.tsx  # Main page component
│   └── page.tsx           # Entry point with ISR config
├── lib/
│   ├── supabase.ts        # Supabase client & queries
│   └── dataFetcher.ts     # Data fetching with fallback
├── public/                # Static assets
└── data.json             # Fallback data
```

## 🗄️ Supabase Schema

### `projects` Table
```sql
id              bigint (primary key)
title           text
category        text ('UI/UX' | 'WEB')
description     text (optional)
tech            text[] (array)
image_url       text
link            text (optional)
order_index     integer
is_active       boolean
is_featured     boolean
```

### `skills` Table
```sql
id              bigint (primary key)
name            text
icon_url        text
category        text
order_index     integer
is_active       boolean
```

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `REVALIDATE_SECRET` (use strong random string!)
4. Deploy! 🎉

### Post-Deploy Updates

**No need to redeploy!** Just call:
```
https://yourdomain.com/api/revalidate?secret=YOUR_SECRET
```

## 📝 Adding New Content

### Add Project
1. Go to Supabase → `projects` table → Insert row
2. Fill in all fields, set `is_active = true`
3. **Option A:** Wait max 1 hour (automatic)
4. **Option B:** Call revalidate API instantly:
   ```
   https://yourdomain.com/api/revalidate?secret=YOUR_SECRET
   ```

### Add Skill
Same as above, but use `skills` table

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Database:** Supabase
- **Deployment:** Vercel

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ by [Galuh Wikri Ramadhan](https://github.com/GaluhWikri)

