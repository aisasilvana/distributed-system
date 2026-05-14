import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Notifikasi({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');

  useEffect(() => {
    fetchData();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap';
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
          msg: `Peminjaman ${p.alat?.nama} oleh ${p.user?.nama} menunggu persetujuan.`,
          detail: `Keperluan: ${p.keperluan || '-'}`,
          tgl: p.tanggalPinjam
        });
      }
      if (p.status === 'Dipinjam') {
        const terlambat = p.tanggalKembali && new Date(p.tanggalKembali) < new Date();
        notifs.push({
          type: terlambat ? 'danger' : 'warning',
          kategori: 'dipinjam',
          msg: terlambat
            ? `⚠️ ${p.alat?.nama} dipinjam ${p.user?.nama} sudah MELEWATI batas waktu!`
            : `${p.alat?.nama} sedang dipinjam oleh ${p.user?.nama}.`,
          detail: `Tgl kembali: ${p.tanggalKembali ? new Date(p.tanggalKembali).toLocaleDateString('id-ID') : '-'}`,
          tgl: p.tanggalPinjam
        });
      }
      if (p.status === 'Dikembalikan') {
        notifs.push({
          type: 'success',
          kategori: 'dikembalikan',
          msg: `${p.alat?.nama} telah dikembalikan oleh ${p.user?.nama}.`,
          detail: `Keperluan: ${p.keperluan || '-'}`,
          tgl: p.tanggalPinjam
        });
      }
    });

    // Sort terbaru dulu
    return notifs.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
  };

  const getStyle = (type) => {
    if (type === 'info')    return { bg: 'rgba(56,189,248,0.10)', border: '#38bdf8', color: '#38bdf8', icon: '📡' };
    if (type === 'warning') return { bg: 'rgba(251,191,36,0.10)', border: '#f59e0b', color: '#fbbf24', icon: '📤' };
    if (type === 'danger')  return { bg: 'rgba(239,68,68,0.10)',  border: '#ef4444', color: '#f87171', icon: '🚨' };
    if (type === 'success') return { bg: 'rgba(34,197,94,0.10)',  border: '#22c55e', color: '#4ade80', icon: '✅' };
    return { bg: 'rgba(148,163,184,0.10)', border: '#64748b', color: '#94a3b8', icon: '🔔' };
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
    <div style={{ fontFamily: "'Sora', 'Inter', sans-serif", color: '#e2e8f0' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notif-item {
          transition: all 0.2s ease;
          cursor: default;
        }
        .notif-item:hover {
          transform: translateY(-3px);
        }
        .filter-btn {
          transition: all 0.2s;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
        }
        .filter-btn:hover {
          filter: brightness(1.1);
        }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: 24, animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700,
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4
        }}>
          Notifikasi Sistem
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Update aktivitas peminjaman alat laboratorium
        </p>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 14, marginBottom: 24, animation: 'fadeUp 0.5s ease'
      }}>
        {[
          { label: 'Total', value: counts.semua, color: '#38bdf8', icon: '🔔' },
          { label: 'Menunggu', value: counts.menunggu, color: '#6366f1', icon: '📡' },
          { label: 'Dipinjam', value: counts.dipinjam, color: '#f59e0b', icon: '📤' },
          { label: 'Dikembalikan', value: counts.dikembalikan, color: '#22c55e', icon: '✅' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.6)', border: `1px solid ${s.color}33`,
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              fontSize: 22, width: 42, height: 42, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, background: s.color + '18'
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER TABS */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18,
        animation: 'fadeUp 0.55s ease'
      }}>
        {[
          { key: 'semua', label: 'Semua' },
          { key: 'menunggu', label: '📡 Menunggu' },
          { key: 'dipinjam', label: '📤 Dipinjam' },
          { key: 'dikembalikan', label: '✅ Dikembalikan' },
        ].map(f => (
          <button
            key={f.key}
            className="filter-btn"
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600,
              background: filter === f.key
                ? 'linear-gradient(135deg,#38bdf8,#6366f1)'
                : 'rgba(15,23,42,0.6)',
              color: filter === f.key ? '#fff' : '#64748b',
              border: filter === f.key ? 'none' : '1px solid rgba(56,189,248,0.15)',
            }}
          >
            {f.label}
            <span style={{
              marginLeft: 6, fontSize: 11, fontWeight: 700,
              background: filter === f.key ? 'rgba(255,255,255,0.2)' : 'rgba(56,189,248,0.15)',
              color: filter === f.key ? '#fff' : '#38bdf8',
              padding: '1px 7px', borderRadius: 10
            }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* LIST NOTIFIKASI */}
      <div style={{
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(18px)',
        borderRadius: 20, border: '1px solid rgba(56,189,248,0.12)',
        padding: 16, animation: 'fadeUp 0.6s ease'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
            Memuat notifikasi...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#334155' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔕</div>
            <div style={{ fontSize: 14 }}>Tidak ada notifikasi</div>
          </div>
        ) : filtered.map((n, i) => {
          const s = getStyle(n.type);
          return (
            <div
              key={i}
              className="notif-item"
              style={{
                display: 'flex', gap: 14, padding: '14px 16px',
                marginBottom: 8, borderRadius: 14,
                background: s.bg, border: `1px solid ${s.border}33`,
                animation: `fadeUp 0.3s ease ${i * 0.04}s backwards`,
                boxShadow: n.type === 'danger' ? `0 0 20px rgba(239,68,68,0.1)` : 'none'
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: 22, width: 40, height: 40, minWidth: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: s.border + '18'
              }}>
                {s.icon}
              </div>

              {/* Konten */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6, color: '#e2e8f0', fontWeight: 500 }}>
                  {n.msg}
                </p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                  {n.detail}
                </p>
                <p style={{ fontSize: 11, color: '#475569', margin: '4px 0 0' }}>
                  🕐 {new Date(n.tgl).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>

              {/* Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, background: s.border + '22', color: s.color,
                  border: `1px solid ${s.border}44`, whiteSpace: 'nowrap'
                }}>
                  {n.kategori === 'menunggu' ? 'Menunggu' :
                   n.kategori === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
