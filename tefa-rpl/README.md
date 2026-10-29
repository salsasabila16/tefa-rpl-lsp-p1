# TEFA RPL — LSP P1 SMKN 1 Banjar

Platform digital resmi untuk mengelola kegiatan Teaching Factory (TEFA) jurusan Rekayasa Perangkat Lunak (RPL) di SMKN 1 Banjar. Sistem ini membantu pengelolaan siswa, produk/kursus, transaksi penjualan, pembayaran, jurnal keuangan, dan pelaporan keuangan secara terpusat dan real-time.

🌐 **Live:** [tefa-delta.vercel.app](https://tefa-delta.vercel.app)

---

## Tentang Proyek

TEFA RPL adalah unit produksi sekolah di bawah jurusan RPL SMKN 1 Banjar. Platform ini menggantikan pencatatan manual dengan sistem digital multi-user yang dapat diakses oleh Admin dan Bendahara secara bersamaan dengan data tersinkronisasi lewat backend dan database terpusat.

---

## Tech Stackkk

| Kategori | Teknologi |
|---|---|
| Frontend | React 19 + Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Plain CSS (dashboard) + Tailwind CSS v4 (landing page) |
| Icons | Lucide React |
| Real-time | Socket.IO client |
| Export | html2canvas (struk & jurnal PNG) |
| Backend | Express.js 5 + MySQL2 |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Database | MySQL 8 (Docker / Railway) |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## Fitur Utama

### Landing Page (Publik)
- Halaman informasi LSP P1 SMKN 1 Banjar
- Profil visi misi, ruang lingkup sertifikasi, dan skema kompetensi per jurusan
- Peta lokasi sekolah (Google Maps embed)
- Desain responsif untuk mobile dan desktop

### Autentikasi
- Login berbasis role (Admin / Bendahara)
- JWT token dengan proteksi route
- Session diverifikasi ke backend setiap kali halaman dimuat

### Dashboard Admin
- **Ringkasan** — statistik total siswa, order, pembayaran lunas & belum bayar
- **Siswa** — CRUD data siswa, status pembayaran, catatan pembayaran langsung
- **Produk** — CRUD katalog produk/kursus
- **Penjualan** — pencatatan penjualan layanan
- **Order** — manajemen order masuk (Proses / Selesai / Dibatalkan)
- **Pembayaran** — catat pembayaran (Tunai, Transfer Bank, QRIS), notifikasi WhatsApp ke bendahara
- **Jurnal** — rekap pembayaran per siswa, download PDF rekap
- **Grafik** — visualisasi pendapatan, pengeluaran, pembayaran 6 bulan terakhir
- **Pendapatan** — rekap dan CRUD pemasukan
- **Pengeluaran** — rekap dan CRUD pengeluaran
- **Struk** — daftar struk lunas, simpan sebagai PNG
- **Histori** — riwayat seluruh aktivitas transaksi

### Dashboard Bendahara
Akses ke semua halaman Admin kecuali **Penjualan** dan **Order**, dengan tambahan:
- **Verifikasi Pembayaran** — setujui atau tolak pembayaran Transfer/QRIS

### Pembayaran & Struk
- Tiga metode: **Tunai**, **Transfer Bank**, **QRIS**
- Transfer/QRIS masuk sebagai *Pending Verifikasi* → bendahara approve/reject
- Setelah disetujui: otomatis buat record Pendapatan + Penjualan
- Struk bisa disimpan sebagai PNG (cross-platform: Windows & macOS)
- Notifikasi real-time via Socket.IO saat pembayaran baru atau diverifikasi

---

## Struktur Folder

```
tefa-rpl/
├── backend/
│   └── src/
│       ├── config/        # db.js (MySQL pool)
│       ├── controllers/   # auth, siswa, produk, order, penjualan,
│       │                  # pembayaran, pendapatan, pengeluaran
│       ├── middleware/    # auth.js (JWT), requireRole.js
│       ├── routes/        # REST API routes
│       ├── migrate.js     # Buat tabel saat startup
│       └── server.js      # Entry point, CORS, Socket.IO
├── database/
│   └── tefa_database.sql  # Schema referensi
├── public/                # Aset statis (logo, hero image)
├── src/
│   ├── components/
│   │   └── dashboard/     # Header, Sidebar, StatCard, SalesChart,
│   │                      # TransactionTable, PaymentModal, StrukModal
│   ├── contexts/          # AuthContext, DataContext, SocketContext
│   ├── hooks/             # useDebounce
│   ├── landingpage/       # LandingPage, LandingNavbar, LandingFooter,
│   │                      # SkemaPage, PanduanPage
│   ├── layouts/           # AuthLayout, DashboardLayout, LandingLayout
│   ├── pages/
│   │   ├── auth/          # Login, Register
│   │   └── dashboard/     # Dashboard, Siswa, Produk, Penjualan, Order,
│   │                      # Pembayaran, Jurnal, Grafik, Pendapatan,
│   │                      # Pengeluaran, Struk, Histori
│   ├── services/          # api.js (axios), paymentService.js
│   ├── styles/            # variables.css, global.css, responsive.css
│   └── utils/             # date.js, rbac.js
├── docker-compose.yml     # MySQL + phpMyAdmin lokal
├── vercel.json            # Routing Vercel + cache headers
└── index.html
```


---

## Struktur Halaman & Akses Role

| Path | Halaman | Admin | Bendahara |
|---|---|:---:|:---:|
| `/` | Landing page | ✓ | ✓ |
| `/masuk` | Login | ✓ | ✓ |
| `/daftar` | Register | ✓ | ✓ |
| `/dashboard` | Ringkasan | ✓ | ✓ |
| `/dashboard/siswa` | Daftar siswa | ✓ | ✓ |
| `/dashboard/produk` | Produk/kursus | ✓ | ✓ |
| `/dashboard/penjualan` | Penjualan | ✓ | — |
| `/dashboard/order` | Order | ✓ | — |
| `/dashboard/pembayaran` | Pembayaran | ✓ | ✓ |
| `/dashboard/jurnal` | Jurnal keuangan | ✓ | ✓ |
| `/dashboard/grafik` | Grafik | ✓ | ✓ |
| `/dashboard/pendapatan` | Pendapatan | ✓ | ✓ |
| `/dashboard/pengeluaran` | Pengeluaran | ✓ | ✓ |
| `/dashboard/struk` | Struk pembayaran | ✓ | ✓ |
| `/dashboard/histori` | Histori transaksi | ✓ | ✓ |

---

## API Endpoints

Semua endpoint di bawah ini memerlukan header `Authorization: Bearer <token>` kecuali yang ditandai publik.

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| POST | `/api/auth/login` | Login | Publik |
| POST | `/api/auth/register` | Buat akun | Admin |
| GET | `/api/auth/me` | Info user aktif | Auth |
| GET/POST/PUT/DELETE | `/api/siswa` | CRUD siswa | Auth |
| GET/POST/PUT/DELETE | `/api/produk` | CRUD produk | Auth |
| GET/POST/PUT/DELETE | `/api/order` | CRUD order | Auth |
| GET/POST/PUT/DELETE | `/api/penjualan` | CRUD penjualan | Auth |
| GET/POST/PUT/DELETE | `/api/pembayaran` | CRUD pembayaran | Auth |
| POST | `/api/pembayaran/:id/verifikasi` | Approve/reject | Bendahara, Admin |
| GET/POST/PUT/DELETE | `/api/pendapatan` | CRUD pendapatan | Auth |
| GET/POST/PUT/DELETE | `/api/pengeluaran` | CRUD pengeluaran | Auth |

---

## Alur Pembayaran

```
Admin catat pembayaran
        │
        ├── Tunai ──────────────────────────→ Langsung Lunas
        │                                     (Pendapatan + Penjualan dibuat)
        │
        └── Transfer / QRIS ─────────────→ Status: Pending Verifikasi
                                                    │
                                    Notifikasi WhatsApp ke Bendahara
                                                    │
                                      Bendahara buka dashboard
                                                    │
                              ┌─────── Approve ─────┴───── Reject ──────┐
                              │                                          │
                         Status: Lunas                            Status: Ditolak
                   Pendapatan + Penjualan                    Pendapatan dikembalikan
                         dibuat                                   ke Pending
                              │
                         Struk tersedia
```

---

## Menjalankan Lokal

### Prasyarat
- Node.js 18+
- Docker (untuk database lokal)

### 1. Clone & install

```bash
git clone https://github.com/salsasabila16/tefa.git
cd "tefa/tefa rpl"
npm install
cd backend && npm install && cd ..
```

### 2. Jalankan database lokal

```bash
docker-compose up -d
# MySQL berjalan di localhost:3306
# phpMyAdmin di http://localhost:8080
```

### 3. Konfigurasi environment

Buat file `backend/.env`:
```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=tefa_user
DB_PASSWORD=tefa_password
DB_NAME=tefa
JWT_SECRET=ganti_dengan_secret_panjang_acak
JWT_EXPIRES_IN=7d
```

Buat file `.env.local` di root frontend:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Jalankan backend

```bash
cd backend
npm run dev
# Backend berjalan di http://localhost:3000
```

### 5. Jalankan frontend

```bash
# Di root project (tefa rpl/tefa-rpl/)
npm run dev
# Buka http://localhost:5173
```

### 6. Build production

```bash
npm run build
npm run preview
```

---

## Deploy

### Frontend — Vercel

1. Push ke branch `main`
2. Vercel auto-deploy dari GitHub
3. Set environment variable di Vercel Dashboard:
   - `VITE_API_URL` = URL backend Railway
   - `VITE_SOCKET_URL` = URL backend Railway

### Backend — Railway

1. Connect repository ke Railway
2. Set root directory ke `tefa rpl/tefa-rpl/backend`
3. Set environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CLIENT_ORIGIN`
4. Railway otomatis jalankan `node src/server.js` (dari `railway.json`)

---

## Database Schema

Tabel utama:

| Tabel | Kolom kunci |
|---|---|
| `users` | id, nama, email, password, role (admin/bendahara/kasir) |
| `siswa` | id, nama, tanggal, produk, tagihan, status (Lunas/Belum Bayar) |
| `produk` | id, nama, kategori, harga, deskripsi |
| `order` | id, tanggal, produk, pembeli, total, status |
| `penjualan` | id, kode_id, tanggal, produk, pembeli, jumlah, status, struk_no |
| `pembayaran` | id, struk_no, pembayar, produk, tanggal, metode, jumlah, bayar, status, keterangan |
| `pendapatan` | id, tanggal, keterangan, kategori, jumlah, status, struk_no |
| `pengeluaran` | id, tanggal, keterangan, kategori, jumlah, status |

Schema lengkap: [`database/tefa_database.sql`](database/tefa_database.sql)

