import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Notifikasi({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);

  useEffect(() => {
    API.get('/peminjaman')
      .then(res => setPeminjaman(res.data))
      .catch(() => {});

    // 🔥 Font premium
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const getNotif = () => {
    const notifs = [];
    peminjaman.forEach(p => {
      if (p.status === 'Menunggu') {
        notifs.push({
          type: 'info',
          msg: `Peminjaman ${p.alat?.nama} oleh ${p.user?.nama} menunggu persetujuan.`,
          tgl: p.tanggalPinjam
        });
      }
      if (p.status === 'Dipinjam') {
        notifs.push({
          type: 'warning',
          msg: `${p.alat?.nama} sedang dipinjam oleh ${p.user?.nama}.`,
          tgl: p.tanggalPinjam
        });
      }
      if (p.status === 'Dikembalikan') {
        notifs.push({
          type: 'success',
          msg: `${p.alat?.nama} telah dikembalikan oleh ${p.user?.nama}.`,
          tgl: p.tanggalPinjam
        });
      }
    });
    return notifs;
  };

  const getStyle = (type) => {
    if (type === 'info') return {
      bg: 'rgba(56,189,248,0.12)',
      border: '#38bdf8',
      icon: '📡'
    };
    if (type === 'warning') return {
      bg: 'rgba(251,191,36,0.12)',
      border: '#f59e0b',
      icon: '⚠️'
    };
    if (type === 'success') return {
      bg: 'rgba(34,197,94,0.12)',
      border: '#22c55e',
      icon: '✅'
    };
    return {
      bg: 'rgba(148,163,184,0.12)',
      border: '#64748b',
      icon: '🔔'
    };
  };

  const notifs = getNotif();

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      color: '#e2e8f0'
    }}>

      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontFamily: "'Sora'",
          fontSize: 30,
          fontWeight: 700,
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Notifikasi Sistem
        </h1>

        <p style={{ color: '#94a3b8' }}>
          Update aktivitas peminjaman alat laboratorium
        </p>
      </div>

      {/* CONTAINER */}
      <div style={{
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(18px)',
        borderRadius: 24,
        border: '1px solid rgba(56,189,248,0.15)',
        padding: 20
      }}>

        {notifs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            🔕 Tidak ada notifikasi
          </div>
        ) : notifs.map((n, i) => {
          const style = getStyle(n.type);

          return (
            <div key={i}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 16px',
                marginBottom: 10,
                borderRadius: 16,
                background: style.bg,
                border: `1px solid ${style.border}33`,
                transition: '0.25s',
                cursor: 'pointer',
                animation: `fadeUp 0.4s ease ${i * 0.05}s backwards`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 10px 25px -8px ${style.border}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >

              {/* ICON */}
              <div style={{
                fontSize: 20,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {style.icon}
              </div>

              {/* TEXT */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {n.msg}
                </p>

                <p style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  marginTop: 6
                }}>
                  {new Date(n.tgl).toLocaleDateString('id-ID')}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

    </div>
  );
}