# **aiRMADA**

> **Aplikasi manajemen dan monitoring armada logistik berbasis AI**, dirancang untuk membantu perusahaan ekspedisi memantau kendaraan, mengelola pengiriman, dan mengoptimalkan rute secara cerdas dalam satu platform terpadu.

aiRMADA dibangun di atas arsitektur **monorepo** (Turborepo) yang menggabungkan web application berbasis Next.js dengan AI microservice berbasis Python FastAPI, terhubung ke Supabase sebagai backend-as-a-service.

---

## Kelompok

**Faniri Solutions (03)**

|                | Nama                     | NIM                |
| -------------- | ------------------------ | ------------------ |
| Ketua Kelompok | **Riyan Naffa Nusafara** | 23/516897/TK/56833 |
| Anggota 1      | **Fanisah**              | 23/520128/TK/57322 |
| Anggota 2      | **Irfan Firdaus Isyfi**  | 23/518614/TK/57120 |

---

## Fitur Utama

| Modul                        | Deskripsi                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| 🚛 **Manajemen Armada**      | Registrasi kendaraan, manajemen supir, assignment kendaraan             |
| 📦 **Manajemen Shipment**    | Buat paket, tracking status real-time, public tracking link             |
| 🗺️ **Routing & Penjadwalan** | Buat rute harian dengan optimasi urutan pengiriman via AI               |
| 📡 **Live Monitoring**       | Peta armada real-time, notifikasi anomali, log aktivitas                |
| 🤖 **AI Features**           | Chatbot operasional, optimasi rute (TSP), prediksi ETA, deteksi anomali |
| 📊 **Analytics**             | Dashboard KPI, tren performa, heatmap pengiriman, export laporan        |
| 👤 **Multi-role Access**     | Manager, Dispatcher, Driver — masing-masing dengan akses berbeda        |

---

## Tech Stack

| Layer      | Teknologi                                            |
| ---------- | ---------------------------------------------------- |
| Web App    | Next.js 16 (App Router, TypeScript)                  |
| Styling    | Tailwind CSS v4                                      |
| API        | Next.js API Routes (Serverless)                      |
| Database   | Supabase (PostgreSQL + Realtime + Auth + Storage)    |
| AI LLM     | Groq API (LLaMA 3) + Google Gemini Flash             |
| AI Service | Python FastAPI + scikit-learn + OR-Tools             |
| Monorepo   | Turborepo + npm Workspaces                           |
| Testing    | Vitest (unit) + Playwright (e2e) + MSW (mock)        |
| CI/CD      | GitHub Actions                                       |
| Deployment | Vercel (web) + HuggingFace Spaces / VPS (AI service) |

---

## Struktur Project

```
aiRMADA/
├── apps/
│   ├── web/                    # Next.js 16 TypeScript web app
│   │   └── src/
│   │       ├── app/            # App Router pages + API routes
│   │       ├── components/     # React components
│   │       ├── hooks/          # Custom React hooks
│   │       ├── lib/            # Utilities, Supabase client, AI helpers
│   │       ├── store/          # Zustand state management
│   │       ├── tests/          # Unit (Vitest) + E2E (Playwright) + MSW mocks
│   │       └── types/          # Local type re-exports
│   │
│   └── ai-service/             # Python FastAPI AI microservice
│       ├── app/                # FastAPI app, routers, models, schemas
│       ├── training/           # Jupyter notebooks + training scripts
│       ├── saved_models/       # Trained model artifacts (.pkl)
│       └── tests/              # Pytest test suite
│
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & enums
│   └── database/               # Supabase SQL migrations + generated types
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, type-check, unit test (setiap PR)
│       ├── deploy-web.yml      # Auto-deploy ke Vercel (merge ke main)
│       └── deploy-ai.yml       # Deploy AI service via SSH (merge ke main)
│
├── turbo.json                  # Turborepo task pipeline
├── package.json                # Root workspace
└── README.md
```

---

## Prasyarat

Pastikan semua tools berikut sudah terinstall sebelum memulai setup:

| Tools   | Versi Minimum | Cek                 |
| ------- | ------------- | ------------------- |
| Node.js | >= 20.x       | `node --version`    |
| npm     | >= 10.x       | `npm --version`     |
| Python  | >= 3.11       | `python3 --version` |
| Git     | >= 2.x        | `git --version`     |

---

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/fanisah/aiRMADA.git
cd aiRMADA
```

### 2. Konfigurasi Environment Variables

Web app membutuhkan beberapa API key dan konfigurasi sebelum bisa dijalankan.

```bash
cp apps/web/.env.example apps/web/.env.local
```

Buka `apps/web/.env.local` dan isi nilai yang diperlukan. Lihat panduan lengkap di **[docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)**.

### 3. Setup NPM Project (Next.js + Turborepo)

Dari **root directory** `aiRMADA/`:

```bash
# Install semua dependencies (semua workspace sekaligus)
npm install

# Verifikasi: lint, type-check, dan unit test harus passed
npm run lint
npm run type-check
npm run test --workspace=apps/web -- --run

# Jalankan development server
npm run dev
```

Web app berjalan di **http://localhost:3000**

### 4. Setup Python Project (FastAPI AI Service)

Dari **root directory** `aiRMADA/`, buka terminal baru:

```bash
cd apps/ai-service

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
# python -m venv .venv
# .venv\Scripts\Activate

# Install semua dependencies (termasuk dev dependencies untuk testing)
pip install -r requirements-dev.txt

# Jalankan AI service di port 8000
uvicorn app.main:app --reload --port 8000
```

AI service berjalan di **http://localhost:8000**\
Dokumentasi API otomatis tersedia di **http://localhost:8000/docs**

### 5. Verifikasi Setup

Setelah kedua service berjalan, pastikan semua endpoint merespons:

```bash
# Cek web app
curl http://localhost:3000/api/auth/me
# → { "error": "Unauthorized" }  (normal — belum login)

# Cek AI service
curl http://localhost:8000/health
# → { "status": "ok", "service": "airmada-ai" }
```

---

## Bash Script — Setup Otomatis

Alternatif dari langkah manual di atas, tersedia bash script untuk setup cepat.

### NPM Project (dari root directory)

Buat file `project-setup.sh` di **root directory** `aiRMADA/`:

```bash
#!/usr/bin/env bash
set -e  # Hentikan script jika ada command yang gagal

echo "▶ Installing npm dependencies..."
npm install

echo "▶ Running linter..."
npm run lint

echo "▶ Running type checks..."
npm run type-check

echo "▶ Running unit tests..."
npm run test --workspace=apps/web -- --run

echo "▶ Starting development server..."
npm run dev
```

Jalankan dengan:

```bash
bash project-setup.sh
```

### Python Project (dari `apps/ai-service/`)

Buat file `project-setup.sh` di direktori `apps/ai-service/`:

```bash
#!/usr/bin/env bash
set -e  # Hentikan script jika ada command yang gagal

echo "▶ Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

echo "▶ Installing dependencies..."
pip install -r requirements-dev.txt

echo "▶ Running tests..."
pytest tests/ -v

echo "▶ Starting AI service..."
uvicorn app.main:app --reload --port 8000
```

Jalankan dengan:

```bash
bash project-setup.sh
```

> **Catatan:** Script Python menggunakan `source` yang hanya bekerja di Linux/macOS.
> Untuk Windows, jalankan langkah-langkah di bagian [Setup Python Project](#4-setup-python-project-fastapi-ai-service) secara manual.

---

## Perintah Tersedia

### Root (Turborepo, menjalankan semua workspace)

| Perintah                                     | Deskripsi                           |
| -------------------------------------------- | ----------------------------------- |
| `npm run dev`                                | Jalankan semua dev server sekaligus |
| `npm run build`                              | Build semua apps untuk production   |
| `npm run lint`                               | Lint semua workspace                |
| `npm run type-check`                         | Type check semua workspace          |
| `npm run test --workspace=apps/web -- --run` | Unit test web app (sekali jalan)    |
| `npm run test:e2e --workspace=apps/web`      | E2E test dengan Playwright          |
| `npm run format`                             | Format semua file dengan Prettier   |

### AI Service (dari `apps/ai-service/`)

| Perintah                                    | Deskripsi                     |
| ------------------------------------------- | ----------------------------- |
| `uvicorn app.main:app --reload --port 8000` | Jalankan dev server           |
| `pytest tests/ -v`                          | Jalankan semua test           |
| `pytest tests/ -v --tb=short`               | Test dengan traceback ringkas |

---

## Dokumentasi

| Dokumen                                 | Deskripsi                                         |
| --------------------------------------- | ------------------------------------------------- |
| [ENVIRONMENT.md](docs/ENVIRONMENT.md)   | Panduan lengkap konfigurasi environment variables |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Panduan kontribusi dan alur kerja tim             |
| [API.md](docs/API.md)                   | Ringkasan API endpoints (detail di Apidog)        |

---

## Deployment

| Service    | Platform                 | Branch                                         |
| ---------- | ------------------------ | ---------------------------------------------- |
| Web App    | Vercel (free tier)       | `main`                                         |
| AI Service | HuggingFace Spaces / VPS | `main` (hanya jika `apps/ai-service/` berubah) |
| Database   | Supabase (free tier)     | —                                              |

Deploy terjadi otomatis via GitHub Actions setiap kali ada push ke branch `main`. Lihat konfigurasi di `.github/workflows/`.
