import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Pengembalian({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await API.get('/peminjaman');
      setPeminjaman(res.data.filter(p => p.status === 'Dipinjam'));
    } catch {
      setPeminjaman([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleKembalikan = async (id) => {
    try {
      await API.put(`/peminjaman/${id}/kembalikan`);
      showToast('Alat berhasil dikembalikan!');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Gagal mengembalikan', 'error');
    }
  };

  const isLate = (tanggalKembali) => {
    if (!tanggalKembali) return false;
    return new Date(tanggalKembali) < new Date();
  };

  const hariTerlambat = (tanggalKembali) => {
    if (!tanggalKembali) return 0;
    const diff = new Date() - new Date(tanggalKembali);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const terlambat = peminjaman.filter(p => isLate(p.tanggalKembali));
  const aktif = peminjaman.filter(p => !isLate(p.tanggalKembali));

  return (
    <div style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .row-hover:hover {
          background: rgba(56,189,248,0.05) !important;
          transition: background 0.2s;
        }
        .btn-return {
          transition: all 0.2s ease;
          font-family: 'Sora', sans-serif;
        }
        .btn-return:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34,197,94,0.4);
          filter: brightness(1.1);
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 30, right: 30, zIndex: 9999,
          padding: '13px 20px', borderRadius: 14,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}`,
          color: toast.type === 'error' ? '#f87171' : '#4ade80',
          backdropFilter: 'blur(20px)', fontWeight: 600, fontSize: 14,
          animation: 'toastIn 0.3s ease', boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ marginBottom: 24, animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700,
          background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4
        }}>
          Pengembalian Alat
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Daftar alat yang sedang dipinjam & perlu dikembalikan
        </p>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 16, marginBottom: 28, animation: 'fadeUp 0.5s ease'
      }}>
        {[
          { label: 'Total Dipinjam', value: peminjaman.length, color: '#38bdf8', icon: '📤' },
          { label: 'Terlambat', value: terlambat.length, color: '#ef4444', icon: '⚠️' },
          { label: 'Tepat Waktu', value: aktif.length, color: '#22c55e', icon: '✅' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.6)', border: `1px solid ${s.color}33`,
            borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              fontSize: 26, width: 48, height: 48, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: s.color + '18',
              animation: s.label === 'Terlambat' && terlambat.length > 0 ? 'pulse 2s infinite' : 'none'
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TERLAMBAT WARNING */}
      {terlambat.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 14, padding: '14px 18px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeUp 0.5s ease'
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ color: '#f87171', fontWeight: 600, fontSize: 14 }}>
            Ada {terlambat.length} peminjaman yang melebihi batas waktu pengembalian!
          </span>
        </div>
      )}

      {/* TABLE */}
      <div style={{
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56,189,248,0.15)', borderRadius: 20,
        overflow: 'hidden', animation: 'fadeUp 0.6s ease'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
          <thead>
            <tr style={{ background: 'rgba(56,189,248,0.06)' }}>
              {['Alat', 'Peminjam', 'Keperluan', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{
                  padding: '14px 16px', textAlign: 'left', fontSize: 11,
                  fontWeight: 700, color: '#64748b',
                  letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Memuat data...
                </td>
              </tr>
            ) : peminjaman.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '50px 30px', color: '#334155' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                  <div style={{ fontSize: 14 }}>Semua alat sudah dikembalikan!</div>
                </td>
              </tr>
            ) : peminjaman.map((p, i) => {
              const late = isLate(p.tanggalKembali);
              const hari = hariTerlambat(p.tanggalKembali);
              return (
                <tr key={p._id} className="row-hover" style={{
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animation: `fadeUp ${0.3 + i * 0.05}s ease`,
                  background: late ? 'rgba(239,68,68,0.03)' : 'transparent'
                }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>
                    {p.alat?.nama || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#94a3b8' }}>
                    {p.user?.nama || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.keperluan || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>
                    {p.tanggalPinjam ? new Date(p.tanggalPinjam).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>
                    <span style={{ color: late ? '#f87171' : '#94a3b8', fontWeight: late ? 600 : 400 }}>
                      {p.tanggalKembali ? new Date(p.tanggalKembali).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: late ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: late ? '#f87171' : '#fbbf24',
                      border: `1px solid ${late ? '#ef444444' : '#f59e0b44'}`,
                    }}>
                      {late ? `⚠️ Terlambat ${hari}h` : '🟡 Aktif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleKembalikan(p._id)}
                      className="btn-return"
                      style={{
                        padding: '7px 16px', borderRadius: 20, border: 'none',
                        background: 'linear-gradient(135deg,#22c55e,#4ade80)',
                        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      ✔ Kembalikan
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
