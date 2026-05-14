import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Inventaris({ user }) {
  const [alat, setAlat] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', kode: '', kategori: '', jumlah: '', kondisi: 'Baik' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlat();
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const fetchAlat = async () => {
    try {
      const res = await API.get('/alat');
      setAlat(res.data);
    } catch {
      showToast('Gagal memuat data alat', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.jumlah) {
      showToast('Nama dan jumlah wajib diisi!', 'error');
      return;
    }
    try {
      const data = { ...form, jumlah: Number(form.jumlah), stok: Number(form.jumlah) };
      if (editId) {
        await API.put(`/alat/${editId}`, data);
        showToast('Alat berhasil diupdate!');
      } else {
        await API.post('/alat', data);
        showToast('Alat berhasil ditambahkan!');
      }
      setShowModal(false);
      setForm({ nama: '', kode: '', kategori: '', jumlah: '', kondisi: 'Baik' });
      setEditId(null);
      fetchAlat();
    } catch {
      showToast('Gagal menyimpan data', 'error');
    }
  };

  const handleEdit = (item) => {
    setForm({
      nama: item.nama || '',
      kode: item.kode || '',
      kategori: item.kategori || '',
      jumlah: item.jumlah || item.stok || '',
      kondisi: item.kondisi || 'Baik'
    });
    setEditId(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus alat ini?')) return;
    try {
      await API.delete(`/alat/${id}`);
      showToast('Alat berhasil dihapus!');
      fetchAlat();
    } catch {
      showToast('Gagal menghapus alat', 'error');
    }
  };

  const filtered = alat.filter(a =>
    a.nama?.toLowerCase().includes(search.toLowerCase()) ||
    a.kode?.toLowerCase().includes(search.toLowerCase()) ||
    a.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  const kondisiColor = (k) => {
    if (k === 'Baik') return { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' };
    if (k === 'Rusak') return { bg: 'rgba(239,68,68,0.15)', color: '#f87171' };
    return { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' };
  };

  return (
    <div style={{ fontFamily: "'Sora', 'Inter', sans-serif", color: '#e2e8f0' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .row-item {
          transition: background 0.2s;
        }
        .row-item:hover {
          background: rgba(56,189,248,0.06) !important;
        }
        .inp {
          width: 100%;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid rgba(56,189,248,0.2);
          background: rgba(15,23,42,0.8);
          color: #e2e8f0;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          margin-bottom: 12px;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .inp:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
        }
        .inp::placeholder { color: #475569; }
        .inp option { background: #0f172a; }
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
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4
        }}>
          Inventaris Lab
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Kelola alat laboratorium jaringan</p>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 16, marginBottom: 24, animation: 'fadeUp 0.5s ease'
      }}>
        {[
          { label: 'Total Alat', value: alat.length, color: '#38bdf8', icon: '🖧' },
          { label: 'Kondisi Baik', value: alat.filter(a => a.kondisi === 'Baik' || !a.kondisi).length, color: '#22c55e', icon: '✅' },
          { label: 'Total Stok', value: alat.reduce((s, a) => s + (a.stok || a.jumlah || 0), 0), color: '#6366f1', icon: '📦' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.6)', border: `1px solid ${s.color}33`,
            borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              fontSize: 26, width: 48, height: 48, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: s.color + '18'
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + BUTTON */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, animation: 'fadeUp 0.55s ease' }}>
        <input
          placeholder="🔍 Cari alat, kode, atau kategori..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 20,
            border: '1px solid rgba(56,189,248,0.2)',
            background: 'rgba(15,23,42,0.6)', color: '#e2e8f0',
            fontFamily: 'Sora, sans-serif', fontSize: 14, outline: 'none'
          }}
        />
        {user?.role !== 'mahasiswa' && (
          <button
            onClick={() => { setShowModal(true); setEditId(null); setForm({ nama: '', kode: '', kategori: '', jumlah: '', kondisi: 'Baik' }); }}
            style={{
              padding: '10px 22px', borderRadius: 20,
              background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
              border: 'none', color: '#fff', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              boxShadow: '0 8px 20px rgba(56,189,248,0.25)',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            + Tambah Alat
          </button>
        )}
      </div>

      {/* TABLE */}
      <div style={{
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)',
        borderRadius: 20, border: '1px solid rgba(56,189,248,0.12)',
        overflow: 'hidden', animation: 'fadeUp 0.6s ease'
      }}>
        {/* Header tabel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: user?.role !== 'mahasiswa'
            ? '0.7fr 1.8fr 1fr 0.7fr 0.7fr 0.8fr 0.8fr'
            : '0.7fr 1.8fr 1fr 0.7fr 0.7fr 0.8fr',
          padding: '12px 20px',
          background: 'rgba(56,189,248,0.06)',
          fontSize: 11, fontWeight: 700, color: '#64748b',
          letterSpacing: '0.06em', textTransform: 'uppercase'
        }}>
          <div>Kode</div>
          <div>Nama Alat</div>
          <div>Kategori</div>
          <div>Jumlah</div>
          <div>Stok</div>
          <div>Kondisi</div>
          {user?.role !== 'mahasiswa' && <div>Aksi</div>}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#334155' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14 }}>
              {search ? 'Tidak ada alat yang cocok' : 'Belum ada data alat'}
            </div>
          </div>
        ) : filtered.map((item, i) => (
          <div
            key={item._id}
            className="row-item"
            style={{
              display: 'grid',
              gridTemplateColumns: user?.role !== 'mahasiswa'
                ? '0.7fr 1.8fr 1fr 0.7fr 0.7fr 0.8fr 0.8fr'
                : '0.7fr 1.8fr 1fr 0.7fr 0.7fr 0.8fr',
              padding: '14px 20px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              alignItems: 'center',
              animation: `fadeUp ${0.3 + i * 0.04}s ease`
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>
              {item.kode || '-'}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{item.nama}</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{item.kategori || '-'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#38bdf8' }}>
              {item.jumlah || '-'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#6366f1' }}>
              {item.stok ?? item.tersedia ?? '-'}
            </div>
            <div>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: kondisiColor(item.kondisi || 'Baik').bg,
                color: kondisiColor(item.kondisi || 'Baik').color,
                border: `1px solid ${kondisiColor(item.kondisi || 'Baik').color}44`
              }}>
                {item.kondisi || 'Baik'}
              </span>
            </div>
            {user?.role !== 'mahasiswa' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(item)} style={{
                  background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
                  color: '#38bdf8', padding: '5px 12px', borderRadius: 8,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  fontFamily: 'Sora, sans-serif', transition: 'all 0.2s'
                }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(item._id)} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', padding: '5px 12px', borderRadius: 8,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  fontFamily: 'Sora, sans-serif', transition: 'all 0.2s'
                }}>
                  🗑️ Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div style={{
            width: 420, background: 'rgba(15,23,42,0.96)',
            borderRadius: 24, padding: 30,
            border: '1px solid rgba(56,189,248,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            animation: 'slideIn 0.3s ease'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 20, margin: 0 }}>
                {editId ? '✏️ Edit Alat' : '➕ Tambah Alat'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: '#64748b', width: 34, height: 34, borderRadius: 10,
                cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>×</button>
            </div>

            <label style={labelStyle}>Kode Alat</label>
            <input className="inp" placeholder="Contoh: AP-001"
              value={form.kode}
              onChange={e => setForm({ ...form, kode: e.target.value })}
            />

            <label style={labelStyle}>Nama Alat *</label>
            <input className="inp" placeholder="Nama alat..."
              value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
            />

            <label style={labelStyle}>Kategori</label>
            <input className="inp" placeholder="Contoh: Jaringan, Kabel..."
              value={form.kategori}
              onChange={e => setForm({ ...form, kategori: e.target.value })}
            />

            <label style={labelStyle}>Jumlah *</label>
            <input type="number" min={1} className="inp" placeholder="Jumlah unit"
              value={form.jumlah}
              onChange={e => setForm({ ...form, jumlah: e.target.value })}
            />

            <label style={labelStyle}>Kondisi</label>
            <select className="inp"
              value={form.kondisi}
              onChange={e => setForm({ ...form, kondisi: e.target.value })}
            >
              <option value="Baik">Baik</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Rusak">Rusak</option>
            </select>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px', borderRadius: 14,
                border: '1px solid rgba(100,116,139,0.4)',
                background: 'transparent', color: '#94a3b8',
                cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontWeight: 500
              }}>
                Batal
              </button>
              <button onClick={handleSubmit} style={{
                flex: 2, padding: '11px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
                color: '#fff', cursor: 'pointer',
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14
              }}>
                {editId ? '✓ Simpan Perubahan' : '✓ Tambah Alat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: 11, color: '#64748b', fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  display: 'block', marginBottom: 4
};
