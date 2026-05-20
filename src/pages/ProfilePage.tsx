import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlogs } from '../hooks/useBlogs';
import { User as UserIcon, BookOpen, PenTool } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { blogs, loading, createBlog } = useBlogs(user?.uid);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
      <div className="mythic-card" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--accent)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '4px solid var(--border-color)'
        }}>
          <UserIcon size={50} style={{ color: 'var(--bg-primary)' }} />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{user.displayName || 'Unnamed Scholar'}</h1>
          <p className="parchment-text" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <span className="gold-text" style={{ fontSize: '0.9rem' }}>Member since: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Ancient Times'}</span>
          </div>
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
