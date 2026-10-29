import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import LandingNavbar from './LandingNavbar'
import LandingFooter from './LandingFooter'
import './PanduanPage.css'

const sections = [
  { id: 'alur', label: 'Panduan Peran Asesor' },
  { id: 'asesi', label: 'Peran Asesi' },
  { id: 'asesor', label: 'Peran Asesor' },
  { id: 'admin', label: 'Peran Admin' },
]

const heroData = {
  alur: {
    title: 'Panduan Peran Asesor',
    desc: 'Akun Asesor dibuat oleh Admin. Asesor login dari halaman umum lalu diarahkan ke area Asesor.',
  },
  asesi: {
    title: 'Panduan Peran Asesi',
    desc: 'Panduan bagi peserta sertifikasi untuk melakukan pendaftaran, melengkapi dokumen, mengikuti asesmen, dan memantau hasil uji kompetensi.',
  },
  asesor: {
    title: 'Panduan Peran Asesor',
    desc: 'Panduan bagi Asesor dalam mengelola peserta yang ditugaskan, meninjau dokumen, melakukan penilaian, dan memberikan rekomendasi kompetensi.',
  },
  admin: {
    title: 'Panduan Peran Admin',
    desc: 'Panduan pengelolaan sistem LSP, mulai dari pembuatan akun, pengaturan data master, verifikasi peserta, hingga monitoring hasil asesmen.',
  },
}

const contentData = {
  alur: {
    steps: [
      { num: 1, title: 'Pembuatan Akun oleh Admin', desc: 'Admin membuat dan mengelola akun untuk Asesi dan Asesor agar setiap pengguna memiliki akses sesuai dengan perannya masing-masing.' },
      { num: 2, title: 'Login dan Identifikasi Peran', desc: 'Asesi dan Asesor melakukan login melalui halaman yang sama. Sistem mengidentifikasi peran pengguna dan mengarahkan mereka ke dashboard sesuai hak akses.' },
      { num: 3, title: 'Persiapan Data Master', desc: 'Admin menyiapkan data master seperti skema sertifikasi, unit kompetensi, elemen, kriteria unjuk kerja, TUK, serta jadwal uji kompetensi.' },
      { num: 4, title: 'Pendaftaran Asesi (APL 01)', desc: 'Asesi melakukan pendaftaran dengan mengisi formulir APL 01 dan melengkapi dokumen persyaratan yang dibutuhkan.' },
      { num: 5, title: 'Verifikasi dan Persetujuan Admin', desc: 'Admin memverifikasi data pendaftaran Asesi. Jika data valid, pendaftaran disetujui agar Asesi dapat melanjutkan ke tahap berikutnya.' },
      { num: 6, title: 'Penjadwalan dan Pengelompokan', desc: 'Admin menyusun kelompok Asesi serta menentukan jadwal dan lokasi uji kompetensi bagi Asesi yang telah disetujui.' },
      { num: 7, title: 'Asesmen Mandiri (APL 02)', desc: 'Asesi mengisi asesmen mandiri (APL 02) sebagai evaluasi awal terhadap kompetensi yang dimiliki.' },
      { num: 8, title: 'Rekomendasi Asesor', desc: 'Asesor meninjau hasil asesmen mandiri dan memberikan rekomendasi. Asesi yang memenuhi rekomendasi dapat melanjutkan ke tahap uji kompetensi.' },
      { num: 9, title: 'Pelaksanaan Uji Kompetensi', desc: 'Asesi mengikuti uji kompetensi sesuai jadwal dan lokasi yang telah ditentukan oleh Admin.' },
      { num: 10, title: 'Penilaian dan Keputusan', desc: 'Asesor melakukan penilaian berdasarkan instrumen yang berlaku dan menetapkan hasil kompetensi berupa Kompeten (K) atau Belum Kompeten (BK).' },
      { num: 11, title: 'Penerbitan Sertifikat', desc: 'Asesi yang dinyatakan Kompeten diproses untuk penerbitan sertifikat sebagai bukti pencapaian kompetensi.' },
      { num: 12, title: 'Monitoring dan Laporan', desc: 'Admin memantau seluruh proses dan hasil asesmen, sementara Asesi dapat melihat status akhir serta ringkasan hasil uji kompetensi.' },
    ],
    note: 'Untuk menjalankan alur secara optimal, data master seperti skema, unit, elemen, jadwal, dan penugasan sebaiknya diselesaikan oleh Admin sebelum pendaftaran dibuka.',
  },
  asesi: {
    steps: [
      { num: 1, title: 'Login ke Panel Asesi', desc: 'Pastikan akun Asesi telah dibuat oleh Admin. Login melalui halaman utama dan sistem akan mengarahkan pengguna ke area Asesi.' },
      { num: 2, title: 'Isi Form Pendaftaran', desc: 'Lengkapi data pribadi dan data pendukung sesuai formulir pendaftaran yang tersedia pada panel Asesi.' },
      { num: 3, title: 'Upload Dokumen', desc: 'Unggah dokumen persyaratan seperti pas foto, identitas, bukti kompetensi, dan transkrip nilai sesuai ketentuan.' },
      { num: 4, title: 'Menunggu Persetujuan Admin', desc: 'Sebelum disetujui Admin, akses fitur inti masih dibatasi. Jika pendaftaran ditolak, perbaiki data sesuai catatan dan kirim ulang.' },
      { num: 5, title: 'Kerjakan Asesmen Mandiri', desc: 'Setelah pendaftaran disetujui, Asesi dapat mengisi FR.APL.02 pada menu asesmen mandiri sesuai skema yang tersedia.' },
      { num: 6, title: 'Cek Jadwal dan Hasil', desc: 'Pantau jadwal uji kompetensi, hasil asesmen, serta perbarui profil dan kata sandi secara mandiri.' },
    ],
  },
  asesor: {
    steps: [
      { num: 1, title: 'Login ke Panel Asesor', desc: 'Akun Asesor dibuat oleh Admin. Asesor login melalui halaman utama dan sistem mengarahkannya ke area Asesor.' },
      { num: 2, title: 'Tinjau Jadwal dan Kelompok', desc: 'Asesor melihat jadwal uji kompetensi serta kelompok Asesi yang menjadi tanggung jawabnya.' },
      { num: 3, title: 'Entry Penilaian', desc: 'Masukkan nilai setiap Asesi melalui fitur penilaian sesuai instrumen asesmen yang berlaku.' },
      { num: 4, title: 'Review Berkas dan Hasil Asesi', desc: 'Tinjau hasil asesmen mandiri dan dokumen pendukung untuk memastikan proses penilaian berjalan secara objektif.' },
      { num: 5, title: 'Beri Rekomendasi', desc: 'Asesor memberikan rekomendasi hasil kompetensi setiap Asesi berdasarkan bukti dan hasil penilaian.' },
      { num: 6, title: 'Sinkron dengan Monitoring Admin', desc: 'Hasil penilaian termonitor pada panel Admin sebagai dasar pemantauan proses dan penyusunan laporan.' },
    ],
  },
  admin: {
    steps: [
      { num: 1, title: 'Login dan Akses Dashboard', desc: 'Admin login menggunakan akun administrator untuk mengakses dashboard manajemen sistem.' },
      { num: 2, title: 'Buat Akun Asesi dan Asesor', desc: 'Admin membuat dan mengelola akun pengguna agar Asesi dan Asesor dapat login serta menjalankan tugas masing-masing.' },
      { num: 3, title: 'Kelola Data Master', desc: 'Admin menyiapkan dan mengelola data jurusan, skema sertifikasi, unit kompetensi, elemen, kriteria unjuk kerja, TUK, jadwal uji kompetensi, mitra, dan konten pendukung halaman depan.' },
      { num: 4, title: 'Kelola Hak Akses', desc: 'Admin mengatur role dan permission agar setiap pengguna hanya dapat mengakses fitur sesuai kewenangannya.' },
      { num: 5, title: 'Verifikasi Asesi', desc: 'Admin memeriksa kelengkapan data dan dokumen, kemudian menyetujui atau menolak pendaftaran disertai catatan jika diperlukan.' },
      { num: 6, title: 'Pantau Penilaian Asesor', desc: 'Admin memonitor proses input nilai, progres kelompok Asesi, dan rekomendasi hasil asesmen dari Asesor.' },
      { num: 7, title: 'Kontrol Kualitas Sistem', desc: 'Admin memastikan alur sistem berjalan dengan baik melalui pencarian data, evaluasi hasil, dan pemeliharaan konfigurasi.' },
    ],
  },
}

export default function PanduanPage() {
  const [active, setActive] = useState('alur')

  const hero = heroData[active]
  const content = contentData[active]

  return (
    <div className="panduan-page">
      <LandingNavbar />

      {/* Hero */}
      <section className="panduan-hero">
        <div className="panduan-hero__inner">
          <h1 className="panduan-hero__title">{hero.title}</h1>
          <p className="panduan-hero__desc">{hero.desc}</p>
        </div>
      </section>

      {/* Body */}
      <div className="panduan-body">
        <div className="panduan-body__inner">

          {/* Sidebar */}
          <aside className="panduan-sidebar">
            <Link to="/" className="panduan-sidebar__back">
              <ArrowLeft size={14} /> Kembali ke Beranda
            </Link>
            <p className="panduan-sidebar__label">Daftar Panduan</p>
            <nav className="panduan-sidebar__nav">
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  className={`panduan-sidebar__item${active === id ? ' panduan-sidebar__item--active' : ''}`}
                  onClick={() => setActive(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="panduan-content">
            <div className="panduan-cards">
              {content.steps.map((step) => (
                <div key={step.num} className="panduan-card">
                  <div className="panduan-card__num">{String(step.num).padStart(2, '0')}</div>
                  <div className="panduan-card__body">
                    <h3 className="panduan-card__title">{step.title}</h3>
                    <p className="panduan-card__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {content.note && (
              <div className="panduan-note">
                <p className="panduan-note__label">Catatan Singkat</p>
                <p className="panduan-note__text">{content.note}</p>
              </div>
            )}
          </main>

        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
