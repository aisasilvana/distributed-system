import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Peminjaman({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);
  const [alats, setAlats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlatNama, setSelectedAlatNama] = useState('');
  const [form, setForm] = useState({
    alatId: '',
    jumlah: 1,
    tanggalKembali: '',
    keperluan: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPeminjaman();
    fetchAlats();

    // Baca alat yang dipilih dari dashboard
    const stored = sessionStorage.getItem('selectedAlat');
    if (stored) {
      const selected = JSON.parse(stored);
      setForm(prev => ({ ...prev, alatId: selected._id, jumlah: 1 }));
      setSelectedAlatNama(selected.nama);
      setShowModal(true);
      sessionStorage.removeItem('selectedAlat');
    }
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const res = await API.get('/peminjaman');
      setPeminjaman(res.data);
    } catch (err) {
      console.error('Gagal fetch peminjaman:', err);
      setPeminjaman([]);
    }
  };

  const fetchAlats = async () => {
    try {
      const res = await API.get('/alat');
      setAlats(res.data);
    } catch {
      setAlats([]);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!form.alatId || !form.tanggalKembali || !form.keperluan) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }
    if (form.jumlah < 1) {
      showToast('Jumlah minimal 1!', 'error');
      return;
    }
    setLoading(true);
    try {
      await API.post('/peminjaman', {
        alatId: form.alatId,
        jumlah: form.jumlah,
        tanggalKembali: form.tanggalKembali,
        keperluan: form.keperluan,
      });
      setShowModal(false);
      setForm({ alatId: '', jumlah: 1, tanggalKembali: '', keperluan: '' });
      setSelectedAlatNama('');
      await fetchPeminjaman();
      showToast('Peminjaman berhasil diajukan!');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Gagal mengajukan peminjaman', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetujui = async (id) => {
    try {
      await API.put(`/peminjaman/${id}/setujui`);
      await fetchPeminjaman();
      showToast('Peminjaman disetujui!');
    } catch {
      showToast('Gagal menyetujui', 'error');
    }
  };

  const handleKembalikan = async (id) => {
    try {
      await API.put(`/peminjaman/${id}/kembalikan`);
      await fetchPeminjaman();
      showToast('Alat berhasil dikembalikan!');
    } catch {
      showToast('Gagal mengembalikan', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAlatNama('');
    setForm({ alatId: '', jumlah: 1, tanggalKembali: '', keperluan: '' });
  };

  // Ketika pilih alat dari dropdown di modal
  const handleSelectAlat = (e) => {
    const id = e.target.value;
    const alat = alats.find(a => a._id === id);
    setForm(prev => ({ ...prev, alatId: id }));
    setSelectedAlatNama(alat ? alat.nama : '');
  };

  const statusColor = (status) => {
    if (status === 'Dipinjam') return '#f59e0b';
    if (status === 'Dikembalikan') return '#22c55e';
    if (status === 'Menunggu') return '#38bdf8';
    return '#94a3b8';
  };

  const statusIcon = (status) => {
    if (status === 'Dipinjam') return '📤';
    if (status === 'Dikembalikan') return '✅';
    if (status === 'Menunggu') return '⏳';
    return '❓';
  };

  return (
    <div style={{ fontFamily: "'Sora', 'Inter', sans-serif", minHeight: '100vh' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .row-hover:hover {
          background: rgba(56,189,248,0.06) !important;
          transition: background 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          border: none;
          color: #fff;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Sora', sans-serif;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(56,189,248,0.35);
          filter: brightness(1.1);
        }
        .btn-primary:active { transform: scale(0.97); }
        .input-field {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(56,189,248,0.25);
          background: rgba(15,23,42,0.8);
          color: #e2e8f0;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          margin-bottom: 14px;
        }
        .input-field:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        .input-field::placeholder { color: #475569; }
        .action-btn {
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s;
        }
        .action-btn:hover { transform: translateY(-1px); filter: brightness(1.15); }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 30, right: 30, zIndex: 9999,
          padding: '14px 22px', borderRadius: 14,
          background: toast.type === 'error'
            ? 'rgba(239,68,68,0.15)'
            : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}`,
          color: toast.type === 'error' ? '#f87171' : '#4ade80',
          backdropFilter: 'blur(20px)',
          fontWeight: 600, fontSize: 14,
          animation: 'toastIn 0.3s ease',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700,
          background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 6,
        }}>
          Peminjaman Alat
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Kelola peminjaman alat praktikum jaringan
        </p>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16, marginBottom: 28,
        animation: 'fadeUp 0.5s ease',
      }}>
        {[
          { label: 'Total Peminjaman', value: peminjaman.length, color: '#38bdf8', icon: '📋' },
          { label: 'Sedang Dipinjam', value: peminjaman.filter(p => p.status === 'Dipinjam').length, color: '#f59e0b', icon: '📤' },
          { label: 'Menunggu', value: peminjaman.filter(p => p.status === 'Menunggu').length, color: '#6366f1', icon: '⏳' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.6)',
            border: `1px solid ${stat.color}33`,
            borderRadius: 16, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              fontSize: 28, width: 52, height: 52,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 14, background: stat.color + '18',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TOMBOL AJUKAN */}
      {user?.role?.toLowerCase() === 'mahasiswa' && (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
    <button
      onClick={() => setShowModal(true)}
      
    >
      + Ajukan Peminjaman
    </button>
  </div>
)}

      {/* TABLE */}
      <div style={{
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(56,189,248,0.15)',
        borderRadius: 20, overflow: 'hidden',
        animation: 'fadeUp 0.6s ease',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
          <thead>
            <tr style={{ background: 'rgba(56,189,248,0.06)' }}>
              {['Alat', 'Peminjam', 'Keperluan', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{
                  padding: '14px 16px', textAlign: 'left', fontSize: 12,
                  fontWeight: 600, color: '#64748b',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {peminjaman.length === 0 ? (
              <tr>
                <td colSpan="7" style={{
                  textAlign: 'center', padding: '50px 30px', color: '#334155',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                  <div style={{ fontSize: 14 }}>Belum ada data peminjaman</div>
                </td>
              </tr>
            ) : peminjaman.map((p, i) => (
              <tr
                key={p._id}
                className="row-hover"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  animation: `fadeUp ${0.3 + i * 0.05}s ease`,
                }}
              >
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500 }}>
                  {p.alat?.nama || '-'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#94a3b8' }}>
                  {p.user?.nama || user?.nama || '-'}
                </td>
                <td style={{
                  padding: '14px 16px', fontSize: 13, color: '#64748b',
                  maxWidth: 150, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.keperluan || '-'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>
                  {p.tanggalPinjam
                    ? new Date(p.tanggalPinjam).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>
                  {p.tanggalKembali
                    ? new Date(p.tanggalKembali).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: statusColor(p.status) + '20',
                    color: statusColor(p.status),
                    padding: '5px 12px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                    border: `1px solid ${statusColor(p.status)}44`,
                  }}>
                    {statusIcon(p.status)} {p.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {p.status === 'Menunggu' && user?.role !== 'mahasiswa' && (
                    <button
                      className="action-btn"
                      onClick={() => handleSetujui(p._id)}
                      style={{
                        background: '#22c55e22', color: '#22c55e',
                        border: '1px solid #22c55e44', marginRight: 6,
                      }}
                    >
                      ✓ Setujui
                    </button>
                  )}
                  {p.status === 'Dipinjam' && (
                    <button
                      className="action-btn"
                      onClick={() => handleKembalikan(p._id)}
                      style={{
                        background: '#38bdf822', color: '#38bdf8',
                        border: '1px solid #38bdf844',
                      }}
                    >
                      ↩ Kembalikan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(56,189,248,0.25)',
            borderRadius: 24, padding: 32, width: 440,
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            animation: 'slideIn 0.3s ease',
          }}>

            {/* Header Modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 24,
            }}>
              <h2 style={{
                color: '#f1f5f9', fontWeight: 700,
                fontSize: 20, margin: 0,
              }}>
                Ajukan Peminjaman
              </h2>
              <button onClick={handleCloseModal} style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none', color: '#64748b',
                width: 36, height: 36, borderRadius: 10,
                cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            {/* Pilih Alat */}
            <label style={{
              fontSize: 12, color: '#64748b', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Alat yang Dipinjam
            </label>

            {/* Jika datang dari dashboard → tampilkan nama alat (read only) */}
            {selectedAlatNama ? (
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                marginTop: 6, marginBottom: 16,
                border: '1px solid rgba(56,189,248,0.3)',
                background: 'rgba(56,189,248,0.08)',
                color: '#38bdf8', fontWeight: 600, fontSize: 15,
              }}>
                📦 {selectedAlatNama}
              </div>
            ) : (
              /* Jika klik "+ Ajukan" langsung → dropdown pilih alat */
              <select
                className="input-field"
                style={{ marginTop: 6 }}
                value={form.alatId}
                onChange={handleSelectAlat}
              >
                <option value="">-- Pilih Alat --</option>
                {alats.filter(a => a.stok > 0).map(a => (
                  <option key={a._id} value={a._id}>
                    {a.nama} ({a.stok} tersedia)
                  </option>
                ))}
              </select>
            )}

            {/* Jumlah */}
            <label style={{
              fontSize: 12, color: '#64748b', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Jumlah
            </label>
            <input
              type="number" min={1} className="input-field"
              style={{ marginTop: 6 }}
              value={form.jumlah}
              onChange={e => setForm({ ...form, jumlah: parseInt(e.target.value) || 1 })}
              placeholder="Jumlah alat"
            />

            {/* Keperluan */}
            <label style={{
              fontSize: 12, color: '#64748b', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Keperluan
            </label>
            <input
              className="input-field" style={{ marginTop: 6 }}
              placeholder="Contoh: Praktikum jaringan komputer..."
              value={form.keperluan}
              onChange={e => setForm({ ...form, keperluan: e.target.value })}
            />

            {/* Tanggal Kembali */}
            <label style={{
              fontSize: 12, color: '#64748b', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Tanggal Kembali
            </label>
            <input
              type="date" className="input-field"
              style={{ marginTop: 6 }}
              value={form.tanggalKembali}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, tanggalKembali: e.target.value })}
            />

            {/* Tombol */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleCloseModal} style={{
                flex: 1, padding: '12px', borderRadius: 14,
                border: '1px solid rgba(100,116,139,0.4)',
                background: 'transparent', color: '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif', fontWeight: 500,
              }}>
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{
                  flex: 2, padding: '12px', borderRadius: 14,
                  fontWeight: 600, fontSize: 14,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Mengajukan...' : '✓ Ajukan Peminjaman'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}