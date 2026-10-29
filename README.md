# TEFA RPL — LSP P1 

Website LSP P1 SMKN 1 Banjar yang menyediakan informasi seputar sertifikasi kompetensi dari berbagai jurusan. Proyek ini juga dilengkapi dashboard khusus TEFA RPL untuk membantu pengelolaan keuangan secara digital.

---

## Tentang Proyek

Proyek ini memiliki dua bagian utama:

**1. Website LSP P1**

Menyediakan informasi seputar LSP P1 SMKN 1 Banjar, mulai dari profil lembaga, visi dan misi, kebijakan mutu, hingga informasi 7 skema sertifikasi kompetensi dari jurusan Pemasaran, Akuntansi, DKV, Tata Busana, MPLB, PPLG, dan Broadcasting. Tersedia juga informasi kontak, lokasi, dan panduan sertifikasi.

**2. Dashboard TEFA RPL**

Dashboard internal yang digunakan khusus untuk pengelolaan keuangan Teaching Factory (TEFA) jurusan Rekayasa Perangkat Lunak (RPL). Dashboard ini memiliki dua peran pengguna, yaitu Admin dan Bendahara, dengan fitur pengelolaan data keuangan serta pembaruan data secara real-time.

---

## Fitur Utama

### Landing Page
- Informasi lengkap 7 skema sertifikasi dengan halaman detail masing-masing (`/skema/:slug`)
- Peta lokasi sekolah via Google Maps embed
- Halaman panduan sertifikasi
- Desain responsif dengan Tailwind CSS v4

### Dashboard Manajemen
- **Manajemen Siswa** — CRUD data siswa, status lunas/belum bayar otomatis dari data pembayaran
- **Pembayaran** — Alur pembayaran 2 langkah (Tunai / Transfer / QRIS), verifikasi oleh Bendahara, notifikasi WhatsApp otomatis
- **Jurnal** — Rekapitulasi pembayaran per siswa, dapat diunduh sebagai PNG
- **Struk** — Cetak & simpan struk pembayaran sebagai PNG
- **Grafik** — Visualisasi pendapatan, pengeluaran, dan pembayaran 6 bulan terakhir
- **Histori** — Log aktivitas gabungan semua transaksi dengan ringkasan keuangan
- **Real-time** — Notifikasi live via Socket.IO saat ada pembayaran baru atau verifikasi

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| **Frontend** | React 19, Vite 8, React Router DOM 7 |
| **Styling** | Tailwind CSS v4 (landing), Plain CSS (dashboard) |
| **HTTP Client** | Axios |
| **Real-time** | Socket.IO Client |
| **Icons** | Lucide React |
| **Export** | html2canvas (PNG) |
| **Backend** | Express.js  |
| **Database** | MySQL 8 (mysql2 pool) |
| **Auth** | JWT (jsonwebtoken) + bcrypt |
| **Email** | Nodemailer (reset password) |
| **Real-time Server** | Socket.IO Server |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Railway |
| **DB Lokal** | Docker + phpMyAdmin |

---

## Struktur Proyek

```
tefa rpl/
├── tefa-rpl/               # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/  # Komponen dashboard (modals, cards, charts)
│   │   │   └── landing/    # Komponen landing page
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx     # JWT auth state
│   │   │   ├── DataContext.jsx     # Global data fetching
│   │   │   └── SocketContext.jsx   # Socket.IO connection
│   │   ├── pages/
│   │   │   ├── dashboard/  # 12 halaman dashboard
│   │   │   └── landing/    # LandingPage, SkemaPage, PanduanPage
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance + JWT interceptor
│   │   │   └── paymentService.js   # WhatsApp notification builder
│   │   ├── utils/
│   │   │   ├── rbac.js     # Role-based route access map
│   │   │   └── date.js     # Indonesian date formatting
│   │   ├── styles/
│   │   │   └── variables.css       # CSS custom properties (navy palette)
│   │   ├── App.jsx         # Routing + ProtectedRoute/PublicRoute
│   │   └── main.jsx        # Provider tree entry point
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
└── backend/                # Backend Express.js
    ├── src/
    │   ├── config/
    │   │   ├── db.js           # MySQL pool connection
    │   │   └── schema.sql      # Full DB schema (8 tables)
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── pembayaranController.js  # Payment + transactional verification
    │   │   └── ...
    │   ├── middleware/
    │   │   ├── auth.js         # Bearer JWT verification
    │   │   └── requireRole.js  # Role-based endpoint guard
    │   ├── routes/
    │   ├── migrate.js          # Auto-migration on startup
    │   └── server.js           # Express + Socket.IO entry point
    ├── docker-compose.yml
    └── package.json
```

---

## Memulai (Getting Started)

### Prerequisites

- Node.js >= 18
- MySQL 8 (atau Docker)
- npm

### 1. Clone Repository

```bash
git clone <repo-url>
cd "tefa rpl"
```

### 2. Setup Backend

```bash
cd backend
npm install
```


### 3. Setup Frontend

```bash
cd tefa-rpl
npm install
```

Buat file `.env` di folder `tefa-rpl/`:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Jalankan Database Lokal (Docker)

```bash
cd backend
docker-compose up -d
```

Ini akan menjalankan MySQL di port `3306` dan phpMyAdmin di `http://localhost:8080`.

> **Catatan:** Backend melakukan auto-migration saat startup — semua tabel akan dibuat otomatis jika belum ada.

### 5. Jalankan Aplikasi

**Terminal 1 — Backend:**
```bash
cd backend
node src/server.js
```

**Terminal 2 — Frontend:**
```bash
cd tefa-rpl
npm run dev
```

Buka `http://localhost:5173` di browser.

---

## Halaman Dashboard

| Halaman | Path | Deskripsi |
|---|---|---|
| **Dashboard** | `/dashboard` | Ringkasan statistik — Admin melihat data siswa & order, Bendahara melihat keuangan + grafik 6 bulan |
| **Siswa** | `/dashboard/siswa` | CRUD data siswa, status pembayaran otomatis |
| **Produk** | `/dashboard/produk` | CRUD katalog produk/layanan |
| **Penjualan** | `/dashboard/penjualan` | CRUD catatan penjualan, auto-generate ID (`PJL-001`) |
| **Order** | `/dashboard/order` | Manajemen order (Proses / Selesai / Dibatalkan) |
| **Pembayaran** | `/dashboard/pembayaran` | Alur pembayaran + verifikasi Bendahara, notifikasi WhatsApp |
| **Jurnal** | `/dashboard/jurnal` | Rekap pembayaran per siswa, ekspor PNG |
| **Grafik** | `/dashboard/grafik` | Bar chart pendapatan, pengeluaran, pembayaran |
| **Pendapatan** | `/dashboard/pendapatan` | CRUD catatan pemasukan |
| **Pengeluaran** | `/dashboard/pengeluaran` | CRUD catatan pengeluaran |
| **Struk** | `/dashboard/struk` | Lihat & cetak struk pembayaran (PNG) |
| **Histori** | `/dashboard/histori` | Log aktivitas semua transaksi + ringkasan keuangan |

---

## Database

Schema tersimpan di `backend/src/config/schema.sql` dengan 8 tabel:

`users` · `siswa` · `produk` · `order` · `penjualan` · `pembayaran` · `pendapatan` · `pengeluaran`

Auto-migration dijalankan via `backend/src/migrate.js` setiap kali server backend dinyalakan.

# Sekian,Terimakasih 
