import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'mahasiswa'
  });

  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  // ===== NETWORK BACKGROUND =====
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56,189,248,${1 - dist / 120})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setIsError(false);

    try {
      await API.post('/auth/register', form);
      setMsg('Registrasi berhasil. Silakan login.');
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.msg || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif",
      background: 'radial-gradient(circle at top, #020617, #020617)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>

      {/* FONT */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Space+Grotesk:wght@500;700&display=swap');

        select {
          appearance: none;
        }
      `}</style>

      <canvas ref={canvasRef} style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0
      }} />

      {/* CARD */}
      <div style={{
        zIndex: 10,
        width: '420px',
        padding: '45px 35px',
        borderRadius: '30px',
        background: 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 0 50px rgba(56,189,248,0.15)',
      }}>

        {/* HEADER CENTERED */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: '700',
            color: '#e2e8f0',
            marginBottom: '8px'
          }}>
            Buat Akun
          </h1>

          <p style={{
            color: '#64748b',
            fontSize: '13px'
          }}>
            Sistem Jaringan Laboratorium
          </p>
        </div>

        {msg && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '13px',
            background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: isError ? '#f87171' : '#4ade80'
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* INPUT */}
          {['nama', 'email', 'password'].map((field, i) => (
            <input
              key={i}
              type={field === 'password' ? 'password' : 'text'}
              placeholder={
                field === 'nama' ? 'Nama Lengkap' :
                field === 'email' ? 'Email' : 'Password'
              }
              value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              required
              style={{
                width: '100%',
                marginBottom: '16px',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid rgba(56,189,248,0.25)',
                background: 'rgba(2,6,23,0.8)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          ))}

          {/* SELECT FIXED */}
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            style={{
              width: '100%',
              marginBottom: '22px',
              padding: '14px',
              borderRadius: '16px',
              border: '1px solid rgba(56,189,248,0.25)',
              background: '#020617',
              color: '#e2e8f0',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="mahasiswa">Mahasiswa</option>
            <option value="laboran">Laboran</option>
            <option value="admin">Admin</option>
          </select>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '22px',
              border: 'none',
              background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '14px',
              boxShadow: '0 10px 25px rgba(56,189,248,0.3)'
            }}
          >
            {loading ? 'Loading...' : 'Daftar Sekarang'}
          </button>

          <button
            type="button"
            onClick={onSwitch}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '22px',
              background: 'transparent',
              border: '1px solid rgba(56,189,248,0.4)',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            ← Kembali ke Login
          </button>

        </form>
      </div>
    </div>
  );
}