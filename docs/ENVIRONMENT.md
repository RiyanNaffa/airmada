# Konfigurasi Environment Variables

Dokumen ini menjelaskan semua environment variable yang dibutuhkan untuk menjalankan aiRMADA secara lokal maupun di production.

---

## Web App (`apps/web/.env.local`)

Salin template terlebih dahulu:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Kemudian isi setiap nilai sesuai panduan di bawah.

### Supabase

Didapat dari **Supabase Dashboard → Project → Settings → API**.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable...
```

### Groq API (LLM Inference)

Daftar gratis di [console.groq.com](https://console.groq.com). Tidak butuh kartu kredit.
Free tier: 30 request/menit, 14.400 request/hari.

```bash
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama3-8b-8192       # Model yang digunakan (default)
```

Model alternatif yang tersedia di Groq free tier: `llama3-70b-8192`, `mixtral-8x7b-32768`.

### Gemini API (Fallback LLM)

Daftar gratis di [aistudio.google.com](https://aistudio.google.com). Tidak butuh kartu kredit.
Free tier: 15 request/menit, 1.500 request/hari.

```bash
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-flash   # Model yang digunakan (default)
```

### Internal AI Service

Diisi setelah AI service berjalan (lokal atau deployed).

```bash
# Lokal (development)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=dev-secret-local

# Production (HuggingFace Spaces atau VPS)
# AI_SERVICE_URL=https://username-airmada-ai.hf.space
# AI_SERVICE_SECRET=<random string panjang>
```

Untuk generate secret yang aman:

```bash
openssl rand -hex 32
```

### App

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## AI Service (`apps/ai-service/.env`)

```bash
AI_SERVICE_SECRET=dev-secret-local   # Harus sama dengan AI_SERVICE_SECRET di web app
WEB_APP_URL=http://localhost:3000    # Untuk konfigurasi CORS
```

---

## GitHub Actions Secrets

Untuk CI/CD pipeline berjalan, tambahkan secrets berikut di:
**GitHub Repository → Settings → Secrets and Variables → Actions**

| Secret                                 | Keterangan                                             |
| -------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key                                      |
| `GROQ_API_KEY`                         | Groq API key                                           |
| `GEMINI_API_KEY`                       | Gemini API key                                         |
| `AI_SERVICE_URL`                       | URL AI service yang sudah di-deploy                    |
| `AI_SERVICE_SECRET`                    | Shared secret antara web app dan AI service            |
| `VERCEL_TOKEN`                         | Token dari Vercel dashboard (untuk deploy-web.yml)     |
| `VERCEL_ORG_ID`                        | Organization ID Vercel                                 |
| `VERCEL_PROJECT_ID`                    | Project ID Vercel                                      |
| `VPS_HOST`                             | IP address VPS (untuk deploy-ai.yml, jika pakai VPS)   |
| `VPS_USER`                             | Username SSH VPS                                       |
| `VPS_SSH_KEY`                          | Private key SSH (isi seluruh isi file `~/.ssh/id_rsa`) |

---

## Cara Mendapatkan Vercel Credentials

```bash
# Install Vercel CLI
npm install -g vercel

# Login dan link project
vercel login
cd apps/web
vercel link

# Setelah link, cek .vercel/project.json untuk orgId dan projectId
cat .vercel/project.json
```

Token tersedia di: **Vercel Dashboard → Account Settings → Tokens**.

---

## Checklist Sebelum Menjalankan

- [ ] `apps/web/.env.local` sudah dibuat dari `.env.example`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sudah diisi
- [ ] `GROQ_API_KEY` atau `GEMINI_API_KEY` sudah diisi (minimal salah satu)
- [ ] `AI_SERVICE_URL` dan `AI_SERVICE_SECRET` sudah diisi dan konsisten dengan `apps/ai-service/.env`
- [ ] Supabase migrations sudah di-push (`supabase db push` dari `packages/database/`)
