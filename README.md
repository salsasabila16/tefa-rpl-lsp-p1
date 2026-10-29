# TEFA RPL — LSP P1

The official LSP P1 website provides information about competency certification across multiple departments at SMKN 1 Banjar. The project also includes a dedicated dashboard for TEFA RPL to support digital financial management.

---

## About the Project

This project consists of two main parts:

**1. LSP P1 Website**

Provides information about LSP P1 SMKN 1 Banjar, including the institution's profile, vision and mission, quality policy, and details of 7 competency certification schemes from Marketing, Accounting, Visual Communication Design (DKV), Fashion Design, Office Management (MPLB), Software and Game Development (PPLG), and Broadcasting. It also includes contact information, school location, and certification guidelines.

**2. TEFA RPL Dashboard**

An internal dashboard specifically designed to manage the finances of the Teaching Factory (TEFA) for the Software and Game Development (RPL) department. The dashboard supports two user roles, Admin and Treasurer, with financial data management and real-time updates.

---

## Key Features

### Landing Page
- Detailed information on 7 certification schemes, each with its own detail page (`/skema/:slug`)
- School location map embedded via Google Maps
- Certification guidelines page
- Responsive design using Tailwind CSS v4

### Management Dashboard
- **Student Management** — CRUD operations for student records, with paid/unpaid status automatically updated based on payment data
- **Payments** — Two-step payment workflow (Cash / Bank Transfer / QRIS), Treasurer verification, and automatic WhatsApp notifications
- **Journal** — Payment summaries for each student, exportable as PNG
- **Receipts** — Print and save payment receipts as PNG
- **Charts** — Visualizations of income, expenses, and payments over the last 6 months
- **History** — Combined activity logs for all transactions, including financial summaries
- **Real-time Updates** — Live notifications via Socket.IO when new payments are submitted or verified

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router DOM 7 |
| **Styling** | Tailwind CSS v4 (landing page), Plain CSS (dashboard) |
| **HTTP Client** | Axios |
| **Real-time** | Socket.IO Client |
| **Icons** | Lucide React |
| **Export** | html2canvas (PNG) |
| **Backend** | Express.js |
| **Database** | MySQL 8 (mysql2 connection pool) |
| **Authentication** | JWT (jsonwebtoken) + bcrypt |
| **Email** | Nodemailer (password reset) |
| **Real-time Server** | Socket.IO Server |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Railway |
| **Local Database** | Docker + phpMyAdmin |

---

## Project Structure

```text
tefa rpl/
├── tefa-rpl/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/  # Dashboard components (modals, cards, charts)
│   │   │   └── landing/    # Landing page components
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx     # JWT authentication state
│   │   │   ├── DataContext.jsx     # Global data fetching
│   │   │   └── SocketContext.jsx   # Socket.IO connection
│   │   ├── pages/
│   │   │   ├── dashboard/  # 12 dashboard pages
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
└── backend/                # Express.js backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js           # MySQL connection pool
    │   │   └── schema.sql      # Full database schema (8 tables)
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── pembayaranController.js  # Payment + transactional verification
    │   │   └── ...
    │   ├── middleware/
    │   │   ├── auth.js         # Bearer JWT verification
    │   │   └── requireRole.js  # Role-based endpoint protection
    │   ├── routes/
    │   ├── migrate.js          # Automatic database migration on startup
    │   └── server.js           # Express + Socket.IO entry point
    ├── docker-compose.yml
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL 8 (or Docker)
- npm

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "tefa rpl"
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

### 3. Set Up the Frontend

```bash
cd tefa-rpl
npm install
```

Create a `.env` file in the `tefa-rpl/` directory:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Start the Local Database (Docker)

```bash
cd backend
docker-compose up -d
```

This starts MySQL on port `3306` and phpMyAdmin at `http://localhost:8080`.

> **Note:** The backend runs automatic migrations on startup. All tables are created automatically if they do not already exist.

### 5. Run the Application

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

Open `http://localhost:5173` in your browser.

---

## Dashboard Pages

| Page | Path | Description |
|---|---|---|
| **Dashboard** | `/dashboard` | Statistical overview — Admin sees student and order data, while the Treasurer sees financial summaries and 6-month charts |
| **Students** | `/dashboard/siswa` | Student record management with automatic payment status updates |
| **Products** | `/dashboard/produk` | Product and service catalog management |
| **Sales** | `/dashboard/penjualan` | Sales record management with automatic ID generation (`PJL-001`) |
| **Orders** | `/dashboard/order` | Order management (Processing / Completed / Cancelled) |
| **Payments** | `/dashboard/pembayaran` | Payment workflow, Treasurer verification, and WhatsApp notifications |
| **Journal** | `/dashboard/jurnal` | Payment summaries by student, with PNG export |
| **Charts** | `/dashboard/grafik` | Bar charts for income, expenses, and payments |
| **Income** | `/dashboard/pendapatan` | Income record management |
| **Expenses** | `/dashboard/pengeluaran` | Expense record management |
| **Receipts** | `/dashboard/struk` | View and print payment receipts as PNG |
| **History** | `/dashboard/histori` | Transaction activity logs and financial summaries |

---

## Database

The database schema is defined in `backend/src/config/schema.sql` and consists of 8 tables:

`users` · `siswa` · `produk` · `order` · `penjualan` · `pembayaran` · `pendapatan` · `pengeluaran`

Automatic migrations are handled by `backend/src/migrate.js` whenever the backend server starts.

---

**Thank you for checking out this project!**
