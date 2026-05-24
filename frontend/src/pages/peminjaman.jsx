import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';

export default function Peminjaman({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);
  const [alats, setAlats] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isPerpanjang, setIsPerpanjang] = useState(false);
  const [isPinjamUlang, setIsPinjamUlang] = useState(false);
  const [selectedPeminjamanId, setSelectedPeminjamanId] = useState(null);
  
  const [selectedAlatNama, setSelectedAlatNama] = useState('');
  const [form, setForm] = useState({ alatId: '', jumlah: 1, tanggalKembali: '', keperluan: '' });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const canvasRef = useRef(null);

  const isAdmin = user?.role?.toLowerCase() !== 'mahasiswa';

  // --- LOGIKA PARTIKEL BACKGROUND LOKAL (BIRU & CYAN) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = Math.random() > 0.5 ? '#38bdf8' : '#0ea5e9';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 60; i++) particles.push(new Particle());
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 - distance / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- LOGIKA FETCH DATA ---
  useEffect(() => {
    fetchPeminjaman();
    fetchAlats();

    const stored = sessionStorage.getItem('selectedAlat');
    if (stored) {
      try {
        const selected = JSON.parse(stored);
        if (selected && selected._id) {
          setForm(prev => ({ ...prev, alatId: selected._id, jumlah: 1 }));
          setSelectedAlatNama(selected.nama || '');
          setShowModal(true);
        }
      } catch (err) {
        console.error('Data selectedAlat rusak:', err);
      } finally {
        sessionStorage.removeItem('selectedAlat');
      }
    }
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const res = await API.get('/peminjaman');
      setPeminjaman(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPeminjaman([]);
    }
  };

  const fetchAlats = async () => {
    try {
      const res = await API.get('/alat');
      setAlats(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAlats([]);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!form.tanggalKembali || !form.keperluan || (!isPerpanjang && !form.alatId)) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isPerpanjang) {
        await API.put(`/peminjaman/${selectedPeminjamanId}/perpanjang`, {
          tanggalKembaliBaru: form.tanggalKembali, alasan: form.keperluan
        });
        showToast('Permohonan perpanjangan berhasil diajukan!');
      } else {
        await API.post('/peminjaman', {
          alatId: form.alatId, jumlah: form.jumlah, tanggalKembali: form.tanggalKembali, keperluan: form.keperluan
        });
        showToast(isPinjamUlang ? 'Pinjam kembali berhasil diajukan!' : 'Peminjaman berhasil diajukan!');
      }
      handleCloseModal();
      await fetchPeminjaman();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Gagal memproses permintaan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, action) => {
    try {
      await API.put(`/peminjaman/${id}/${action}`);
      await fetchPeminjaman();
      showToast(`Berhasil memperbarui status peminjaman!`);
    } catch {
      showToast(`Gagal memperbarui status`, 'error');
    }
  };

  const openPerpanjangModal = (item) => {
    setIsPerpanjang(true);
    setIsPinjamUlang(false);
    setSelectedPeminjamanId(item._id);
    setSelectedAlatNama(item.alat?.nama || 'Alat Tidak Diketahui');
    setForm({ alatId: item.alat?._id || '', jumlah: item.jumlah || 1, tanggalKembali: '', keperluan: `Perpanjangan: ${item.keperluan || ''}` });
    setShowModal(true);
  };

  const openPinjamUlangModal = (item) => {
    setIsPerpanjang(false);
    setIsPinjamUlang(true);
    setSelectedPeminjamanId(null);
    setSelectedAlatNama(item.alat?.nama || ''); 
    setForm({ alatId: item.alat?._id || '', jumlah: item.jumlah || 1, tanggalKembali: '', keperluan: item.keperluan || '' });
    setShowModal(true);
  };

  const openPinjamBaruModal = () => {
    setIsPerpanjang(false);
    setIsPinjamUlang(false);
    setSelectedPeminjamanId(null);
    setSelectedAlatNama(''); 
    setForm({ alatId: '', jumlah: 1, tanggalKembali: '', keperluan: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsPerpanjang(false);
    setIsPinjamUlang(false);
    setSelectedAlatNama('');
    setForm({ alatId: '', jumlah: 1, tanggalKembali: '', keperluan: '' });
  };

  const statusStyle = (status) => {
    if (status === 'Dipinjam') return { color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.3)', shadow: 'rgba(14,165,233,0.15)' };
    if (status === 'Dikembalikan' || status === 'Kembali') return { color: '#22c55e', bg: 'rgba(34,197,148,0.08)', border: 'rgba(34,197,148,0.3)', shadow: 'rgba(34,197,148,0.15)' };
    if (status === 'Menunggu') return { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.3)', shadow: 'rgba(56,189,248,0.15)' };
    if (status === 'Ditolak') return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', shadow: 'rgba(239,68,68,0.15)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.3)', shadow: 'rgba(148,163,184,0.15)' };
  };

  const statusIcon = (status) => {
    if (status === 'Dipinjam') return '📤';
    if (status === 'Dikembalikan' || status === 'Kembali') return '✅';
    if (status === 'Menunggu') return '⏳';
    if (status === 'Ditolak') return '❌';
    return '❓';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', ' -');
  };

 // --- LOGIKA CETAK BUKTI TRANSAKSI (VERSI MODERN COMMAND CENTER) ---
  const handlePrint = (data) => {
    if (!data) return;

    // Helper formatter tanggal
    const formatCustomDate = (dateString) => {
      if (!dateString) return { date: '-', time: '-' };
      const d = new Date(dateString);
      const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return { date, time };
    };

    const pinjam = formatCustomDate(data.tanggalPinjam);
    const kembali = formatCustomDate(data.tanggalKembali);
    
    // Generate ID Transaksi unik
    const transactionId = `CCX-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Warna dinamis berdasarkan status
    const getStatusColor = (status) => {
      if (status === 'Dipinjam') return { bg: '#e0f2fe', text: '#0284c7', border: '#38bdf8' };
      if (status === 'Dikembalikan' || status === 'Kembali') return { bg: '#dcfce7', text: '#166534', border: '#4ade80' };
      if (status === 'Menunggu') return { bg: '#fef08a', text: '#854d0e', border: '#facc15' };
      if (status === 'Ditolak') return { bg: '#fee2e2', text: '#991b1b', border: '#f87171' };
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    };

    const statusStyle = getStatusColor(data.status);

    // SVG Logo Kustom (Logo Command Center Modern)
    const customLogo = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#0f172a"/>
        <path d="M14 24L22 32L34 16" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 10H16M10 16H14" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="38" cy="38" r="3" fill="#38bdf8"/>
        <circle cx="10" cy="38" r="3" fill="#38bdf8"/>
        <circle cx="38" cy="10" r="3" fill="#38bdf8"/>
      </svg>
    `;

    // SVG Barcode tiruan untuk estetika
    const fakeBarcode = `
      <svg width="120" height="30" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" width="4" height="30" fill="#0f172a"/><rect x="6" width="2" height="30" fill="#0f172a"/>
        <rect x="10" width="6" height="30" fill="#0f172a"/><rect x="18" width="2" height="30" fill="#0f172a"/>
        <rect x="22" width="4" height="30" fill="#0f172a"/><rect x="30" width="8" height="30" fill="#0f172a"/>
        <rect x="40" width="2" height="30" fill="#0f172a"/><rect x="46" width="4" height="30" fill="#0f172a"/>
        <rect x="52" width="6" height="30" fill="#0f172a"/><rect x="62" width="2" height="30" fill="#0f172a"/>
        <rect x="68" width="8" height="30" fill="#0f172a"/><rect x="78" width="4" height="30" fill="#0f172a"/>
        <rect x="84" width="2" height="30" fill="#0f172a"/><rect x="88" width="6" height="30" fill="#0f172a"/>
        <rect x="96" width="4" height="30" fill="#0f172a"/><rect x="104" width="2" height="30" fill="#0f172a"/>
        <rect x="108" width="8" height="30" fill="#0f172a"/><rect x="118" width="2" height="30" fill="#0f172a"/>
      </svg>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>INVOICE - ${transactionId}</title>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 0; }
            body {
              font-family: 'Inter', sans-serif;
              background-color: #f8fafc;
              color: #0f172a;
              margin: 0;
              padding: 40px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .document-container {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
              position: relative;
              overflow: hidden;
            }
            
            /* Aksen garis atas */
            .top-accent {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #0ea5e9, #38bdf8);
            }

            /* Watermark background */
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-family: 'Space Grotesk', sans-serif;
              font-size: 120px;
              font-weight: 700;
              color: rgba(241, 245, 249, 0.6);
              white-space: nowrap;
              z-index: 0;
              pointer-events: none;
            }

            .content-wrapper {
              position: relative;
              z-index: 1;
            }

            /* --- HEADER --- */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px dashed #cbd5e1;
              padding-bottom: 25px;
              margin-bottom: 30px;
            }
            .header-left { display: flex; align-items: center; gap: 16px; }
            .brand-info h1 {
              font-family: 'Space Grotesk', sans-serif;
              margin: 0;
              font-size: 24px;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .brand-info p {
              margin: 4px 0 0 0;
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header-right { text-align: right; }
            .trx-id {
              font-family: 'JetBrains Mono', monospace;
              font-size: 18px;
              font-weight: 700;
              color: #0ea5e9;
              margin: 0 0 4px 0;
            }
            .print-date {
              font-size: 12px;
              color: #94a3b8;
            }

            /* --- MAIN INFO CARDS --- */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
            }
            .card-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
              font-weight: 600;
            }
            .card-value {
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 14px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 10px;
              background-color: ${statusStyle.bg};
              color: ${statusStyle.text};
              border: 1px solid ${statusStyle.border};
            }

            /* --- ITEM DETAILS --- */
            .item-section {
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 30px;
            }
            .item-header {
              background: #f1f5f9;
              padding: 12px 20px;
              font-size: 12px;
              font-weight: 600;
              color: #475569;
              text-transform: uppercase;
              border-bottom: 1px solid #cbd5e1;
            }
            .item-body {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px;
            }
            .item-name {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
            }
            .item-qty {
              background: #0ea5e9;
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }

            /* --- TIMELINE --- */
            .timeline-container {
              position: relative;
              padding: 20px 0;
              margin-bottom: 30px;
            }
            .timeline-line {
              position: absolute;
              top: 35px;
              left: 10%;
              right: 10%;
              height: 2px;
              background: repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 5px, transparent 5px, transparent 10px);
              z-index: 1;
            }
            .timeline-points {
              display: flex;
              justify-content: space-between;
              position: relative;
              z-index: 2;
              padding: 0 5%;
            }
            .point {
              text-align: center;
              background: #ffffff;
              padding: 0 10px;
            }
            .point-icon {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #f8fafc;
              border: 2px solid #0ea5e9;
              margin: 0 auto 10px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #0ea5e9;
              font-weight: bold;
              font-size: 14px;
            }
            .point-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .point-date {
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
            }

            /* --- KEPERLUAN BOX --- */
            .purpose-box {
              background: #f8fafc;
              border-left: 4px solid #0ea5e9;
              padding: 16px 20px;
              border-radius: 0 8px 8px 0;
              margin-bottom: 40px;
            }
            .purpose-box p { margin: 0; font-size: 14px; line-height: 1.6; color: #334155; }

            /* --- SIGNATURES --- */
            .signature-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              text-align: center;
              margin-bottom: 40px;
            }
            .sig-title {
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
              margin-bottom: 60px;
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              width: 80%;
              margin: 0 auto 8px auto;
            }
            .sig-name {
              font-size: 14px;
              font-weight: 600;
              color: #0f172a;
            }

            /* --- FOOTER --- */
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .footer-terms {
              font-size: 11px;
              color: #94a3b8;
              max-width: 60%;
              line-height: 1.5;
            }
            .barcode-container {
              text-align: right;
            }

            @media print {
              body { background-color: transparent; padding: 0; }
              .document-container { box-shadow: none; border: none; }
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="top-accent"></div>
            <div class="watermark">SECURE AUTH</div>
            
            <div class="content-wrapper">
              
              <!-- Header Section -->
              <div class="header">
                <div class="header-left">
                  ${customLogo}
                  <div class="brand-info">
                    <h1>Command Center</h1>
                    <p>Logistics & Inventory System</p>
                  </div>
                </div>
                <div class="header-right">
                  <p class="trx-id">${transactionId}</p>
                  <p class="print-date">Generated: ${new Date().toLocaleString('id-ID')}</p>
                </div>
              </div>

              <!-- General Info Cards -->
              <div class="info-grid">
                <div class="info-card">
                  <div class="card-label">Identitas Peminjam</div>
                  <div class="card-value">${data.user?.nama || user?.nama || 'Unknown User'}</div>
                  <div class="status-badge">${data.status || 'PROSES'}</div>
                </div>
                <div class="info-card">
                  <div class="card-label">Otorisasi Sistem</div>
                  <div class="card-value">Access Granted</div>
                  <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; margin-top: 10px;">
                    AUTH_KEY: ${Math.random().toString(16).substring(2, 10).toUpperCase()}<br>
                    NODE: CC-MAIN-01
                  </div>
                </div>
              </div>

              <!-- Hardware Item Section -->
              <div class="item-section">
                <div class="item-header">Hardware Details</div>
                <div class="item-body">
                  <div>
                    <div class="card-label">Nama Perangkat / Alat</div>
                    <div class="item-name">${data.alat?.nama || 'Unspecified Device'}</div>
                  </div>
                  <div class="item-qty">${data.jumlah || 1} Unit</div>
                </div>
              </div>

              <!-- Timeline Section -->
              <div class="timeline-container">
                <div class="timeline-line"></div>
                <div class="timeline-points">
                  <div class="point">
                    <div class="point-icon">OUT</div>
                    <div class="point-label">Waktu Ekstraksi</div>
                    <div class="point-date">${pinjam.date}</div>
                    <div class="card-label" style="margin-top:4px;">${pinjam.time}</div>
                  </div>
                  <div class="point">
                    <div class="point-icon">IN</div>
                    <div class="point-label">Batas Pengembalian</div>
                    <div class="point-date">${kembali.date}</div>
                    <div class="card-label" style="margin-top:4px;">${kembali.time}</div>
                  </div>
                </div>
              </div>

              <!-- Purpose Box -->
              <div class="card-label">Tujuan / Keperluan Transmisi</div>
              <div class="purpose-box">
                <p>${data.keperluan || 'Tidak ada deskripsi keperluan yang dilampirkan dalam log.'}</p>
              </div>

              <!-- Signatures -->
              <div class="signature-grid">
                <div>
                  <div class="sig-title">System Administrator</div>
                  <div class="sig-line"></div>
                  <div class="sig-name">Authorized Officer</div>
                </div>
                <div>
                  <div class="sig-title">Peminjam / Eksekutor</div>
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.user?.nama || user?.nama || '..................'}</div>
                </div>
                <div>
                  <div class="sig-title">Petugas Pengembalian</div>
                  <div class="sig-line"></div>
                  <div class="sig-name">..................</div>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="footer-terms">
                  <strong>PENTING:</strong> Dokumen ini adalah bukti otorisasi fisik yang sah dari sistem Command Center. Harap bawa dokumen ini saat melakukan pengembalian perangkat. Keterlambatan pengembalian akan dicatat dalam log sistem.
                </div>
                <div class="barcode-container">
                  ${fakeBarcode}
                  <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #64748b; margin-top: 4px; letter-spacing: 2px;">
                    ${transactionId}
                  </div>
                </div>
              </div>

            </div>
          </div>
          <script>
            // Memberikan sedikit waktu agar font dari Google termuat sebelum window print otomatis muncul
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 600);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const safePeminjaman = Array.isArray(peminjaman) ? peminjaman : [];
  const safeAlats = Array.isArray(alats) ? alats : [];

  return (
    <div style={{ fontFamily: "'Sora', 'Inter', sans-serif", minHeight: '100vh', paddingBottom: '20px', position: 'relative' }}>

      {/* CANVAS BACKGROUND LOKAL MANDIRI */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          width: '100vw',
          height: '100vh',
          zIndex: 0, 
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)'
        }} 
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.2); } }
        
        .row-hover:hover { background: rgba(56,189,248,0.06) !important; transition: background 0.2s; }
        
        /* WARNA FULL BIRU/CYAN MODERN */
        .btn-primary { 
          background: linear-gradient(135deg, #0ea5e9, #38bdf8); 
          border: 1px solid rgba(255,255,255,0.05); 
          color: #fff; 
          cursor: pointer; 
          transition: all 0.25s ease; 
          font-family: 'Space Grotesk', sans-serif; 
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(14,165,233,0.25);
        }
        .btn-primary:hover:not(:disabled) { 
          transform: translateY(-2px); 
          box-shadow: 0 10px 28px rgba(14,165,233,0.45); 
          filter: brightness(1.1); 
        }
        
        .input-field { 
          width: 100%; 
          padding: 12px 14px; 
          border-radius: 12px; 
          border: 1px solid rgba(56,189,248,0.2); 
          background: rgba(15,23,42,0.85); 
          color: #e2e8f0; 
          font-family: 'Sora', sans-serif; 
          font-size: 14px; 
          margin-bottom: 14px; 
          box-sizing: border-box; 
        }
        .input-field:focus { 
          outline: none; 
          border-color: #38bdf8; 
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15); 
        }
        
        .action-btn { 
          border: none; 
          cursor: pointer; 
          font-size: 12px; 
          font-weight: 600; 
          padding: 7px 15px; 
          border-radius: 20px; 
          font-family: 'Space Grotesk', sans-serif; 
          transition: all 0.2s; 
        }
        .action-btn:hover { 
          transform: translateY(-1.5px); 
          filter: brightness(1.15); 
        }
        
        .dropdown-item { 
          padding: 12px 16px; 
          text-align: left; 
          background: transparent; 
          border: none; 
          cursor: pointer; 
          font-size: 13px; 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          font-family: 'Sora', sans-serif; 
          font-weight: 500; 
          transition: 0.2s; 
        }
        .dropdown-item:hover { 
          background: rgba(56,189,248,0.15); 
          padding-left: 20px; 
        }
        .pulse-light {
          width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: pulseDot 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* WRAPPER KONTEN UTAMA DENGAN Z-INDEX LEBIH TINGGI */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* TOAST NOTIFIKASI */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 30, right: 30, zIndex: 9999, padding: '14px 22px', borderRadius: 14,
            background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
            border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}`,
            color: toast.type === 'error' ? '#f87171' : '#4ade80',
            backdropFilter: 'blur(20px)', fontWeight: 600, fontSize: 14, animation: 'toastIn 0.3s ease',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
              Command Center Peminjaman
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Kelola riwayat peminjaman, permohonan, dan perpanjangan alat lab</p>
          </div>

          {!isAdmin && (
            <button onClick={openPinjamBaruModal} className="btn-primary" style={{ padding: '14px 26px', borderRadius: 14, fontSize: 14 }}>
              + Ajukan Peminjaman Baru
            </button>
          )}
        </div>

        {/* STATISTIK */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28, animation: 'fadeUp 0.5s ease' }}>
          {[
            { label: 'Total Peminjaman Aktif', value: safePeminjaman.length, color: '#38bdf8', icon: '📋' },
            { label: 'Perangkat Sedang Aktif', value: safePeminjaman.filter(p => p.status === 'Dipinjam').length, color: '#0ea5e9', icon: '📤' },
            { label: 'Menunggu Otorisasi', value: safePeminjaman.filter(p => p.status === 'Menunggu').length, color: '#0284c7', icon: '⏳' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(56,189,248,0.12)', backdropFilter: 'blur(10px)', borderRadius: 18, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 26, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: stat.color + '15', border: `1px solid ${stat.color}25` }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* DATA TABLE */}
        <div style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(14px)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 20, overflow: 'visible', animation: 'fadeUp 0.6s ease', padding: '10px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
            <thead>
              <tr style={{ background: 'rgba(56,189,248,0.04)' }}>
                {['Alat & Perangkat', 'Tujuan / Keperluan', 'Status Enkripsi', 'Panel Kontrol'].map(h => (
                  <th key={h} style={{ padding: '16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: "'Space Grotesk', sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safePeminjaman.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '70px 30px', color: '#64748b' }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>📡</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}>No Active Transmission</div>
                    <div style={{ fontSize: 13, marginBottom: 20, color: '#475569' }}>Belum ada riwayat peminjaman yang tercatat di database</div>
                    {!isAdmin && (
                      <button onClick={openPinjamBaruModal} className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>Inisiasi Koneksi Pertama</button>
                    )}
                  </td>
                </tr>
              ) : safePeminjaman.map((p, i) => {
                const style = statusStyle(p.status);
                return (
                  <tr key={p._id || i} className="row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: '0.2s' }}>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 600 }}>
                         📦 {p.alat?.nama || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.keperluan || '-'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: style.bg, color: style.color, 
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, 
                        border: `1px solid ${style.border}`,
                        boxShadow: `0 0 10px ${style.shadow}`,
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}>
                        <span className="pulse-light" style={{ background: style.color }} />
                        {statusIcon(p.status)} {p.status || 'Tidak Diketahui'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                        
{/* ADMIN PANEL CONTROL */}
{isAdmin && (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
    
    {/* Tombol Setuju / Tolak */}
    {p.status === 'Menunggu' && (
      <>
        <button className="action-btn" onClick={() => handleUpdateStatus(p._id, 'setujui')} style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Setujui</button>
        <button className="action-btn" onClick={() => handleUpdateStatus(p._id, 'tolak')} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>✗ Tolak</button>
      </>
    )}
    
    {/* Tombol Konfirmasi Kembali */}
    {p.status === 'Dipinjam' && (
      <button className="action-btn" onClick={() => handleUpdateStatus(p._id, 'kembalikan')} style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>↩ Konfirmasi Kembali</button>
    )}
    
    {/* Label Arsip */}
    {(p.status === 'Dikembalikan' || p.status === 'Kembali' || p.status === 'Ditolak') && (
       <span style={{ color: '#475569', fontSize: 12, fontWeight: 600 }}>🔒 ARSIP SELESAI</span>
    )}

    {/* 👇 TOMBOL CETAK & DETAIL UNTUK ADMIN 👇 */}
    <button 
      className="action-btn" 
      onClick={() => setDetailData(p)} 
      style={{ 
        background: 'rgba(148,163,184,0.15)', 
        color: '#cbd5e1', 
        border: '1px solid rgba(148,163,184,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
      title="Lihat Detail & Cetak Bukti"
    >
      🖨️ Cetak
    </button>
    
  </div>
)}
                        {/* MAHASISWA PANEL CONTROL */}
                        {!isAdmin && (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <motion.button 
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => setActiveDropdown(activeDropdown === p._id ? null : p._id)} 
                              className="action-btn" 
                              style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              Opsi Kontrol <span style={{ fontSize: '10px' }}>▼</span>
                            </motion.button>
                            
                            <AnimatePresence>
                              {activeDropdown === p._id && (
                                <>
                                  {/* BACKDROP UNTUK MENUTUP DROPDOWN SAAT DIKLIK DI LUAR */}
                                  <div onClick={() => setActiveDropdown(null)} style={{ position: 'fixed', inset: 0, zIndex: 10 }}></div>
                                  
                                  {/* PERBAIKAN: Posisi dropdown diganti ke right: 0 agar pas dan tidak meluap keluar layar */}
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    style={{ 
                                      position: 'absolute', 
                                      right: 0, // Posisi diratakan ke kanan tombol
                                      top: 'calc(100% + 8px)', 
                                      width: '220px', 
                                      zIndex: 11, 
                                      background: 'rgba(15,23,42,0.95)', 
                                      backdropFilter: 'blur(10px)', 
                                      border: '1px solid rgba(56,189,248,0.3)', 
                                      borderRadius: '14px', 
                                      boxShadow: '0 10px 40px rgba(0,0,0,0.8)', 
                                      overflow: 'hidden', 
                                      display: 'flex', 
                                      flexDirection: 'column' 
                                    }}
                                  >
                                    {/* 1. JIKA STATUS: MENUNGGU */}
                                    {p.status === 'Menunggu' && (
                                      <>
                                        <button onClick={() => { setDetailData(p); setActiveDropdown(null); }} className="dropdown-item" style={{ color: '#cbd5e1' }}>
                                          <span style={{ width: '24px', textAlign: 'center', fontSize: '15px' }}>📜</span> 
                                          <span>Detail Pengajuan</span>
                                        </button>
                                      </>
                                    )}

                                    {/* 2. JIKA STATUS: DIPINJAM */}
                                    {p.status === 'Dipinjam' && (
                                      <>
                                        <button onClick={() => { openPerpanjangModal(p); setActiveDropdown(null); }} className="dropdown-item" style={{ color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                          <span style={{ width: '24px', textAlign: 'center', fontSize: '15px' }}>🚀</span> 
                                          <span>Perpanjang Barang</span>
                                        </button>
                                        <button onClick={() => { handleUpdateStatus(p._id, 'kembalikan'); setActiveDropdown(null); }} className="dropdown-item" style={{ color: '#0ea5e9', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                          <span style={{ width: '24px', textAlign: 'center', fontSize: '15px' }}>↩</span> 
                                          <span>Kembalikan Barang</span>
                                        </button>
                                        <button onClick={() => { setDetailData(p); setActiveDropdown(null); }} className="dropdown-item" style={{ color: '#cbd5e1' }}>
                                          <span style={{ width: '24px', textAlign: 'center', fontSize: '15px' }}>📜</span> 
                                          <span>Detail Peminjaman</span>
                                        </button>
                                      </>
                                    )}

                                    {/* 3. JIKA STATUS: SELESAI / KEMBALI / DITOLAK */}
                                    {(p.status === 'Dikembalikan' || p.status === 'Kembali' || p.status === 'Ditolak') && (
                                      <>
                                        <button onClick={() => { setDetailData(p); setActiveDropdown(null); }} className="dropdown-item" style={{ color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                          <span style={{ width: '24px', textAlign: 'center', fontSize: '15px' }}>📜</span> 
                                          <span>Riwayat Pengembalian</span>
                                        </button>
                                        <button onClick={() => { openPinjamUlangModal(p); setActiveDropdown(null); }} className="dropdown-item" style={{ color: '#38bdf8' }}>
                                          <span style={{ width: '24px', textAlign: 'center', fontSize: '15px' }}>↻</span> 
                                          <span>Pinjam Kembali</span>
                                        </button>
                                      </>
                                    )}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL RIWAYAT DETAIL */}
        <AnimatePresence>
          {detailData && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '24px', padding: '32px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', color: '#e2e8f0' }}
              >
                <h2 style={{ margin: '0 0 24px 0', fontSize: 22, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span>📜</span> Detail Transaksi
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                  <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.2)', boxShadow: 'inset 0 2px 10px rgba(56,189,248,0.05)' }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alat yang Dikembalikan</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📦 {detailData.alat?.nama || '-'}
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '14px', borderRadius: '14px' }}>
                    <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Peminjam</div>
                    <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{detailData.user?.nama || user?.nama || '-'}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#1e293b', padding: '14px', borderRadius: '14px', flex: 1 }}>
                      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Waktu Pinjam</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{formatDateTime(detailData.tanggalPinjam)}</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '14px', borderRadius: '14px', flex: 1 }}>
                      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Waktu Kembali</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{formatDateTime(detailData.tanggalKembali)}</div>
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '14px', borderRadius: '14px' }}>
                    <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Keperluan</div>
                    <div style={{ lineHeight: '1.5' }}>{detailData.keperluan || '-'}</div>
                  </div>
                  
                  <div style={{ background: '#1e293b', padding: '14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Status Akhir</div>
                    <div style={{ color: statusStyle(detailData.status).color, fontWeight: 700, background: statusStyle(detailData.status).bg, padding: '4px 12px', borderRadius: '8px', border: `1px solid ${statusStyle(detailData.status).border}` }}>
                      {detailData.status || '-'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                  <button onClick={() => setDetailData(null)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Tutup Detail
                  </button>
                  <button 
                    onClick={() => handlePrint(detailData)} 
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      borderRadius: '14px', 
                      background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', 
                      color: 'white', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: 15, 
                      fontFamily: "'Space Grotesk', sans-serif",
                      boxShadow: '0 4px 15px rgba(14,165,233,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🖨️</span> Cetak Bukti
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL FORM */}
        <AnimatePresence>
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 24, padding: 32, width: 440, boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {isPerpanjang ? '🚀 Perpanjang Alat' : isPinjamUlang ? '↻ Pinjam Kembali Alat' : 'Ajukan Peminjaman'}
                  </h2>
                  <button onClick={handleCloseModal} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#64748b', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>

                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>Alat yang Dipinjam</label>
                
                {isPerpanjang ? (
                  <div style={{ padding: '12px 14px', borderRadius: 12, marginTop: 6, marginBottom: 16, border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', fontWeight: 600, fontSize: 15 }}>
                    📦 {selectedAlatNama}
                  </div>
                ) : (
                  <select className="input-field" style={{ marginTop: 6 }} value={form.alatId} onChange={(e) => setForm({ ...form, alatId: e.target.value })}>
                    <option value="" style={{ background: '#0f172a' }}>-- Pilih Alat --</option>
                    {safeAlats.map(a => (
                      <option 
                        key={a._id} 
                        value={a._id} 
                        style={{ background: '#0f172a' }}
                        disabled={a.stok <= 0 && a._id !== form.alatId}
                      >
                        {a.nama} ({a.stok > 0 ? `${a.stok} tersedia` : 'Stok Habis'})
                      </option>
                    ))}
                  </select>
                )}

                {!isPerpanjang && !isPinjamUlang && (
                  <>
                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>Jumlah</label>
                    <input type="number" min={1} className="input-field" style={{ marginTop: 6 }} value={form.jumlah} onChange={e => setForm({ ...form, jumlah: parseInt(e.target.value) || 1 })} placeholder="Jumlah alat" />
                  </>
                )}

                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {isPerpanjang ? 'Alasan Perpanjangan' : isPinjamUlang ? 'Keperluan (Bisa Diubah)' : 'Keperluan'}
                </label>
                <input className="input-field" style={{ marginTop: 6 }} placeholder="Contoh: Praktikum jaringan..." value={form.keperluan} onChange={e => setForm({ ...form, keperluan: e.target.value })} />

                <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {isPerpanjang || isPinjamUlang ? 'Tanggal Kembali Baru' : 'Tanggal Kembali'}
                </label>
                <input type="date" className="input-field" style={{ marginTop: 6 }} value={form.tanggalKembali} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, tanggalKembali: e.target.value })} />

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={handleCloseModal} style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1px solid rgba(100,116,139,0.4)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 }}>Batal</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 2, padding: '12px', borderRadius: 14, fontSize: 14 }}>
                    {loading ? '⏳ Memproses...' : (isPerpanjang ? '✓ Perpanjang' : isPinjamUlang ? '✓ Pinjam Kembali' : '✓ Ajukan')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}