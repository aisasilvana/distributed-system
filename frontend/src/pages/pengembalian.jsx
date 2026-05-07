import { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Pengembalian({ user }) {
  const [peminjaman, setPeminjaman] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const res = await API.get('/peminjaman');
    setPeminjaman(res.data.filter(p => p.status === 'Dipinjam'));
  };

  const handleKembalikan = async (id) => {
    try {
      await API.put(`/peminjaman/${id}/kembalikan`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Gagal mengembalikan');
    }
  };

  const isLate = (tanggalKembali) => {
    return new Date(tanggalKembali) < new Date();
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui" }}>
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glass {
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(56,189,248,0.2);
          }
          .row-hover:hover {
            background: rgba(56,189,248,0.05);
          }
          .btn {
            transition: all 0.2s ease;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px -6px rgba(34,197,94,0.5);
          }
        `}
      </style>

      {/* HEADER */}
      <div style={{ marginBottom: 30, animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Pengembalian Alat
        </h1>
        <p style={{ color: '#94a3b8' }}>
          Daftar alat yang sedang dipinjam & perlu dikembalikan
        </p>
      </div>

      {/* TABLE */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <table style={{ width: '100%', color: '#e2e8f0' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              <th style={th}>Alat</th>
              <th style={th}>Peminjam</th>
              <th style={th}>Tgl Pinjam</th>
              <th style={th}>Tgl Kembali</th>
              <th style={th}>Status</th>
              <th style={th}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {peminjaman.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  Tidak ada alat yang sedang dipinjam
                </td>
              </tr>
            ) : peminjaman.map(p => (
              <tr key={p._id} className="row-hover" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={td}>{p.alat?.nama}</td>
                <td style={td}>{p.user?.nama}</td>
                <td style={td}>{new Date(p.tanggalPinjam).toLocaleDateString('id-ID')}</td>
                <td style={td}>
                  {p.tanggalKembali ? new Date(p.tanggalKembali).toLocaleDateString('id-ID') : '-'}
                </td>

                {/* STATUS */}
                <td style={td}>
                  <span style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: isLate(p.tanggalKembali)
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(245,158,11,0.15)',
                    color: isLate(p.tanggalKembali)
                      ? '#f87171'
                      : '#fbbf24',
                    boxShadow: isLate(p.tanggalKembali)
                      ? '0 0 10px rgba(239,68,68,0.3)'
                      : '0 0 10px rgba(245,158,11,0.3)'
                  }}>
                    {isLate(p.tanggalKembali) ? 'Terlambat' : 'Aktif'}
                  </span>
                </td>

                {/* BUTTON */}
                <td style={td}>
                  <button
                    onClick={() => handleKembalikan(p._id)}
                    className="btn"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: 'none',
                      background: 'linear-gradient(135deg,#22c55e,#4ade80)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✔ Kembalikan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* STYLE */
const th = {
  padding: '14px',
  textAlign: 'left',
  fontSize: '13px',
  color: '#94a3b8'
};

const td = {
  padding: '14px',
  fontSize: '14px'
};