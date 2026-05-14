import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';

const getLocalImage = (nama) => {
  const map = {
    'Access Point':           '/images/alat/access_point.webp',
    'Crimping Tool':          '/images/alat/crimping.jpg',
    'Kabel UTP':              '/images/alat/kabel_utp.jpg',
    'NIC':                    '/images/alat/nic.jpg',
    'Router':                 '/images/alat/router.avif',
    'Switch':                 '/images/alat/switch.webp',
    'Cable Stripper':         '/images/alat/cablestripper.jpeg',
    'Obeng':                  '/images/alat/obeng.jpeg',
    'Power':                  '/images/alat/power.jpeg',
    'Lan Tester':             '/images/alat/lantester.jpeg',
    'Tone Generator dan Probe': '/images/alat/tonegenerator.jpeg',
    'Ups Cadangan Listrik':   '/images/alat/ups.jpeg',
  };
  return map[nama] || '/images/alat/router.avif';
};

const FALLBACK = [
  { _id: null, nama: 'Access Point',           stok: 5  },
  { _id: null, nama: 'Kabel UTP',              stok: 10 },
  { _id: null, nama: 'Router',                 stok: 3  },
  { _id: null, nama: 'Switch',                 stok: 4  },
  { _id: null, nama: 'NIC',                    stok: 7  },
  { _id: null, nama: 'Crimping Tool',          stok: 2  },
  { _id: null, nama: 'Cable Stripper',         stok: 3  },
  { _id: null, nama: 'Lan Tester',             stok: 4  },
  { _id: null, nama: 'Tone Generator dan Probe', stok: 2 },
  { _id: null, nama: 'Ups Cadangan Listrik',   stok: 1  },
];

export default function DashboardHome({ user, onNavigate }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  // Google Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@300;400;500&display=swap';
    link.rel  = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(56,189,248,${0.06 * (1 - dist / 100)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  // Fetch alat
  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get('/alat');
      if (res.data && res.data.length > 0) {
        setItems(res.data);
      } else {
        setItems(FALLBACK);
      }
    } catch (err) {
      console.error('Gagal fetch alat:', err);
      setItems(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const handlePinjam = (alat) => {
    if (!alat._id) {
      alert('Backend tidak terhubung. Pastikan server berjalan!');
      return;
    }
    if (alat.stok <= 0) {
      alert('Stok alat ini habis!');
      return;
    }
    sessionStorage.setItem('selectedAlat', JSON.stringify({
      _id: alat._id, nama: alat.nama, stok: alat.stok,
    }));
    onNavigate('peminjaman');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '70vh',
      padding: '30px',
      fontFamily: 'Inter',
      overflow: 'hidden',
    }}>

      {/* ✅ Canvas TIDAK fixed, pakai absolute + pointerEvents none */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none', // ← kunci: tidak block klik
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* JUDUL */}
        <h1 style={{
          textAlign: 'center',
          fontSize: 36,
          fontFamily: 'Orbitron',
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 28,
        }}>
          Lab Network Dashboard
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 18, padding: '60px 0' }}>
            ⏳ Memuat data alat...
          </div>
        ) : (
          <>
            {/* SUMMARY STATS */}
            <div style={{
              display: 'flex', gap: 12, marginBottom: 32,
              justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {[
                { label: `Total Alat: ${items.length} jenis`,                          color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  icon: '📦' },
                { label: `Tersedia: ${items.filter(i => i.stok > 0).length} jenis`,    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   icon: '✅' },
                { label: `Habis: ${items.filter(i => i.stok <= 0).length} jenis`,      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: '❌' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 12, padding: '10px 20px',
                  color: s.color, fontWeight: 600, fontSize: 13,
                }}>
                  {s.icon} {s.label}
                </div>
              ))}
            </div>

            {/* GRID ALAT */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20,
            }}>
              {items.map((item, idx) => {
                const habis    = item.stok <= 0;
                const terbatas = !habis && item.stok <= 2;

                return (
                  <div
                    key={item._id || idx}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      background: 'rgba(15,23,42,0.85)',
                      border: habis
                        ? '1px solid rgba(239,68,68,0.3)'
                        : '1px solid rgba(56,189,248,0.2)',
                      transition: 'transform 0.25s, box-shadow 0.25s',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      opacity: habis ? 0.65 : 1,
                    }}
                    onMouseEnter={e => {
                      if (habis) return;
                      e.currentTarget.style.transform  = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow  = '0 16px 40px rgba(56,189,248,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
                    }}
                  >
                    {/* Gambar + Badge */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={getLocalImage(item.nama)}
                        alt={item.nama}
                        style={{ width: '100%', height: 160, objectFit: 'cover' }}
                        onError={e => { e.target.src = '/images/alat/router.avif'; }}
                      />
                      {habis && (
                        <span style={{
                          position: 'absolute', top: 8, right: 8,
                          background: '#ef4444', color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          padding: '3px 8px', borderRadius: 20,
                        }}>HABIS</span>
                      )}
                      {terbatas && (
                        <span style={{
                          position: 'absolute', top: 8, right: 8,
                          background: '#f59e0b', color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          padding: '3px 8px', borderRadius: 20,
                        }}>TERBATAS</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px 16px' }}>
                      <h3 style={{
                        color: '#f1f5f9', marginBottom: 6,
                        fontSize: 14, fontWeight: 600,
                      }}>
                        {item.nama}
                      </h3>

                      <p style={{
                        fontWeight: 600, fontSize: 13, marginBottom: 12,
                        color: habis ? '#ef4444' : terbatas ? '#f59e0b' : '#22c55e',
                      }}>
                        {habis
                          ? '❌ Stok habis'
                          : terbatas
                            ? `⚠️ ${item.stok} tersedia (terbatas)`
                            : `✅ ${item.stok} tersedia`}
                      </p>

                      <button
                        onClick={() => handlePinjam(item)}
                        disabled={habis}
                        style={{
                          width: '100%', padding: '9px',
                          borderRadius: 10, border: 'none',
                          background: habis
                            ? '#1e293b'
                            : !item._id
                              ? '#334155'
                              : 'linear-gradient(135deg,#38bdf8,#6366f1)',
                          color: habis ? '#475569' : '#fff',
                          cursor: habis ? 'not-allowed' : 'pointer',
                          fontWeight: 600, fontSize: 13,
                        }}
                      >
                        {habis
                          ? 'Tidak Tersedia'
                          : !item._id
                            ? 'Server Offline'
                            : 'Pinjam →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}