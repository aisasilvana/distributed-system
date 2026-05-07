import { useState, useEffect } from 'react';
import Inventaris from './inventaris';
import Peminjaman from './peminjaman';
import Pengembalian from './pengembalian';
import Notifikasi from './notifikasi';
import DashboardHome from './dashboardhome';

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');

  // 🔥 Inject font biar langsung kepake
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⬢' },
    { id: 'inventaris', label: 'Inventaris', icon: '🖧' },
    { id: 'peminjaman', label: 'Peminjaman', icon: '📡' },
    { id: 'pengembalian', label: 'Pengembalian', icon: '↺' },
    { id: 'notifikasi', label: 'Notifikasi', icon: '🔔' },
  ];

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardHome user={user} onNavigate={setPage} />;
      case 'inventaris': return <Inventaris user={user} />;
      case 'peminjaman': return <Peminjaman user={user} />;
      case 'pengembalian': return <Pengembalian user={user} />;
      case 'notifikasi': return <Notifikasi user={user} />;
      default: return <DashboardHome user={user} onNavigate={setPage} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, #0f172a, #020617)',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    }}>

      {/* 🔥 Background Glow */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.15), transparent)',
        filter: 'blur(80px)',
        animation: 'float 15s infinite alternate',
      }} />

      <div style={{
        position: 'fixed',
        bottom: '-20%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)',
        filter: 'blur(100px)',
        animation: 'float 20s infinite alternate-reverse',
      }} />

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(40px); }
        }

        .menu {
          transition: all 0.2s ease;
        }

        .menu:hover {
          background: rgba(56,189,248,0.15);
          transform: translateX(6px);
          color: #38bdf8;
        }

        .active {
          background: rgba(56,189,248,0.2);
          color: #38bdf8;
          border-left: 3px solid #38bdf8;
        }
      `}</style>

      {/* 🔥 SIDEBAR */}
      <div style={{
        width: '260px',
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(56,189,248,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Logo */}
        <div style={{ padding: '30px 20px' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            color: '#f1f5f9',
            margin: 0
          }}>
            Lab<span style={{ color: '#38bdf8' }}>Net</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Sistem Jaringan Lab
          </p>
        </div>

        {/* Menu */}
        <div style={{ padding: '10px' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`menu ${page === item.id ? 'active' : ''}`}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '6px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        {/* User */}
        <div style={{
          marginTop: 'auto',
          padding: '20px',
          borderTop: '1px solid rgba(56,189,248,0.1)'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <b style={{ color: '#e2e8f0' }}>{user?.nama}</b>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {user?.role}
            </div>
          </div>

          <button onClick={onLogout} style={{
            background: 'transparent',
            border: 'none',
            color: '#f87171',
            cursor: 'pointer'
          }}>
            ← Logout
          </button>
        </div>
      </div>

      {/* 🔥 MAIN */}
      <div style={{ flex: 1, padding: '30px' }}>

        {/* Header */}
        <div style={{
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk'",
            fontSize: '24px',
            color: '#f1f5f9',
            marginBottom: '5px'
          }}>
            {page === 'dashboard' ? 'Dashboard Overview' : page}
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Sistem manajemen laboratorium jaringan
          </p>
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(15,23,42,0.6)',
          padding: '20px',
          borderRadius: '20px',
          border: '1px solid rgba(56,189,248,0.1)'
        }}>
          {renderPage()}
        </div>

      </div>
    </div>
  );
}