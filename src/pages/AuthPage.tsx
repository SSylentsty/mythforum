import React, { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions';
import { useNavigate, Link } from 'react-router-dom';

const AuthForm: React.FC<{ type: 'login' | 'signup' }> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, error, loading } = useAuthActions();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
    if (!error) navigate('/');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="mythic-card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {type === 'login' ? 'Invoke Your Spirit' : 'Join the Pantheon'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="parchment-text">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                padding: '0.75rem', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)',
                color: 'inherit',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="parchment-text">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                padding: '0.75rem', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)',
                color: 'inherit',
                fontFamily: 'inherit'
              }}
            />
          </div>
          {error && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: 'var(--accent)', 
              color: 'var(--bg-primary)',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Processing...' : (type === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {type === 'login' ? "Haven't joined yet?" : "Already have an account?"}
          <Link to={type === 'login' ? '/signup' : '/login'} style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>
            {type === 'login' ? 'Sign Up' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
