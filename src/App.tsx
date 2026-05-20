import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, User as UserIcon, LogOut, Award } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAuthActions } from './hooks/useAuthActions';
import { getLevelInfo } from './utils/xpSystem';
import AuthPage from './pages/AuthPage';
import ForumPage from './pages/ForumPage';
import ThreadDetail from './pages/ThreadDetail';
import ProfilePage from './pages/ProfilePage';
import ThemeToggle from './components/ThemeToggle';

function Home() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <Shield size={80} style={{ color: 'var(--accent)', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Mythos Forum</h1>
      <p className="parchment-text" style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.6' }}>
        Where ancient wisdom meets modern discussion. Explore the legends of the gods, the tales of heroes, and the mysteries of the cosmos.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
        <Link to="/forum" className="mythic-card" style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}>Enter the Great Hall</Link>
        {!user && (
          <Link to="/signup" className="mythic-card" style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem', backgroundColor: 'transparent' }}>Join the Pantheon</Link>
        )}
      </div>
      
      <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div className="mythic-card">
          <h4>Greek</h4>
          <p style={{ fontSize: '0.8rem' }}>Mount Olympus & Heroic Cycles</p>
        </div>
        <div className="mythic-card">
          <h4>Norse</h4>
          <p style={{ fontSize: '0.8rem' }}>Yggdrasil & the Nine Realms</p>
        </div>
        <div className="mythic-card">
          <h4>Egyptian</h4>
          <p style={{ fontSize: '0.8rem' }}>The Nile & the Afterlife</p>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, userData } = useAuth();
  const { logout } = useAuthActions();
  const levelInfo = userData ? getLevelInfo(userData.xp) : null;

  return (
    <header style={{ 
      padding: '1rem 2rem', 
      borderBottom: '1px solid var(--border-color)', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'var(--bg-secondary)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={24} style={{ color: 'var(--accent)' }} />
        <span style={{ fontFamily: 'var(--header-font)', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--text-primary)' }}>MYTHOS</span>
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Home</Link>
        <Link to="/forum" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Forum</Link>
        {user ? (
          <>
            {levelInfo && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.3rem', 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                color: levelInfo.color, 
                textTransform: 'uppercase', 
                border: `1px solid ${levelInfo.color}`, 
                padding: '2px 8px', 
                borderRadius: '4px',
                backgroundColor: `${levelInfo.color}10`
              }}>
                <Award size={14} />
                <span>{levelInfo.tag}</span>
              </div>
            )}
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <UserIcon size={18} />
              <span>Profile</span>
            </Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Login</Link>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/thread/:id" element={<ThreadDetail />} />
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/signup" element={<AuthPage type="signup" />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <footer style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            &copy; 2026 Mythos Forum. All rights reserved. Built for the community of mythology enthusiasts.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
