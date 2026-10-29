const pool = require('../config/db')

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM pengeluaran ORDER BY id DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function create(req, res) {
  const { tanggal, keterangan, kategori, jumlah, status = 'Lunas' } = req.body
  if (!keterangan || !jumlah) return res.status(400).json({ message: 'Keterangan dan jumlah wajib diisi' })
  try {
    const [r] = await pool.query('INSERT INTO pengeluaran (tanggal, keterangan, kategori, jumlah, status) VALUES (?,?,?,?,?)', [tanggal, keterangan, kategori, jumlah, status])
    const [rows] = await pool.query('SELECT * FROM pengeluaran WHERE id = ?', [r.insertId])
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function update(req, res) {
  const { id } = req.params
  const { tanggal, keterangan, kategori, jumlah, status } = req.body
  try {
    await pool.query('UPDATE pengeluaran SET tanggal=?, keterangan=?, kategori=?, jumlah=?, status=? WHERE id=?', [tanggal, keterangan, kategori, jumlah, status, id])
    const [rows] = await pool.query('SELECT * FROM pengeluaran WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM pengeluaran WHERE id = ?', [id])
    res.json({ message: 'Pengeluaran dihapus' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getAll, create, update, remove }
