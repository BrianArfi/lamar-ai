# Job Seeker AI — Build Status & Continuation Guide

**Produk:** Job Seeker AI  
**Domain target:** carikerja.brianarfi.com  
**Stack:** Next.js 15 + Supabase + Anthropic API + Xendit (billing Phase 4)  
**Lokasi project:** `c:\Users\Brian\career-ops-web`

---

## Yang Sudah Selesai

### Foundation (100%)
| File | Deskripsi |
|------|-----------|
| `package.json` | Dependencies lengkap: Supabase, Anthropic SDK, Xendit, Inngest, shadcn/ui |
| `src/middleware.ts` | Auth guard — redirect ke /auth/login kalau belum login, redirect ke /dashboard kalau sudah login dan buka /auth/* |
| `src/lib/supabase/client.ts` | Supabase browser client (untuk komponen client-side) |
| `src/lib/supabase/server.ts` | Supabase server client (untuk Server Components + API routes) |
| `src/types/index.ts` | Semua TypeScript types: Profile, Evaluation, Application, PlanTier, PLAN_LIMITS |
| `src/components/ui/button.tsx` | shadcn Button component |
| `src/lib/utils.ts` | Helper `cn()` untuk Tailwind class merging |
| `supabase/schema.sql` | Schema lengkap: profiles, evaluations, applications + RLS policies + triggers |
| `.env.local.example` | Template environment variables |

---

## Yang Belum Dibangun (Sisa Phase 1)

### Langkah 1 — Setup Supabase Project (15 menit, manual)
Ini HARUS dilakukan dulu sebelum bisa coding apapun.

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor** → paste isi `supabase/schema.sql` → Run
3. Masuk ke **Project Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
4. Buat file `.env.local` (copy dari `.env.local.example`), isi dengan values di atas
5. Isi juga `ANTHROPIC_API_KEY` dari [console.anthropic.com](https://console.anthropic.com)
6. (Opsional) Enable Google OAuth: Supabase dashboard → Auth → Providers → Google

### Langkah 2 — Buat Route Groups (struktur folder)
Buat folder-folder ini di `src/app/`:
```
src/app/
  (marketing)/            ← landing + pricing (no auth required)
    page.tsx
    pricing/page.tsx
  (app)/                  ← semua halaman yang butuh auth
    layout.tsx            ← sidebar + header wrapper
    dashboard/page.tsx
    evaluate/
      page.tsx
      [id]/page.tsx
    applications/page.tsx
    cv/page.tsx
    settings/page.tsx
  auth/
    login/page.tsx
    register/page.tsx
    callback/route.ts     ← OAuth callback handler
  api/
    evaluate/route.ts     ← POST: trigger Claude evaluation
    inngest/route.ts      ← Inngest webhook
```

### Langkah 3 — Build Urutan Ini (jangan loncat-loncat)

#### 3a. Auth pages
- `src/app/auth/login/page.tsx` — form email/password + tombol Google OAuth
- `src/app/auth/register/page.tsx` — form register + auto-create profile
- `src/app/auth/callback/route.ts` — handler setelah OAuth redirect

#### 3b. App layout (sidebar)
- `src/components/layout/sidebar.tsx` — navigasi: Dashboard, Evaluate, Applications, CV, Settings
- `src/app/(app)/layout.tsx` — wrapper yang load sidebar + check auth

#### 3c. Dashboard
- `src/app/(app)/dashboard/page.tsx` — stats (total evaluations, applied, interview) + recent list

#### 3d. Evaluate (CORE FEATURE)
- `src/lib/anthropic/evaluate.ts` — system prompt dari career-ops modes + streaming response
- `src/app/api/evaluate/route.ts` — POST handler, check plan limits, call Claude, save ke DB
- `src/app/(app)/evaluate/page.tsx` — textarea input JD + streaming report viewer
- `src/app/(app)/evaluate/[id]/page.tsx` — view saved report

#### 3e. Applications Tracker
- `src/app/(app)/applications/page.tsx` — tabel dengan company, role, score, status (editable)

#### 3f. Landing Page
- `src/app/(marketing)/page.tsx` — hero section, features, CTA ke /auth/register
  
---

## Catatan Penting untuk Lanjut

### Evaluation System Prompt
File `src/lib/anthropic/evaluate.ts` perlu berisi port dari career-ops.
Source aslinya ada di:
- `c:\Users\Brian\Career-Ops\career-ops\modes\oferta.md` — scoring blocks A-G
- `c:\Users\Brian\Career-Ops\career-ops\modes\_shared.md` — archetype detection + scoring system

Perbedaan dari CLI version: CV tidak dibaca dari filesystem, tapi dari `profile.cv_markdown` di database.

### Plan Limits Enforcement
Di `src/app/api/evaluate/route.ts`, sebelum call Claude:
```ts
import { PLAN_LIMITS } from '@/types'
// check profile.evaluations_count >= PLAN_LIMITS[profile.plan_tier].evaluations
// kalau exceeded → return 403
```

### Streaming Response
Claude evaluation butuh ~30-60 detik. Gunakan `ReadableStream` + `TextEncoder` di API route
agar user lihat progress real-time, bukan loading blank.

### Xendit (Phase 4 — skip dulu)
Jangan implement billing dulu. Free launch. Semua user dapat `plan_tier = 'free'` dengan limit 3 evaluasi/bulan.

---

## Quick Start untuk Lanjut

```bash
cd c:\Users\Brian\career-ops-web

# 1. Copy env dan isi dengan values asli
cp .env.local.example .env.local
# (edit .env.local dengan text editor)

# 2. Jalankan dev server
npm run dev

# 3. Buka http://localhost:3000
```

---

## Phase Roadmap

| Phase | Scope | Estimasi |
|-------|-------|----------|
| **Phase 1** (sekarang) | Auth + Dashboard + Evaluate + Tracker | 2–3 minggu |
| Phase 2 | CV editor + PDF generation (Browserless.io) | 1–2 minggu |
| Phase 3 | Portal scanner + Pattern analysis + Follow-up tracker | 1–2 minggu |
| Phase 4 | Xendit billing + plan gating | 1 minggu |
