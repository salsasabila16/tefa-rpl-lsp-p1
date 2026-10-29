const pool = require('../config/db')

async function getAll(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM pembayaran ORDER BY id DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function create(req, res) {
  const { struk_no, pembayar, produk, tanggal, metode, jumlah, jumlah_raw, bayar, status } = req.body
  if (!pembayar || !produk || !jumlah) return res.status(400).json({ message: 'Pembayar, produk, dan jumlah wajib diisi' })
  try {
    const [r] = await pool.query(
      'INSERT INTO pembayaran (struk_no, pembayar, produk, tanggal, metode, jumlah, jumlah_raw, bayar, status) VALUES (?,?,?,?,?,?,?,?,?)',
      [struk_no, pembayar, produk, tanggal, metode, jumlah, jumlah_raw || 0, bayar, status || 'Pending']
    )
    const [rows] = await pool.query('SELECT * FROM pembayaran WHERE id = ?', [r.insertId])
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function update(req, res) {
  const { id } = req.params
  const { pembayar, produk, tanggal, metode, jumlah, jumlah_raw, bayar, status, keterangan } = req.body
  try {
    await pool.query(
      'UPDATE pembayaran SET pembayar=?, produk=?, tanggal=?, metode=?, jumlah=?, jumlah_raw=?, bayar=?, status=?, keterangan=? WHERE id=?',
      [pembayar, produk, tanggal, metode, jumlah, jumlah_raw || 0, bayar, status || 'Pending', keterangan, id]
    )
    const [rows] = await pool.query('SELECT * FROM pembayaran WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function verifikasi(req, res) {
  const { id } = req.params
  const { action, keterangan } = req.body // action: 'approve' | 'reject'
  const status = action === 'approve' ? 'Lunas' : 'Ditolak'

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [existing] = await conn.query('SELECT * FROM pembayaran WHERE id = ?', [id])
    if (!existing.length) {
      await conn.rollback()
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' })
    }
    const pbyr = existing[0]

    await conn.query('UPDATE pembayaran SET status=?, keterangan=? WHERE id=?', [status, keterangan || '', id])

    if (action === 'approve') {
      const tanggalSingkat = (pbyr.tanggal || '').split(' ').slice(0, 3).join(' ') || '-'

      // Jika pendapatan sudah ada (dari entri manual) → UPDATE statusnya ke Lunas
      // Jika belum ada → INSERT baru (alur tanpa entri pendapatan manual)
      const [existingPdt] = await conn.query('SELECT id FROM pendapatan WHERE struk_no = ?', [pbyr.struk_no])
      if (existingPdt.length) {
        await conn.query(
          'UPDATE pendapatan SET status=?, tanggal=? WHERE struk_no=?',
          ['Lunas', tanggalSingkat, pbyr.struk_no]
        )
      } else {
        await conn.query(
          'INSERT INTO pendapatan (tanggal, keterangan, kategori, jumlah, status, struk_no) VALUES (?,?,?,?,?,?)',
          [tanggalSingkat, `${pbyr.produk || 'Pembayaran'} — ${pbyr.pembayar || '-'}`, 'Pembayaran Siswa', pbyr.jumlah, 'Lunas', pbyr.struk_no]
        )
      }

      // Idempoten: hanya insert penjualan jika belum ada untuk struk_no ini
      const [existingPjl] = await conn.query('SELECT id FROM penjualan WHERE struk_no = ?', [pbyr.struk_no])
      if (!existingPjl.length) {
        await conn.query(
          'INSERT INTO penjualan (kode_id, tanggal, produk, pembeli, jumlah, status, struk_no) VALUES (?,?,?,?,?,?,?)',
          [pbyr.struk_no, tanggalSingkat, pbyr.produk || '-', pbyr.pembayar || '-', pbyr.jumlah, 'Lunas', pbyr.struk_no]
        )
      }
    }

    // Jika ditolak dan ada pendapatan terkait, kembalikan status ke Pending
    if (action === 'reject' && pbyr.struk_no) {
      await conn.query(
        'UPDATE pendapatan SET status=? WHERE struk_no=? AND status=?',
        ['Pending', pbyr.struk_no, 'Lunas']
      )
    }

    await conn.commit()
    const [rows] = await conn.query('SELECT * FROM pembayaran WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ message: err.message })
  } finally {
    conn.release()
  }
}

async function remove(req, res) {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM pembayaran WHERE id = ?', [id])
    res.json({ message: 'Pembayaran dihapus' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getAll, create, update, verifikasi, remove }
