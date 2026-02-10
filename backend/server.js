const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Data sementara (simulasi database)
let items = [
  { id: 1, name: 'Item 1', description: 'Deskripsi untuk item 1' },
  { id: 2, name: 'Item 2', description: 'Deskripsi untuk item 2' },
  { id: 3, name: 'Item 3', description: 'Deskripsi untuk item 3' }
];

// Route kesehatan
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API berjalan dengan baik',
    timestamp: new Date().toISOString(),
    totalItems: items.length
  });
});

// Route untuk mendapatkan semua data
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    data: items,
    count: items.length
  });
});

// Route untuk menambahkan data
app.post('/api/data', (req, res) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: 'Nama dan deskripsi diperlukan'
    });
  }
  
  const newItem = {
    id: items.length + 1,
    name,
    description,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  
  res.status(201).json({
    success: true,
    message: 'Data berhasil ditambahkan',
    data: newItem
  });
});

// Route untuk menghapus data
app.delete('/api/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = items.length;
  
  items = items.filter(item => item.id !== id);
  
  if (items.length < initialLength) {
    res.json({
      success: true,
      message: 'Data berhasil dihapus'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Data tidak ditemukan'
    });
  }
});

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Backend API - Aplikasi AWS Amplify</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          .api-list { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Backend API - Aplikasi AWS Amplify</h1>
          <p>Backend API berjalan dengan baik!</p>
          
          <div class="api-list">
            <h3>Available Endpoints:</h3>
            <ul>
              <li><code>GET /api/health</code> - Status API</li>
              <li><code>GET /api/data</code> - Mendapatkan semua data</li>
              <li><code>POST /api/data</code> - Menambah data baru</li>
              <li><code>DELETE /api/data/:id</code> - Menghapus data</li>
            </ul>
            
            <h3>Contoh Penggunaan:</h3>
            <pre>
curl -X GET ${req.protocol}://${req.get('host')}/api/data
            </pre>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route tidak ditemukan'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('===================================');
  console.log('🚀 Backend API berhasil dijalankan!');
  console.log('===================================');
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📡 Network: http://${getIPAddress()}:${PORT}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API Data: http://localhost:${PORT}/api/data`);
  console.log('===================================');
});

// Fungsi untuk mendapatkan IP address
function getIPAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}