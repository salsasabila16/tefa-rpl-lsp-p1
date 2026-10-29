export function buildWAMessage(payment) {
  return (
    `🔔 *NOTIFIKASI PEMBAYARAN TEFA*\n\n` +
    `Ada pembayaran baru yang perlu diverifikasi.\n\n` +
    `*No Struk:* ${payment.strukNo || payment.struk_no || '-'}\n` +
    `*Nama Pembayar:* ${payment.pembayar || '-'}\n` +
    `*Produk:* ${payment.produk || '-'}\n` +
    `*Jumlah:* ${payment.jumlah || '-'}\n` +
    `*Metode:* ${payment.metode || '-'}\n` +
    `*Tanggal:* ${payment.tanggal || '-'}\n` +
    `*Status:* Pending Verifikasi\n\n` +
    `Silakan buka dashboard Bendahara untuk memverifikasi pembayaran ini.\n` +
    `Terima kasih. 🙏`
  )
}

export function getWALink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
