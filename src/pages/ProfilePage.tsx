import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlogs } from '../hooks/useBlogs';
import { User as UserIcon, BookOpen, PenTool, Award, Zap } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';
import { getLevelInfo, LEVELS } from '../utils/xpSystem';

const ProfilePage: React.FC = () => {
  const { user, userData } = useAuth();
  const { blogs, loading, createBlog } = useBlogs(user?.uid);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const levelInfo = userData ? getLevelInfo(userData.xp) : null;
  const nextLevel = levelInfo ? LEVELS.find(l => l.level === levelInfo.level + 1) : null;
  
  const xpProgress = levelInfo && nextLevel 
    ? ((userData!.xp - levelInfo.minXp) / (nextLevel.minXp - levelInfo.minXp)) * 100 
    : 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && title && content) {
      await createBlog(title, content, user.uid, user.displayName || user.email || 'Anonymous');
      setTitle('');
      setContent('');
      setShowForm(false);
    }
  };

  if (!user) return <div style={{ padding: '4rem', textAlign: 'center' }}>You must be summoned (logged in) to view this sanctuary.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="mythic-card" style={{ marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--accent)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '4px solid var(--border-color)',
          boxShadow: `0 0 20px ${levelInfo?.color}40`
        }}>
          <UserIcon size={60} style={{ color: 'var(--bg-primary)' }} />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0 }}>{userData?.username || user.displayName || 'Unnamed Scholar'}</h1>
            {levelInfo && (
              <span style={{ 
                padding: '4px 12px', 
                backgroundColor: `${levelInfo.color}20`, 
                color: levelInfo.color, 
                border: `1px solid ${levelInfo.color}`,
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Award size={14} />
                {levelInfo.tag}
              </span>
            )}
          </div>
          <p className="parchment-text" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{user.email}</p>
          
          {userData && levelInfo && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={14} className="gold-text" />
                  <strong>{userData.xp}</strong> <span style={{ opacity: 0.7 }}>Experience Points</span>
                </span>
                {nextLevel ? (
                  <span style={{ opacity: 0.7 }}>Next: {nextLevel.tag} ({nextLevel.minXp} XP)</span>
                ) : (
                  <span className="gold-text">Maximum Divinity Reached</span>
                )}
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  width: `${xpProgress}%`, 
                  height: '100%', 
                  backgroundColor: levelInfo.color,
                  transition: 'width 1s ease-out',
                  boxShadow: `0 0 10px ${levelInfo.color}`
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} />
          Personal Chronologies
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="mythic-card"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          <PenTool size={18} />
          New Entry
        </button>
      </div>

      {showForm && (
        <div className="mythic-card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Chronology Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit', fontFamily: 'var(--header-font)' }}
            />
            <textarea 
              placeholder="Record your personal findings and stories..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit', fontFamily: 'var(--serif-font)', fontSize: '1.1rem' }}
            />
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', fontWeight: 'bold' }}>
              Inscribe Entry
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading ? (
          <p>Unveiling your history...</p>
        ) : blogs.length > 0 ? (
          blogs.map(blog => (
            <div key={blog.id} className="mythic-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{blog.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '1.5rem' }}>
                Recorded on {blog.createdAt?.toDate().toLocaleDateString()}
              </p>
              <div style={{ fontFamily: 'var(--serif-font)', lineHeight: '1.8' }}>
                <RichTextDisplay content={blog.content} />
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', fontStyle: 'italic', padding: '2rem' }}>Your scrolls are empty. Start recording your journey.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
