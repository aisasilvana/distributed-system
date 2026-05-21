import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Notifikasi({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');

  useEffect(() => {
    fetchData();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get('/peminjaman');
      setPeminjaman(res.data);
    } catch {
      setPeminjaman([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotif = () => {
    const notifs = [];
    peminjaman.forEach(p => {
      if (p.status === 'Menunggu') {
        notifs.push({
          type: 'info',
          kategori: 'menunggu',
          msg: `Pengajuan peminjaman alat`,
          highlight: p.alat?.nama,
          user: p.user?.nama,
          detail: `Keperluan: ${p.keperluan || '-'}`,
          tgl: p.tanggalPinjam
        });
      }
      if (p.status === 'Dipinjam') {
        const terlambat = p.tanggalKembali && new Date(p.tanggalKembali) < new Date();
        notifs.push({
          type: terlambat ? 'danger' : 'warning',
          kategori: 'dipinjam',
          msg: terlambat ? `Waktu pengembalian telah MELEWATI batas` : `Sedang dipinjam oleh`,
          highlight: p.alat?.nama,
          user: p.user?.nama,
          detail: `Batas Kembali: ${p.tanggalKembali ? formatDateTime(p.tanggalKembali) : '-'}`,
          tgl: p.tanggalPinjam
        });
      }
      if (p.status === 'Dikembalikan') {
        notifs.push({
          type: 'success',
          kategori: 'dikembalikan',
          msg: `Telah dikembalikan oleh`,
          highlight: p.alat?.nama,
          user: p.user?.nama,
          detail: `Keperluan awal: ${p.keperluan || '-'}`,
          tgl: p.tanggalKembali || p.tanggalPinjam
        });
      }
    });

    // Sort terbaru dulu berdasarkan tanggal
    return notifs.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
  };

  const getStyle = (type) => {
    if (type === 'info')    return { bg: 'rgba(56,189,248,0.05)', border: '#38bdf8', glow: 'rgba(56,189,248,0.3)', icon: '📡', label: 'Menunggu' };
    if (type === 'warning') return { bg: 'rgba(251,191,36,0.05)', border: '#f59e0b', glow: 'rgba(251,191,36,0.3)', icon: '📤', label: 'Dipinjam' };
    if (type === 'danger')  return { bg: 'rgba(239,68,68,0.08)',  border: '#ef4444', glow: 'rgba(239,68,68,0.4)', icon: '🚨', label: 'Terlambat' };
    if (type === 'success') return { bg: 'rgba(34,197,94,0.05)',  border: '#22c55e', glow: 'rgba(34,197,94,0.3)', icon: '✅', label: 'Dikembalikan' };
    return { bg: 'rgba(148,163,184,0.05)', border: '#64748b', glow: 'rgba(148,163,184,0.3)', icon: '🔔', label: 'Info' };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', ' •');
  };

  const allNotifs = getNotif();
  const filtered = filter === 'semua' ? allNotifs : allNotifs.filter(n => n.kategori === filter);

  const counts = {
    semua: allNotifs.length,
    menunggu: allNotifs.filter(n => n.kategori === 'menunggu').length,
    dipinjam: allNotifs.filter(n => n.kategori === 'dipinjam').length,
    dikembalikan: allNotifs.filter(n => n.kategori === 'dikembalikan').length,
  };

  return (
    <div style={{ fontFamily: "'Sora', 'Inter', sans-serif", color: '#e2e8f0', minHeight: '100vh', paddingBottom: '40px' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSkeleton {
          0% { background-color: rgba(56,189,248,0.05); }
          50% { background-color: rgba(56,189,248,0.15); }
          100% { background-color: rgba(56,189,248,0.05); }
        }
        @keyframes pulseDanger {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        
        .stat-card {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .filter-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .filter-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .filter-btn:active {
          transform: translateY(1px);
        }

        .notif-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .notif-item:hover {
          transform: translateX(6px) scale(1.01);
          background: rgba(30, 41, 59, 0.8) !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .notif-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--accent-color);
          border-radius: 4px 0 0 4px;
          transition: width 0.2s;
        }
        .notif-item:hover::before {
          width: 6px;
        }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{
          fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6
        }}>
          Pusat Notifikasi
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          Pantau semua pembaruan dan aktivitas laboratorium secara real-time.
        </p>
      </div>

      {/* STATS KOTAK */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 32, animation: 'fadeUp 0.5s ease'
      }}>
        {[
          { label: 'Semua Aktivitas', value: counts.semua, color: '#38bdf8', icon: '🔔' },
          { label: 'Menunggu Persetujuan', value: counts.menunggu, color: '#818cf8', icon: '📡' },
          { label: 'Sedang Dipinjam', value: counts.dipinjam, color: '#f59e0b', icon: '📤' },
          { label: 'Telah Kembali', value: counts.dikembalikan, color: '#22c55e', icon: '✅' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))', 
            border: `1px solid ${s.color}22`,
            borderRadius: 20, padding: '20px',
            display: 'flex', alignItems: 'center', gap: 16,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: 24, width: 50, height: 50, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 14, background: `linear-gradient(135deg, ${s.color}22, transparent)`,
              boxShadow: `inset 0 0 0 1px ${s.color}44`,
              color: s.color
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER TABS */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap',
        animation: 'fadeUp 0.55s ease'
      }}>
        {[
          { key: 'semua', label: 'Semua' },
          { key: 'menunggu', label: 'Menunggu' },
          { key: 'dipinjam', label: 'Dipinjam' },
          { key: 'dikembalikan', label: 'Dikembalikan' },
        ].map(f => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              className="filter-btn"
              onClick={() => setFilter(f.key)}
              style={{
                padding: '10px 20px', borderRadius: 14, border: 'none', fontSize: 14, fontWeight: 600,
                background: isActive ? 'linear-gradient(135deg, #38bdf8, #6366f1)' : 'rgba(30,41,59,0.6)',
                color: isActive ? '#fff' : '#94a3b8',
                border: isActive ? '1px solid transparent' : '1px solid rgba(148,163,184,0.1)',
                boxShadow: isActive ? '0 8px 20px rgba(56,189,248,0.25)' : 'none',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {f.label}
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.5)',
                color: isActive ? '#fff' : '#64748b',
                padding: '2px 8px', borderRadius: 12
              }}>
                {counts[f.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* LIST NOTIFIKASI CONTAINER */}
      <div style={{ animation: 'fadeUp 0.6s ease' }}>
        {loading ? (
          /* SKELETON LOADER */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{
                background: 'rgba(30,41,59,0.4)', borderRadius: 16, padding: '20px',
                display: 'flex', gap: 16, border: '1px solid rgba(255,255,255,0.02)',
                animation: 'pulseSkeleton 1.5s infinite ease-in-out'
              }}>
                <div style={{ width: 45, height: 45, borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                  <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}></div>
                  <div style={{ width: '40%', height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* EMPTY STATE */
          <div style={{ 
            textAlign: 'center', padding: '80px 20px', 
            background: 'linear-gradient(180deg, rgba(30,41,59,0.3) 0%, transparent 100%)',
            borderRadius: 24, border: '1px dashed rgba(148,163,184,0.2)'
          }}>
            <div style={{ fontSize: 50, marginBottom: 16, filter: 'grayscale(0.8) opacity(0.5)' }}>📭</div>
            <h3 style={{ fontSize: 18, color: '#e2e8f0', margin: '0 0 8px 0' }}>Belum Ada Notifikasi</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Aktivitas peminjaman akan muncul di sini.</p>
          </div>
        ) : (
          /* ACTUAL LIST */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((n, i) => {
              const s = getStyle(n.type);
              return (
                <div
                  key={i}
                  className="notif-item"
                  style={{
                    '--accent-color': s.border, // CSS Variable untuk pseudo-element
                    display: 'flex', gap: 18, padding: '20px',
                    borderRadius: 16,
                    background: 'linear-gradient(90deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.4) 100%)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    animation: `fadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05}s backwards`,
                  }}
                >
                  {/* ICON W/ GLOW */}
                  <div style={{
                    fontSize: 22, width: 48, height: 48, minWidth: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 14, background: s.bg, border: `1px solid ${s.border}44`,
                    boxShadow: `0 0 20px ${s.glow}`,
                    animation: n.type === 'danger' ? 'pulseDanger 2s infinite' : 'none'
                  }}>
                    {s.icon}
                  </div>

                  {/* KONTEN */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ fontSize: 15, margin: 0, color: '#cbd5e1', lineHeight: 1.5 }}>
                      {n.msg}{' '}
                      <span style={{ color: '#fff', fontWeight: 600, borderBottom: `1px dashed ${s.border}` }}>
                        {n.highlight}
                      </span>{' '}
                      {n.type === 'danger' ? 'dari' : (n.user ? 'oleh' : '')}{' '}
                      <span style={{ color: '#fff', fontWeight: 500 }}>{n.user}</span>
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ opacity: 0.7 }}>{n.type === 'danger' ? '⚠️' : 'ℹ️'}</span> {n.detail}
                      </p>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#475569' }}></span>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>
                        {formatDateTime(n.tgl)}
                      </p>
                    </div>
                  </div>

                  {/* BADGE KANAN */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '6px 14px',
                      borderRadius: 20, background: s.bg, color: s.border,
                      border: `1px solid ${s.border}33`, whiteSpace: 'nowrap',
                      boxShadow: `inset 0 0 10px ${s.glow}`
                    }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}