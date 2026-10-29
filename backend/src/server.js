const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
require('dotenv').config()
const app = express()
const server = http.createServer(app)

const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true)
    else cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

app.use(cors(corsOptions))

app.use(express.json())

// REST API routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/siswa', require('./routes/siswa'))
app.use('/api/produk', require('./routes/produk'))
app.use('/api/order', require('./routes/order'))
app.use('/api/penjualan', require('./routes/penjualan'))
app.use('/api/pembayaran', require('./routes/pembayaran'))
app.use('/api/pendapatan', require('./routes/pendapatan'))
app.use('/api/pengeluaran', require('./routes/pengeluaran'))

// WebSocket
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
})

let connectedClients = 0

io.on('connection', (socket) => {
  connectedClients++
  console.log(`Client terhubung: ${socket.id} (total: ${connectedClients})`)
  socket.broadcast.emit('user:online', { count: connectedClients })

  socket.on('pembayaran:baru', (data) => socket.broadcast.emit('pembayaran:baru', data))
  socket.on('pembayaran:verifikasi', (data) => socket.broadcast.emit('pembayaran:verifikasi', data))
  socket.on('data:update', (data) => socket.broadcast.emit('data:update', data))

  socket.on('disconnect', () => {
    connectedClients--
    console.log(`Client terputus: ${socket.id} (total: ${connectedClients})`)
    io.emit('user:online', { count: connectedClients })
  })
})

app.get('/', (req, res) => {
  res.json({ message: 'Backend TEFA RPL berjalan', clients: connectedClients })
})

const migrate = require('./migrate')
const PORT = process.env.PORT || 3000

migrate()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Backend berjalan di http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Gagal migrasi, server tidak dijalankan:', err.message)
    process.exit(1)
  })
