import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Alert, Spinner, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Konfigurasi API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [apiCalls, setApiCalls] = useState(0);

  // Fetch data dari backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/data`);
      setData(response.data.data);
      setError(null);
      setApiCalls(prev => prev + 1);
    } catch (err) {
      setError('Gagal mengambil data dari server. Pastikan backend berjalan.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cek status backend
  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setHealthStatus(response.data);
      setApiCalls(prev => prev + 1);
    } catch (err) {
      setHealthStatus({ 
        status: 'ERROR', 
        message: 'Backend tidak terhubung',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Tambah data baru
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/data`, newItem);
      
      // Tambah item baru ke state
      setData([...data, response.data.data]);
      setNewItem({ name: '', description: '' });
      setShowModal(false);
      setApiCalls(prev => prev + 1);
      
      alert('Data berhasil ditambahkan!');
    } catch (err) {
      alert('Gagal menambahkan data');
      console.error('Error adding item:', err);
    }
  };

  // Hapus data
  const handleDeleteItem = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/data/${id}`);
        setData(data.filter(item => item.id !== id));
        setApiCalls(prev => prev + 1);
        alert('Data berhasil dihapus!');
      } catch (err) {
        alert('Gagal menghapus data');
        console.error('Error deleting item:', err);
      }
    }
  };

  // Load data saat komponen pertama kali render
  useEffect(() => {
    fetchData();
    checkHealth();
    
    // Cek status backend setiap 30 detik
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {/* Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 shadow">
        <Container>
          <Navbar.Brand href="#">
            <i className="bi bi-cloud-check me-2"></i>
            <strong>Aplikasi AWS Amplify</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#data">
                <i className="bi bi-database me-1"></i>
                Data ({data.length})
              </Nav.Link>
              <Nav.Link href="#status">
                <i className="bi bi-heart-pulse me-1"></i>
                Status
              </Nav.Link>
              <Button 
                variant="light" 
                className="ms-2"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Tambah Data
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {/* Header */}
        <header className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary">
            <i className="bi bi-aws me-2"></i>
            Aplikasi Full-Stack AWS Amplify
          </h1>
          <p className="lead">
            Contoh aplikasi dengan React frontend dan Express.js backend
          </p>
          <Badge bg="info" className="mb-3">
            API Calls: {apiCalls}
          </Badge>
        </header>

        {/* Status Backend */}
        <section id="status" className="mb-5">
          <h2 className="mb-3">
            <i className="bi bi-activity me-2"></i>
            Status Sistem
          </h2>
          <Card className="shadow-sm border-0">
            <Card.Body className={healthStatus?.status === 'OK' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}>
              <div className="d-flex align-items-center">
                <div className={`status-indicator ${healthStatus?.status === 'OK' ? 'status-ok' : 'status-error'}`}></div>
                <div className="ms-3">
                  <Card.Title>
                    {healthStatus?.status === 'OK' ? '✅ Backend Connected' : '❌ Backend Disconnected'}
                  </Card.Title>
                  <Card.Text className="mb-1">
                    <strong>URL Backend:</strong> {API_BASE_URL}
                  </Card.Text>
                  <Card.Text className="mb-1">
                    <strong>Status:</strong> 
                    <Badge bg={healthStatus?.status === 'OK' ? 'success' : 'danger'} className="ms-2">
                      {healthStatus?.status || 'Checking...'}
                    </Badge>
                  </Card.Text>
                  <Card.Text className="mb-1">
                    <strong>Pesan:</strong> {healthStatus?.message || 'Memeriksa...'}
                  </Card.Text>
                  {healthStatus?.timestamp && (
                    <Card.Text className="text-muted small">
                      <strong>Terakhir diperiksa:</strong> {new Date(healthStatus.timestamp).toLocaleString()}
                    </Card.Text>
                  )}
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="text-end">
              <Button variant="outline-primary" size="sm" onClick={checkHealth}>
                <i className="bi bi-arrow-repeat me-1"></i>
                Refresh Status
              </Button>
            </Card.Footer>
          </Card>
        </section>

        {/* Data Section */}
        <section id="data" className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>
              <i className="bi bi-table me-2"></i>
              Data dari Backend
              <Badge bg="secondary" className="ms-2">{data.length} items</Badge>
            </h2>
            <div>
              <Button variant="outline-primary" onClick={fetchData} disabled={loading} className="me-2">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </>
                )}
              </Button>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-circle me-1"></i>
                Tambah Baru
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>
                <i className="bi bi-exclamation-triangle me-2"></i>
                Terjadi Kesalahan!
              </Alert.Heading>
              <p>{error}</p>
              <hr />
              <p className="mb-0">
                Pastikan backend server berjalan di: <code>{API_BASE_URL}</code>
              </p>
            </Alert>
          )}

          {loading && !error ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Memuat data dari backend...</p>
            </div>
          ) : (
            <div className="row">
              {data.map((item) => (
                <div key={item.id} className="col-md-4 mb-4">
                  <Card className="h-100 shadow-sm border-hover">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <Card.Title className="text-primary">{item.name}</Card.Title>
                        <Badge bg="light" text="dark" className="border">
                          ID: {item.id}
                        </Badge>
                      </div>
                      <Card.Text className="mt-3">{item.description}</Card.Text>
                      {item.createdAt && (
                        <Card.Text className="text-muted small">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Card.Text>
                      )}
                    </Card.Body>
                    <Card.Footer className="bg-transparent border-top-0">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Hapus
                      </Button>
                    </Card.Footer>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {!loading && data.length === 0 && !error && (
            <Alert variant="info" className="text-center">
              <Alert.Heading>
                <i className="bi bi-info-circle me-2"></i>
                Tidak ada data
              </Alert.Heading>
              <p>Belum ada data yang tersedia. Coba tambah data baru!</p>
            </Alert>
          )}
        </section>

        {/* Modal Tambah Data */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-plus-circle me-2"></i>
              Tambah Data Baru
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddItem}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Nama Item</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contoh: Laptop Dell XPS"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                  autoFocus
                />
                <Form.Text className="text-muted">
                  Masukkan nama untuk item baru
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Deskripsi</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Contoh: Laptop dengan spesifikasi tinggi untuk development"
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  required
                />
                <Form.Text className="text-muted">
                  Berikan deskripsi yang jelas tentang item ini
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-circle me-1"></i>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                <i className="bi bi-check-circle me-1"></i>
                Simpan Data
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Informasi Deployment */}
        <Card className="mt-5 border-primary">
          <Card.Header className="bg-primary text-white">
            <i className="bi bi-cloud-upload me-2"></i>
            Informasi Deployment
          </Card.Header>
          <Card.Body>
            <h5>Deployment ke AWS Amplify</h5>
            <p>
              Aplikasi ini siap di-deploy ke AWS Amplify. Berikut konfigurasi yang diperlukan:
            </p>
            <ul>
              <li><strong>Frontend:</strong> AWS Amplify Hosting</li>
              <li><strong>Backend:</strong> AWS EC2, Elastic Beanstalk, atau Lambda</li>
              <li><strong>Environment Variable:</strong> <code>REACT_APP_API_URL</code></li>
            </ul>
            <div className="alert alert-info">
              <strong>Backend URL saat ini:</strong> <code>{API_BASE_URL}</code>
            </div>
          </Card.Body>
        </Card>

        {/* Footer */}
        <footer className="mt-5 pt-4 border-top text-center">
          <p className="text-muted">
            <strong>Aplikasi AWS Amplify</strong> - Contoh aplikasi full-stack
          </p>
          <div className="small text-muted">
            <p className="mb-1">
              <i className="bi bi-github me-1"></i>
              Frontend: React | Backend: Express.js
            </p>
            <p className="mb-0">
              Dibuat untuk demonstrasi deployment ke AWS Amplify
            </p>
          </div>
        </footer>
      </Container>
    </div>
  );
}

export default App;