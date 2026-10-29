const pool = require('../config/db')

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM siswa ORDER BY id DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function create(req, res) {
  const { nama, tanggal, produk, tagihan, status = 'Belum Bayar' } = req.body
  if (!nama) return res.status(400).json({ message: 'Nama wajib diisi' })
  try {
    const [r] = await pool.query(
      'INSERT INTO siswa (nama, tanggal, produk, tagihan, status) VALUES (?,?,?,?,?)',
      [nama, tanggal || null, produk, tagihan, status]
    )
    const [rows] = await pool.query('SELECT * FROM siswa WHERE id = ?', [r.insertId])
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function update(req, res) {
  const { id } = req.params
  const { nama, tanggal, produk, tagihan, status = 'Belum Bayar' } = req.body
  try {
    await pool.query(
      'UPDATE siswa SET nama=?, tanggal=?, produk=?, tagihan=?, status=? WHERE id=?',
      [nama, tanggal || null, produk, tagihan, status, id]
    )
    const [rows] = await pool.query('SELECT * FROM siswa WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM siswa WHERE id = ?', [id])
    res.json({ message: 'Siswa dihapus' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getAll, create, update, remove }
