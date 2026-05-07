import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';

// 🔥 MAPPING GAMBAR LOCAL (INI YANG PENTING)
const getLocalImage = (nama) => {
  const map = {
    'Access Point': '/images/alat/access_point.webp',
    'Crimping Tool': '/images/alat/crimping.jpg',
    'Kabel UTP': '/images/alat/kabel_utp.jpg',
    'NIC': '/images/alat/nic.jpg',
    'Router': '/images/alat/router.avif',
    'Switch': '/images/alat/switch.webp',
    'Cable Stripper': '/images/alat/cablestripper.jpeg',
    'Obeng': '/images/alat/obeng.jpeg',
    'Power': '/images/alat/power.jpeg',
    'Lan Tester': '/images/alat/lantester.jpeg',
    'Tone Generator dan Probe': '/images/alat/tonegenerator.jpeg',
    'Ups Cadangan Listrik': '/images/alat/ups.jpeg',

  };

  return map[nama] || '/images/alat/router.avif';
};

export default function DashboardHome({ user, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  // 🔥 LOAD FONT BAGUS
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // 🔥 ANIMASI BACKGROUND JARINGAN 
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      particles = Array.from({ length: 80 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      });

      // garis koneksi
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.strokeStyle = 'rgba(56,189,248,0.08)';
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get('/inventaris');
      setItems(res.data);
    } catch {
      // fallback data
      setItems([
        { id: 1, nama: 'Access Point', stok: 5 },
        { id: 2, nama: 'Kabel UTP', stok: 10 },
        { id: 3, nama: 'Router', stok: 3 },
        { id: 4, nama: 'Switch', stok: 4 },
        { id: 5, nama: 'NIC', stok: 7 },
        { id: 6, nama: 'Crimping Tool', stok: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePinjam = (alat) => {
    sessionStorage.setItem('selectedAlat', JSON.stringify(alat));
    onNavigate('peminjaman');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      padding: '40px',
      background: '#020617',
      overflow: 'hidden',
      fontFamily: 'Inter'
    }}>

      {/* 🔥 CANVAS BG */}
      <canvas ref={canvasRef} style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0
      }} />

      {/* 🔥 CONTENT */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* 🔥 JUDUL TENGAH */}
        <h1 style={{
          textAlign: 'center',
          fontSize: 42,
          fontFamily: 'Orbitron',
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 50
        }}>
          Lab Network Dashboard
        </h1>

        {/* 🔥 GRID 3 KOLOM */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            Loading...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 30
          }}>
            {items.map(item => (
              <div key={item.id}
                onClick={() => handlePinjam(item)}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'rgba(15,23,42,0.7)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  transition: '0.3s',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(56,189,248,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                }}
              >

                {/* 🔥 GAMBAR FIX */}
                <img
                  src={getLocalImage(item.nama)}
                  alt={item.nama}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover'
                  }}
                />

                {/* 🔥 ISI */}
                <div style={{ padding: 16 }}>
                  <h3 style={{ color: '#fff', marginBottom: 8 }}>
                    {item.nama}
                  </h3>

                  {/* 🔥 WARNA BARU (BIRU, BUKAN HIJAU) */}
                  <p style={{
                    color: '#38bdf8',
                    fontWeight: 500
                  }}>
                    {item.stok} tersedia
                  </p>

                  {/* 🔥 BUTTON PINJAM */}
                  <button style={{
                    marginTop: 10,
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}>
                    Pinjam →
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}