import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';

export default function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  // 🔥 ANIMASI NETWORK
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = 'rgba(56,189,248,0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.strokeStyle = `rgba(56,189,248,${1 - dist / 120})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.msg || 'Email atau password salah');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <div style={styles.card}>

        {/* LEFT */}
        <div style={styles.left}>
          <h1 style={styles.logo}>🌐 LabNet</h1>

          <h2 style={styles.title}>
            Sistem Jaringan<br />Laboratorium
          </h2>

          <p style={styles.desc}>
            Monitoring, manajemen, dan kontrol perangkat jaringan dalam satu platform modern.
          </p>

          <div style={styles.features}>
            <span>📡 Monitoring jaringan</span>
            <span>🖧 Manajemen perangkat</span>
            <span>⚡ Real-time system</span>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <h3 style={styles.formTitle}>Login</h3>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              required
            />

            <button style={styles.primaryBtn}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

            <button type="button" onClick={onRegister} style={styles.secondaryBtn}>
              Buat akun baru
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #0f172a, #020617)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    // 🔥 SYSTEM FONT STACK (INI KUNCI TANPA IMPORT)
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  canvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  card: {
    display: 'flex',
    width: '1000px',
    borderRadius: '22px',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(56,189,248,0.2)',
    boxShadow: '0 0 80px rgba(56,189,248,0.15)',
    zIndex: 2,
  },

  left: {
    flex: 1,
    padding: '48px',
    color: '#fff',
  },

  logo: {
    color: '#38bdf8',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },

  title: {
    fontSize: '34px',
    fontWeight: '600',
    marginTop: '20px',
    letterSpacing: '-0.5px',

    background: 'linear-gradient(90deg,#38bdf8,#818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  desc: {
    color: '#94a3b8',
    marginTop: '10px',
    lineHeight: '1.6',
  },

  features: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  right: {
    flex: 1,
    padding: '48px',
    background: 'rgba(2,6,23,0.7)',
  },

  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  input: {
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid rgba(56,189,248,0.3)',
    background: 'transparent',
    color: '#fff',
  },

  primaryBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
  },

  secondaryBtn: {
    padding: '14px',
    border: '1px solid rgba(56,189,248,0.4)',
    background: 'transparent',
    borderRadius: '10px',
    color: '#94a3b8',
    cursor: 'pointer',
  },

  error: {
    background: 'rgba(255,0,0,0.1)',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '10px',
    color: '#f87171',
  },
};