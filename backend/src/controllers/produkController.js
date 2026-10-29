const pool = require('../config/db')

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM produk ORDER BY id DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function create(req, res) {
  const { nama, kategori, harga, deskripsi } = req.body
  if (!nama) return res.status(400).json({ message: 'Nama wajib diisi' })
  try {
    const [r] = await pool.query('INSERT INTO produk (nama, kategori, harga, deskripsi) VALUES (?,?,?,?)', [nama, kategori, harga, deskripsi])
    const [rows] = await pool.query('SELECT * FROM produk WHERE id = ?', [r.insertId])
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function update(req, res) {
  const { id } = req.params
  const { nama, kategori, harga, deskripsi } = req.body
  try {
    await pool.query('UPDATE produk SET nama=?, kategori=?, harga=?, deskripsi=? WHERE id=?', [nama, kategori, harga, deskripsi, id])
    const [rows] = await pool.query('SELECT * FROM produk WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM produk WHERE id = ?', [id])
    res.json({ message: 'Produk dihapus' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getAll, create, update, remove }
