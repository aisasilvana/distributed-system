import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaTachometerAlt, 
  FaClipboardList, 
  FaBell, 
  FaUserCircle,
  FaSignOutAlt // Import icon logout dari react-icons/fa
} from 'react-icons/fa';
import DashboardHome from './dashboardhome';
import Inventaris from './inventaris'; 
import Peminjaman from './peminjaman'; 
import Notifikasi from './notifikasi'; 

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const canvasRef = useRef(null);

  // --- Animasi Background Global ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Inisialisasi ulang partikel setiap kali ukuran layar berubah
      particles = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width, 
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, 
        vy: (Math.random() - 0.5) * 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        
        // Memantul jika kena ujung layar
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56,189,248,0.5)'; // Warna partikel biru terang
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    resize(); 
    draw();
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardHome onNavigate={setPage} />;
      case 'inventaris': return <Inventaris />;
      case 'peminjaman': return <Peminjaman user={user} />;
      case 'notifikasi': return <Notifikasi />;
      default: return <DashboardHome onNavigate={setPage} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* CANVAS BACKGROUND */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: -1, 
          pointerEvents: 'none',
          background: '#020617' 
        }} 
      />
      
      {/* Sidebar */}
      <motion.div 
        animate={{ width: sidebarOpen ? '220px' : '60px' }}
        style={{ 
          zIndex: 10, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(15px)', 
          borderRight: '1px solid rgba(56,189,248,0.1)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', padding: '20px 0'
        }}
      >
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ 
            background: 'transparent', border: 'none', color: '#38bdf8', 
            cursor: 'pointer', marginBottom: '20px', paddingLeft: '20px', fontSize: '18px',
            textAlign: 'left'
          }}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            {id: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard'}, 
            {id: 'peminjaman', icon: <FaClipboardList />, label: 'Peminjaman'}, 
            {id: 'notifikasi', icon: <FaBell />, label: 'Notifikasi'}
          ].map(item => (
            <div 
              key={item.id} 
              onClick={() => setPage(item.id)} 
              style={{ 
                padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                color: page === item.id ? '#38bdf8' : '#94a3b8',
                background: page === item.id ? 'rgba(56,189,248,0.1)' : 'transparent',
                transition: '0.3s'
              }}
            >
              <div style={{ fontSize: '20px', minWidth: '20px' }}>{item.icon}</div>
              {sidebarOpen && <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* --- BAGIAN AKUN USER DAN TOMBOL LOGOUT --- */}
        <div 
          style={{ 
            marginTop: 'auto', 
            padding: sidebarOpen ? '15px 20px' : '15px 0', 
            borderTop: '1px solid rgba(56,189,248,0.1)',
            display: 'flex', 
            flexDirection: sidebarOpen ? 'row' : 'column',
            alignItems: 'center', 
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            gap: sidebarOpen ? '12px' : '15px',
            overflow: 'hidden',
            transition: 'padding 0.3s ease, gap 0.3s ease'
          }}
        >
          {/* Sisi Kiri: Avatar & Informasi Nama (Hanya jika Sidebar Terbuka) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Logo / Avatar Akun */}
            <div style={{ fontSize: '26px', color: '#38bdf8', minWidth: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUserCircle />
            </div>

            {sidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ 
                  color: '#f8fafc', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {user?.nama || user?.name || 'nisa'}
                </span>
                <span style={{ 
                  color: '#64748b', 
                  fontSize: '10px', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  textTransform: 'lowercase'
                }}>
                  {user?.role || 'mahasiswa'}
                </span>
              </div>
            )}
          </div>

          {/* Sisi Kanan / Bawah: Tombol Logout */}
          <button 
            onClick={() => onLogout && onLogout()}
            title="Keluar"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#ef4444', 
              cursor: 'pointer', 
              padding: '6px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '6px', 
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FaSignOutAlt style={{ fontSize: '18px' }} />
          </button>
        </div>
        {/* ------------------------------------------- */}

      </motion.div>

      {/* Main Content Area */}
      <main style={{ flex: 1, zIndex: 5, padding: '30px', overflowY: 'auto', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}