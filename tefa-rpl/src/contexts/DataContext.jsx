import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { AuthContext } from './AuthContext'

const DataContext = createContext(null)

// Normalize pembayaran row: snake_case → camelCase untuk kompatibilitas frontend
function normalizePembayaran(row) {
  return {
    ...row,
    strukNo: row.strukNo ?? row.struk_no ?? '',
    jumlahRaw: Number(row.jumlahRaw ?? row.jumlah_raw ?? 0),
  }
}

function useApiData(endpoint, defaultValue = [], transform) {
  const { user } = useContext(AuthContext)
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await api.get(endpoint)
      setData(transform ? res.data.map(transform) : res.data)
    } catch (err) {
      console.error(`Fetch error [${endpoint}]:`, err.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint, user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch()
  }, [fetch])

  const setList = useCallback(async (list) => {
    setData(list)
  }, [])

  return [data, setList, fetch, loading]
}

export function DataProvider({ children }) {
  const [siswa, setSiswa, refetchSiswa] = useApiData('/siswa', [])
  const [pembayaran, setPembayaran, refetchPembayaran] = useApiData('/pembayaran', [], normalizePembayaran)
  const [penjualan, setPenjualan, refetchPenjualan] = useApiData('/penjualan', [])
  const [order, setOrder, refetchOrder] = useApiData('/order', [])
  const [produk, setProduk, refetchProduk] = useApiData('/produk', [])
  const [pendapatan, setPendapatan, refetchPendapatan] = useApiData('/pendapatan', [])
  const [pengeluaran, setPengeluaran, refetchPengeluaran] = useApiData('/pengeluaran', [])

  return (
    <DataContext.Provider value={{
      siswa, setSiswa, refetchSiswa,
      pembayaran, setPembayaran, refetchPembayaran,
      penjualan, setPenjualan, refetchPenjualan,
      order, setOrder, refetchOrder,
      produk, setProduk, refetchProduk,
      pendapatan, setPendapatan, refetchPendapatan,
      pengeluaran, setPengeluaran, refetchPengeluaran,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() { // eslint-disable-line react-refresh/only-export-components
  return useContext(DataContext)
}
