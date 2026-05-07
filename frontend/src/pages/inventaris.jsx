import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Inventaris({ user }) {
  const [alat, setAlat] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', kode: '', kategori: '', jumlah: '', kondisi: 'Baik' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAlat();

    // 🔥 Font biar konsisten
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const fetchAlat = async () => {
    const res = await API.get('/alat');
    setAlat(res.data);
  };

  const handleSubmit = async () => {
    const data = { ...form, jumlah: Number(form.jumlah), tersedia: Number(form.jumlah) };
    if (editId) {
      await API.put(`/alat/${editId}`, data);
    } else {
      await API.post('/alat', data);
    }
    setShowModal(false);
    setForm({ nama: '', kode: '', kategori: '', jumlah: '', kondisi: 'Baik' });
    setEditId(null);
    fetchAlat();
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus alat ini?')) {
      await API.delete(`/alat/${id}`);
      fetchAlat();
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontFamily: "'Sora'",
          fontSize: 30,
          background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Inventaris Lab
        </h1>
        <p style={{ color: '#94a3b8' }}>Kelola alat laboratorium jaringan</p>
      </div>

      {/* BUTTON */}
      {user?.role !== 'mahasiswa' && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({ nama: '', kode: '', kategori: '', jumlah: '', kondisi: 'Baik' });
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 20,
              background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(56,189,248,0.3)'
            }}
          >
            + Tambah Alat
          </button>
        </div>
      )}

      {/* TABLE STYLE MODERN */}
      <div style={{
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(16px)',
        borderRadius: 20,
        border: '1px solid rgba(56,189,248,0.15)',
        overflow: 'hidden'
      }}>

        {alat.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Belum ada data alat
          </div>
        ) : (
          alat.map(item => (
            <div key={item._id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr auto',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              alignItems: 'center',
              transition: '0.25s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >

              <div>{item.kode}</div>
              <div style={{ fontWeight: 500 }}>{item.nama}</div>
              <div>{item.kategori}</div>
              <div>{item.jumlah}</div>
              <div>{item.tersedia}</div>

              {/* BADGE */}
              <div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  background: 'rgba(34,197,94,0.15)',
                  color: '#4ade80'
                }}>
                  {item.kondisi}
                </span>
              </div>

              {/* ACTION */}
              {user?.role !== 'mahasiswa' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleEdit(item)}
                    style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Hapus
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>

          <div style={{
            width: 400,
            background: 'rgba(15,23,42,0.9)',
            borderRadius: 20,
            padding: 24,
            border: '1px solid rgba(56,189,248,0.2)',
            backdropFilter: 'blur(20px)'
          }}>

            <h2 style={{ marginBottom: 20 }}>
              {editId ? 'Edit Alat' : 'Tambah Alat'}
            </h2>

            <input placeholder="Kode"
              value={form.kode}
              onChange={e => setForm({ ...form, kode: e.target.value })}
              style={inputStyle}
            />

            <input placeholder="Nama"
              value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              style={inputStyle}
            />

            <input placeholder="Kategori"
              value={form.kategori}
              onChange={e => setForm({ ...form, kategori: e.target.value })}
              style={inputStyle}
            />

            <input type="number" placeholder="Jumlah"
              value={form.jumlah}
              onChange={e => setForm({ ...form, jumlah: e.target.value })}
              style={inputStyle}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={btnSecondary}>Batal</button>
              <button onClick={handleSubmit} style={btnPrimary}>Simpan</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// STYLE
const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(0,0,0,0.4)',
  color: 'white'
};

const btnPrimary = {
  padding: '8px 14px',
  borderRadius: 10,
  background: '#38bdf8',
  border: 'none',
  color: 'white',
  cursor: 'pointer'
};

const btnSecondary = {
  padding: '8px 14px',
  borderRadius: 10,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: 'white',
  cursor: 'pointer'
};