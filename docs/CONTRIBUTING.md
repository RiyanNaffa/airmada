# Panduan Kontribusi

Dokumen ini menjelaskan alur kerja pengembangan tim aiRMADA — dari membuat branch baru hingga merge ke `main`.

---

## Alur Kerja Git

Kami menggunakan **GitHub Flow** yang disederhanakan:

```
main ──────────────────────────────────────────────────► production
        |                   ▲                   ▲
        |                   | merge (PR)        |
dev  ───────────────────────────────────        |
        │             ▲ merge dev               │ merge (PR)
        |             |                         |
        | feat/...(1) |                 fix/... |
        |
        | feat/...(2)
```

- **`main`**: branch produksi. Setiap push ke `main` otomatis trigger deployment.
- **`dev`**: branch development sebagai basis setiap branch feature.
- **`feat/nama-fitur`**: branch untuk pengembangan fitur baru.
- **`fix/nama-bug`**: branch untuk perbaikan bug.

### Langkah Membuat Fitur Baru

```bash
# 1. Pastikan main lokal sudah up-to-date
git checkout main
git pull origin main

# 2. Buat branch baru dari main
git checkout -b feat/vehicle-management

# 3. Kerjakan perubahan...

# 4. Commit dengan pesan yang jelas (lihat konvensi di bawah)
git add .
git commit -m "feat(vehicles): add vehicle registration form with Zod validation"

# 5. Push ke remote
git push origin feat/vehicle-management

# 6. Buat Pull Request di GitHub
#    → Isi deskripsi PR, tambahkan reviewer
#    → Tunggu CI (lint + type-check + test) passing
#    → Minta review dari minimal 1 anggota tim lain
#    → Merge setelah approved
```

---

## Konvensi Commit Message

Format: `<type>(<scope>): <deskripsi singkat>`

| Type       | Kapan digunakan                              |
| ---------- | -------------------------------------------- |
| `feat`     | Menambah fitur baru                          |
| `fix`      | Memperbaiki bug                              |
| `refactor` | Refactor kode tanpa mengubah perilaku        |
| `test`     | Menambah atau memperbaiki test               |
| `docs`     | Mengubah dokumentasi                         |
| `chore`    | Perubahan build, config, dependency          |
| `style`    | Perubahan formatting, tidak ada logic change |

**Scope** adalah nama modul yang berubah: `vehicles`, `shipments`, `routes`, `ai`, `auth`, `analytics`, dll.

Contoh commit yang baik:

```
feat(shipments): add FSM status transition validation
fix(gps): prevent duplicate realtime subscription on remount
test(auth): add unit test for role guard middleware
docs(api): update OpenAPI spec for /api/routes endpoint
chore: update groq-sdk to v1.1.1
```

---

## Pembagian Tanggung Jawab

| Role                 | Scope Utama                                                                | Koordinasi dengan                  |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| **Frontend / UI-UX** | `apps/web/src/app/`, `components/`, `hooks/`, `store/`                     | Backend untuk API contract         |
| **Backend / Cloud**  | `apps/web/src/app/api/`, `lib/`, `.github/workflows/`, Supabase migrations | Frontend untuk response shape      |
| **AI Engineer**      | `apps/ai-service/`, `lib/ai/`, `packages/types/` AI types                  | Backend untuk endpoint `/api/ai/*` |

### Aturan Koordinasi

Sebelum mengubah shape API response (misal menambah field baru ke response `GET /api/shipments`):

1. Update type di `packages/types/src/` terlebih dahulu
2. Commit type change terpisah dengan `chore(types): ...`
3. Baru implementasi API dan consumer-nya

Ini memastikan tidak ada type error saat anggota lain pull perubahan.

---

## Menjalankan CI Secara Lokal

Sebelum push, pastikan semua check berikut passing agar tidak ada CI failure:

```bash
# Dari root directory
npm run lint
npm run type-check
npm run test --workspace=apps/web -- --run

# AI service
cd apps/ai-service
source .venv/bin/activate
pytest tests/ -v
```

---

## Struktur PR yang Baik

Saat membuat Pull Request, isi template berikut di deskripsi:

```markdown
## Apa yang berubah?

Jelaskan singkat perubahan yang dibuat.

## Jenis perubahan

- [ ] Fitur baru
- [ ] Bug fix
- [ ] Refactor
- [ ] Dokumentasi

## Cara test

Jelaskan langkah untuk memverifikasi perubahan ini bekerja.

## Screenshot (jika ada perubahan UI)
```

---

## Aturan Umum

- Jangan commit langsung ke `main`. Selalu lewat **Pull Request**.
- Jangan commit file `.env.local` atau file yang berisi secret apapun. Gunakan `.env.example` sebagai template.
- Jangan commit folder `node_modules/`, `.venv/`, atau `saved_models/*.pkl`.
- Satu PR idealnya mengerjakan satu hal (satu fitur atau satu bug fix).
- Jika PR terlalu besar, pecah menjadi beberapa PR yang lebih kecil.
