import { useState, useEffect } from 'react';
import Inventaris from './inventaris';
import Peminjaman from './peminjaman';
import Pengembalian from './pengembalian';
import Notifikasi from './notifikasi';
import DashboardHome from './dashboardhome';

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // 🔥 MENU BERDASARKAN ROLE
  const role = user?.role?.toLowerCase();
  const getMenuItems = () => {
    const base = [
      { id: 'dashboard', label: 'Dashboard', icon: '⬢' },
    ];

    if (role === 'mahasiswa') {
      return [
        ...base,
        { id: 'peminjaman',   label: 'Peminjaman',   icon: '📡' },
        { id: 'pengembalian', label: 'Pengembalian', icon: '↺' },
        { id: 'notifikasi',   label: 'Notifikasi',   icon: '🔔' },
      ];
    }

    if (role === 'laboran') {
      return [
        ...base,
        { id: 'inventaris',   label: 'Inventaris',   icon: '🖧' },
        { id: 'peminjaman',   label: 'Peminjaman',   icon: '📡' },
        { id: 'pengembalian', label: 'Pengembalian', icon: '↺' },
        { id: 'notifikasi',   label: 'Notifikasi',   icon: '🔔' },
      ];
    }

    if (role === 'admin') {
      return [
        ...base,
        { id: 'inventaris',   label: 'Inventaris',   icon: '🖧' },
        { id: 'peminjaman',   label: 'Peminjaman',   icon: '📡' },
        { id: 'pengembalian', label: 'Pengembalian', icon: '↺' },
        { id: 'notifikasi',   label: 'Notifikasi',   icon: '🔔' },
      ];
    }

    return base;
  };

  // 🔥 BADGE ROLE
  const getRoleBadge = () => {
    if (role === 'admin')    return { label: 'Admin',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    if (role === 'laboran')  return { label: 'Laboran',  color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' };
    if (role === 'mahasiswa') return { label: 'Mahasiswa', color: '#818cf8', bg: 'rgba(129,140,248,0.15)' };
    return { label: user?.role, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
  };

  const menuItems = getMenuItems();
  const roleBadge = getRoleBadge();

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <DashboardHome user={user} onNavigate={setPage} />;
      case 'inventaris':   return <Inventaris user={user} />;
      case 'peminjaman':   return <Peminjaman user={user} />;
      case 'pengembalian': return <Pengembalian user={user} />;
      case 'notifikasi':   return <Notifikasi user={user} />;
      default:             return <DashboardHome user={user} onNavigate={setPage} />;
    }
  };

  const pageTitle = () => {
    if (page === 'dashboard')    return 'Dashboard Overview';
    if (page === 'inventaris')   return 'Inventaris Lab';
    if (page === 'peminjaman')   return 'Peminjaman Alat';
    if (page === 'pengembalian') return 'Pengembalian Alat';
    if (page === 'notifikasi')   return 'Notifikasi Sistem';
    return page;
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, #0f172a, #020617)',
      fontFamily: "'Inter', sans-serif",
    }}>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(40px); }
        }
        .menu-item {
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 6px;
          color: #94a3b8;
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 14px;
          user-select: none;
        }
        .menu-item:hover {
          background: rgba(56,189,248,0.15);
          transform: translateX(6px);
          color: #38bdf8;
        }
        .menu-item.active {
          background: rgba(56,189,248,0.2);
          color: #38bdf8;
          border-left: 3px solid #38bdf8;
        }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: '50%', height: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.15), transparent)',
        filter: 'blur(80px)',
        animation: 'float 15s infinite alternate',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%',
        width: '50%', height: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)',
        filter: 'blur(100px)',
        animation: 'float 20s infinite alternate-reverse',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* SIDEBAR */}
      <div style={{
        width: '220px', minHeight: '100vh',
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(56,189,248,0.2)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 100, flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{ padding: '30px 20px 20px' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px', color: '#f1f5f9', margin: 0,
          }}>
            Lab<span style={{ color: '#38bdf8' }}>Net</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
            Sistem Jaringan Lab
          </p>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: '0 10px', flex: 1 }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`menu-item ${page === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(56,189,248,0.1)',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
              {user?.nama}
            </div>
            {/* 🔥 ROLE BADGE */}
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
              background: roleBadge.bg,
              color: roleBadge.color,
              border: `1px solid ${roleBadge.color}44`,
              textTransform: 'capitalize'
            }}>
              {roleBadge.label}
            </span>
          </div>
          <button onClick={onLogout} style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171', cursor: 'pointer',
            padding: '7px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 500, width: '100%'
          }}>
            ← Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1, padding: '30px',
        position: 'relative', zIndex: 1,
        overflowY: 'auto', minWidth: 0,
      }}>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: "'Space Grotesk'",
            fontSize: '24px', color: '#f1f5f9', marginBottom: '5px',
          }}>
            {pageTitle()}
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Sistem manajemen laboratorium jaringan
          </p>
        </div>

        {/* Page Content */}
        <div style={{
          background: 'rgba(15,23,42,0.6)',
          padding: '20px', borderRadius: '20px',
          border: '1px solid rgba(56,189,248,0.1)',
        }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
