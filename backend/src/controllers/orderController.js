const pool = require('../config/db')

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM `order` ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    console.error('GET ORDER ERROR:', err)
    res.status(500).json({ message: 'Gagal mengambil data order', error: err.message })
  }
}

async function create(req, res) {
  const { tanggal, produk, pembeli, total, status = 'Proses' } = req.body
  if (!produk || !pembeli || !total) {
    return res.status(400).json({ message: 'Produk, pembeli, dan total wajib diisi' })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO `order` (tanggal, produk, pembeli, total, status) VALUES (?, ?, ?, ?, ?)',
      [tanggal, produk, pembeli, total, status]
    )
    const [rows] = await pool.query('SELECT * FROM `order` WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('CREATE ORDER ERROR:', err)
    res.status(500).json({ message: 'Gagal membuat order', error: err.message })
  }
}

async function update(req, res) {
  const { id } = req.params
  const { tanggal, produk, pembeli, total, status } = req.body
  if (!produk || !pembeli || !total || !status) {
    return res.status(400).json({ message: 'Produk, pembeli, total, dan status wajib diisi' })
  }
  try {
    const [result] = await pool.query(
      'UPDATE `order` SET tanggal=?, produk=?, pembeli=?, total=?, status=? WHERE id=?',
      [tanggal, produk, pembeli, total, status, id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Order tidak ditemukan' })
    const [rows] = await pool.query('SELECT * FROM `order` WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) {
    console.error('UPDATE ORDER ERROR:', err)
    res.status(500).json({ message: 'Gagal memperbarui order', error: err.message })
  }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM `order` WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Order tidak ditemukan' })
    res.json({ message: 'Order berhasil dihapus' })
  } catch (err) {
    console.error('DELETE ORDER ERROR:', err)
    res.status(500).json({ message: 'Gagal menghapus order', error: err.message })
  }
}

module.exports = { getAll, create, update, remove }
