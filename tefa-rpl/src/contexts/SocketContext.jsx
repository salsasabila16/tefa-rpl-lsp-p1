/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { AuthContext } from './AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const SocketContext = createContext(null)

let socketInstance = null

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [socket, setSocket] = useState(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  // Declared before useEffect so it can be referenced in socket event handlers
  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now() }, ...prev].slice(0, 20))
  }, [])

  useEffect(() => {
    if (!user) {
      if (socketInstance) { socketInstance.disconnect(); socketInstance = null }
      // queueMicrotask avoids calling setState synchronously in effect body
      queueMicrotask(() => setSocket(null))
      return
    }

    if (socketInstance?.connected || socketInstance?.active) return

    socketInstance = io(SOCKET_URL, { transports: ['polling', 'websocket'] })
    queueMicrotask(() => setSocket(socketInstance))

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id, '| transport:', socketInstance.io.engine.transport.name)
    })

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] connect_error:', err.message)
    })

    socketInstance.on('user:online', ({ count }) => setOnlineCount(count))

    socketInstance.on('pembayaran:baru', (data) => {
      addNotification({ type: 'pembayaran', message: `Pembayaran baru: ${data.pembayar} — ${data.produk}`, data })
    })

    socketInstance.on('pembayaran:verifikasi', (data) => {
      addNotification({ type: 'verifikasi', message: `Struk ${data.strukNo} ${data.status === 'Lunas' ? 'disetujui' : 'ditolak'}`, data })
    })


    return () => { socketInstance?.disconnect(); socketInstance = null; setSocket(null) }
  }, [user, addNotification])

  function dismissNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  function emit(event, data) {
    socketInstance?.emit(event, data)
  }

  return (
    <SocketContext.Provider value={{ socket, onlineCount, notifications, emit, dismissNotification }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
