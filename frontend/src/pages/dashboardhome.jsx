import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

const FALLBACK =[
  { _id: '1', nama: 'Access Point', stok: 5 },
  { _id: '2', nama: 'Kabel UTP', stok: 10 },
  { _id: '3', nama: 'Router', stok: 3 },
  { _id: '4', nama: 'Switch', stok: 4 },
  { _id: '5', nama: 'NIC', stok: 7 },
];

export default function DashboardHome({ user, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  // --- LOGIKA PARTIKEL BACKGROUND (LANGSUNG MUNCUL) ---
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
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = Math.random() > 0.5 ? '#38bdf8' : '#6366f1';
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
      initParticles(); // Reset partikel saat pertama load/resize agar akurat
    };

    window.addEventListener('resize', resize);
    resize(); // Eksekusi render canvas saat komponen dipasang

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

  // --- FUNGSI ASLI ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get('/alat');
      setItems(res.data?.length > 0 ? res.data : FALLBACK);
    } catch {
      setItems(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const handlePinjam = (alat) => {
    sessionStorage.setItem('selectedAlat', JSON.stringify({ _id: alat._id, nama: alat.nama, stok: alat.stok }));
    onNavigate('peminjaman');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '20px' }}>
      
      {/* CANVAS BACKGROUND */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          width: '100vw',
          height: '100vh',
          zIndex: 0, // PERBAIKAN: Diubah dari -1 menjadi 0 agar tidak tenggelam
          pointerEvents: 'none', // PERBAIKAN: Agar canvas tidak bisa diklik dan menghalangi tombol
          background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' 
        }} 
      />

      {/* KONTEN UTAMA (Dibungkus dengan zIndex: 1 agar di atas kanvas) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* JUDUL */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            textAlign: 'center', fontSize: 36, fontFamily: "'Orbitron', sans-serif", 
            background: 'linear-gradient(135deg,#38bdf8,#818cf8)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
            marginBottom: 40, letterSpacing: '1px' 
          }}
        >
          Lab Network Dashboard
        </motion.h1>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>Memuat data alat...</div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 28,
              maxWidth: '1200px',
              margin: '0 auto'
            }}
          >
            {items.map((item) => {
              const habis = item.stok <= 0;
              return (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -14, 
                    boxShadow: '0 25px 50px rgba(0,0,0,0.7), 0 0 30px rgba(56,189,248,0.2)',
                    borderColor: 'rgba(56,189,248,0.6)'
                  }}
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(10px)', 
                    border: '1px solid rgba(56,189,248,0.2)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    opacity: habis ? 0.7 : 1
                  }}
                >
                  <div style={{ background: '#fff', padding: '15px 10px', overflow: 'hidden' }}>
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      src={getLocalImage(item.nama)}
                      style={{ width: '100%', height: 160, objectFit: 'contain' }}
                      onError={e => { e.target.src = '/images/alat/router.avif'; }}
                    />
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 8, fontWeight: 600 }}>{item.nama}</h3>
                    <p style={{ color: habis ? '#ef4444' : '#4ade80', fontSize: 13, marginBottom: 20 }}>
                      {habis ? '❌ Stok habis' : `✅ ${item.stok} unit tersedia`}
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: habis ? 1 : 1.02 }}
                      whileTap={{ scale: habis ? 1 : 0.95 }}
                      onClick={() => handlePinjam(item)}
                      disabled={habis}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                        background: habis ? '#334155' : 'linear-gradient(135deg, #38bdf8, #6366f1)',
                        color: '#fff', fontWeight: 600, cursor: habis ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {habis ? 'Tidak Tersedia' : 'Pinjam Alat →'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}