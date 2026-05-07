import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    if (showRegister) return <Register onSwitch={() => setShowRegister(false)} />;
    return <Login onLogin={setUser} onRegister={() => setShowRegister(true)} />;
  }
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;