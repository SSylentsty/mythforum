import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlogs } from '../hooks/useBlogs';
import { User as UserIcon, BookOpen, PenTool, Award, Zap, Package } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';
import { getLevelInfo, LEVELS } from '../utils/xpSystem';
import CardInventory from '../components/CardInventory';

const ProfilePage: React.FC = () => {
  const { user, userData } = useAuth();
  const { blogs, loading, createBlog } = useBlogs(user?.uid);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'chronologies' | 'mythic' | 'inventory'>('chronologies');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const levelInfo = userData ? getLevelInfo(userData.xp) : getLevelInfo(0);
  const nextLevel = LEVELS.find(l => l.level === levelInfo.level + 1);
  
  const xpProgress = nextLevel 
    ? (((userData?.xp || 0) - levelInfo.minXp) / (nextLevel.minXp - levelInfo.minXp)) * 100 
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
      <div className="mythic-card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--accent)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '4px solid var(--border-color)',
          boxShadow: `0 0 20px ${levelInfo.color}40`
        }}>
          <UserIcon size={50} style={{ color: 'var(--bg-primary)' }} />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{userData?.username || user.displayName || 'Unnamed Scholar'}</h1>
            <span style={{ 
              padding: '2px 10px', 
              backgroundColor: `${levelInfo.color}20`, 
              color: levelInfo.color, 
              border: `1px solid ${levelInfo.color}`,
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {levelInfo.tag}
            </span>
          </div>
          <p className="parchment-text" style={{ color: 'var(--text-secondary)', margin: 0 }}>{user.email}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('chronologies')}
          style={{ 
            padding: '1rem', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'chronologies' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'chronologies' ? '2px solid var(--accent)' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <BookOpen size={16} /> Chronologies
        </button>
        <button 
          onClick={() => setActiveTab('mythic')}
          style={{ 
            padding: '1rem', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'mythic' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'mythic' ? '2px solid var(--accent)' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Award size={16} /> Mythic Progress
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{ 
            padding: '1rem', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'inventory' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'inventory' ? '2px solid var(--accent)' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Package size={16} /> Inventory
        </button>
      </div>

      {activeTab === 'mythic' ? (
        <div className="mythic-card" style={{ padding: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Award size={28} className="gold-text" />
            Your Mythic Standing
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Zap size={32} className="gold-text" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{userData?.xp || 0}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Total Experience</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Award size={32} style={{ color: levelInfo.color, marginBottom: '1rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: levelInfo.color }}>{levelInfo.tag}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Current Rank</div>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Progress to {nextLevel?.tag || 'Ascension'}</span>
              <span>{userData?.xp || 0} / {nextLevel?.minXp || 'MAX'} XP</span>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ width: `${Math.min(100, Math.max(0, xpProgress))}%`, height: '100%', backgroundColor: levelInfo.color, boxShadow: `0 0 15px ${levelInfo.color}` }} />
            </div>
          </div>

          <h3>The Pantheon Hierarchy</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {LEVELS.map((l) => (
              <div key={l.level} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem', 
                backgroundColor: l.level === levelInfo.level ? `${l.color}15` : 'transparent',
                border: l.level === levelInfo.level ? `1px solid ${l.color}` : '1px solid transparent',
                borderRadius: '8px',
                opacity: (userData?.xp || 0) >= l.minXp ? 1 : 0.4
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: l.color, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--bg-primary)' }}>
                  {l.level}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: l.color }}>{l.tag}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Requires {l.minXp} XP</div>
                </div>
                {(userData?.xp || 0) >= l.minXp && (
                  <div className="gold-text" style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Unlocked</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        <CardInventory />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ProfilePage;
