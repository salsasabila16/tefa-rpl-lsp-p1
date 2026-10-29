
CREATE DATABASE IF NOT EXISTS tefa_rpl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tefa_rpl;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','bendahara') NOT NULL DEFAULT 'bendahara',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS siswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  produk VARCHAR(100),
  tagihan VARCHAR(50),
  status ENUM('Lunas','Belum Bayar','Pending') NOT NULL DEFAULT 'Belum Bayar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kategori VARCHAR(50),
  harga VARCHAR(50),
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `order` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal VARCHAR(50),
  produk VARCHAR(100),
  pembeli VARCHAR(100),
  total VARCHAR(50),
  status ENUM('Proses','Selesai','Dibatalkan') NOT NULL DEFAULT 'Proses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS penjualan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_id VARCHAR(20),
  tanggal VARCHAR(50),
  produk VARCHAR(100),
  pembeli VARCHAR(100),
  jumlah VARCHAR(50),
  status ENUM('Lunas','Pending','Dibatalkan') NOT NULL DEFAULT 'Lunas',
  struk_no VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  struk_no VARCHAR(20) UNIQUE,
  pembayar VARCHAR(100),
  produk VARCHAR(100),
  tanggal VARCHAR(50),
  metode VARCHAR(30),
  jumlah VARCHAR(50),
  jumlah_raw INT DEFAULT 0,
  bayar VARCHAR(50),
  status ENUM('Lunas','Pending','Pending Verifikasi','Ditolak','Belum Bayar') NOT NULL DEFAULT 'Pending',
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pendapatan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal VARCHAR(50),
  keterangan TEXT,
  kategori VARCHAR(50),
  jumlah VARCHAR(50),
  status ENUM('Lunas','Pending') NOT NULL DEFAULT 'Lunas',
  struk_no VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengeluaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal VARCHAR(50),
  keterangan TEXT,
  kategori VARCHAR(50),
  jumlah VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Lunas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
