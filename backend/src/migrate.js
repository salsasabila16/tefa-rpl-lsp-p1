require('dotenv').config()
const pool = require('./config/db')

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','bendahara','kasir') NOT NULL DEFAULT 'kasir',
    phone VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS siswa (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    tanggal VARCHAR(100) NULL,
    produk VARCHAR(150),
    tagihan VARCHAR(100),
    status ENUM('Lunas','Belum Bayar') NOT NULL DEFAULT 'Belum Bayar',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS produk (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    kategori VARCHAR(100),
    harga DECIMAL(15,2) NOT NULL DEFAULT 0,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS \`order\` (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tanggal VARCHAR(100) NULL,
    produk VARCHAR(150),
    pembeli VARCHAR(150),
    total VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS penjualan (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_id VARCHAR(50),
    tanggal VARCHAR(100) NULL,
    produk VARCHAR(150),
    pembeli VARCHAR(150),
    jumlah VARCHAR(100),
    status VARCHAR(50),
    struk_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS pembayaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    struk_no VARCHAR(50),
    pembayar VARCHAR(150),
    produk VARCHAR(150),
    tanggal VARCHAR(100) NULL,
    metode VARCHAR(50),
    jumlah VARCHAR(100),
    jumlah_raw DECIMAL(15,2) DEFAULT 0,
    bayar VARCHAR(100),
    status VARCHAR(50),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS pendapatan (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tanggal VARCHAR(100) NULL,
    keterangan VARCHAR(255),
    kategori VARCHAR(100),
    jumlah VARCHAR(100),
    status VARCHAR(50),
    struk_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS pengeluaran (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tanggal VARCHAR(100) NULL,
    keterangan VARCHAR(255),
    kategori VARCHAR(100),
    jumlah VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
]

// Alter existing tables to fix DATE → VARCHAR for tanggal columns
const ALTERS = [
  `ALTER TABLE siswa MODIFY COLUMN tanggal VARCHAR(100) NULL`,
  `ALTER TABLE \`order\` MODIFY COLUMN tanggal VARCHAR(100) NULL`,
  `ALTER TABLE penjualan MODIFY COLUMN tanggal VARCHAR(100) NULL`,
  `ALTER TABLE pembayaran MODIFY COLUMN tanggal VARCHAR(100) NULL`,
  `ALTER TABLE pendapatan MODIFY COLUMN tanggal VARCHAR(100) NULL`,
  `ALTER TABLE pengeluaran MODIFY COLUMN tanggal VARCHAR(100) NULL`,
  `ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) NULL`,
  `ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL`,
]

async function migrate() {
  const conn = await pool.getConnection()
  try {
    for (const sql of TABLES) {
      await conn.query(sql)
      const name = sql.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/i)?.[1]
      console.log(`✓ tabel ${name}`)
    }
    for (const sql of ALTERS) {
      try {
        await conn.query(sql)
        const name = sql.match(/ALTER TABLE `?(\w+)`?/i)?.[1]
        console.log(`✓ alter ${name}`)
      } catch (err) {
        // Ignore if column type already correct
        console.log(`  skip alter: ${err.message}`)
      }
    }
    console.log('Migration selesai')
  } catch (err) {
    console.error('Migration error:', err.message)
    throw err
  } finally {
    conn.release()
  }
}

module.exports = migrate