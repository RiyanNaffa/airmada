# Dokumentasi API

Dokumentasi lengkap dan interaktif tersedia di **Apidog** (import file `openapi.yaml` dari root project).

Dokumen ini berisi ringkasan endpoint per group sebagai referensi cepat.

---

## Base URL

| Environment | URL                          |
| ----------- | ---------------------------- |
| Development | `http://localhost:3000`      |
| Production  | `https://airmada.vercel.app` |

## Autentikasi

Semua endpoint (kecuali yang ditandai **public**) memerlukan JWT Bearer token dari Supabase Auth:

```
Authorization: Bearer <access_token>
```

Token didapat dari response `POST /api/auth/login`.

---

## Endpoint Groups

### 🔐 Auth — `/api/auth`

| Method  | Path      | Auth    | Deskripsi                             |
| ------- | --------- | ------- | ------------------------------------- |
| `POST`  | `/login`  | public  | Login dengan email + password         |
| `POST`  | `/invite` | manager | Undang user baru dengan role tertentu |
| `GET`   | `/me`     | any     | Ambil profil user saat ini            |
| `PATCH` | `/me`     | any     | Update profil sendiri                 |
| `POST`  | `/logout` | any     | Invalidate session                    |

### 🚛 Vehicles — `/api/vehicles`

| Method   | Path       | Auth      | Deskripsi                       |
| -------- | ---------- | --------- | ------------------------------- |
| `GET`    | `/`        | mgr, disp | List kendaraan dengan filter    |
| `POST`   | `/`        | manager   | Registrasi kendaraan baru       |
| `GET`    | `/:id`     | mgr, disp | Detail kendaraan + riwayat rute |
| `PATCH`  | `/:id`     | manager   | Update data kendaraan           |
| `DELETE` | `/:id`     | manager   | Soft delete kendaraan           |
| `GET`    | `/:id/gps` | mgr, disp | Riwayat GPS kendaraan           |

### 👤 Drivers — `/api/drivers`

| Method  | Path               | Auth                   | Deskripsi                      |
| ------- | ------------------ | ---------------------- | ------------------------------ |
| `GET`   | `/`                | mgr, disp              | List supir dengan status       |
| `POST`  | `/`                | manager                | Tambah supir baru              |
| `GET`   | `/:id`             | mgr, disp              | Detail supir + statistik       |
| `PATCH` | `/:id`             | manager                | Update supir, assign kendaraan |
| `GET`   | `/:id/shipments`   | mgr, disp, driver(own) | Riwayat pengiriman supir       |
| `GET`   | `/:id/performance` | manager                | Analytics performa supir       |

### 📦 Shipments — `/api/shipments`

| Method   | Path           | Auth                   | Deskripsi                                |
| -------- | -------------- | ---------------------- | ---------------------------------------- |
| `GET`    | `/`            | mgr, disp              | List paket dengan multi-filter           |
| `POST`   | `/`            | mgr, disp              | Buat paket baru (tracking code otomatis) |
| `GET`    | `/track/:code` | **public**             | Tracking publik via kode                 |
| `GET`    | `/:id`         | mgr, disp, driver(own) | Detail paket + timeline status           |
| `PATCH`  | `/:id/status`  | mgr, disp, driver(own) | Update status paket (FSM)                |
| `PATCH`  | `/:id/assign`  | mgr, disp              | Assign paket ke driver + route           |
| `DELETE` | `/:id`         | manager                | Hapus paket (hanya pending)              |

### 🗺️ Routes — `/api/routes`

| Method  | Path              | Auth                   | Deskripsi                                |
| ------- | ----------------- | ---------------------- | ---------------------------------------- |
| `GET`   | `/`               | mgr, disp              | List rute                                |
| `POST`  | `/`               | mgr, disp              | Buat rute (trigger AI optimasi otomatis) |
| `GET`   | `/:id`            | mgr, disp, driver(own) | Detail rute + shipments terurut          |
| `PATCH` | `/:id/status`     | mgr, disp, driver(own) | Start / complete / cancel rute           |
| `PATCH` | `/:id/reoptimize` | mgr, disp              | Re-run AI optimasi                       |

### 📡 GPS — `/api/gps`

| Method | Path                  | Auth      | Deskripsi                            |
| ------ | --------------------- | --------- | ------------------------------------ |
| `POST` | `/log`                | driver    | Kirim koordinat GPS (tiap ~5 detik)  |
| `GET`  | `/live`               | mgr, disp | Posisi terkini semua kendaraan aktif |
| `GET`  | `/history/:vehicleId` | mgr, disp | Riwayat GPS untuk playback           |

### 🔔 Notifications — `/api/notifications`

| Method  | Path        | Auth | Deskripsi                      |
| ------- | ----------- | ---- | ------------------------------ |
| `GET`   | `/`         | any  | List notifikasi user saat ini  |
| `PATCH` | `/:id/read` | any  | Tandai satu notifikasi dibaca  |
| `PATCH` | `/read-all` | any  | Tandai semua notifikasi dibaca |

### 🤖 AI — `/api/ai`

| Method | Path               | Auth      | Deskripsi                        |
| ------ | ------------------ | --------- | -------------------------------- |
| `POST` | `/chat`            | any       | Chatbot query natural language   |
| `POST` | `/optimize-route`  | mgr, disp | Optimasi urutan titik (internal) |
| `POST` | `/predict-eta`     | mgr, disp | Prediksi ETA shipment            |
| `GET`  | `/anomalies`       | mgr, disp | Anomali terdeteksi hari ini      |
| `POST` | `/generate-report` | manager   | Generate narasi laporan via AI   |

### 📊 Analytics — `/api/analytics`

| Method | Path           | Auth      | Deskripsi                         |
| ------ | -------------- | --------- | --------------------------------- |
| `GET`  | `/dashboard`   | mgr, disp | KPI utama hari ini                |
| `GET`  | `/performance` | manager   | Tren performa dalam rentang waktu |
| `GET`  | `/heatmap`     | mgr, disp | Data heatmap area pengiriman      |
| `GET`  | `/drivers`     | manager   | Ranking performa supir            |
| `GET`  | `/export`      | manager   | Export laporan CSV / XLSX / PDF   |

---

## Shipment Status — Finite State Machine

Perubahan status paket mengikuti aturan berikut. Transisi yang tidak valid akan ditolak dengan HTTP `422`.

```
pending → assigned → pickup → in_transit → delivered ✓
                                          ↘ failed → returned
```

| Status                     | Siapa yang bisa mengubah            |
| -------------------------- | ----------------------------------- |
| `pending` → `assigned`     | Dispatcher, Manager                 |
| `assigned` → `pickup`      | Driver (miliknya sendiri)           |
| `pickup` → `in_transit`    | Driver                              |
| `in_transit` → `delivered` | Driver                              |
| `in_transit` → `failed`    | Driver (wajib isi `failure_reason`) |
| `failed` → `returned`      | Dispatcher, Manager                 |

---

## Kode Error Umum

| HTTP Status | Arti                                               |
| ----------- | -------------------------------------------------- |
| `400`       | Request malformed (JSON tidak valid)               |
| `401`       | Token tidak ada atau expired                       |
| `403`       | Role tidak memiliki akses ke resource ini          |
| `404`       | Resource tidak ditemukan                           |
| `422`       | Validasi input gagal atau transisi FSM tidak valid |
| `500`       | Internal server error                              |

Semua error dikembalikan dalam format:

```json
{
  "error": "Pesan error yang deskriptif",
  "code": "OPTIONAL_ERROR_CODE"
}
```
