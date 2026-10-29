export const ROLE_ROUTES = {
  admin: [
    '/dashboard',
    '/dashboard/siswa',
    '/dashboard/produk',
    '/dashboard/penjualan',
    '/dashboard/order',
    '/dashboard/pembayaran',
    '/dashboard/jurnal',
    '/dashboard/grafik',
    '/dashboard/pendapatan',
    '/dashboard/pengeluaran',
    '/dashboard/struk',
    '/dashboard/histori',
  ],
  bendahara: [
    '/dashboard',
    '/dashboard/siswa',
    '/dashboard/produk',
    '/dashboard/pembayaran',
    '/dashboard/jurnal',
    '/dashboard/grafik',
    '/dashboard/pendapatan',
    '/dashboard/pengeluaran',
    '/dashboard/struk',
    '/dashboard/histori',
  ],
}

export function canAccess(role, path) {
  return ROLE_ROUTES[role]?.includes(path) ?? false
}
