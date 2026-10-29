const pool = require('../config/db')

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM penjualan ORDER BY id DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function create(req, res) {
  const { kode_id, tanggal, produk, pembeli, jumlah, status = 'Lunas', struk_no } = req.body
  if (!produk || !pembeli || !jumlah) return res.status(400).json({ message: 'Produk, pembeli, dan jumlah wajib diisi' })
  try {
    const [r] = await pool.query(
      'INSERT INTO penjualan (kode_id, tanggal, produk, pembeli, jumlah, status, struk_no) VALUES (?,?,?,?,?,?,?)',
      [kode_id, tanggal, produk, pembeli, jumlah, status, struk_no]
    )
    const [rows] = await pool.query('SELECT * FROM penjualan WHERE id = ?', [r.insertId])
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function update(req, res) {
  const { id } = req.params
  const { tanggal, produk, pembeli, jumlah, status } = req.body
  try {
    await pool.query('UPDATE penjualan SET tanggal=?, produk=?, pembeli=?, jumlah=?, status=? WHERE id=?', [tanggal, produk, pembeli, jumlah, status, id])
    const [rows] = await pool.query('SELECT * FROM penjualan WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM penjualan WHERE id = ?', [id])
    res.json({ message: 'Penjualan dihapus' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getAll, create, update, remove }
